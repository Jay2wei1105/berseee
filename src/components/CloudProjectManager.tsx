"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
    Cloud,
    Search,
    RefreshCcw,
    ArrowUpRight,
    History,
    Trash2,
    Building2,
    Calendar,
    Loader2,
    CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface Project {
    id: string;
    building_name: string;
    created_at: string;
    input_data: any;
    user_id: string;
}

export function CloudProjectManager({ onSelectProject }: { onSelectProject: (data: any) => void }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchProjects = async () => {
        setLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
            // Fetch all assessments (RLS will handle the filtering)
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .order('updated_at', { ascending: false });

            if (!error && data) {
                setProjects(data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const { error } = await supabase.from('assessments').delete().eq('id', id);
        if (!error) {
            setProjects(projects.filter(p => p.id !== id));
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-white italic tracking-tight flex items-center gap-2">
                        <Cloud className="text-sky-400" size={20} />
                        雲端同步專案
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                        Select a building protocol to synchronize data
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchProjects}
                    className="h-8 w-8 rounded-full hover:bg-white/5 text-zinc-500 hover:text-sky-400"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {projects.length === 0 && !loading && (
                    <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl">
                        <History className="mx-auto text-zinc-800 mb-3" size={32} />
                        <p className="text-zinc-600 text-[12px] font-medium italic">尚未有儲存的雲端專案</p>
                    </div>
                )}

                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => onSelectProject(project.input_data)}
                        className="group relative bg-zinc-900/40 border border-white/5 p-4 rounded-2xl hover:border-sky-500/30 hover:bg-sky-500/[0.02] transition-all cursor-pointer overflow-hidden shadow-xl"
                    >
                        {/* Status Light */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-mono font-bold text-emerald-500/80 uppercase">Synced</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-sky-500/10 group-hover:text-sky-400 group-hover:border-sky-500/20 transition-all">
                                <Building2 size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors truncate pr-16 italic">
                                    {project.building_name}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">
                                        <Calendar size={10} />
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-600 font-mono text-[9px] uppercase tracking-wider border-l border-white/5 pl-4">
                                        MOD {new Date(project.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-black italic tracking-tighter text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10"
                                onClick={(e) => handleDelete(e, project.id)}
                            >
                                <Trash2 size={12} className="mr-1.5" /> REMOVE
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-[10px] font-black italic tracking-tighter text-sky-400 bg-sky-500/5 hover:bg-sky-500/15"
                            >
                                LOAD PROTOCOL <ArrowUpRight size={12} className="ml-1.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="animate-spin text-sky-500" size={24} />
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] animate-pulse">Scanning Cloud Nodes...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
