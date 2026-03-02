import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, LabelList } from 'recharts';
import { CalculationResult } from '@/lib/types';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

interface GradeStatsProps {
    data: CalculationResult;
}

export const GradeStats: React.FC<GradeStatsProps> = ({ data }) => {
    // Simplified distribution for 1+ to 7
    const stats = [
        { grade: '1+', count: 4, color: '#1e3a8a' }, // Dark Blue
        { grade: '1', count: 12, color: '#15803d' }, // Dark Green
        { grade: '2', count: 22, color: '#22c55e' }, // Mid Green
        { grade: '3', count: 35, color: '#84cc16' }, // Light Green
        { grade: '4', count: 18, color: '#facc15' }, // Yellow
        { grade: '5', count: 12, color: '#f59e0b' }, // Light Orange
        { grade: '6', count: 7, color: '#d97706' },  // Dark Orange
        { grade: '7', count: 4, color: '#dc2626' },   // Red
    ];

    const currentGrade = data.grade;

    return (
        <div className="w-full h-full flex flex-col justify-center py-6 px-0">
            <div className="flex-1 min-h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={stats}
                        layout="vertical"
                        margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                    >
                        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
                        <div className="YAxis_tick_fix px-0">
                            {/* Tick color fix via CSS variable inherited from parent if possible, but recharts is tricky. 
                        Best to use a class and handle via globals.css or inline-style with theme check */}
                        </div>
                        <YAxis
                            dataKey="grade"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            tick={{ fill: 'currentColor', fontWeight: '900' }}
                            className="text-muted-foreground"
                            width={40}
                        />
                        <Tooltip
                            cursor={{ fill: 'currentColor', fillOpacity: 0.05 }}
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-2xl text-[10px]">
                                            <div className="text-muted-foreground uppercase tracking-[0.2em] mb-1">Grade {payload[0].payload.grade}</div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${payload[0].payload.grade === currentGrade ? 'bg-cyan-500' : 'bg-muted-foreground'}`} />
                                                <span className="text-foreground font-black text-xs">{payload[0].value} Buildings</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[0, 4, 4, 0]}
                            barSize={24}
                            animationBegin={200}
                        >
                            <LabelList
                                dataKey="count"
                                position="right"
                                fill="#a1a1aa"
                                style={{ fontSize: '10px', fontWeight: '900' }}
                                offset={12}
                            />
                            {stats.map((entry, index) => {
                                const isSelected = entry.grade === currentGrade;
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={isSelected ? 1 : 0.2}
                                        className="hover:fill-opacity-80 transition-all duration-300 cursor-pointer"
                                    />
                                );
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* Building Indicator (Rightside pointing Left) */}
                {stats.map((entry, index) => {
                    if (entry.grade === currentGrade) {
                        // RECHARTS LAYOUT MATH:
                        // Total Container Height = 100%
                        // BarChart Margins: Top 20px, Bottom 20px
                        // Available Bar Area = (100% - 40px)
                        // Slot Center = MarginTop + (Index + 0.5) * (Available / Count)

                        return (
                            <motion.div
                                key={`indicator-v3-${index}`}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                style={{
                                    top: `calc(20px + (100% - 40px) * ${(index + 0.5) / stats.length})`,
                                    right: '25px'
                                }}
                                className="absolute -translate-y-1/2 flex items-center pointer-events-none z-50"
                            >
                                <div className="flex items-center gap-1.5">
                                    {/* Precise Pointer Triangle */}
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-r-[7px] border-r-cyan-400 border-b-[4px] border-b-transparent drop-shadow-[0_0_8px_rgba(6,182,212,1)]" />

                                    {/* The Label with refined glow */}
                                    <motion.div
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="bg-cyan-500 text-primary-foreground px-3 py-1.5 rounded-sm text-[10px] font-black uppercase shadow-[0_0_25px_rgba(6,182,212,0.7),inset_0_0_10px_rgba(255,255,255,0.3)] whitespace-nowrap"
                                    >
                                        本 棟 建 築
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    }
                    return null;
                })}
            </div>

            <div className="mt-4 flex flex-col gap-2 text-[10px] text-muted-foreground font-mono px-6 border-t border-border pt-5">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/60 tracking-widest uppercase font-bold">Statistical Context</span>
                    <span className="text-foreground bg-secondary px-2 py-0.5 rounded font-bold">114 SAMPLES</span>
                </div>
            </div>
        </div>
    );
};
