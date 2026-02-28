export interface ElevatorItem {
    load: number;    // 載重 kg
    speed: number;   // 速度 m/min
    qty: number;     // 台數
    type: 'normal' | 'vfd' | 'vfd_regen'; // 普通 / 變頻 / 變頻回收
    hours: number;   // 年運轉時數 hr/yr
}

export interface EscalatorItem {
    qty: number;
    hours: number;
}

export interface WaterInput {
    towerHeight: number;      // 水塔高度 HP1 (m)
    annualUsage: number;      // 年用水量 Qw (m³/yr) — 若 0 則由系統估算
    // 用水量估算用（可選）
    hotelRooms?: number;       // 飯店客房數 NR
    hotelOccupancy?: number;   // 旅館年住房率 YOR (0~1)
    hospitalBeds?: number;     // 病床數 NB
    hospitalOccupancy?: number;// 醫院占床率 YOB (0~1)
    toiletArea?: number;       // 廁所(盥洗室)面積 Afw (m²)
    toiletHours?: number;      // 全年營運時間 YOH (hr/yr)
    rainwaterRecovery?: number;// 雨水回收量 Qrw (m³/yr)
    waterCooledAcArea?: number;// 水冷式空調面積 Afwa (m²)
}

export interface HotWaterInput {
    type: 'electric' | 'heatpump' | 'none'; // 熱水設備類型
    restaurantArea?: number;     // 餐廳面積 Afi (m²)
    restaurantDays?: number;     // 全年營運天數 YOD (day/yr)
    restaurantServiceType?: 'one' | 'two' | 'three' | '24h' | 'none'; // 餐飲服務類型
    hotelRooms?: number;
    hotelOccupancy?: number;
    hospitalBeds?: number;
    hospitalOccupancy?: number;
    toiletArea?: number;
    toiletHours?: number;
}

export interface AssessmentInput {
    buildingName: string;
    buildingAddress: string;
    location: string;             // 行政區名稱，供 UR 查表
    buildingType: string;         // 建築分類代碼，如 "G-2"，供 Or/Osr 查表
    totalFloorArea: number;       // 總樓地板面積 (包含評估+免評估)
    floorsAbove: number;
    floorsBelow: number;

    // 用電量
    totalElectricityTE: number;   // 年總耗電量 TE (kWh/yr)
    totalElectricityTE_y2?: number; // 第2年（若填，自動取平均）
    otherSpecialPowerEe: number;  // 其他特殊用電量 Ee (kWh/yr)

    // 用水
    waterUsage: number;           // 年用水量 m³/yr (直接輸入)
    waterInput?: WaterInput;      // 詳細水資料（用於精確計算 Ep）

    // 熱水
    hotWaterInput?: HotWaterInput;

    // 評估分區
    energyZones: Array<{
        code: string;
        area: number;
        isIntermittent: boolean;
        isWaterCooled: boolean;
    }>;

    // 免評估分區（EN 計算用）
    exemptZones: Array<{
        code: string;
        area: number;
    }>;

    // 設備
    elevators: ElevatorItem[];
    escalators?: EscalatorItem[];

    // 每月用電資料 (檢驗信賴度用)
    monthlyData?: Array<{ m: number; y1: string; y2: string }>;
}

export interface ZoneDetail {
    name: string;
    code: string;
    area: number;
    aeui: number;
    leui: number;
    eeui: number;
    ur: number;
    sori: number;
    energy: number;
}

export interface ExemptZoneDetail {
    name: string;
    code: string;
    area: number;
    formula: string;
    energy: number;
}

export interface ReliabilityCheck {
    totalTE: number;
    monthlyMaxVariation: number;
    yearlyVariation: number;
    isMonthlyValid: boolean;
    isYearlyValid: boolean;
}

export interface CalculationResult {
    teui: number;       // 總耗電密度 TEUI
    euiAdj: number;     // 耗電密度指標 EUI*
    euiPrime: number;   // 主設備耗電密度 EUI'
    score: number;      // 能效得分 SCORE
    grade: string;      // 能效等級

    // 中間值（供對照 Excel）
    Et: number;         // 電梯耗電 kWh/yr
    Ep: number;         // 揚水耗電 kWh/yr
    Eh: number;         // 熱水耗電 kWh/yr
    EN: number;         // 免評估用電 kWh/yr
    deltaEui: number;   // △EUI

    AFe: number;        // 評估樓板面積
    AFn: number;        // 免評估樓板面積
    UR: number;         // 城鄉係數

    benchmarks: {
        min: number;    // EUImin
        g: number;      // EUIg (GB基準 = 0.8×中位值)
        m: number;      // EUIm (中位值)
        max: number;    // EUImax
    };

    // 詳細報表數據
    reliability: ReliabilityCheck;
    energyZoneDetails: ZoneDetail[];
    exemptZoneDetails: ExemptZoneDetail[];
}
