import React from 'react';
import { motion } from 'framer-motion';
import { CalculationResult } from '@/lib/types';

interface EnergyScaleHUDProps {
    data: CalculationResult;
}

export const EnergyScaleHUD: React.FC<EnergyScaleHUDProps> = ({ data }) => {
    const { min, g, max } = data.benchmarks;

    const thresholds = [
        { grade: '1+', score: 90, eui: g - 0.8 * (g - min), color: 'bg-[#1e3a8a]' }, // Dark Blue
        { grade: '1', score: 80, eui: g - 0.6 * (g - min), color: 'bg-[#15803d]' }, // Dark Green
        { grade: '2', score: 70, eui: g - 0.4 * (g - min), color: 'bg-[#22c55e]' }, // Mid Green
        { grade: '3', score: 60, eui: g - 0.2 * (g - min), color: 'bg-[#84cc16]' }, // Light Green
        { grade: '4', score: 50, eui: g, color: 'bg-[#facc15]' },                   // Yellow
        { grade: '5', score: 40, eui: max - 0.8 * (max - g), color: 'bg-[#f59e0b]' }, // Light Orange
        { grade: '6', score: 20, eui: max - 0.4 * (max - g), color: 'bg-[#d97706]' }, // Dark Orange
        { grade: '7', score: 0, eui: max, color: 'bg-[#dc2626]' },                   // Red
    ];

    const currentEui = data.euiAdj;

    return (
        <div className="relative w-full h-full flex flex-col pt-2 pb-1 text-[11px] font-mono">
            {/* Header Labels - Prominent */}
            <div className="grid grid-cols-[100px_1fr_100px] gap-2 mb-3 items-center text-[10px]">
                <div className="text-muted-foreground/60 font-bold uppercase tracking-widest text-center">EUI Threshold</div>
                <div className="text-muted-foreground/60 font-bold uppercase tracking-widest text-center">Efficiency Grade</div>
                <div className="text-muted-foreground/60 font-bold uppercase tracking-widest text-center italic">EUI* Indicator</div>
            </div>

            {/* Content Area - Filling available space with thicker bars */}
            <div className="flex-1 flex flex-col justify-between py-1">
                {thresholds.map((t, i) => {
                    const isCurrentGrade = data.grade === t.grade;
                    const barWidth = 40 + i * 7;

                    return (
                        <div key={t.grade} className="grid grid-cols-[100px_1fr_100px] gap-2 items-stretch flex-1 group">
                            {/* EUI Threshold Column */}
                            <div className="flex items-center justify-end pr-4 border-r border-border text-muted-foreground/80">
                                <span className="text-[10px] font-bold group-hover:text-primary transition-colors">
                                    {i === thresholds.length - 1 ? `> ${thresholds[i - 1].eui.toFixed(1)}` : `≤ ${t.eui.toFixed(1)}`}
                                </span>
                            </div>

                            {/* Center Bar Column - THICKER BARS (h-7) */}
                            <div className="flex items-center relative py-1 gap-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    className={`h-7 ${t.color} rounded-r-lg flex items-center justify-between px-4 relative overflow-hidden group/bar hover:brightness-110 transition-all cursor-crosshair shadow-lg shrink-0`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:20px_20px] animate-[scan_2s_linear_infinite] opacity-0 group-hover/bar:opacity-100" />

                                    <span className="text-white/95 font-black z-10 whitespace-nowrap text-[9px] drop-shadow-md">
                                        {i === 0 ? `≥ 90 ~ 100` :
                                            i === 7 ? `0 ~ < 20` :
                                                `≥ ${t.score} ~ < ${thresholds[i - 1].score}`}
                                    </span>
                                    <span className="text-white font-black text-xs z-10 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{t.grade}</span>
                                </motion.div>

                                {/* Energy Saving Optimization Target */}
                                {currentEui > t.eui && (
                                    <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-left-2 duration-700">
                                        <div className="text-[8px] text-muted-foreground/60 font-black uppercase tracking-tighter mb-0.5">Required Savings</div>
                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                                            -{Math.round((currentEui - t.eui) * (data.AFe || 0)).toLocaleString()} <span className="text-[8px] opacity-60">kWh/yr</span>
                                        </div>
                                    </div>
                                )}

                                {/* Grade Threshold Lines */}
                                {t.grade === '1' && (
                                    <div className="absolute -top-4 right-0 whitespace-nowrap text-[8px] text-muted-foreground/60 font-bold border-r border-border pr-2 h-3 flex items-center">
                                        NEAR ZERO TARGET
                                    </div>
                                )}
                            </div>

                            {/* Current EUI Pointer - Larger and more prominent */}
                            <div className="flex items-center pl-4 h-full">
                                {isCurrentGrade && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative flex items-center"
                                    >
                                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-primary z-10 mr-[-2px]" />
                                        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1 rounded shadow-lg border border-primary/20">
                                            <div className="text-[11px] font-black leading-none">{currentEui.toFixed(1)}</div>
                                            <div className="text-[7px] font-bold uppercase tracking-tighter opacity-80 mt-0.5">Your EUI*</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Signature Footer */}
            <div className="mt-4 p-3 bg-secondary/20 border border-border rounded-lg flex justify-between items-center">
                <div className="text-muted-foreground/40 font-black uppercase tracking-[0.3em] text-[8px]">EUI Digital Signature</div>
                <div className="flex gap-6 text-[9px]">
                    <span className="text-muted-foreground/60 font-bold uppercase tracking-tighter">MIN <span className="text-primary ml-1">{min.toFixed(1)}</span></span>
                    <span className="text-muted-foreground/60 font-bold uppercase tracking-tighter">GB <span className="text-amber-600 dark:text-amber-400 ml-1">{g.toFixed(1)}</span></span>
                    <span className="text-muted-foreground/60 font-bold uppercase tracking-tighter">MAX <span className="text-red-500 ml-1">{max.toFixed(1)}</span></span>
                </div>
            </div>
        </div>
    );
};
