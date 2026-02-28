import { euiTable, Region } from './eui-table';
import { cityRegions } from './city-regions';
import { equipmentRates } from './equipment-rates';
import { exemptEuiTable } from './exempt-eui-table';
import { AssessmentInput, CalculationResult, ZoneDetail, ExemptZoneDetail, ReliabilityCheck } from './types';

// ─── 城市 → 地區對應（供找 AEUI 北/中/南 欄） ─────────────────────────────────
const countyToRegion: Record<string, Region> = {
    '基隆市': 'north', '臺北市': 'north', '新北市': 'north', '桃園市': 'north',
    '新竹市': 'north', '新竹縣': 'north', '宜蘭縣': 'north', '花蓮縣': 'north',
    '金門縣': 'north', '連江縣': 'north',
    '苗栗縣': 'central', '臺中市': 'central', '彰化縣': 'central',
    '南投縣': 'central', '雲林縣': 'central',
    '嘉義市': 'south', '嘉義縣': 'south', '臺南市': 'south',
    '高雄市': 'south', '屏東縣': 'south', '臺東縣': 'south', '澎湖縣': 'south',
};

// ─── Et 電梯耗電計算 ─────────────────────────────────────────────────────────
function calcEt(elevators: AssessmentInput['elevators'], buildingType: string): number {
    const rates = (equipmentRates as any)[buildingType];
    const Or = rates ? rates.or : 0.6;

    let totalEt = 0;
    for (const el of elevators) {
        const eeFactor = el.type === 'vfd_regen' ? 0.5 : el.type === 'vfd' ? 0.7 : 1.0;
        const unitEnergy = el.qty * el.load * el.speed * 0.05 / 860 * eeFactor * el.hours;
        totalEt += unitEnergy;
    }
    return totalEt * Or;
}

// ─── Ep 揚水設備耗電計算 ─────────────────────────────────────────────────────
function calcEp(
    towerHeight: number,
    annualWaterUsage: number,
    waterCooledArea: number = 0,
    rainwaterRecovery: number = 0
): number {
    const Qaw = 0.32 * waterCooledArea;
    const Qw = annualWaterUsage;
    const Qrw = rainwaterRecovery;
    return 0.02 * (towerHeight + 6) * (Qw + Qaw - Qrw);
}

// ─── Eh 熱水系統耗電計算 ──────────────────────────────────────────────────────
const restaurantCoeff: Record<string, number> = {
    one: 0.00284, two: 0.00568, three: 0.00852, '24h': 0.0284, none: 0,
};

function calcEh(input: AssessmentInput): number {
    const hw = input.hotWaterInput;
    if (!hw || hw.type === 'none') return 0;
    const H1 = hw.type === 'heatpump' ? 13.2 : 45.1;
    const qHotel = 10.2 * (hw.hotelRooms || 0) * (hw.hotelOccupancy || 0);
    const qHosp = 12.8 * (hw.hospitalBeds || 0) * (hw.hospitalOccupancy || 0);
    const qToilet = 0.023 * (hw.toiletArea || 0) * (hw.toiletHours || 0);
    const restCoeff = restaurantCoeff[hw.restaurantServiceType || 'none'] || 0;
    const qRest = (hw.restaurantArea || 0) * (hw.restaurantDays || 0) * restCoeff;
    const Qhw = qHotel + qHosp + qToilet + qRest;
    return H1 * Qhw;
}

