"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Zap, LayoutDashboard, Settings2, Droplets, Activity, BarChart3, Save, Plus, Map, ShieldOff, FileText, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FloorPlanTool } from "@/components/FloorPlanTool";

import { buildingTypes } from "@/lib/building-types";
import { euiTable } from "@/lib/eui-table";
import { exemptEuiTable } from '@/lib/exempt-eui-table';
import { calculateBERSe } from "@/lib/calculator";
import { AssessmentInput, CalculationResult } from "@/lib/types";

const steps = [
    { id: "basic", label: "基本資料", icon: Building2 },
    { id: "energy", label: "電費資料", icon: Zap },
    { id: "spaces", label: "分區空間", icon: LayoutDashboard },
    { id: "equipment", label: "設備資料", icon: Settings2 },
    { id: "water", label: "水資料", icon: Droplets },
    { id: "operation", label: "營運率資料", icon: Activity },
    { id: "result", label: "初步結果", icon: BarChart3 },
];

const INP = "h-12 w-full rounded-xl bg-zinc-800/50 border border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 text-sm px-4 focus:outline-none focus:border-sky-500/40 focus:bg-zinc-800 transition-all shadow-none";
const INPSM = "h-9 w-full rounded-lg bg-zinc-800/50 border border-white/[0.06] text-zinc-200 placeholder:text-zinc-700 text-sm px-3 focus:outline-none focus:border-sky-500/30 transition-all shadow-none";
const SEL = "h-12 w-full rounded-xl bg-zinc-800/50 border border-white/[0.06] text-zinc-100 text-sm px-4 focus:border-sky-500/40 shadow-none transition-all data-[state=open]:border-sky-500/40";
const SELSM = "h-9 w-full rounded-lg bg-zinc-800/50 border border-white/[0.06] text-zinc-200 text-sm px-3 shadow-none transition-all focus:border-sky-500/30";
const SC = "rounded-xl bg-zinc-900 border border-white/10 shadow-xl";
const LBL = "text-[13px] text-zinc-400 mb-2 block";
const LBLSM = "text-[11px] text-zinc-500 mb-1.5 block";

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400"><Icon size={14} /></div>
            <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">{title}</h2>
        </div>
    );
}

function SubHead({ title, onAdd }: { title: string; onAdd?: () => void }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-zinc-200">{title}</p>
            {onAdd && (
                <Button onClick={onAdd} variant="outline" size="sm" className="h-7 px-2.5 text-[11px] rounded-lg border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white hover:bg-white/[0.06]">
                    <Plus className="w-3 h-3 mr-1" /> 新增
                </Button>
            )}
        </div>
    );
}

