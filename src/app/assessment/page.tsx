"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Zap, LayoutDashboard, Settings2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { calculateBERS, getAvailableZones } from "@/utils/bersCalculator";

export default function AssessmentPage() {
    const [activeTab, setActiveTab] = useState("basic");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // States
    const [basicInfo, setBasicInfo] = useState({
        companyName: "",
        address: "",
        contactPerson: "",
        contactEmail: "",
        floorArea: "",
        buildingType: "office",
    });

    // We use a simplified single zone for the demo or mock the zones
    const [zones, setZones] = useState([
        { zoneCode: "B3", area: 15000, region: "north", acType: "intermittent", baseline: "m" }
    ]);

    const handleNext = (nextTab: string) => {
        setActiveTab(nextTab);
    };

    const handleComplete = async () => {
        setIsSubmitting(true);

        // Form the calculation
        const totalArea = Number(basicInfo.floorArea) || 15000;
        const annualElec = 1240000; // Mock from form
        const result = calculateBERS(zones, [], totalArea, annualElec);

        // In a real app we would save this to Supabase or Context
        console.log("Calculated BERS result:", result);

        setTimeout(() => {
            setIsSubmitting(false);
            window.location.href = "/dashboard";
        }, 1500);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="flex-1 flex flex-col items-center py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full text-center mb-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                    BERS 智慧建築能效評估
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    請填寫以下建築基本資訊與設備數據，我們的 AI 引擎將為您即時計算並生成專屬的能效診斷報告。
                </p>
            </motion.div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full"
            >
                <Card className="bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="bg-muted/30 border-b border-border p-2">
                            <TabsList className="w-full grid grid-cols-4 bg-transparent gap-2">
                                <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all">
                                    <Building2 size={16} className="mr-2" />
                                    <span className="hidden sm:inline">基本資料</span>
                                </TabsTrigger>
                                <TabsTrigger value="energy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all">
                                    <Zap size={16} className="mr-2" />
                                    <span className="hidden sm:inline">能耗數據</span>
                                </TabsTrigger>
                                <TabsTrigger value="spaces" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all">
                                    <LayoutDashboard size={16} className="mr-2" />
                                    <span className="hidden sm:inline">空間分區</span>
                                </TabsTrigger>
                                <TabsTrigger value="equipment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl py-3 transition-all">
                                    <Settings2 size={16} className="mr-2" />
                                    <span className="hidden sm:inline">核心設備</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                <TabsContent value="basic" className="mt-0 outline-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-2xl">Step 1: 建築基本資料</CardTitle>
                                            <CardDescription>我們需要您的基本聯繫方式與建築概況以建立評估檔案。</CardDescription>
                                        </CardHeader>
                                        <div className="grid gap-6 md:grid-cols-2 mt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName">企業 / 建築名稱</Label>
                                                <Input id="companyName" placeholder="例如：台達內湖總部" className="bg-background/50 h-12 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="buildingType">建築類別</Label>
                                                <Select defaultValue={basicInfo.buildingType}>
                                                    <SelectTrigger className="bg-background/50 h-12 rounded-xl">
                                                        <SelectValue placeholder="選擇類別" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="office">辦公大樓 (Office)</SelectItem>
                                                        <SelectItem value="hotel">觀光旅館 (Hotel)</SelectItem>
                                                        <SelectItem value="hospital">醫療院所 (Hospital)</SelectItem>
                                                        <SelectItem value="departmentStore">百貨商場 (Department Store)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="floorArea">總樓地板面積 (m²)</Label>
                                                <Input id="floorArea" type="number" placeholder="例如：15000" className="bg-background/50 h-12 rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="contactEmail">聯絡信箱</Label>
                                                <Input id="contactEmail" type="email" placeholder="name@example.com" className="bg-background/50 h-12 rounded-xl" />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            <Button onClick={() => handleNext("energy")} className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90">
                                                下一步：能耗數據 <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="energy" className="mt-0 outline-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-2xl">Step 2: 歷史能耗數據</CardTitle>
                                            <CardDescription>輸入最近一年的電費單或總用電量，我們將透過此數據計算您的 EUI 水準。</CardDescription>
                                        </CardHeader>
                                        <div className="mt-6 border border-border/50 rounded-2xl p-6 bg-background/20">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>年度總用電量 (度 / kWh)</Label>
                                                    <Input type="number" placeholder="輸入年度總用電量..." className="bg-background/50 h-12 rounded-xl text-lg font-medium" />
                                                </div>
                                                <Separator className="my-6" />
                                                <div className="space-y-2">
                                                    <Label>年度總用水量 (度 / m³) - 選擇性</Label>
                                                    <Input type="number" placeholder="輸入年度總用水量..." className="bg-background/50 h-12 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-between">
                                            <Button variant="outline" onClick={() => handleNext("basic")} className="h-12 px-6 rounded-full border-white/10">
                                                <ArrowLeft className="mr-2 w-4 h-4" /> 返回
                                            </Button>
                                            <Button onClick={() => handleNext("spaces")} className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90">
                                                下一步：空間分區 <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="spaces" className="mt-0 outline-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-2xl">Step 3: 空間分區配置</CardTitle>
                                            <CardDescription>設定建築內部的各大空間，以利系統推估不同區域的標準耗能區間。</CardDescription>
                                        </CardHeader>
                                        <div className="mt-4 border border-border/50 rounded-2xl p-6 bg-background/20 space-y-4">
                                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
                                                <div className="space-y-2">
                                                    <Label>空間名稱</Label>
                                                    <Input placeholder="1F 大廳" className="bg-background/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>空間用途</Label>
                                                    <Select defaultValue="lobby">
                                                        <SelectTrigger className="bg-background/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="office">一般辦公區</SelectItem>
                                                            <SelectItem value="lobby">大廳/梯廳</SelectItem>
                                                            <SelectItem value="meeting">會議室</SelectItem>
                                                            <SelectItem value="server">資訊機房</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>面積 (m²)</Label>
                                                    <Input placeholder="500" type="number" className="bg-background/50" />
                                                </div>
                                                <Button variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                                    新增空間
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-between">
                                            <Button variant="outline" onClick={() => handleNext("energy")} className="h-12 px-6 rounded-full border-white/10">
                                                <ArrowLeft className="mr-2 w-4 h-4" /> 返回
                                            </Button>
                                            <Button onClick={() => handleNext("equipment")} className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90">
                                                下一步：設備資訊 <ArrowRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="equipment" className="mt-0 outline-none">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle className="text-2xl">Step 4: 核心設備</CardTitle>
                                            <CardDescription>確認空調、照明等主要耗能設備規格，完成最後一步驟即可產出分析。</CardDescription>
                                        </CardHeader>
                                        <div className="mt-4 space-y-6">
                                            <div className="border border-border/50 rounded-2xl p-6 bg-background/20">
                                                <h4 className="font-semibold mb-4 text-primary">空調系統</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>總冷卻噸數 (RT)</Label>
                                                        <Input placeholder="請輸入噸數" type="number" className="bg-background/50" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>系統類型</Label>
                                                        <Select defaultValue="central">
                                                            <SelectTrigger className="bg-background/50">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="central">水冷式中央空調</SelectItem>
                                                                <SelectItem value="vrv">VRV 多聯變頻</SelectItem>
                                                                <SelectItem value="split">分離式/箱型機</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-between">
                                            <Button variant="outline" onClick={() => handleNext("spaces")} className="h-12 px-6 rounded-full border-white/10">
                                                <ArrowLeft className="mr-2 w-4 h-4" /> 返回
                                            </Button>
                                            <Button onClick={handleComplete} disabled={isSubmitting} className="h-12 px-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-cyan-500/20 text-white font-bold border-0">
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2">處理中...</span>
                                                ) : (
                                                    <span className="flex items-center gap-2"><Save size={18} /> 產出 AI 診斷報告</span>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                </TabsContent>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </Card>
            </motion.div>
        </div>
    );
}
