"use client";

import { motion } from "framer-motion";
import {
    Activity, Zap, Leaf, Droplets, Target, AlertTriangle,
    ArrowUpRight, ArrowDownRight, BatteryCharging
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <div className="flex-1 flex flex-col py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <Activity className="text-primary" size={32} /> 能效分析總覽
                        </h1>
                        <p className="text-muted-foreground mt-2">DSE.BERS 智慧節能診斷報告</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex gap-3">
                        <Button variant="outline" className="rounded-full bg-background/50 backdrop-blur-md border-white/10">
                            下載 PDF 報告
                        </Button>
                        <Button className="rounded-full bg-primary hover:bg-primary/90">
                            匯出詳細數據
                        </Button>
                    </motion.div>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {/* Main Score Card (Span 2 cols) */}
                    <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 row-span-2">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                            <CardHeader className="relative z-10 pb-2">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Leaf className="text-green-400" size={20} /> 綜合能效評級 (BERS)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10 flex flex-col items-center justify-center h-[calc(100%-4rem)]">
                                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 tabular-nums tracking-tighter drop-shadow-sm">
                                    1<span className="text-4xl relative -top-6">+</span>
                                </div>
                                <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-green-500/20 text-green-300 font-medium border border-green-500/30">
                                    鑽石級 (優良)
                                </div>
                                <div className="w-full mt-8 space-y-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>EUI 指標</span>
                                        <span className="font-bold text-foreground">85 kW·h/m²·yr</span>
                                    </div>
                                    <div className="h-3 w-full bg-background/30 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "30%" }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                        <span>標準值 140</span>
                                        <span>最高分 0</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats 1 */}
                    <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Zap className="text-amber-400" size={24} />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">年度總用電量</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">1.24 <span className="text-lg text-muted-foreground font-normal">MWh</span></div>
                                <p className="text-xs text-green-400 mt-2 flex items-center">
                                    <ArrowDownRight size={14} className="mr-1" /> 比去年減少 12.5%
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats 2 */}
                    <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Target className="text-cyan-400" size={24} />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">預估節能潛力</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">18.2 <span className="text-lg text-muted-foreground font-normal">%</span></div>
                                <p className="text-xs text-cyan-400 mt-2 flex items-center">
                                    相當於每年節省 NT$ 450,000
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats 3 */}
                    <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Droplets className="text-blue-400" size={24} />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">水資源耗用指數</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">0.85 <span className="text-lg text-muted-foreground font-normal">WUI</span></div>
                                <p className="text-xs text-amber-400 mt-2 flex items-center">
                                    <ArrowUpRight size={14} className="mr-1" /> 高於平均標準 5%
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Stats 4 */}
                    <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1">
                        <Card className="h-full bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">異常耗能警示</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-foreground">2 <span className="text-lg text-muted-foreground font-normal">個熱點</span></div>
                                <p className="text-xs text-red-400 mt-2 flex items-center">
                                    B2 冰水主機效率偏低
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Charts / AI Analysis Span Full */}
                    <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4">
                        <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden group mt-4">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <BatteryCharging className="text-cyan-400" size={20} /> AI 智慧改善建議
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-3 p-4 rounded-xl bg-background/30 border border-white/5">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</span>
                                            空調系統優化
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            目前中央空調系統能耗佔比達 55%。建議加裝 VFD 變頻器並導入 EMS 聯動控制，預估可降低 12% 整體用電。
                                        </p>
                                    </div>
                                    <div className="space-y-3 p-4 rounded-xl bg-background/30 border border-white/5">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</span>
                                            照明設備汰換
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            B1, B2 地下停車場仍有部分傳統燈管，建議全面汰換為 LED 智能感應燈具，投資回收期約 1.5 年。
                                        </p>
                                    </div>
                                    <div className="space-y-3 p-4 rounded-xl bg-background/30 border border-white/5">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</span>
                                            契約容量管理
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            夏季尖峰用電經常超出契約容量並產生罰金。建議透過需量反應系統在尖峰時段自動卸載非核心負載。
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
}