function SummaryReport({ result, basic }: { result: CalculationResult; basic: any }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">BERSe 評估總表</h1>
                    <p className="text-zinc-500 text-sm mt-1">建築能效評估完整數據報告 — {basic.companyName}</p>
                </div>
                <Button className="h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/20"><Download size={16} className="mr-2" /> 下載報告</Button>
            </div>

            {/* 一、建築物及空調基本資料 */}
            <ReportSection title="一、建築物及空調基本資料" icon={FileText} count={13}>
                <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                    <ReportRowG label="建築物名稱" value={basic.companyName} />
                    <ReportRowG label="建築物地址" value={basic.address} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
                        <ReportRowI label="總樓地板面積" value={basic.totalFloorArea} unit="m²" />
                        <ReportRowI label="評估樓地板面積" value={result.AFe} unit="m²" />
                        <ReportRowI label="地上總樓層數" value={basic.groundFloors} unit="層" />
                        <ReportRowI label="地下總樓層數" value={basic.basementFloors} unit="層" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5">
                        <ReportRowI label="實際年總耗電量" value={result.reliability.totalTE} unit="kWh/yr" />
                        <ReportRowI label="雨中水年利用量" value="-" unit="m³" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5">
                        <ReportRowI label="其他特殊用電" value="0" unit="kWh/yr" />
                        <ReportRowI label="城鄉係數" value={result.UR} unit="" />
                    </div>
                </div>
            </ReportSection>

            {/* 二、用電信賴度檢驗 */}
            <ReportSection title="二、用電信賴度檢驗" icon={Activity} count={3}>
                <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                    <div className="bg-zinc-900/50 p-4 flex justify-between items-center group">
                        <span className="text-zinc-400 text-sm">年總耗電量</span>
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-100 font-mono font-bold text-lg">{result.reliability.totalTE.toLocaleString()}</span>
                            <span className="text-zinc-600 text-xs">(kWh/yr)</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5">
                        <ReportRowReliability label="日平均用電量之最大月用電量變動率" valid={result.reliability.isMonthlyValid} value={result.reliability.monthlyMaxVariation} threshold="合格 < 50%" />
                        <ReportRowReliability label="日平均用電量之年變動率" valid={result.reliability.isYearlyValid} value={result.reliability.yearlyVariation} threshold="合格 < 15%" />
                    </div>
                </div>
            </ReportSection>

            {/* 三、BERSe免評估分區資料 */}
            <ReportSection title="三、BERSe免評估分區資料" icon={ShieldOff} count={result.exemptZoneDetails.length}>
                <div className="border border-white/10 rounded-xl overflow-hidden relative">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-800 text-zinc-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                            <tr>
                                <th className="px-6 py-3">免評估分區</th>
                                <th className="px-6 py-3 text-center">面積 (m²)</th>
                                <th className="px-6 py-3 text-center">年耗電量計算公式 (kWh/yr)</th>
                                <th className="px-6 py-3 text-right">年耗電量 (kWh/yr)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {result.exemptZoneDetails.map((z, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-zinc-300 font-medium">{z.name}</td>
                                    <td className="px-6 py-4 text-center text-zinc-400 font-mono">{z.area}</td>
                                    <td className="px-6 py-4 text-center text-zinc-500 font-mono italic">{z.formula}</td>
                                    <td className="px-6 py-4 text-right text-zinc-200 font-bold font-mono">{z.energy.toLocaleString()}</td>
                                </tr>
                            ))}
                            {result.exemptZoneDetails.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-600 text-sm italic">無免評估分區數據</td></tr>
                            )}
                        </tbody>
                        <tfoot className="bg-zinc-900/80 font-bold text-zinc-200 border-t border-white/10">
                            <tr>
                                <td className="px-6 py-4">免評估分區總面積</td>
                                <td className="px-6 py-4 text-center font-mono text-zinc-100">{result.AFn}</td>
                                <td className="px-6 py-4 text-center text-zinc-500">免評估分區總年耗電量</td>
                                <td className="px-6 py-4 text-right font-mono text-xl text-sky-400">{result.EN.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </ReportSection>

            {/* 四、BERSe耗能分區資料 */}
            <ReportSection title="四、BERSe耗能分區資料" icon={LayoutDashboard} count={result.energyZoneDetails.length}>
                <div className="border border-white/10 rounded-xl overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-zinc-800 text-zinc-400 uppercase font-black tracking-widest border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3 min-w-[120px]">耗能分區</th>
                                    <th className="px-4 py-3 text-center">面積 (m²)</th>
                                    <th className="px-4 py-3 text-center">AEUIm</th>
                                    <th className="px-4 py-3 text-center">LEUIm</th>
                                    <th className="px-4 py-3 text-center">EEUIm</th>
                                    <th className="px-4 py-3 text-center">城鄉數 UR</th>
                                    <th className="px-4 py-3 text-center">空間營運率</th>
                                    <th className="px-4 py-3 text-right">年耗電量</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {result.energyZoneDetails.map((z, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-zinc-300 font-bold">{z.name}</td>
                                        <td className="px-4 py-3 text-center text-zinc-400 font-mono">{z.area}</td>
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{z.aeui}</td>
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{z.leui}</td>
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{z.eeui}</td>
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{z.ur}</td>
                                        <td className="px-4 py-3 text-center text-zinc-500 font-mono">{z.sori}</td>
                                        <td className="px-4 py-3 text-right text-zinc-200 font-bold font-mono">{z.energy.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-zinc-900 font-bold text-zinc-200 border-t border-white/10">
                                <tr>
                                    <td className="px-4 py-2">耗能分區總年耗電量</td>
                                    <td colSpan={7} className="px-4 py-2 text-right font-mono text-zinc-100">{(result.energyZoneDetails.reduce((s, z) => s + z.energy, 0)).toFixed(0)} kWh/yr</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 divide-y divide-white/5">
                        <ReportSummaryItem label="實際年總耗電量" value={result.reliability.totalTE} unit="kWh/yr" />
                        <ReportSummaryItem label="輸送設備年耗電量 (Et)" value={result.Et} unit="kWh/yr" />
                        <ReportSummaryItem label="揚水設備年耗電量 (Ep)" value={result.Ep} unit="kWh/yr" />
                        <ReportSummaryItem label="加熱設備年耗電量 (Eh)" value={result.Eh} unit="kWh/yr" />
                        <ReportSummaryItem label="其他特殊用電量 (Ee)" value="0" unit="kWh/yr" />
                    </div>
                    <div className="bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 flex flex-col justify-center gap-4">
                        <div className="flex justify-between items-center group">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">總耗電密度 TEUI</span>
                            <span className="text-zinc-100 font-mono font-black text-2xl group-hover:text-sky-400 transition-colors">{result.teui} <span className="text-[10px] text-zinc-600 ml-1">kWh/(m².yr)</span></span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">主設備用電密度 EUI'</span>
                            <span className="text-zinc-100 font-mono font-black text-2xl group-hover:text-sky-400 transition-colors">{result.euiPrime} <span className="text-[10px] text-zinc-600 ml-1">kWh/(m².yr)</span></span>
                        </div>
                    </div>
                </div>
            </ReportSection>

            {/* 五、能效指標 */}
            <ReportSection title="五、能效指標" icon={BarChart3} count={7}>
                <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10 shadow-2xl shadow-black/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10">
                        <ReportRowI label="EUI 最小值" value={result.benchmarks.min} unit="kWh/(m².yr)" />
                        <ReportRowI label="EUI GB 基準值" value={result.benchmarks.g} unit="kWh/(m².yr)" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10">
                        <ReportRowI label="EUI 中位值" value={result.benchmarks.m} unit="kWh/(m².yr)" />
                        <ReportRowI label="EUI 最大值" value={result.benchmarks.max} unit="kWh/(m².yr)" />
                    </div>
                    <ReportRowLarge label="耗電密度差距 ΔEUI" value={result.deltaEui} unit="kWh/(m².yr)" detail="EUI' − SOR加權標準值" />
                    <ReportRowLarge label="耗電密度指標 EUI*" value={result.euiAdj} unit="kWh/(m².yr)" detail="EUIm + ΔEUI" />
                    <ReportRowLarge label="碳排密度指標 CEI*" value={(result.euiAdj * 0.495).toFixed(2)} unit="kgCO2/(m².yr)" detail="EUI* × 0.495" />
                    <div className="bg-zinc-900 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2 block">能效得分計算</span>
                            <div className="flex items-end gap-2">
                                <span className="text-7xl font-black text-white leading-none tracking-tighter">{Math.round(result.score)}</span>
                                <span className="text-zinc-600 font-bold mb-2">分 / 100</span>
                            </div>
                        </div>
                        <div className="h-24 w-[1px] bg-white/10 hidden md:block" />
                        <div className="flex-1 text-right">
                            <span className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-2 block text-right">能效等級判定</span>
                            <div className="flex flex-col items-end">
                                <span className="text-7xl font-black text-emerald-400 leading-none tracking-tighter group-hover:scale-110 transition-transform">{result.grade} 級</span>
                                <span className="text-emerald-500/50 font-black text-xl italic uppercase tracking-widest mt-1">Excellent (銀級)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ReportSection>
        </div>
    );
}

function ReportSection({ title, icon: Icon, count, children }: { title: string, icon: any, count: number, children: React.ReactNode }) {
    return (
        <div className="space-y-4 group">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-zinc-400 group-hover:text-sky-400 group-hover:bg-sky-500/10 transition-all duration-300">
                    <Icon size={18} />
                </div>
                <h2 className="text-base font-black text-zinc-300 group-hover:text-white transition-colors tracking-tight">{title}</h2>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-600">({count} 項目)</span>
            </div>
            {children}
        </div>
    );
}

function ReportRowG({ label, value }: { label: string, value: string }) {
    return (
        <div className="grid grid-cols-[160px_1fr] bg-zinc-900/30 hover:bg-zinc-900 transition-colors">
            <div className="py-3 px-6 text-zinc-500 text-xs font-bold border-r border-white/5 bg-zinc-800/20">{label}</div>
            <div className="py-3 px-6 text-zinc-200 text-sm font-medium">{value || "-"}</div>
        </div>
    );
}

function ReportRowI({ label, value, unit }: { label: string, value: any, unit: string }) {
    return (
        <div className="flex flex-col p-4 bg-zinc-900/30 hover:bg-zinc-900 transition-colors">
            <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-zinc-100 font-mono font-bold text-base">{value || "0"}</span>
                <span className="text-zinc-600 text-[9px]">{unit}</span>
            </div>
        </div>
    );
}

function ReportRowReliability({ label, valid, value, threshold }: { label: string, valid: boolean, value: number, threshold: string }) {
    const pct = (value * 100).toFixed(1) + "%";
    return (
        <div className="p-5 flex flex-col gap-3 group">
            <div className="flex justify-between items-start">
                <p className="text-zinc-400 text-[13px] leading-relaxed max-w-[240px]">{label}</p>
                <div className="text-right">
                    <div className={`text-lg font-mono font-black ${valid ? 'text-sky-400' : 'text-red-400'}`}>{pct}</div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">({threshold})</div>
                </div>
            </div>
            <div className="flex items-center gap-6 mt-1">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded bg-zinc-800 border-2 ${valid ? 'bg-sky-500 border-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]' : 'border-zinc-700'}`} />
                    <span className={`text-[10px] font-bold ${valid ? 'text-sky-400' : 'text-zinc-600'}`}>合格</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded bg-zinc-800 border-2 ${!valid ? 'bg-red-500 border-red-400' : 'border-zinc-700'}`} />
                    <span className={`text-[10px] font-bold ${!valid ? 'text-red-400' : 'text-zinc-600'}`}>不合格</span>
                </div>
            </div>
        </div>
    );
}

function ReportRowLarge({ label, value, unit, detail }: { label: string, value: any, unit: string, detail: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_200px] divide-x divide-white/10 group hover:bg-zinc-800/30 transition-colors">
            <div className="p-4 flex flex-col justify-center">
                <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <div className="p-4 flex items-center justify-center">
                <span className="text-3xl font-black text-zinc-100 font-mono">{value} <span className="text-xs text-zinc-600 font-normal ml-1">{unit}</span></span>
            </div>
            <div className="p-4 flex flex-col justify-center items-end">
                <span className="text-zinc-600 text-[10px] italic">{detail}</span>
            </div>
        </div>
    );
}

function ReportSummaryItem({ label, value, unit }: { label: string, value: any, unit: string }) {
    return (
        <div className="py-2.5 flex justify-between items-center group">
            <span className="text-zinc-500 text-xs group-hover:text-zinc-400 transition-colors">{label}</span>
            <div className="flex items-baseline gap-2">
                <span className="text-zinc-200 font-mono font-bold text-sm tracking-tighter">{value === "-" ? "-" : Number(value).toLocaleString()}</span>
                <span className="text-zinc-700 text-[9px] uppercase">{unit}</span>
            </div>
        </div>
    );
}

function ResultRow({ label, value, unit }: { label: string, value: any, unit: string }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-zinc-400 text-[11px] font-medium group-hover:text-zinc-300 transition-colors">{label}</span>
            <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-100 font-mono font-bold text-sm leading-none tabular-nums">{value.toLocaleString()}</span>
                <span className="text-[9px] text-zinc-600 font-bold uppercase">{unit}</span>
            </div>
        </div>
    );
}

