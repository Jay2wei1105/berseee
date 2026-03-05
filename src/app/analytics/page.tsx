"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Zap, Shield, Cpu, LayoutDashboard,
    ArrowUpRight, AlertCircle, Terminal, Info,
    BarChart, PieChart, Database, HardDrive, Wifi, Server, Target, Wind, RotateCcw
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip,
    PieChart as RePie, Pie, Cell, Radar, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { Save, ChevronDown, CheckCircle2, FileText, Download, ChevronRight } from "lucide-react";
import { SummaryReport } from "@/components/SummaryReport";
import { CalculationResult } from "@/lib/types";
import { EnergyScaleHUD } from "@/components/EnergyScaleHUD";
import { EnergyBreakdownChart } from "@/components/EnergyBreakdownChart";
import { BenchmarkingEUI } from "@/components/BenchmarkingEUI";
import { EnvironmentalImpactHUD } from "@/components/EnvironmentalImpactHUD";
import { GradeStats } from "@/components/GradeStats";

// --- Icons / Components ---
const CyberCard = ({ children, title, icon: Icon, className = "" }: any) => (
    <motion.div
        initial={false}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative group ${className} z-0 hover:z-20 flex flex-col`}
    >
        {/* Advanced Glow Layer */}
        <div className="absolute -inset-[2px] bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-blue-500/0 rounded-2xl blur-xl group-hover:from-cyan-500/20 group-hover:via-blue-500/10 group-hover:to-cyan-500/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />

        {/* Static Border (Visible when not hovered) */}
        <div className="absolute inset-0 border border-white/[0.03] rounded-2xl transition-opacity group-hover:opacity-0" />

        {/* Dynamic Border (Visible on hover) */}
        <div className="absolute inset-0 border border-cyan-500/20 group-hover:border-cyan-500/40 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]" />

        <div className="relative h-full flex-1 flex flex-col bg-card border border-border backdrop-blur-3xl rounded-2xl p-6 shadow-2xl transition-colors duration-500 group-hover:bg-card/90">
            {/* HUD Scanline Effect on hover */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(6,182,212,0.02)_50%,transparent_100%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none" />

            <div className="flex items-center justify-between mb-5 border-b border-border pb-4 relative z-10 flex-none">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                        {Icon && <Icon className="w-4 h-4" />}
                    </div>
                    <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase group-hover:text-cyan-500 group-hover:tracking-[0.25em] transition-all duration-300">
                        {title}
                    </h3>
                </div>
                <div className="flex gap-1.5 items-center">
                    <div className="w-1 h-1 rounded-full bg-cyan-500/40 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <div className="w-1 h-1 rounded-full bg-border group-hover:bg-cyan-900 transition-colors" />
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    </motion.div>
);

export default function AnalyticsPage() {
    const [data, setData] = useState<CalculationResult | null>(null);
    const [mounted, setMounted] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [basic, setBasic] = useState<any>(null);

    const fetchCalculatedProjects = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Filter: result_data cannot be empty or null
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('updated_at', { ascending: false });

            if (!error && data) {
                // Client-side filter to ensure it has actual result content (like a grade)
                const completed = data.filter(p => p.result_data && p.result_data.grade);
                setProjects(completed);
            }
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchCalculatedProjects();

        // Listen for auth state changes to refresh projects list immediately
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event in Analytics:", event);
            fetchCalculatedProjects();

            // If signed out, reset selection
            if (event === 'SIGNED_OUT' || !session) {
                handleReset();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSelect = (id: string) => {
        const p = projects.find(proj => proj.id === id);
        if (p && p.result_data) {
            setSelectedId(id);
            setData(p.result_data);
            setBasic(p.input_data?.basic || { companyName: p.building_name });
        }
    };

    const handleReset = () => {
        setSelectedId("");
        setData(null);
        setBasic(null);
    };

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
        <div className="min-h-screen bg-transparent text-foreground font-sans selection:bg-sky-500/30 overflow-x-hidden pt-10 px-6 pb-20 relative z-10">
            <div className="relative z-10 max-w-[1700px] mx-auto space-y-8">

                {/* HUD Header */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 pb-10 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/40 flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Cpu className="text-sky-400 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-6 text-foreground uppercase leading-none">
                                <span className="flex items-baseline gap-2">
                                    建築能效分析
                                </span>
                                <span className="hidden xl:inline-block text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase border-l border-border pl-6">
                                    Advanced Building Energy Performance System
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-6">
                        {projects.length > 0 && (
                            <div className="flex items-center gap-3 bg-secondary/50 border border-border p-1 rounded-2xl backdrop-blur-xl">
                                <div className="pl-4 pr-2 py-2 border-r border-border">
                                    <Database className="w-3.5 h-3.5 text-sky-600" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={selectedId} onValueChange={handleSelect}>
                                        <SelectTrigger className="w-[300px] h-10 bg-transparent border-none text-foreground hover:text-sky-600 transition-colors focus:ring-0 font-bold">
                                            <SelectValue placeholder="選擇已完成的評估紀錄..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground rounded-xl shadow-2xl">
                                            {projects.map((p) => (
                                                <SelectItem key={p.id} value={p.id} className="focus:bg-sky-500/10 focus:text-sky-400 cursor-pointer">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-xs">{p.building_name}</span>
                                                        <span className="text-[9px] text-zinc-500 opacity-70">
                                                            等級: {p.result_data.grade} 級 | {new Date(p.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedId && (
                                        <motion.button
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            onClick={handleReset}
                                            className="mr-2 p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border"
                                            title="清空選擇"
                                        >
                                            <RotateCcw size={14} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {data ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {/* Row 1: 4 columns structure */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
                            {/* Column 1: Left (Fixed heights based on content) */}
                            <div className="xl:col-span-1 flex flex-col gap-6">
                                <CyberCard title="BERSe 核心評級" icon={Shield}>
                                    <div className="relative flex flex-col items-center justify-center py-10">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.08)_0%,transparent_70%)] animate-pulse" />
                                        <h2 className="text-[7.5rem] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-muted-foreground/50 leading-[1.1] z-10 select-none">
                                            {data.grade}
                                        </h2>
                                        <div className="mt-4 px-3 py-1 bg-secondary border border-border rounded-full text-[9px] font-bold text-muted-foreground tracking-[0.3em] uppercase z-10 tracking-widest transition-all hover:text-foreground hover:border-border cursor-default">
                                            Efficiency Level
                                        </div>
                                    </div>
                                </CyberCard>

                                <CyberCard title="碳排與環境衝擊" icon={Wind} className="flex-1 h-full">
                                    <div className="h-full flex flex-col">
                                        <EnvironmentalImpactHUD data={data} />
                                    </div>
                                </CyberCard>
                            </div>

                            <div className="xl:col-span-2 flex flex-col">
                                <CyberCard title="能效等級落點圖" icon={Target} className="flex-1 h-full">
                                    <div className="px-4 py-4 h-full flex flex-col">
                                        <EnergyScaleHUD data={data} />
                                    </div>
                                </CyberCard>
                            </div>

                            {/* Column 4: Right */}
                            <div className="xl:col-span-1">
                                <CyberCard title="耗能組成分布" icon={PieChart}>
                                    <div className="py-4">
                                        <EnergyBreakdownChart data={data} />
                                    </div>
                                </CyberCard>
                            </div>
                        </div>

                        {/* Row 2: Statistics & Benchmarking (Aligned heights) */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
                            <div className="xl:col-span-1 flex flex-col">
                                <CyberCard title="等級統計分佈" icon={Activity} className="flex-1 h-full">
                                    <div className="h-full">
                                        <GradeStats data={data} />
                                    </div>
                                </CyberCard>
                            </div>
                            <div className="xl:col-span-3 flex flex-col">
                                <CyberCard title="能效標竿對比" icon={BarChart} className="flex-1 h-full">
                                    <div className="h-full">
                                        <BenchmarkingEUI data={data} />
                                    </div>
                                </CyberCard>
                            </div>
                        </div>

                        {/* Row 3: Full Width Report */}
                        <div className="pt-4">
                            {data && basic && (
                                <SummaryReport
                                    result={data}
                                    basic={basic}
                                    collapsible={true}
                                    defaultExpanded={false}
                                />
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 space-y-8">
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 bg-sky-500/10 rounded-full blur-xl animate-pulse" />
                                <Cpu size={80} className="text-muted-foreground/20 relative z-10" />
                            </div>
                        </motion.div>
                        <div className="text-center space-y-4 max-w-md">
                            <h2 className="text-foreground font-black text-xl uppercase tracking-[0.4em] italic">Systems Idle</h2>
                            <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.15em] leading-loose font-bold">
                                Please select a building project from the database terminal above to initialize performance analytics.
                            </p>
                            {projects.length === 0 && (
                                <p className="text-sky-600/60 text-[10px] font-bold uppercase tracking-widest pt-4">
                                    No evaluation records found in cloud storage.
                                </p>
                            )}
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
