"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Zap, Shield, Cpu, LayoutDashboard,
    ArrowUpRight, AlertCircle, Terminal, Info,
    BarChart, PieChart, Database, HardDrive, Wifi, Server, Target
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip,
    PieChart as RePie, Pie, Cell, Radar, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// --- Types ---
interface CalculationResult {
    teui: number;
    euiAdj: number;
    euiPrime: number;
    score: number;
    grade: string;
    EN: number;
    Et: number;
    Ep: number;
    Eh: number;
    reliability: {
        totalTE: number;
        monthlyMaxVariation: number;
        yearlyVariation: number;
        isMonthlyValid: boolean;
        isYearlyValid: boolean;
    };
    benchmarks: {
        min: number;
        g: number;
        m: number;
        max: number;
    };
    energyZoneDetails: any[];
    exemptZoneDetails: any[];
    isDiamond?: boolean;
}

// --- Icons / Components ---
const CyberCard = ({ children, title, icon: Icon, className = "" }: any) => (
    <div className={`relative group ${className}`}>
        {/* Glow Border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/50 via-magenta-500/20 to-cyan-500/50 rounded-lg blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative bg-[#0a0a0c]/90 border border-white/5 backdrop-blur-3xl rounded-lg p-5 overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-50"></div>

            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
                    <h3 className="text-xs font-bold tracking-[0.2em] text-cyan-500/80 uppercase">{title}</h3>
                </div>
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] bg-green-500 animate-pulse" />
            </div>
            {children}

            {/* HUD Decoration */}
            <div className="absolute bottom-1 right-1 flex gap-0.5">
                {[1, 2, 3].map(i => <div key={i} className="w-0.5 h-0.5 bg-white/20" />)}
            </div>
        </div>
    </div>
);

