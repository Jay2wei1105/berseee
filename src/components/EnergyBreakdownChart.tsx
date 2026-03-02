import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CalculationResult } from '@/lib/types';

interface EnergyBreakdownChartProps {
    data: CalculationResult;
}

export const EnergyBreakdownChart: React.FC<EnergyBreakdownChartProps> = ({ data }) => {
    // Breakdown evaluation zones energy using AEUI, LEUI, and EEUI x Area
    const totalAC = data.energyZoneDetails.reduce((sum, zone) => sum + (zone.aeui * zone.area), 0);
    const totalLT = data.energyZoneDetails.reduce((sum, zone) => sum + (zone.leui * zone.area), 0);
    const totalEL = data.energyZoneDetails.reduce((sum, zone) => sum + (zone.eeui * zone.area), 0);

    const chartData = [
        { name: '空調系統 (AC)', value: totalAC, color: '#0ea5e9' },          // Sky Blue
        { name: '照明系統 (LT)', value: totalLT, color: '#22d3ee' },          // Cyan
        { name: '插座與電器 (EL)', value: totalEL, color: '#94a3b8' },         // Slate
        { name: '輸送設備 (Et)', value: data.Et, color: '#a855f7' },          // Purple
        { name: '揚水設備 (Ep)', value: data.Ep, color: '#ec4899' },          // Pink
        { name: '加熱設備 (Eh)', value: data.Eh, color: '#f59e0b' },          // Amber
        { name: '免評分區 (EN)', value: data.EN, color: '#475569' },          // Dark Slate
    ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Donut Chart with specific styling from image */}
            <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            isAnimationActive={true}
                            stroke="none"
                            cornerRadius={4}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    className="filter hover:brightness-125 transition-all duration-300 cursor-pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border)',
                                borderRadius: '8px',
                                fontSize: '10px'
                            }}
                            itemStyle={{ color: 'var(--foreground)' }}
                            labelStyle={{ color: 'var(--muted-foreground)' }}
                            formatter={(value: any) => [`${Number(value).toLocaleString()} kWh/yr`, '耗電量']}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center text for percentage of largest slice or total label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase">Total</span>
                    <span className="text-lg font-bold text-foreground font-mono">{total > 1000 ? (total / 1000).toFixed(1) + 'k' : total}</span>
                </div>
            </div>

            {/* List View with bars and percentages as shown in the request image */}
            <div className="w-full space-y-1 mt-6 px-2">
                {chartData.map((item, idx) => {
                    const percentage = (item.value / total) * 100;
                    return (
                        <div key={idx} className="group relative">
                            <div className="flex items-center justify-between py-2 px-3 bg-secondary/20 hover:bg-secondary/40 rounded-lg transition-all duration-300">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="w-4 h-4 rounded-sm flex-none shadow-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[11px] text-muted-foreground font-medium truncate">{item.name}</span>
                                            <span className="text-[11px] text-foreground font-bold font-mono ml-4">{percentage.toFixed(0)}%</span>
                                        </div>
                                        {/* Background track for bar */}
                                        <div className="w-full h-1 bg-secondary rounded-full mt-1.5 overflow-hidden">
                                            {/* Colored bar progress */}
                                            <div
                                                className="h-full transition-all duration-1000 ease-out rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: item.color,
                                                    boxShadow: `0 0 8px ${item.color}40`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Insight */}
            <div className="w-full mt-6 pt-4 border-t border-border flex items-center justify-between px-2">
                <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-tighter">Peak Analysis:</span>
                <span className="text-[10px] font-bold text-primary tracking-tight uppercase">
                    {chartData[0]?.name.split(' (')[0]} 主導能耗
                </span>
            </div>
        </div>
    );
};