const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

const DEMO_DATA = {
    basic: {
        companyName: "臺北市政府環境保護局(木柵分隊)",
        buildingTypeCode: "G-2", // Added from context
        contactPerson: "A",
        contactEmail: "A",
        phone: "A",
        totalFloorArea: "761.11",
        groundFloors: "5",
        basementFloors: "0",
        address: "台北市文山區木柵路二段138巷26號",
        startDay: "1",
        endDay: "5",
        startTime: "09:00",
        endTime: "18:00",
        allDay: false
    },
    monthly: [
        { m: 1, y1: "2840", y2: "3400" }, { m: 2, y1: "", y2: "" },
        { m: 3, y1: "3200", y2: "3400" }, { m: 4, y1: "", y2: "" },
        { m: 5, y1: "3120", y2: "3080" }, { m: 6, y1: "", y2: "" },
        { m: 7, y1: "4600", y2: "4480" }, { m: 8, y1: "", y2: "" },
        { m: 9, y1: "5120", y2: "4480" }, { m: 10, y1: "", y2: "" },
        { m: 11, y1: "3680", y2: "4200" }, { m: 12, y1: "", y2: "" }
    ],
    spaces: [
        { id: 1, typeCode: "B3 行政辦公大樓-一般辦公大樓(一般商辦、政府辦公、分租型辦公)", isIntermittent: true, area: "189.88" },
        { id: 1772295921532, typeCode: "B4 行政辦公大樓-一般辦公大樓專用大或專用走廊休息區等次空間", isIntermittent: true, area: "157.50" }
    ],
    ac: [],
    lt: [],
    el: [
        { id: 1772295957183, type: "normal", qty: "1", load: "800", speed: "60", year: "2020", hours: "2500" }
    ],
    exemptSpaces: [
        { id: 501, typeCode: "N321", area: "393.69" }
    ],
    water: {
        towerHeight: "19.5",
        annualUsage: "400", // Defaulting to some value as it was empty
        toiletArea: "", toiletHours: "", restaurantType: "", restaurantArea: "", restaurantDays: "", hotWaterType: ""
    }
};


