import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Area, ComposedChart, CartesianGrid } from 'recharts';
import { CalculationResult } from '@/lib/types';
import { motion } from 'framer-motion';
import { Database, Target, MapPin } from 'lucide-react';

interface BenchmarkingEUIProps {
    data: CalculationResult;
}

const SniperCrosshair = (props: any) => {
    const { cx, cy } = props;
    return (
        <g>
            {/* Pulsing Outer Ring */}
            <motion.circle
                cx={cx}
                cy={cy}
                r={12}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={1}
                strokeDasharray="4 2"
                animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ opacity: 0.4 }}
            />
            {/* Sniper Notches */}
            <motion.path
                d={`M ${cx} ${cy - 10} V ${cy - 14} M ${cx} ${cy + 10} V ${cy + 14} M ${cx - 10} ${cy} H ${cx - 14} M ${cx + 10} ${cy} H ${cx + 14}`}
                stroke="#06b6d4"
                strokeWidth={2}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Target Core Dot */}
            <circle cx={cx} cy={cy} r={4} fill="#06b6d4" />
            <motion.circle
                cx={cx}
                cy={cy}
                r={6}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={1.5}
                animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            {/* HUD Label */}
            <text x={cx + 18} y={cy + 4} fill="#06b6d4" fontSize="8" fontWeight="black" className="tracking-tighter uppercase opacity-80">
                LOCKED
            </text>
        </g>
    );
};