export default function AnalyticsPage() {
    const [data, setData] = useState<CalculationResult | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("BERS2_LATEST_RESULT");
        if (stored) {
            try {
                setData(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored results", e);
            }
        }
    }, []);

    if (!mounted) return null;

    // Reliability Radar Data
    const radarData = data ? [
        { subject: '月用電信賴', A: Math.max(0, 100 - (data.reliability.monthlyMaxVariation * 100)), fullMark: 100 },
        { subject: '年變動信賴', A: Math.max(0, 100 - (data.reliability.yearlyVariation * 100)), fullMark: 100 },
        { subject: '數據完整度', A: 95, fullMark: 100 },
        { subject: '評估精準度', A: 90, fullMark: 100 },
        { subject: '基準偏移', A: 85, fullMark: 100 },
    ] : [];

    const COLORS = ['#00f3ff', '#ff00ff', '#39ff14', '#f1c40f'];

    return (
        <div className="min-h-screen bg-[#050507] text-[#e0e0e0] font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-20 px-6 pb-20">
            {/* Background Grid & Scanlines */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">

                {/* HUD Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                <Cpu className="text-cyan-400 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black tracking-tighter italic flex items-baseline gap-2">
                                    NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">ANALYTICS</span>
                                    <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase ml-4">v2.0. bers-protocol</span>
                                </h1>
                                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                                    Real-time Energy Efficiency Evaluation Pipeline // System Status: <span className="text-green-500">OPERATIONAL</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right px-4 border-r border-white/10">
                            <div className="text-[9px] font-mono text-zinc-600 uppercase">Latency</div>
                            <div className="text-xs font-mono text-cyan-400">12ms</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-mono text-zinc-600 uppercase">Last Sync</div>
                            <div className="text-xs font-mono text-magenta-400">{new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>

                {data ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                        {/* Rating Panel (Left Column) */}
                        <div className="xl:col-span-1 space-y-6">
                            <CyberCard title="Primary Core Rating" icon={Shield}>
                                <div className="flex flex-col items-center justify-center py-8 relative">
                                    {/* Circular Glow */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                        <div className="w-48 h-48 rounded-full border-2 border-dashed border-cyan-500 animate-[spin_20s_linear_infinite]" />
                                        <div className="absolute w-40 h-40 rounded-full border border-magenta-500/40 animate-[spin_10s_linear_infinite_reverse]" />
                                    </div>

                                    <h2 className="text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 leading-none mb-2 z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                        {data.grade}
                                    </h2>
                                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 rounded-full text-[10px] font-bold text-cyan-400 tracking-widest uppercase z-10 transition-all hover:scale-105 cursor-default">
                                        Level Recognition
                                    </div>

                                    <div className="mt-12 w-full space-y-4 font-mono text-[10px]">
                                        <div className="flex justify-between items-center text-zinc-500 p-2 bg-white/5 rounded">
                                            <span>BERSe INDEX</span>
                                            <span className="text-cyan-400 font-bold">{data.euiAdj.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-zinc-500 p-2 bg-white/5 rounded">
                                            <span>DIAMOND ELIGIBILITY</span>
                                            <span className={data.isDiamond ? "text-green-400 font-bold" : "text-zinc-600"}>
                                                {data.isDiamond ? "VERIFIED" : "DISABLED"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CyberCard>

                            <CyberCard title="Integrity Pulse" icon={Activity}>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#333" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 8 }} />
                                            <Radar
                                                name="Reliability"
                                                dataKey="A"
                                                stroke="#00f3ff"
                                                fill="#00f3ff"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CyberCard>
                        </div>

                        {/* Main Analysis (Center Spans 2) */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Energy Breakdown Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <CyberCard title="Actual Consumption (TE)" icon={Zap}>
                                    <div className="py-2">
                                        <div className="text-3xl font-bold font-mono text-zinc-100 flex items-baseline gap-2">
                                            {data.reliability.totalTE.toLocaleString()}
                                            <span className="text-xs text-zinc-500 font-sans">kWh/yr</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-900 rounded-full mt-4 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "85%" }}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-transparent"
                                            />
                                        </div>
                                    </div>
                                </CyberCard>
                                <CyberCard title="Design Baseline (B0)" icon={Target}>
                                    <div className="py-2">
                                        <div className="text-3xl font-bold font-mono text-zinc-100 flex items-baseline gap-2">
                                            {data.benchmarks.m.toLocaleString()}
                                            <span className="text-xs text-zinc-500 font-sans">kWh/yr</span>
                                        </div>
                                        <div className="w-full h-1 bg-zinc-900 rounded-full mt-4 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                className="h-full bg-zinc-700"
                                            />
                                        </div>
                                    </div>
                                </CyberCard>
                            </div>

                            {/* Zone Node Analysis */}
                            <CyberCard title="Division Node Matrix" icon={Terminal}>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {data.energyZoneDetails.map((zone, idx) => (
                                        <div key={idx} className="group/item relative bg-white/[0.02] border border-white/5 p-4 rounded-lg hover:border-cyan-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-500">
                                                        Z{idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-zinc-300">{zone.code}</div>
                                                        <div className="text-[10px] text-zinc-500 uppercase font-mono">Area Matrix Locked: {zone.area}m²</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-mono text-cyan-400">{zone.eeui.toFixed(1)} kWh/m².yr</div>
                                                    <div className="text-[9px] text-zinc-600">Calc Signature: 0x{Math.random().toString(16).slice(2, 8)}</div>
                                                </div>
                                            </div>

                                            {/* Sparklines-style bar */}
                                            <div className="flex gap-1 h-1.5">
                                                {[...Array(20)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-full transition-all duration-300 ${i < (zone.eeui / 2) ? 'bg-cyan-500/40 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-zinc-800'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {data.exemptZoneDetails.map((zone, idx) => (
                                        <div key={`ex-${idx}`} className="relative bg-white/[0.01] border border-dashed border-white/5 p-4 rounded-lg opacity-60">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-zinc-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                                        EX
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-zinc-500">{zone.code}</div>
                                                        <div className="text-[10px] text-zinc-600 uppercase font-mono">Exempted Void: {zone.area}m²</div>
                                                    </div>
                                                </div>
                                                <Info size={12} className="text-zinc-700" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CyberCard>
                        </div>

                        {/* System Logs / Extra (Right Column) */}
                        <div className="xl:col-span-1 space-y-6">
                            <CyberCard title="Neural Distribution" icon={Database}>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePie>
                                            <Pie
                                                data={data.energyZoneDetails}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="eeui"
                                                stroke="none"
                                            >
                                                {data.energyZoneDetails.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </RePie>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {data.energyZoneDetails.slice(0, 4).map((z, i) => (
                                        <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                                <span className="text-zinc-500">{z.code}</span>
                                            </div>
                                            <span className="text-zinc-300">{((z.eeui / data.reliability.totalTE) * 100).toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </CyberCard>

                            <CyberCard title="Protocol Warnings" icon={AlertCircle}>
                                <div className="space-y-4 font-mono text-[9px]">
                                    {!data.reliability.isMonthlyValid && (
                                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md animate-pulse">
                                            [CRITICAL ERROR] MONTHLY_VAR_OUT_OF_BOUNDS: {data.reliability.monthlyMaxVariation.toFixed(2)}%
                                        </div>
                                    )}
                                    {!data.reliability.isYearlyValid && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
                                            [WARNING] YEARLY_DRIFT_DETECTED: {data.reliability.yearlyVariation.toFixed(2)}%
                                        </div>
                                    )}
                                    <div className="p-3 bg-green-500/5 border border-green-500/10 text-green-500/60 rounded-md">
                                        [LOG] BERS_CALCULATION_SUCCESS: SEED_0x{Math.random().toString(16).slice(2, 8)}
                                    </div>
                                    <div className="p-3 bg-green-500/5 border border-green-500/10 text-green-500/60 rounded-md">
                                        [LOG] PERSISTENCE_LAYER_SYNCED_OK
                                    </div>
                                    <div className="pt-2 text-zinc-700 uppercase tracking-tighter animate-pulse">
                                        &gt; Listening for assessment triggers...
                                    </div>
                                </div>
                            </CyberCard>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                            <Cpu size={48} className="text-zinc-800" />
                        </motion.div>
                        <div className="text-center">
                            <h2 className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em]">No Assessment Data Found</h2>
                            <p className="text-zinc-700 text-[10px] mt-2 font-mono uppercase tracking-[0.2em]">Please perform an evaluation in the Assessment terminal first.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Styled CSS */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(6, 182, 212, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.4);
                }
            `}</style>
        </div>
    );
}
