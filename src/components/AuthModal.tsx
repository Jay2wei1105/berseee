"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { LogIn, User, LogOut, Loader2, ShieldCheck } from "lucide-react";

export function AuthModal() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Check current session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (mode === "login") {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                setOpen(false);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;

                // If email confirmation is disabled, Supabase returns a session immediately
                if (data.session) {
                    setOpen(false);
                } else {
                    setMessage("註冊成功！請檢查您的 Email 以驗證帳號。");
                }
            }
        } catch (error: any) {
            if (error.message?.includes("rate limit")) {
                setMessage("目前註冊郵件發送過於頻繁，請 1 小時後再試，或請管理員檢查 Supabase 驗證信設定是否已關閉。");
            } else {
                setMessage(error.message || "發生錯誤，請稍後再試。");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest leading-none mb-1">Authenticated</span>
                    <span className="text-[12px] text-foreground font-bold leading-none">{user.email?.split('@')[0]}</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="h-9 px-4 rounded-full border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                    <LogOut size={14} className="mr-2" />
                    登出
                </Button>
            </div>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-full border-border bg-secondary/50 text-foreground hover:bg-sky-500/10 hover:border-sky-500/30 transition-all font-bold"
                >
                    <LogIn size={14} className="mr-2 text-sky-400" />
                    登入 / 註冊
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-zinc-950/95 border-white/10 backdrop-blur-2xl p-0 overflow-hidden rounded-3xl shadow-2xl">
                <div className="relative p-8">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-[80px]" />

                    <DialogHeader className="mb-8 relative z-10">
                        <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                            <ShieldCheck className="text-sky-400" size={24} />
                        </div>
                        <DialogTitle className="text-2xl font-black text-center tracking-tight text-white italic">
                            {mode === "login" ? "BERS2 LOGIN" : "CREATE ACCOUNT"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500 text-[12px] font-mono uppercase tracking-widest mt-2">
                            Secure Cloud Authentication Protocol
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Terminal</Label>
                            <Input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-sky-500/50 focus:ring-0 text-white transition-all text-sm placeholder:text-zinc-700"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Token</Label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-white/[0.03] border-white/10 rounded-xl focus:border-sky-500/50 focus:ring-0 text-white transition-all text-sm placeholder:text-zinc-700"
                                required
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-[12px] font-medium leading-relaxed ${message.includes("成功") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                                {message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-black italic tracking-tighter rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === "login" ? "INITIALIZE SESSION" : "REGISTER PROTOCOL")}
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-zinc-950 px-2 text-zinc-600">OR CONNECT WITH</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" className="h-10 bg-white/[0.02] border-white/10 hover:bg-white/[0.05] rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all">
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                GOOGLE
                            </Button>
                            <Button type="button" variant="outline" className="h-10 bg-white/[0.02] border-white/10 hover:bg-white/[0.05] rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all">
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.24.73-.55v-1.84c-3.03.66-3.67-1.46-3.67-1.46-.5-1.27-1.23-1.61-1.23-1.61-.98-.67.08-.66.08-.66 1.1.08 1.67 1.13 1.67 1.13.97 1.66 2.54 1.18 3.17.9.1-.72.39-1.22.71-1.5-2.42-.28-4.97-1.21-4.97-5.39 0-1.19.43-2.16 1.13-2.92-.1-.28-.5-1.38.1-2.88 0 0 .91-.3 3 1.11a10.33 10.33 0 015.5 0c2.09-1.41 3-1.11 3-1.11.6 1.5.2 2.6.1 2.88.71.76 1.13 1.73 1.13 2.92 0 4.19-2.56 5.11-4.99 5.38.4.35.74 1.05.74 2.11v3.12c0 .32.18.66.76.55A11 11 0 0012 1.27" /></svg>
                                GITHUB
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-white/5 text-center">
                            <button
                                type="button"
                                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                                className="text-[11px] text-zinc-500 hover:text-sky-400 transition-colors uppercase font-bold tracking-widest"
                            >
                                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                            </button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