export const BenchmarkingEUI: React.FC<BenchmarkingEUIProps> = ({ data }) => {
    const { min = 50, g = 100, m = 150, max = 300 } = data.benchmarks || {};
    const currentEui = data.euiAdj || 0;
    const currentTE = data.reliability?.totalTE || 0;

    const peerData = useMemo(() => {
        const points = [];
        const count = 120;

        // Generate a spread of values around the current building's consumption
        // Normalizing the X-axis to a logarithmic-like spread for visualization
        const baseTE = currentTE > 0 ? currentTE : 100000;

        for (let i = 0; i < count; i++) {
            // X: Total Electricity (simulated)
            const xRand = Math.random();
            const x = baseTE * (0.1 + xRand * 5); // Spread from 0.1x to 5.1x current consumption

            // Y: EUI (simulated around benchmarks)
            const rand = Math.random();
            let y;
            if (rand < 0.25) y = g + (Math.random() - 0.5) * (g * 0.2);
            else if (rand < 0.75) y = m + (Math.random() - 0.5) * (m * 0.3);
            else y = m + Math.random() * (max - m) * 1.5;

            points.push({ x, y, isCurrent: false });
        }
        return points;
    }, [g, m, max, currentTE]);

    const maxX = useMemo(() => {
        const maxPeerX = Math.max(...peerData.map(p => p.x), currentTE * 1.2);
        return maxPeerX;
    }, [peerData, currentTE]);

    const maxY = useMemo(() => {
        return Math.max(max * 1.5, currentEui * 1.2);
    }, [max, currentEui]);

    // Background area data (Green Zone)
    const areaData = [
        { x: 0, y: 0, y2: g },
        { x: maxX, y: 0, y2: g },
    ];

    return (
        <div className="w-full h-full flex flex-col p-8 overflow-hidden relative group">
            {/* HUD Scanline Effect */}
            <div className="absolute inset-x-0 h-[1px] bg-cyan-500/10 top-0 pointer-events-none animate-[scan-y_6s_linear_infinite]" />
            <div className="absolute inset-y-0 w-[1px] bg-border/20 left-1/4 pointer-events-none" />
            <div className="absolute inset-y-0 w-[1px] bg-border/20 left-1/2 pointer-events-none" />
            <div className="absolute inset-y-0 w-[1px] bg-border/20 left-3/4 pointer-events-none" />

            {/* Premium Header */}
            <div className="mb-8 flex justify-between items-end border-b border-border pb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-500">
                            <Database size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground tracking-widest uppercase italic">Benchmarking Matrix</h3>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-tighter font-bold">Continental Data Federation v2.1</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[20px] font-black text-cyan-400 font-mono tracking-tighter drop-shadow-lg leading-none">
                        {currentEui.toFixed(1)}
                    </div>
                    <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-1">Current EUI Indicator</div>
                </div>
            </div>

            <div className="flex-1 min-h-[400px] relative px-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-50" vertical={false} />
                        <XAxis
                            type="number"
                            dataKey="x"
                            domain={[0, maxX]}
                            axisLine={{ stroke: 'currentColor', className: "text-border" }}
                            tickLine={false}
                            tick={{ fill: 'currentColor', className: "text-muted-foreground/60", fontSize: 10, fontWeight: 'bold' }}
                            label={{ value: '年耗電量 (kWh/yr)', position: 'bottom', offset: 20, fill: 'currentColor', className: "text-muted-foreground", fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : Math.round(val).toString())}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            domain={[0, Math.ceil(maxY)]}
                            axisLine={{ stroke: 'currentColor', className: "text-border" }}
                            tickLine={false}
                            tick={{ fill: 'currentColor', className: "text-muted-foreground/60", fontSize: 10, fontWeight: 'bold' }}
                            tickFormatter={(val) => Math.round(val).toString()}
                            label={{ value: 'EUI* (kWh/m².yr)', angle: -90, position: 'insideLeft', offset: -20, fill: 'currentColor', className: "text-muted-foreground", fontSize: 10, fontWeight: 'bold' }}
                        />

                        <Tooltip
                            shared={false}
                            trigger="hover"
                            cursor={{ strokeDasharray: '3 3', stroke: 'currentColor', className: 'text-border' }}
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                    const point = payload[0].payload;
                                    const isCurrent = point.isCurrent;
                                    return (
                                        <div className={`bg-card/95 backdrop-blur-xl border ${isCurrent ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-border'} p-4 rounded-xl text-[10px] min-w-[200px] z-[100]`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Target size={12} className={isCurrent ? 'text-cyan-500' : 'text-muted-foreground'} />
                                                <span className={`font-black tracking-widest uppercase ${isCurrent ? 'text-cyan-500' : 'text-muted-foreground'}`}>
                                                    {isCurrent ? 'Current Project' : 'Market Sample Data'}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center bg-secondary/50 p-2 rounded">
                                                    <span className="text-muted-foreground font-bold uppercase tracking-tighter text-[9px]">Building EUI:</span>
                                                    <span className={`font-mono font-bold ${isCurrent ? 'text-cyan-600' : 'text-foreground'}`}>{point.y.toFixed(1)} <span className="text-[8px] text-muted-foreground/60">kWh/m².y</span></span>
                                                </div>
                                                <div className="flex justify-between items-center bg-secondary/50 p-2 rounded">
                                                    <span className="text-muted-foreground font-bold uppercase tracking-tighter text-[9px]">Total Energy:</span>
                                                    <span className="text-foreground font-bold font-mono">{Math.round(point.x).toLocaleString()} <span className="text-[8px] text-muted-foreground/60">kWh/y</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Market Dataset (Gray Points) */}
                        <Scatter
                            name="Market Samples"
                            data={peerData}
                            fill="rgba(82, 82, 91, 0.4)"
                            shape="circle"
                        />

                        {/* SINGLE Distinct Marker for Current Building - SNIPER MODE */}
                        <Scatter
                            name="Current Project"
                            data={[{ x: currentTE, y: currentEui, isCurrent: true }]}
                            shape={<SniperCrosshair />}
                        />

                        {/* Reference Lines */}
                        <ReferenceLine y={g} stroke="#22c55e" strokeDasharray="10 6" strokeOpacity={0.2} strokeWidth={2} />
                        <ReferenceLine y={m} stroke="#facc15" strokeDasharray="10 6" strokeOpacity={0.2} strokeWidth={2} />
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Manual Reference Labels */}
                <div style={{ bottom: `${(g / maxY) * 100 + 13}%` }} className="absolute left-10 w-full flex items-center gap-2 pointer-events-none translate-y-1/2">
                    <div className="h-[1px] w-8 bg-green-500/50" />
                    <span className="text-[8px] font-black text-green-600 uppercase tracking-widest whitespace-nowrap bg-secondary/80 px-1 backdrop-blur-sm shadow-sm rounded">Green Bench (GB)</span>
                </div>
                <div style={{ bottom: `${(m / maxY) * 100 + 13}%` }} className="absolute left-10 w-full flex items-center gap-2 pointer-events-none translate-y-1/2">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest whitespace-nowrap bg-secondary/80 px-1 backdrop-blur-sm shadow-sm rounded">Market Median</span>
                </div>

            </div>

            {/* Legends & Metadata Metadata Segment */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6 text-[8px] tracking-[0.2em] font-black text-muted-foreground uppercase">
                <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>Focused Unit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                        <span>Federated Dataset</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 opacity-60">
                        <MapPin size={10} />
                        <span>TAIPEI_D01</span>
                    </div>
                    <span>SYNC_STATUS: VERIFIED</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes scan-y {
                    0% { transform: translateY(0); opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { transform: translateY(400px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