export default function AssessmentPage() {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<CalculationResult | null>(null);

    // Basic info
    const [basic, setBasic] = useState({
        companyName: "", buildingTypeCode: "",
        contactPerson: "", contactEmail: "", phone: "",
        totalFloorArea: "", groundFloors: "", basementFloors: "", address: "",
        startDay: "1", endDay: "5", startTime: "09:00", endTime: "18:00", allDay: false,
    });
    const setB = (k: string, v: any) => setBasic(p => ({ ...p, [k]: v }));

    // Electricity - monthly 2 years
    const [billCycle, setBillCycle] = useState<"monthly" | "bimonthly">("monthly");
    const [yr1, setYr1] = useState("2024");
    const [yr2, setYr2] = useState("2023");
    const [monthly, setMonthly] = useState(Array.from({ length: 12 }, (_, i) => ({ m: i + 1, y1: "", y2: "" })));
    const updM = (i: number, f: "y1" | "y2", v: string) => setMonthly(p => p.map((r, idx) => idx === i ? { ...r, [f]: v } : r));

    // Spaces
    const [spaces, setSpaces] = useState([{ id: 1, typeCode: "", isIntermittent: true, area: "" }]);
    const [floorLicenseArea, setFloorLicenseArea] = useState("");
    const addSp = (area?: number) => setSpaces(p => [...p, { id: Date.now(), typeCode: "", isIntermittent: true, area: area ? area.toFixed(1) : "" }]);
    const rmSp = (id: number) => setSpaces(p => p.filter(s => s.id !== id));

    // Equipment - AC
    const [acList, setAc] = useState<{ id: number; type: string; tonnage: string; qty: string; year: string; hours: string }[]>([]);
    const addAc = () => setAc(p => [...p, { id: Date.now(), type: "", tonnage: "", qty: "", year: "", hours: "" }]);
    const rmAc = (id: number) => setAc(p => p.filter(i => i.id !== id));
    const upAc = (id: number, k: string, v: string) => setAc(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));

    // Equipment - Lighting
    const [ltList, setLt] = useState<{ id: number; type: string; qty: string; year: string; hours: string }[]>([]);
    const addLt = () => setLt(p => [...p, { id: Date.now(), type: "", qty: "", year: "", hours: "" }]);
    const rmLt = (id: number) => setLt(p => p.filter(i => i.id !== id));
    const upLt = (id: number, k: string, v: string) => setLt(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));

    // Equipment - Elevator
    const [elList, setEl] = useState<{ id: number; type: string; qty: string; load: string; speed: string; year: string; hours: string }[]>([]);
    const addEl = () => setEl(p => [...p, { id: Date.now(), type: "", qty: "", load: "", speed: "", year: "", hours: "" }]);
    const rmEl = (id: number) => setEl(p => p.filter(i => i.id !== id));
    const upEl = (id: number, k: string, v: string) => setEl(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));

    // Exempt Spaces
    const [exemptSpaces, setExemptSpaces] = useState<{ id: number; typeCode: string; area: string }[]>([]);
    const addExSp = () => setExemptSpaces(p => [...p, { id: Date.now(), typeCode: "", area: "" }]);
    const rmExSp = (id: number) => setExemptSpaces(p => p.filter(s => s.id !== id));
    const upExSp = (id: number, k: string, v: string) => setExemptSpaces(p => p.map(s => s.id === id ? { ...s, [k]: v } : s));

    // Equipment - Server room
    const [svList, setSv] = useState<{ id: number; name: string; power: string }[]>([]);
    const addSv = () => setSv(p => [...p, { id: Date.now(), name: "", power: "" }]);
    const rmSv = (id: number) => setSv(p => p.filter(i => i.id !== id));
    const upSv = (id: number, k: string, v: string) => setSv(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));

    // Water
    const [water, setWater] = useState({ towerHeight: "", annualUsage: "", toiletArea: "", toiletHours: "", restaurantType: "", restaurantArea: "", restaurantDays: "", hotWaterType: "" });
    const setW = (k: string, v: string) => setWater(p => ({ ...p, [k]: v }));

    // Operation rates
    const [op, setOp] = useState({ exhibitionOR: "", largeMeetingOR: "", smallMeetingOR: "", nationalTheaterOR: "", generalTheaterOR: "" });
    const setO = (k: string, v: string) => setOp(p => ({ ...p, [k]: v }));

    const handleToggleDemo = (checked: boolean) => {
        setIsDemoMode(checked);
        if (checked) {
            // Priority: LocalStorage (Custom Demo) > Static DEMO_DATA
            const custom = localStorage.getItem("BERS2_CUSTOM_DEMO");
            const dataToUse = custom ? JSON.parse(custom) : DEMO_DATA;

            setBasic(dataToUse.basic);
            setMonthly(dataToUse.monthly);
            setSpaces(dataToUse.spaces);
            setAc(dataToUse.ac || dataToUse.acList || []);
            setLt(dataToUse.lt || dataToUse.ltList || []);
            setEl(dataToUse.el || dataToUse.elList || []);
            setExemptSpaces(dataToUse.exemptSpaces || []);
            setWater(dataToUse.water);
        } else {
            // Reset to default
            setBasic({ companyName: "", buildingTypeCode: "", contactPerson: "", contactEmail: "", phone: "", totalFloorArea: "", groundFloors: "", basementFloors: "", address: "", startDay: "1", endDay: "5", startTime: "09:00", endTime: "18:00", allDay: false });
            setMonthly(Array.from({ length: 12 }, (_, i) => ({ m: i + 1, y1: "", y2: "" })));
            setSpaces([{ id: 1, typeCode: "", isIntermittent: true, area: "" }]);
            setExemptSpaces([]);
            setAc([]);
            setLt([]);
            setEl([]);
            setWater({ towerHeight: "", annualUsage: "", toiletArea: "", toiletHours: "", restaurantType: "", restaurantArea: "", restaurantDays: "", hotWaterType: "" });
            setResult(null);
        }
    };

    const saveAsDemo = () => {
        const data = {
            basic,
            monthly,
            spaces,
            exemptSpaces,
            ac: acList,
            lt: ltList,
            el: elList,
            water
        };
        localStorage.setItem("BERS2_CUSTOM_DEMO", JSON.stringify(data));
        console.log("NEW_DEMO_DATA:", JSON.stringify(data, null, 2));
        alert("目前的表單內容已儲存為本機 Demo！之後啟動 DEMO MODE 會優先載入此內容。\n\n完整的 JSON 也已輸出到 Console (F12)，如有需要可複製給 AI 更新。");
    };

    const currentIndex = steps.findIndex(s => s.id === activeTab);
    const handleNext = () => { if (currentIndex < steps.length - 1) setActiveTab(steps[currentIndex + 1].id); };
    const handlePrev = () => { if (currentIndex > 0) setActiveTab(steps[currentIndex - 1].id); };

    const calculate = () => {

        // 年總耗電量：取 2 年平均（對照 Excel 電費單資料）
        const te_y1 = monthly.reduce((s, r) => s + (Number(r.y1) || 0), 0);
        const te_y2 = monthly.reduce((s, r) => s + (Number(r.y2) || 0), 0);

        const input: AssessmentInput = {
            buildingName: basic.companyName,
            buildingAddress: basic.address,
            location: basic.address, // 地址用於 UR 查表（ideally 應傳行政區）
            buildingType: basic.buildingTypeCode,
            totalFloorArea: Number(basic.totalFloorArea),
            floorsAbove: Number(basic.groundFloors),
            floorsBelow: Number(basic.basementFloors),

            // 用電量（2年平均）
            totalElectricityTE: te_y1,
            totalElectricityTE_y2: te_y2 > 0 ? te_y2 : undefined,
            monthlyData: monthly,
            otherSpecialPowerEe: 0,

            // 用水
            waterUsage: Number(water.annualUsage) || 0,
            waterInput: {
                towerHeight: Number(water.towerHeight) || 0,
                annualUsage: Number(water.annualUsage) || 0,
                toiletArea: Number(water.toiletArea) || 0,
                toiletHours: Number(water.toiletHours) || 0,
                rainwaterRecovery: 0,
            },

            // 熱水
            hotWaterInput: {
                type: (water.hotWaterType as 'electric' | 'heatpump' | 'none') || 'none',
                restaurantArea: Number(water.restaurantArea) || 0,
                restaurantDays: Number(water.restaurantDays) || 0,
                restaurantServiceType: 'none',
            },

            // 評估分區
            energyZones: spaces.map(s => ({
                code: s.typeCode,
                area: Number(s.area),
                isIntermittent: s.isIntermittent,
                isWaterCooled: false,
            })),

            // 免評估分區
            exemptZones: exemptSpaces.map(s => ({
                code: s.typeCode,
                area: Number(s.area)
            })),

            // 電梯設備（對照 填表!U3 公式）
            elevators: elList.map(el => ({
                load: Number(el.load) || 0,
                speed: Number(el.speed) || 0,
                qty: Number(el.qty) || 1,
                type: el.type === 'highspeed' ? 'vfd' : 'normal' as any,
                hours: Number(el.hours) || 2500,
            })),
        };

        setResult(calculateBERSe(input));
    };


    const handleComplete = async () => { calculate(); setIsSubmitting(true); setTimeout(() => setIsSubmitting(false), 1500); };

    return (
        <div className="flex-1 relative selection:bg-sky-800/30 pt-8 md:pt-12 pb-24">
            <div className="relative z-10 flex flex-col lg:flex-row gap-6 w-full max-w-[95%] xl:max-w-[1320px] mx-auto px-4 md:px-8 items-start">

                {/* Left Nav */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-[190px] shrink-0 lg:sticky lg:top-24">
                    <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-2xl flex flex-row flex-wrap gap-0.5 lg:flex-col">
                        {steps.map((step) => {
                            const isActive = activeTab === step.id;
                            const Icon = step.icon;
                            return (
                                <button key={step.id} onClick={() => setActiveTab(step.id)}
                                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 z-10 text-left overflow-hidden lg:w-full ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"}`}>
                                    {isActive && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-sky-900/70 border border-sky-500/20 rounded-xl z-[-1]" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}
                                    <Icon size={13} className={isActive ? "text-sky-400" : "text-zinc-600"} />
                                    <span className="text-[12px] tracking-wide whitespace-nowrap">{step.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Right Content */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex-1 min-w-0">
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl flex flex-col min-h-[560px]">
                        <div className="p-6 md:p-8 flex-1">
                            <AnimatePresence mode="wait">

                                {/* ── 基本資料 ── */}
                                {activeTab === "basic" && (
                                    <motion.div key="basic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-5">
                                        <SectionHeader icon={Building2} title="使用者基本資料" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <div><Label className={LBL}>公司名稱</Label><Input value={basic.companyName} onChange={e => setB("companyName", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>建築類型</Label>
                                                <Select value={basic.buildingTypeCode} onValueChange={v => setB("buildingTypeCode", v)}>
                                                    <SelectTrigger className={SEL}><SelectValue placeholder="辦公室" /></SelectTrigger>
                                                    <SelectContent className={SC}>{buildingTypes.map(t => <SelectItem key={t.code} value={t.code}>{t.type}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div><Label className={LBL}>填寫人員</Label><Input value={basic.contactPerson} onChange={e => setB("contactPerson", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>聯絡信箱</Label><Input type="email" value={basic.contactEmail} onChange={e => setB("contactEmail", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>電話</Label><Input value={basic.phone} onChange={e => setB("phone", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>地板面積(m²)</Label><Input type="number" value={basic.totalFloorArea} onChange={e => setB("totalFloorArea", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>地上總樓層數</Label><Input type="number" value={basic.groundFloors} onChange={e => setB("groundFloors", e.target.value)} className={INP} /></div>
                                            <div><Label className={LBL}>地下總樓層數</Label><Input type="number" value={basic.basementFloors} onChange={e => setB("basementFloors", e.target.value)} className={INP} /></div>
                                            <div className="md:col-span-2"><Label className={LBL}>地址</Label><Input value={basic.address} onChange={e => setB("address", e.target.value)} className={INP} /></div>
                                        </div>
                                        <div>
                                            <Label className={LBL}>建築營運時間</Label>
                                            <div className="bg-zinc-800/30 border border-white/[0.04] rounded-xl p-4">
                                                <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
                                                    <div><Label className={LBLSM}>起始日</Label>
                                                        <Select value={basic.startDay} onValueChange={v => setB("startDay", v)}>
                                                            <SelectTrigger className={SEL}><SelectValue /></SelectTrigger>
                                                            <SelectContent className={SC}>{WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i + 1)}>{d}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div><Label className={LBLSM}>結束日</Label>
                                                        <Select value={basic.endDay} onValueChange={v => setB("endDay", v)}>
                                                            <SelectTrigger className={SEL}><SelectValue /></SelectTrigger>
                                                            <SelectContent className={SC}>{WEEKDAYS.map((d, i) => <SelectItem key={i} value={String(i + 1)}>{d}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div><Label className={LBLSM}>開始時間</Label><Input type="time" value={basic.startTime} onChange={e => setB("startTime", e.target.value)} className={INP} /></div>
                                                    <div><Label className={LBLSM}>結束時間</Label><Input type="time" value={basic.endTime} onChange={e => setB("endTime", e.target.value)} className={INP} /></div>
                                                    <div className="flex items-center gap-2 pb-3">
                                                        <Checkbox id="allday" checked={basic.allDay} onCheckedChange={v => setB("allDay", !!v)} className="border-zinc-600" />
                                                        <label htmlFor="allday" className="text-[13px] text-zinc-400 cursor-pointer">整日</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 電費資料 ── */}
                                {activeTab === "energy" && (
                                    <motion.div key="energy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <SectionHeader icon={Zap} title="電費資料（2年）" />
                                            <div className="flex items-center gap-3 bg-zinc-800/40 p-1.5 rounded-xl border border-white/[0.05]">
                                                <button onClick={() => setBillCycle("monthly")} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${billCycle === "monthly" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-zinc-500 hover:text-zinc-300"}`}>月繳</button>
                                                <button onClick={() => setBillCycle("bimonthly")} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${billCycle === "bimonthly" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-zinc-500 hover:text-zinc-300"}`}>雙月繳</button>
                                            </div>
                                        </div>
                                        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                                            <div className="grid grid-cols-[140px_1fr_1fr] bg-zinc-800/50 border-b border-white/[0.06]">
                                                <div className="py-3 px-4 text-[12px] text-zinc-500 font-medium flex items-center">月</div>
                                                <div className="flex items-center px-3 border-l border-white/[0.06]">
                                                    <Select value={yr1} onValueChange={setYr1}><SelectTrigger className="h-11 w-full bg-transparent dark:bg-transparent dark:hover:bg-transparent border-0 text-zinc-300 text-sm shadow-none focus:ring-0"><SelectValue /></SelectTrigger><SelectContent className={SC}>{[2025, 2024, 2023, 2022, 2021].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
                                                </div>
                                                <div className="flex items-center px-3 border-l border-white/[0.06]">
                                                    <Select value={yr2} onValueChange={setYr2}><SelectTrigger className="h-11 w-full bg-transparent dark:bg-transparent dark:hover:bg-transparent border-0 text-zinc-300 text-sm shadow-none focus:ring-0"><SelectValue /></SelectTrigger><SelectContent className={SC}>{[2025, 2024, 2023, 2022, 2021].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
                                                </div>
                                            </div>
                                            {monthly.map((row, idx) => {
                                                if (billCycle === "bimonthly" && row.m % 2 === 0) return null;
                                                return (
                                                    <div key={row.m} className={`grid grid-cols-[140px_1fr_1fr] border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? "bg-zinc-800/20" : ""}`}>
                                                        <div className="py-2 px-4 text-[13px] text-zinc-400 flex items-center">{billCycle === "bimonthly" ? `${row.m}-${row.m + 1} 月` : `${row.m} 月`}</div>
                                                        <div className="px-3 py-2 border-l border-white/[0.04]">
                                                            <Input type="number" value={row.y1} onChange={e => updM(idx, "y1", e.target.value)} placeholder="0" className={INPSM} />
                                                        </div>
                                                        <div className="px-3 py-2 border-l border-white/[0.04]">
                                                            <Input type="number" value={row.y2} onChange={e => updM(idx, "y2", e.target.value)} placeholder="0" className={INPSM} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 分區空間 ── */}
                                {activeTab === "spaces" && (() => {
                                    const totalEnergyArea = spaces.reduce((s, sp) => s + (Number(sp.area) || 0), 0);
                                    const totalExemptArea = exemptSpaces.reduce((s, sp) => s + (Number(sp.area) || 0), 0);
                                    const totalSpaceArea = totalEnergyArea + totalExemptArea;
                                    const basicArea = Number(basic.totalFloorArea) || 0;
                                    const ratio = basicArea > 0 ? Math.min(totalSpaceArea / basicArea, 1) : 0;
                                    const isOver = basicArea > 0 && totalSpaceArea > basicArea;
                                    return (
                                        <motion.div key="spaces" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-8">
                                            <div className="flex flex-col xl:flex-row gap-8">
                                                <div className="flex-1 space-y-8">
                                                    {/* Energy Zones Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400"><LayoutDashboard size={14} /></div>
                                                                <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">耗能評估分區</h2>
                                                            </div>
                                                            <Button onClick={() => addSp()} variant="outline" size="sm" className="h-7 px-2.5 text-[11px] rounded-lg border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white hover:bg-white/[0.06]"><Plus className="w-3 h-3 mr-1" /> 新增分區</Button>
                                                        </div>
                                                        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                                                            <div className="grid grid-cols-[2fr_1fr_100px_50px] bg-zinc-800/50 border-b border-white/[0.06]">
                                                                <div className="py-2.5 px-3 text-[11px] text-zinc-500">空間類型</div>
                                                                <div className="py-2.5 px-3 text-[11px] text-zinc-500 border-l border-white/[0.06]">空調</div>
                                                                <div className="py-2.5 px-3 text-[11px] text-zinc-500 border-l border-white/[0.06]">面積 (m²)</div>
                                                                <div />
                                                            </div>
                                                            {spaces.map((sp, idx) => (
                                                                <div key={sp.id} className={`grid grid-cols-[2fr_1fr_100px_50px] border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? "bg-zinc-800/20" : ""}`}>
                                                                    <div className="px-2 py-1.5"><Select value={sp.typeCode} onValueChange={v => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, typeCode: v } : s))}><SelectTrigger className={SELSM}><SelectValue placeholder="請選擇" /></SelectTrigger><SelectContent className={`${SC} max-h-60`}>{Object.entries(euiTable as any).map(([code, data]: any) => <SelectItem key={code} value={code}>{data.name} ({code})</SelectItem>)}</SelectContent></Select></div>
                                                                    <div className="px-2 py-1.5 border-l border-white/[0.04]"><Select value={sp.isIntermittent ? "yes" : "no"} onValueChange={v => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, isIntermittent: v === "yes" } : s))}><SelectTrigger className={SELSM}><SelectValue /></SelectTrigger><SelectContent className={SC}><SelectItem value="yes">間歇</SelectItem><SelectItem value="no">全天</SelectItem></SelectContent></Select></div>
                                                                    <div className="px-2 py-1.5 border-l border-white/[0.04]"><Input type="number" value={sp.area} onChange={e => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, area: e.target.value } : s))} placeholder="m²" className={INPSM} /></div>
                                                                    <div className="flex items-center justify-center border-l border-white/[0.04]"><button onClick={() => rmSp(sp.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors px-2">✕</button></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Exempt Zones Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-md bg-zinc-500/10 text-zinc-400"><ShieldOff size={14} /></div>
                                                                <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">免評評估分區</h2>
                                                            </div>
                                                            <Button onClick={() => addExSp()} variant="outline" size="sm" className="h-7 px-2.5 text-[11px] rounded-lg border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white hover:bg-white/[0.06]"><Plus className="w-3 h-3 mr-1" /> 新增免評分區</Button>
                                                        </div>
                                                        <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                                                            <div className="grid grid-cols-[2fr_100px_50px] bg-zinc-800/50 border-b border-white/[0.06]">
                                                                <div className="py-2.5 px-3 text-[11px] text-zinc-500">免評估空間類型</div>
                                                                <div className="py-2.5 px-3 text-[11px] text-zinc-500 border-l border-white/[0.06]">面積 (m²)</div>
                                                                <div />
                                                            </div>
                                                            {exemptSpaces.length === 0 && (
                                                                <div className="py-6 text-center text-zinc-600 text-xs italic">尚無免評估分區</div>
                                                            )}
                                                            {exemptSpaces.map((sp, idx) => (
                                                                <div key={sp.id} className={`grid grid-cols-[2fr_100px_50px] border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? "bg-zinc-800/20" : ""}`}>
                                                                    <div className="px-2 py-1.5"><Select value={sp.typeCode} onValueChange={v => setExemptSpaces(exemptSpaces.map(s => s.id === sp.id ? { ...s, typeCode: v } : s))}><SelectTrigger className={SELSM}><SelectValue placeholder="請選擇" /></SelectTrigger><SelectContent className={`${SC} max-h-60`}>{exemptEuiTable.map((data: any) => <SelectItem key={data.mainCode} value={data.mainCode}>{data.description} ({data.mainCode})</SelectItem>)}</SelectContent></Select></div>
                                                                    <div className="px-2 py-1.5 border-l border-white/[0.04]"><Input type="number" value={sp.area} onChange={e => setExemptSpaces(exemptSpaces.map(s => s.id === sp.id ? { ...s, area: e.target.value } : s))} placeholder="m²" className={INPSM} /></div>
                                                                    <div className="flex items-center justify-center border-l border-white/[0.04]"><button onClick={() => rmExSp(sp.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors px-2">✕</button></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Summary Card */}
                                                    <div className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between text-[12px]">
                                                                <span className="text-zinc-400">總樓地板面積 (加總)</span>
                                                                <span className={`font-mono font-bold text-lg ${isOver ? "text-red-400" : "text-zinc-100"}`}>{totalSpaceArea.toFixed(2)} m²</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[12px]">
                                                                <span className="text-zinc-500">基本資料設定面積</span>
                                                                <span className="font-mono text-zinc-400">{basicArea.toFixed(2)} m²</span>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <div className="w-full h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : ratio > 0.95 ? "bg-emerald-400" : "bg-sky-500"}`} style={{ width: `${ratio * 100}%` }} />
                                                                </div>
                                                                <p className={`text-[10px] uppercase tracking-wider font-bold ${isOver ? "text-red-500" : ratio > 0.95 ? "text-emerald-500" : "text-zinc-500"}`}>
                                                                    {isOver ? `面積超出 ${((totalSpaceArea / (basicArea || 1) - 1) * 100).toFixed(1)}%` : `填寫進度 ${(ratio * 100).toFixed(1)}%`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col justify-center">
                                                                <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">評估面積</p>
                                                                <p className="text-lg font-mono text-emerald-400 font-black">{totalEnergyArea.toFixed(2)}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex flex-col justify-center">
                                                                <p className="text-[10px] text-zinc-500 uppercase font-black mb-1 tracking-widest">免評面積</p>
                                                                <p className="text-lg font-mono text-zinc-400 font-black">{totalExemptArea.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Area tools */}
                                                <div className="xl:w-[420px] shrink-0">
                                                    <div className="bg-zinc-800/20 border border-white/[0.06] rounded-xl p-3 flex flex-col gap-3 h-full sticky top-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded-md bg-sky-500/10 text-sky-400"><Map size={13} /></div>
                                                            <p className="text-[12px] font-black text-zinc-300 uppercase tracking-widest">平面圖面積工具</p>
                                                        </div>
                                                        <div className="space-y-4 mt-2">
                                                            <div>
                                                                <Label className="text-[11px] text-zinc-500 mb-1.5 block uppercase font-bold">樓層執照面積 (m²)</Label>
                                                                <Input type="number" value={floorLicenseArea} onChange={e => setFloorLicenseArea(e.target.value)}
                                                                    placeholder={basicArea > 0 ? `預設使用基本資料 ${basicArea} m²` : "輸入執照總面積"}
                                                                    className={INPSM} />
                                                            </div>
                                                            <FloorPlanTool
                                                                licenseArea={Number(floorLicenseArea) || basicArea}
                                                                onAddEnergyArea={(area) => addSp(area)}
                                                                onAddExemptArea={(area) => {
                                                                    setExemptSpaces(p => [...p, { id: Date.now(), typeCode: "", area: area.toFixed(1) }]);
                                                                }}
                                                            />
                                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                                                                    * 使用工具繪製平面圖分區，系統將自動依據上述「執照面積」換算為實際平方公尺。
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}

                                {/* ── 設備資料 ── */}
                                {activeTab === "equipment" && (
                                    <motion.div key="equipment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-7">
                                        <SectionHeader icon={Settings2} title="設備資料" />
                                        {/* 空調設備 */}
                                        <div>
                                            <SubHead title="空調設備" onAdd={addAc} />
                                            {acList.length === 0 ? <p className="text-zinc-700 text-xs py-2">尚無設備，點擊「+ 新增」加入</p> : acList.map(item => (
                                                <div key={item.id} className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4 mb-2 group">
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                        <div><Label className={LBLSM}>類型</Label>
                                                            <Select value={item.type} onValueChange={v => upAc(item.id, "type", v)}>
                                                                <SelectTrigger className={SEL}><SelectValue placeholder="中央空調" /></SelectTrigger>
                                                                <SelectContent className={SC}><SelectItem value="central">中央空調</SelectItem><SelectItem value="vrv">VRV</SelectItem><SelectItem value="split">分離式</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><Label className={LBLSM}>噸數</Label>
                                                            <Select value={item.tonnage} onValueChange={v => upAc(item.id, "tonnage", v)}>
                                                                <SelectTrigger className={SEL}><SelectValue placeholder="1RT" /></SelectTrigger>
                                                                <SelectContent className={SC}>{["1RT", "2RT", "5RT", "10RT", "20RT", "50RT", "100RT"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><Label className={LBLSM}>台數</Label><Input type="number" value={item.qty} onChange={e => upAc(item.id, "qty", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>年份</Label><Input type="number" value={item.year} onChange={e => upAc(item.id, "year", e.target.value)} placeholder="2020" className={INP} /></div>
                                                        <div><Label className={LBLSM}>使用時間（小時/年）</Label><Input type="number" value={item.hours} onChange={e => upAc(item.id, "hours", e.target.value)} className={INP} /></div>
                                                    </div>
                                                    <div className="flex justify-end mt-2"><button onClick={() => rmAc(item.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">移除</button></div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 照明設備 */}
                                        <div>
                                            <SubHead title="照明設備" onAdd={addLt} />
                                            {ltList.length === 0 ? <p className="text-zinc-700 text-xs py-2">尚無設備，點擊「+ 新增」加入</p> : ltList.map(item => (
                                                <div key={item.id} className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4 mb-2 group">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div><Label className={LBLSM}>類型</Label>
                                                            <Select value={item.type} onValueChange={v => upLt(item.id, "type", v)}>
                                                                <SelectTrigger className={SEL}><SelectValue placeholder="LED燈具" /></SelectTrigger>
                                                                <SelectContent className={SC}><SelectItem value="led">LED燈具</SelectItem><SelectItem value="t5">T5 日光燈</SelectItem><SelectItem value="cfl">省電燈泡</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><Label className={LBLSM}>台數</Label><Input type="number" value={item.qty} onChange={e => upLt(item.id, "qty", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>年份</Label><Input type="number" value={item.year} onChange={e => upLt(item.id, "year", e.target.value)} placeholder="2020" className={INP} /></div>
                                                        <div><Label className={LBLSM}>使用時間（小時/年）</Label><Input type="number" value={item.hours} onChange={e => upLt(item.id, "hours", e.target.value)} className={INP} /></div>
                                                    </div>
                                                    <div className="flex justify-end mt-2"><button onClick={() => rmLt(item.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">移除</button></div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 電梯設備 */}
                                        <div>
                                            <SubHead title="電梯設備" onAdd={addEl} />
                                            {elList.length === 0 ? <p className="text-zinc-700 text-xs py-2">尚無設備，點擊「+ 新增」加入</p> : elList.map(item => (
                                                <div key={item.id} className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4 mb-2 group">
                                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                                        <div><Label className={LBLSM}>類型</Label>
                                                            <Select value={item.type} onValueChange={v => upEl(item.id, "type", v)}>
                                                                <SelectTrigger className={SEL}><SelectValue placeholder="普通設備" /></SelectTrigger>
                                                                <SelectContent className={SC}><SelectItem value="normal">普通設備</SelectItem><SelectItem value="highspeed">高速電梯</SelectItem><SelectItem value="escalator">電扶梯</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><Label className={LBLSM}>台數</Label><Input type="number" value={item.qty} onChange={e => upEl(item.id, "qty", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>載重（公斤）</Label><Input type="number" value={item.load} onChange={e => upEl(item.id, "load", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>速度（米/秒）</Label><Input type="number" value={item.speed} onChange={e => upEl(item.id, "speed", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>年份</Label><Input type="number" value={item.year} onChange={e => upEl(item.id, "year", e.target.value)} placeholder="2020" className={INP} /></div>
                                                        <div><Label className={LBLSM}>使用時間（小時/年）</Label><Input type="number" value={item.hours} onChange={e => upEl(item.id, "hours", e.target.value)} className={INP} /></div>
                                                    </div>
                                                    <div className="flex justify-end mt-2"><button onClick={() => rmEl(item.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">移除</button></div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* 資訊機房 */}
                                        <div>
                                            <SubHead title="資訊機房" onAdd={addSv} />
                                            {svList.length === 0 ? <p className="text-zinc-700 text-xs py-2">尚無資料，點擊「+ 新增」加入</p> : svList.map(item => (
                                                <div key={item.id} className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4 mb-2 group">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div><Label className={LBLSM}>機房名稱</Label><Input value={item.name} onChange={e => upSv(item.id, "name", e.target.value)} className={INP} /></div>
                                                        <div><Label className={LBLSM}>機櫃總功率 (kW)</Label><Input type="number" value={item.power} onChange={e => upSv(item.id, "power", e.target.value)} className={INP} /></div>
                                                    </div>
                                                    <div className="flex justify-end mt-2"><button onClick={() => rmSv(item.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">移除</button></div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 水資料 ── */}
                                {activeTab === "water" && (
                                    <motion.div key="water" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-7">
                                        <SectionHeader icon={Droplets} title="水資料" />
                                        <div>
                                            <SubHead title="揚水系統" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><Label className={LBL}>水塔高度(m)</Label><Input type="number" value={water.towerHeight} onChange={e => setW("towerHeight", e.target.value)} placeholder="例如：42" className={INP} /></div>
                                                <div><Label className={LBL}>年用水量 (m³/yr)</Label><Input type="number" value={water.annualUsage} onChange={e => setW("annualUsage", e.target.value)} placeholder="例如：221.4" className={INP} /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <SubHead title="廁所" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><Label className={LBL}>淨化室面積(m²)</Label><Input type="number" value={water.toiletArea} onChange={e => setW("toiletArea", e.target.value)} className={INP} /></div>
                                                <div><Label className={LBL}>全年營運時間 (h/yr)</Label><Input type="number" value={water.toiletHours} onChange={e => setW("toiletHours", e.target.value)} placeholder="例如：2500" className={INP} /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <SubHead title="室內餐廳" />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div><Label className={LBL}>餐廳類型</Label>
                                                    <Select value={water.restaurantType} onValueChange={v => setW("restaurantType", v)}>
                                                        <SelectTrigger className={SEL}><SelectValue placeholder="-- 請選擇 --" /></SelectTrigger>
                                                        <SelectContent className={SC}><SelectItem value="cafeteria">自助餐</SelectItem><SelectItem value="restaurant">餐廳</SelectItem><SelectItem value="cafe">咖啡廳</SelectItem></SelectContent>
                                                    </Select>
                                                </div>
                                                <div><Label className={LBL}>餐廳面積 (m²)</Label><Input type="number" value={water.restaurantArea} onChange={e => setW("restaurantArea", e.target.value)} className={INP} /></div>
                                                <div><Label className={LBL}>全年營運天數 (day/yr)</Label><Input type="number" value={water.restaurantDays} onChange={e => setW("restaurantDays", e.target.value)} placeholder="例如：365" className={INP} /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <SubHead title="熱水供應設備" />
                                            <div><Label className={LBL}>熱水設備類型</Label>
                                                <Select value={water.hotWaterType} onValueChange={v => setW("hotWaterType", v)}>
                                                    <SelectTrigger className={SEL}><SelectValue placeholder="-- 請選擇 --" /></SelectTrigger>
                                                    <SelectContent className={SC}><SelectItem value="electric">電熱式</SelectItem><SelectItem value="gas">瓦斯式</SelectItem><SelectItem value="heatpump">熱泵</SelectItem><SelectItem value="solar">太陽能</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 營運率資料 ── */}
                                {activeTab === "operation" && (
                                    <motion.div key="operation" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-6">
                                        <SectionHeader icon={Activity} title="營運率數據" />
                                        <div className="flex items-start gap-3 bg-sky-950/30 border border-sky-500/10 rounded-xl px-4 py-3">
                                            <span className="text-sky-400 text-sm mt-0.5">💡</span>
                                            <p className="text-[13px] text-zinc-400 leading-relaxed">提示：針對有會議或演藝空間的建築物，請填寫相關空間的營運人數。非必填，如無相關空間可留白。</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <div><Label className={LBL}>展覽區營業率</Label><Input type="number" step="0.1" max="1" value={op.exhibitionOR} onChange={e => setO("exhibitionOR", e.target.value)} placeholder="例如：0.6" className={INP} /></div>
                                            <div><Label className={LBL}>200人以上大型會議室營業率</Label><Input type="number" step="0.1" max="1" value={op.largeMeetingOR} onChange={e => setO("largeMeetingOR", e.target.value)} placeholder="例如：0.7" className={INP} /></div>
                                            <div><Label className={LBL}>200人以下會議室營業率</Label><Input type="number" step="0.1" max="1" value={op.smallMeetingOR} onChange={e => setO("smallMeetingOR", e.target.value)} placeholder="例如：0.6" className={INP} /></div>
                                            <div><Label className={LBL}>國家級演藝廳營運率</Label><Input type="number" step="0.1" max="1" value={op.nationalTheaterOR} onChange={e => setO("nationalTheaterOR", e.target.value)} placeholder="例如：0.8" className={INP} /></div>
                                            <div><Label className={LBL}>一般演藝廳營運率</Label><Input type="number" step="0.1" max="1" value={op.generalTheaterOR} onChange={e => setO("generalTheaterOR", e.target.value)} placeholder="例如：0.7" className={INP} /></div>
                                        </div>
                                        <div className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-4">
                                            <p className="text-[12px] font-semibold text-zinc-400 mb-2">營業率參考值：</p>
                                            <ul className="text-[12px] text-zinc-500 space-y-1">
                                                <li>• 展覽區：通常為100部年/台（上限273）</li>
                                                <li>• 200以上會議室：通常為100部年/台（上限208）</li>
                                                <li>• 200人以下會議室：通常為100部年/台（上限208）</li>
                                                <li>• 國家級演藝廳：通常為100部年/台（上限156）</li>
                                                <li>• 一般演藝室：通常為100部年/台（上限156）</li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 初步結果 ── */}
                                {activeTab === "result" && (
                                    <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-8">
                                        {result ? (
                                            <div className="space-y-6">
                                                <div className="flex justify-end">
                                                    <Button onClick={calculate} size="sm" className="h-8 px-4 text-[12px] rounded-lg bg-sky-900/60 hover:bg-sky-800/80 text-sky-100 border border-sky-500/20 transition-all">
                                                        <Activity className="w-3 h-3 mr-2" /> 重新計算
                                                    </Button>
                                                </div>
                                                <SummaryReport result={result} basic={basic} />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-white/5 rounded-2xl hover:border-sky-500/15 transition-all duration-500">
                                                <div className="p-4 rounded-full bg-sky-500/5 mb-4 hover:scale-110 transition-transform duration-500">
                                                    <BarChart3 size={32} className="text-sky-500/20" />
                                                </div>
                                                <h3 className="text-zinc-400 font-bold mb-2">尚未產生能效評估</h3>
                                                <p className="text-zinc-600 text-[13px] mb-8 max-w-xs text-center">請先完成基本資料、用電量與分區空間等數據填寫，或開啟 Demo 模式快速預覽。</p>
                                                <Button onClick={calculate} className="rounded-full bg-sky-900 text-white font-bold h-11 px-10 hover:bg-sky-800 border border-sky-500/20 shadow-[0_8px_20px_rgba(7,89,133,0.3)] transition-all active:scale-95">點此開始分析</Button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="px-6 md:px-8 py-4 border-t border-white/[0.04] flex justify-between items-center rounded-b-2xl">
                            <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}
                                className={`h-9 px-4 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all ${currentIndex === 0 ? "invisible" : ""}`}>
                                <ArrowLeft className="mr-2 w-4 h-4" /> 返回上一步
                            </Button>
                            {currentIndex === steps.length - 2 ? (
                                <Button variant="ghost" onClick={handleComplete} disabled={isSubmitting} className="h-9 px-4 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all disabled:opacity-50">
                                    {isSubmitting ? "計算中..." : <><Activity className="mr-2 w-4 h-4" />開始能效計算</>}
                                </Button>
                            ) : currentIndex === steps.length - 1 ? (
                                <Button variant="ghost" onClick={() => window.location.href = "/"} className="h-9 px-4 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all">
                                    <Building2 className="mr-2 w-4 h-4" /> 返回首頁
                                </Button>
                            ) : (
                                <Button variant="ghost" onClick={handleNext} className="h-9 px-4 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all">
                                    下個階段 <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div >
                </motion.div >
            </div >

            {/* Demo Mode Toggle (Bottom Left Floating) */}
            < div className="fixed bottom-6 left-6 z-[100]" >
                <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 p-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
                    <div className="flex items-center gap-2 px-1">
                        <Checkbox
                            id="demo-mode"
                            checked={isDemoMode}
                            onCheckedChange={handleToggleDemo}
                            className="w-5 h-5 rounded-md border-white/20 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                        />
                        <Label htmlFor="demo-mode" className="text-xs font-bold text-zinc-400 cursor-pointer select-none">
                            DEMO MODE
                        </Label>
                    </div>
                    {!isDemoMode && basic.companyName && (
                        <>
                            <div className="h-5 w-[1px] bg-white/10 mx-1" />
                            <Button
                                onClick={saveAsDemo}
                                variant="outline"
                                className="h-7 px-3 text-[10px] font-bold rounded-lg border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                            >
                                <Save className="w-3 h-3 mr-1.5" /> 存為本機 DEMO
                            </Button>
                        </>
                    )}
                    {isDemoMode && (
                        <>
                            <div className="h-5 w-[1px] bg-white/10 mx-1" />
                            <div className="text-[10px] font-medium text-sky-400/80 tracking-tight animate-pulse px-1">
                                示範模式：數據已載入
                            </div>
                        </>
                    )}
                </div>
            </div >
        </div >
    );
}