// ─── 主計算函式 ───────────────────────────────────────────────────────────────
export function calculateBERSe(input: AssessmentInput): CalculationResult {
    const {
        location, buildingType, energyZones, exemptZones,
        otherSpecialPowerEe, elevators = [],
        waterInput,
    } = input;

    const cityData = (cityRegions as any)[location];
    const ur = cityData ? cityData.urValue : 1;
    const region: Region = cityData ? (countyToRegion[cityData.county] || 'north') : 'north';

    const TE = input.totalElectricityTE_y2
        ? (input.totalElectricityTE + input.totalElectricityTE_y2) / 2
        : input.totalElectricityTE;

    // Reliability Check (Match Excel: 變動率 = |Y1-Y2|/max(Y1,Y2))
    let monthlyMaxVar = 0;
    if (input.monthlyData && input.monthlyData.length > 0 && input.totalElectricityTE_y2) {
        const monthlyVars = input.monthlyData
            .map(d => {
                const y1 = Number(d.y1) || 0;
                const y2 = Number(d.y2) || 0;
                const maxVal = Math.max(y1, y2);
                if (maxVal <= 0) return null; // Skip months with no data
                return Math.abs(y1 - y2) / maxVal;
            })
            .filter((v): v is number => v !== null);

        if (monthlyVars.length > 0) {
            monthlyMaxVar = Math.max(...monthlyVars);
        }
    }

    const teY1 = input.totalElectricityTE;
    const teY2 = input.totalElectricityTE_y2 || 0;
    const yearlyVar = (teY1 > 0 && teY2 > 0)
        ? Math.abs(teY1 - teY2) / Math.max(teY1, teY2)
        : 0;

    const reliability: ReliabilityCheck = {
        totalTE: TE,
        monthlyMaxVariation: monthlyMaxVar,
        yearlyVariation: yearlyVar,
        isMonthlyValid: monthlyMaxVar < 0.5,
        isYearlyValid: teY2 > 0 ? yearlyVar < 0.15 : true,
    };

    // ── 3. 評估分區加權計算 ──
    const energyZoneDetails: ZoneDetail[] = [];
    let AFe = 0;
    let aeuiMinW = 0, aeuiMW = 0, aeuiMaxW = 0;
    let leuiMinW = 0, leuiMW = 0, leuiMaxW = 0;
    let eeuiW = 0, soriW = 0, waterCooledArea = 0;

    for (const zone of energyZones) {
        const td = (euiTable as any)[zone.code];
        if (!td) continue;
        const a = zone.area;
        const p = td.params;
        const isInt = zone.isIntermittent;
        AFe += a;

        const zoneAeuiM = isInt ? p.m.aeui_intermittent[region] : p.m.aeui_full[region];
        const zoneLeuiM = p.m.leui;
        const zoneEeuiM = p.m.eeui;
        const zoneSori = td.sori || 1;

        aeuiMinW += (isInt ? p.min.aeui_intermittent[region] : p.min.aeui_full[region]) * a;
        aeuiMW += zoneAeuiM * a;
        aeuiMaxW += (isInt ? p.max.aeui_intermittent[region] : p.max.aeui_full[region]) * a;
        leuiMinW += p.min.leui * a;
        leuiMW += zoneLeuiM * a;
        leuiMaxW += p.max.leui * a;
        eeuiW += zoneEeuiM * a;
        soriW += zoneSori * a;
        if (zone.isWaterCooled) waterCooledArea += a;

        energyZoneDetails.push({
            name: td.name,
            code: zone.code,
            area: a,
            aeui: zoneAeuiM,
            leui: zoneLeuiM,
            eeui: zoneEeuiM,
            ur: ur,
            sori: zoneSori,
            energy: round2((zoneAeuiM + zoneLeuiM + zoneEeuiM) * ur * zoneSori * a)
        });
    }

    // ── 4. 免評估分區 EN ──
    const exemptZoneDetails: ExemptZoneDetail[] = [];
    let EN = 0;
    let AFn = 0;
    for (const ez of exemptZones) {
        const td = exemptEuiTable.find(t => t.mainCode === ez.code);
        if (!td) continue;
        const eEnergy = ez.area * td.value;
        EN += eEnergy;
        AFn += ez.area;
        exemptZoneDetails.push({
            name: td.description,
            code: ez.code,
            area: ez.area,
            formula: `${ez.area} × ${td.value}`,
            energy: round2(eEnergy)
        });
    }

    if (AFe === 0) {
        return {
            teui: 0, euiAdj: 0, euiPrime: 0, score: 0, grade: 'N/A', Et: 0, Ep: 0, Eh: 0, EN: 0, deltaEui: 0, AFe: 0, AFn: 0, UR: ur,
            reliability, energyZoneDetails: [], exemptZoneDetails: [],
            benchmarks: { min: 0, g: 0, m: 0, max: 0 }
        };
    }

    const avgAeuiM = aeuiMW / AFe;
    const avgLeuiM = leuiMW / AFe;
    const avgEeui = eeuiW / AFe;
    const avgSori = soriW / AFe;

    const Et = calcEt(elevators, buildingType);
    const w = waterInput;
    const Ep = w ? calcEp(w.towerHeight, w.annualUsage, waterCooledArea, w.rainwaterRecovery || 0) : calcEp(0, input.waterUsage, waterCooledArea, 0);
    const Eh = calcEh(input);

    const EuiPrime = (TE - ur * (EN + Et + Ep + Eh) - otherSpecialPowerEe) / AFe;
    const euiMin = ur * (aeuiMinW / AFe + leuiMinW / AFe + avgEeui);
    const euiM = ur * (avgAeuiM + avgLeuiM + avgEeui);
    const euiG = ur * (0.8 * avgAeuiM + 0.8 * avgLeuiM + avgEeui);
    const euiMax = ur * (aeuiMaxW / AFe + leuiMaxW / AFe + avgEeui);

    const standardWithSori = ur * ((avgAeuiM + avgLeuiM + avgEeui) * avgSori);
    const deltaEui = EuiPrime - standardWithSori;
    const euiStar = euiM + deltaEui;

    let score = euiStar <= euiG ? 50 + 50 * (euiG - euiStar) / (euiG - euiMin) : 50 * (euiMax - euiStar) / (euiMax - euiG);
    score = Math.max(0, Math.min(100, score));

    let grade = '7';
    if (score >= 90) grade = '1+';
    else if (score >= 80) grade = '1';
    else if (score >= 70) grade = '2';
    else if (score >= 60) grade = '3';
    else if (score >= 50) grade = '4';
    else if (score >= 40) grade = '5';
    else if (score >= 20) grade = '6';

    return {
        teui: round2(TE / (AFe + AFn)),
        euiAdj: round2(euiStar),
        euiPrime: round2(EuiPrime),
        score: round2(score),
        grade,
        Et: round2(Et), Ep: round2(Ep), Eh: round2(Eh), EN: round2(EN),
        deltaEui: round2(deltaEui), AFe: round2(AFe), AFn: round2(AFn), UR: ur,
        benchmarks: { min: round2(euiMin), g: round2(euiG), m: round2(euiM), max: round2(euiMax) },
        reliability, energyZoneDetails, exemptZoneDetails
    };
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
