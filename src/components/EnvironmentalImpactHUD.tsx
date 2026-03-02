import React from 'react';
import { TreeDeciduous, Car } from 'lucide-react';
import { CalculationResult } from '@/lib/types';

interface EnvironmentalImpactHUDProps {
    data: CalculationResult;
}

export const EnvironmentalImpactHUD: React.FC<EnvironmentalImpactHUDProps> = ({ data }) => {
    const { totalTE } = data.reliability;
    const co2Kg = totalTE * 0.495;
    const treesRequired = co2Kg / 12; // 1 tree handles ~12kg of CO2/yr
    const carsEquivalent = co2Kg / 4600; // 1 car emits ~4,600kg CO2/yr

    return (
        <div className="w-full space-y-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.2em] mb-4">Carbon Flux Estimation</div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black italic text-foreground drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        {co2Kg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-xs text-emerald-500 font-mono">kgCO₂e / yr</span>
                </div>
                <div className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest font-bold">Calculated via BERS-Protocol v2.1</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all relative group">
                    <div className="absolute top-4 right-4 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity">
                        <TreeDeciduous size={24} />
                    </div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Offset Ecosystem</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">
                        {treesRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[9px] text-zinc-500 uppercase mt-1">Mature Trees Required</div>
                </div>

                <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/[0.05] transition-all relative group">
                    <div className="absolute top-4 right-4 text-sky-500 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Car size={24} />
                    </div>
                    <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Pollution Offset</div>
                    <div className="text-xl font-bold text-sky-400 font-mono">
                        {carsEquivalent.toFixed(1)}
                    </div>
                    <div className="text-[9px] text-zinc-500 uppercase mt-1">Passenger Vehicles Yearly</div>
                </div>
            </div>
        </div>
    );
};
