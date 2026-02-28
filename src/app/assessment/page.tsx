"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Zap, LayoutDashboard, Settings2, Droplets, Activity, BarChart3, Save, Plus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FloorPlanTool } from "@/components/FloorPlanTool";

import { buildingTypes } from "@/lib/building-types";
import { euiTable } from "@/lib/eui-table";
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

const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];

export default function AssessmentPage() {
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

            // 免評估分區（TODO：待串接免評估分區輸入）
            exemptZones: [],

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
                                    <motion.div key="energy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-5">
                                        <SectionHeader icon={Zap} title="電費資料（2年）" />
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
                                            {monthly.map((row, idx) => (
                                                <div key={row.m} className={`grid grid-cols-[140px_1fr_1fr] border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? "bg-zinc-800/20" : ""}`}>
                                                    <div className="py-2 px-4 text-[13px] text-zinc-400 flex items-center">{MONTHS[idx]}</div>
                                                    <div className="px-3 py-2 border-l border-white/[0.04]">
                                                        <Input type="number" value={row.y1} onChange={e => updM(idx, "y1", e.target.value)} placeholder="千瓦時" className={INPSM} />
                                                    </div>
                                                    <div className="px-3 py-2 border-l border-white/[0.04]">
                                                        <Input type="number" value={row.y2} onChange={e => updM(idx, "y2", e.target.value)} placeholder="千瓦時" className={INPSM} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 分區空間 ── */}
                                {activeTab === "spaces" && (() => {
                                    const totalSpaceArea = spaces.reduce((s, sp) => s + (Number(sp.area) || 0), 0);
                                    const basicArea = Number(basic.totalFloorArea) || 0;
                                    const ratio = basicArea > 0 ? Math.min(totalSpaceArea / basicArea, 1) : 0;
                                    const isOver = basicArea > 0 && totalSpaceArea > basicArea;
                                    return (
                                        <motion.div key="spaces" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                            {/* Header */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400"><LayoutDashboard size={14} /></div>
                                                <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">分區空間資料</h2>
                                            </div>
                                            {/* Two-column layout */}
                                            <div className="flex flex-col xl:flex-row gap-4">

                                                {/* LEFT: Space form */}
                                                <div className="flex-1 min-w-0 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[12px] text-zinc-500">填寫各分區空間類型與面積</p>
                                                        <Button onClick={() => addSp()} variant="outline" size="sm" className="h-7 px-2.5 text-[11px] rounded-lg border-white/10 bg-white/[0.02] text-zinc-500 hover:text-white hover:bg-white/[0.06]"><Plus className="w-3 h-3 mr-1" /> 新增空間</Button>
                                                    </div>
                                                    <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                                                        <div className="grid grid-cols-[2fr_1fr_100px_50px] bg-zinc-800/50 border-b border-white/[0.06]">
                                                            <div className="py-2.5 px-3 text-[11px] text-zinc-500">空間類型</div>
                                                            <div className="py-2.5 px-3 text-[11px] text-zinc-500 border-l border-white/[0.06]">空調</div>
                                                            <div className="py-2.5 px-3 text-[11px] text-zinc-500 border-l border-white/[0.06]">面積 (m²)</div>
                                                            <div />
                                                        </div>
                                                        {spaces.length === 0 && (
                                                            <div className="py-6 text-center text-zinc-600 text-xs">尚無分區，點擊「新增空間」或從右側平面圖加入</div>
                                                        )}
                                                        {spaces.map((sp, idx) => (
                                                            <div key={sp.id} className={`grid grid-cols-[2fr_1fr_100px_50px] border-b border-white/[0.04] last:border-0 ${idx % 2 === 0 ? "bg-zinc-800/20" : ""}`}>
                                                                <div className="px-2 py-1.5">
                                                                    <Select value={sp.typeCode} onValueChange={v => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, typeCode: v } : s))}>
                                                                        <SelectTrigger className={SELSM}><SelectValue placeholder="請選擇" /></SelectTrigger>
                                                                        <SelectContent className={`${SC} max-h-60`}>{Object.entries(euiTable as any).map(([code, data]: any) => <SelectItem key={code} value={code}>{data.name} ({code})</SelectItem>)}</SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="px-2 py-1.5 border-l border-white/[0.04]">
                                                                    <Select value={sp.isIntermittent ? "yes" : "no"} onValueChange={v => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, isIntermittent: v === "yes" } : s))}>
                                                                        <SelectTrigger className={SELSM}><SelectValue /></SelectTrigger>
                                                                        <SelectContent className={SC}><SelectItem value="yes">間歇</SelectItem><SelectItem value="no">全天</SelectItem></SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="px-2 py-1.5 border-l border-white/[0.04]">
                                                                    <Input type="number" value={sp.area} onChange={e => setSpaces(spaces.map(s => s.id === sp.id ? { ...s, area: e.target.value } : s))} placeholder="m²" className={INPSM} />
                                                                </div>
                                                                <div className="flex items-center justify-center border-l border-white/[0.04]">
                                                                    <button onClick={() => rmSp(sp.id)} className="text-[11px] text-zinc-700 hover:text-red-400 transition-colors px-2">✕</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Area comparison */}
                                                    <div className="bg-zinc-800/30 border border-white/[0.05] rounded-xl p-3 space-y-2">
                                                        <div className="flex items-center justify-between text-[12px]">
                                                            <span className="text-zinc-400">分區面積加總</span>
                                                            <span className={`font-mono font-semibold ${isOver ? "text-red-400" : "text-zinc-200"}`}>{totalSpaceArea.toFixed(1)} m²</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[12px]">
                                                            <span className="text-zinc-500">基本資料總樓地板面積</span>
                                                            <span className="font-mono text-zinc-400">{basicArea > 0 ? `${basicArea} m²` : "未填寫"}</span>
                                                        </div>
                                                        {basicArea > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="w-full h-1.5 bg-zinc-700/50 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : ratio > 0.9 ? "bg-emerald-400" : "bg-sky-500"}`} style={{ width: `${ratio * 100}%` }} />
                                                                </div>
                                                                <p className={`text-[11px] ${isOver ? "text-red-400" : ratio > 0.9 ? "text-emerald-400" : "text-zinc-500"}`}>
                                                                    {isOver ? `⚠️ 超出基本資料面積 ${(totalSpaceArea - basicArea).toFixed(1)} m²` : basicArea > 0 ? `已填寫 ${(ratio * 100).toFixed(1)}%` : ""}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* RIGHT: Floor plan tool */}
                                                <div className="xl:w-[420px] shrink-0">
                                                    <div className="bg-zinc-800/20 border border-white/[0.06] rounded-xl p-3 flex flex-col gap-3 h-full">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1 rounded-md bg-sky-500/10 text-sky-400"><Map size={13} /></div>
                                                            <p className="text-[12px] font-semibold text-zinc-300">平面圖面積工具</p>
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px] text-zinc-500 mb-1 block">樓層使用執照總面積 (m²)</Label>
                                                            <Input type="number" value={floorLicenseArea} onChange={e => setFloorLicenseArea(e.target.value)}
                                                                placeholder={basicArea > 0 ? `預設使用基本資料 ${basicArea} m²` : "輸入執照總面積"}
                                                                className={INPSM} />
                                                            <p className="text-[10px] text-zinc-600 mt-1">用於換算繪製區域的實際面積比例</p>
                                                        </div>
                                                        <FloorPlanTool
                                                            licenseArea={Number(floorLicenseArea) || basicArea}
                                                            onAddArea={(area) => addSp(area)}
                                                        />
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
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400"><BarChart3 size={14} /></div>
                                                <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">能效初步評估結果</h2>
                                            </div>
                                            <Button onClick={calculate} size="sm" className="h-8 px-4 text-[12px] rounded-lg bg-sky-900/60 hover:bg-sky-800/80 text-sky-100 border border-sky-500/20 transition-all">重新計算</Button>
                                        </div>
                                        {result ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2 bg-gradient-to-br from-sky-950/40 via-indigo-950/30 to-transparent border border-sky-500/15 p-8 rounded-2xl relative overflow-hidden group">
                                                    <div className="relative z-10 flex flex-col items-center py-4">
                                                        <div className="text-[10px] font-bold text-sky-400/60 tracking-[0.35em] uppercase mb-4">BERS 能效得分</div>
                                                        <div className="text-[7rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 leading-none mb-6">{result.score}</div>
                                                        <div className="flex items-center gap-8 bg-black/30 backdrop-blur-xl px-8 py-5 rounded-2xl border border-white/5">
                                                            <div className="text-center border-r border-white/5 pr-8"><div className="text-3xl font-black text-white">{result.grade}</div><div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">能效等級</div></div>
                                                            <div className="text-center"><div className="text-2xl font-bold text-zinc-100">{typeof result.euiAdj === 'number' ? result.euiAdj.toFixed(2) : result.euiAdj}</div><div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">EUI adj</div></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">能效基準值 (EUI)</p>
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><span className="text-xs text-emerald-400">EUImin (1+級)</span><span className="font-mono text-sm text-emerald-300">{result.benchmarks.min}</span></div>
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-sky-500/5 border border-sky-500/10"><span className="text-xs text-sky-400">EUIg / GB基準</span><span className="font-mono text-sm text-sky-300">{result.benchmarks.g}</span></div>
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-700/20 border border-white/[0.05]"><span className="text-xs text-zinc-400">EUIm 中位值</span><span className="font-mono text-sm text-zinc-300">{result.benchmarks.m}</span></div>
                                                    <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/5 border border-red-500/10"><span className="text-xs text-red-400">EUImax (7級)</span><span className="font-mono text-sm text-red-300">{result.benchmarks.max}</span></div>
                                                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"><span className="text-xs text-zinc-500">EUI' 主設備</span><span className="font-mono text-xs text-zinc-400">{result.euiPrime}</span></div>
                                                    <div className="pt-1 space-y-1.5">
                                                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">免評估設備 (kWh/yr)</p>
                                                        <div className="flex justify-between text-xs px-1"><span className="text-zinc-600">Et 電梯</span><span className="font-mono text-zinc-500">{result.Et}</span></div>
                                                        <div className="flex justify-between text-xs px-1"><span className="text-zinc-600">Ep 揚水</span><span className="font-mono text-zinc-500">{result.Ep}</span></div>
                                                        <div className="flex justify-between text-xs px-1"><span className="text-zinc-600">Eh 熱水</span><span className="font-mono text-zinc-500">{result.Eh}</span></div>
                                                    </div>
                                                    <div className="pt-2"><Button variant="outline" className="w-full rounded-xl border-white/5 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 h-11 text-sm font-medium transition-all"><Save size={14} className="mr-2" /> 下載報告</Button></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-[320px] border border-dashed border-white/5 rounded-2xl hover:border-sky-500/15 transition-all duration-500">
                                                <div className="p-4 rounded-full bg-sky-500/5 mb-4 hover:scale-110 transition-transform duration-500"><Activity size={28} className="text-sky-500/20" /></div>
                                                <p className="text-zinc-600 text-sm mb-5 font-light">尚未產生計算數據</p>
                                                <Button onClick={calculate} className="rounded-full bg-sky-900 text-white font-bold h-10 px-8 hover:bg-sky-800 border border-sky-500/20 shadow-[0_8px_20px_rgba(7,89,133,0.3)]">點此開始分析</Button>
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
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
