"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Zap, LayoutDashboard, Settings2, Droplets, Activity, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const steps = [
    { id: "basic", label: "基本資料", icon: Building2 },
    { id: "energy", label: "用電資料", icon: Zap },
    { id: "spaces", label: "空間面積", icon: LayoutDashboard },
    { id: "equipment", label: "設備資料", icon: Settings2 },
    { id: "water", label: "用水資料", icon: Droplets },
    { id: "operation", label: "營運率", icon: Activity },
];

export default function AssessmentPage() {
    const [activeTab, setActiveTab] = useState("basic");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [basicInfo, setBasicInfo] = useState({
        companyName: "", buildingType: "", contactPerson: "", contactEmail: "", phone: "", floorArea: "", groundFloors: "", basementFloors: "", address: ""
    });

    const [spaces, setSpaces] = useState([
        { id: 1, name: "", type: "", acUsage: "", isWaterCooled: "no", area: "" }
    ]);

    const currentIndex = steps.findIndex(s => s.id === activeTab);
    const handleNext = () => { if (currentIndex < steps.length - 1) setActiveTab(steps[currentIndex + 1].id); };
    const handlePrev = () => { if (currentIndex > 0) setActiveTab(steps[currentIndex - 1].id); };

    const handleComplete = async () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            window.location.href = "/dashboard";
        }, 1500);
    };

    const addSpace = () => setSpaces([...spaces, { id: Date.now(), name: "", type: "", acUsage: "", isWaterCooled: "no", area: "" }]);
    const removeSpace = (id: number) => setSpaces(spaces.filter(s => s.id !== id));

    return (
        <div className="flex-1 flex flex-col items-center py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                    BERS 智慧建築能效評估
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    請填寫以下建築基本資訊與設備數據，我們的 AI 引擎將為您即時計算並生成專屬的能效診斷報告。
                </p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 w-full items-start">

                {/* Left Side Navigation Pill */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-64 shrink-0">
                    <Card className="bg-popover border-border shadow-xl rounded-full p-4 flex flex-col gap-2 overflow-hidden relative">
                        {steps.map((step, idx) => {
                            const isActive = activeTab === step.id;
                            const Icon = step.icon;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveTab(step.id)}
                                    className={`relative flex items-center gap-4 px-6 py-4 rounded-full font-medium transition-all duration-300 z-10 w-full text-left
                    ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-primary rounded-full z-[-1]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} className={isActive ? "text-primary-foreground" : ""} />
                                    <span className="text-sm tracking-wide">{step.label}</span>
                                </button>
                            );
                        })}
                    </Card>
                </motion.div>

                {/* Right Side Content Form */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex-1 min-w-0">
                    <Card className="bg-popover border-transparent shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-8 md:p-12 flex-1 relative">
                            <AnimatePresence mode="wait">

                                {/* 1. 基本資料 */}
                                {activeTab === "basic" && (
                                    <motion.div key="basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-foreground mb-2">基本資料</h2>
                                            <p className="text-muted-foreground">我們需要您的基本聯繫方式與建築概況以建立評估檔案。</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3"><Label>公司名稱</Label><Input className="h-14 rounded-full bg-muted/50 border-transparent focus:bg-background px-6" /></div>
                                            <div className="space-y-3"><Label>建築類型</Label>
                                                <Select><SelectTrigger className="h-14 rounded-full bg-muted/50 border-transparent px-6"><SelectValue placeholder="選擇類型" /></SelectTrigger>
                                                    <SelectContent className="rounded-2xl"><SelectItem value="office">辦公場所</SelectItem><SelectItem value="hotel">旅館</SelectItem><SelectItem value="hospital">醫療照護</SelectItem></SelectContent></Select>
                                            </div>
                                            <div className="space-y-3"><Label>填寫人員</Label><Input className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3"><Label>聯繫信箱</Label><Input type="email" className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3"><Label>電話</Label><Input type="tel" className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3"><Label>樓地板面積 (m²)</Label><Input type="number" className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3"><Label>地上總樓層數</Label><Input type="number" className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3"><Label>地下總樓層數</Label><Input type="number" className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                            <div className="space-y-3 md:col-span-2"><Label>地址</Label><Input className="h-14 rounded-full bg-muted/50 border-transparent px-6" /></div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 2. 用電資料 */}
                                {activeTab === "energy" && (
                                    <motion.div key="energy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div><h2 className="text-3xl font-bold text-foreground mb-2">用電資料</h2><p className="text-muted-foreground">輸入連續 12 個月的電費單數據以建立能效基準。</p></div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3"><Label>比對年度 1</Label><Select><SelectTrigger className="h-14 rounded-full bg-muted/50"><SelectValue placeholder="2024" /></SelectTrigger><SelectContent><SelectItem value="2024">2024</SelectItem></SelectContent></Select></div>
                                            <div className="space-y-3"><Label>比對年度 2</Label><Select><SelectTrigger className="h-14 rounded-full bg-muted/50"><SelectValue placeholder="2023" /></SelectTrigger><SelectContent><SelectItem value="2023">2023</SelectItem></SelectContent></Select></div>
                                        </div>
                                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[1, 2, 3, 4, 5, 6].map(month => (
                                                    <div key={month} className="flex gap-2 items-center">
                                                        <Label className="w-12">{month}月</Label>
                                                        <Input placeholder={`年度1 kWh`} className="h-12 rounded-xl bg-background border-border/50" />
                                                        <Input placeholder={`年度2 kWh`} className="h-12 rounded-xl bg-background border-border/50" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 3. 空間面積 */}
                                {activeTab === "spaces" && (
                                    <motion.div key="spaces" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div><h2 className="text-3xl font-bold text-foreground mb-2">空間面積資料</h2><p className="text-muted-foreground">設定建築內部的各大空間，推估不同區域的標準耗能區間。</p></div>
                                            <Button onClick={addSpace} className="rounded-full shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 h-12">
                                                <Plus className="w-4 h-4 mr-2" /> 新增空間
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {spaces.map((space, index) => (
                                                <div key={space.id} className="relative bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm flex flex-col gap-4 group">
                                                    <button onClick={() => removeSpace(space.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} /></button>
                                                    <div className="font-bold text-xl text-foreground">空間 {index + 1}</div>
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                        <div className="space-y-2 col-span-2"><Label>空間名稱</Label><Input className="h-12 rounded-xl bg-background" placeholder="例如: 1F 大廳" /></div>
                                                        <div className="space-y-2"><Label>類型</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="選擇" /></SelectTrigger><SelectContent><SelectItem value="office">辦公空間</SelectItem><SelectItem value="lobby">商場</SelectItem></SelectContent></Select></div>
                                                        <div className="space-y-2"><Label>空調使情形</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="選擇" /></SelectTrigger><SelectContent><SelectItem value="1">間歇</SelectItem><SelectItem value="2">整日</SelectItem></SelectContent></Select></div>
                                                        <div className="space-y-2"><Label>面積 (m²)</Label><Input className="h-12 rounded-xl bg-background" placeholder="500" /></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* 4. 設備資料 */}
                                {activeTab === "equipment" && (
                                    <motion.div key="equipment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div><h2 className="text-3xl font-bold text-foreground mb-2">設備資料</h2><p className="text-muted-foreground">設定空調、照明等主要耗能設備規格。</p></div>

                                        <div className="grid gap-6">
                                            <div className="bg-card p-6 rounded-[2rem] border border-border/50">
                                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings2 className="text-primary" /> 空調設備</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2"><Label>設備類型</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="選取" /></SelectTrigger><SelectContent><SelectItem value="central">中央空調</SelectItem><SelectItem value="vrv">VRV</SelectItem></SelectContent></Select></div>
                                                    <div className="space-y-2"><Label>總噸數 (RT)</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>數量</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>使用時數 (hr/yr)</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                </div>
                                            </div>

                                            <div className="bg-card p-6 rounded-[2rem] border border-border/50">
                                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="text-secondary" /> 照明設備</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2"><Label>燈具類型</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="選取" /></SelectTrigger><SelectContent><SelectItem value="led">LED</SelectItem><SelectItem value="t5">T5 日光燈</SelectItem></SelectContent></Select></div>
                                                    <div className="space-y-2"><Label>數量</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>年份</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>使用時數 (hr/yr)</Label><Input type="number" className="h-12 rounded-xl bg-background" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 5. 用水資料 */}
                                {activeTab === "water" && (
                                    <motion.div key="water" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div><h2 className="text-3xl font-bold text-foreground mb-2">用水資料</h2><p className="text-muted-foreground">揚水系統與用水相關數據。</p></div>
                                        <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm flex flex-col gap-6">
                                            <h3 className="text-xl font-bold">揚水系統</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3"><Label>水塔高度 (m)</Label><Input type="number" placeholder="42" className="h-14 rounded-full bg-background px-6 border-border" /></div>
                                                <div className="space-y-3"><Label>年用水量 (m³/yr)</Label><Input type="number" placeholder="221.4" className="h-14 rounded-full bg-background px-6 border-border" /></div>
                                                <div className="space-y-3 md:col-span-2"><Label>熱水設備類型</Label>
                                                    <Select><SelectTrigger className="h-14 rounded-full bg-background border-border px-6"><SelectValue placeholder="選擇類別" /></SelectTrigger>
                                                        <SelectContent className="rounded-2xl"><SelectItem value="1">電熱式</SelectItem><SelectItem value="2">瓦斯式</SelectItem><SelectItem value="3">熱泵</SelectItem></SelectContent></Select>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 6. 營運率 */}
                                {activeTab === "operation" && (
                                    <motion.div key="operation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        <div><h2 className="text-3xl font-bold text-foreground mb-2">營運率 (Operation Rate)</h2><p className="text-muted-foreground">建築物與各特定區域的營運時間。</p></div>

                                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm mb-6">
                                            <h3 className="text-xl font-bold mb-4">建築營運時間</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div className="space-y-2"><Label>起始日</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="星期一" /></SelectTrigger><SelectContent><SelectItem value="1">星期一</SelectItem></SelectContent></Select></div>
                                                <div className="space-y-2"><Label>結束日</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="星期五" /></SelectTrigger><SelectContent><SelectItem value="5">星期五</SelectItem></SelectContent></Select></div>
                                                <div className="space-y-2"><Label>開始時間</Label><Input type="time" className="h-12 rounded-xl bg-background" /></div>
                                                <div className="space-y-2"><Label>結束時間</Label><Input type="time" className="h-12 rounded-xl bg-background" /></div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="allday" className="rounded-md w-5 h-5" />
                                                <label htmlFor="allday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    整日營運 (24hr)
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-card p-6 rounded-[2rem] border border-border/50">
                                                <h3 className="font-bold mb-4">特定區域營運率</h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2"><Label>展覽區</Label><Input type="number" step="0.1" placeholder="0.5" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>200人以上大會議室</Label><Input type="number" step="0.1" placeholder="0.6" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>一般空調區域</Label><Input type="number" step="0.1" placeholder="0.8" className="h-12 rounded-xl bg-background" /></div>
                                                </div>
                                            </div>
                                            <div className="bg-card p-6 rounded-[2rem] border border-border/50">
                                                <h3 className="font-bold mb-4">特定營運空間</h3>
                                                <div className="space-y-4">
                                                    <div className="space-y-2"><Label>盥洗室營運時間 (h/yr)</Label><Input type="number" placeholder="2500" className="h-12 rounded-xl bg-background" /></div>
                                                    <div className="space-y-2"><Label>餐廳形式</Label><Select><SelectTrigger className="h-12 rounded-xl bg-background"><SelectValue placeholder="無" /></SelectTrigger><SelectContent><SelectItem value="0">無</SelectItem><SelectItem value="1">員工餐廳</SelectItem></SelectContent></Select></div>
                                                    <div className="space-y-2"><Label>餐廳面積 (m²)</Label><Input type="number" placeholder="0" className="h-12 rounded-xl bg-background" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>

                        {/* Bottom Actions Area */}
                        <div className="p-6 md:p-8 bg-muted/20 border-t border-border mt-auto flex justify-between items-center rounded-b-[2rem]">
                            <Button
                                variant="ghost"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="h-14 px-6 rounded-full hover:bg-muted font-bold text-muted-foreground"
                            >
                                <ArrowLeft className="mr-2 w-5 h-5" /> 返回
                            </Button>

                            {currentIndex === steps.length - 1 ? (
                                <Button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] transition-all"
                                >
                                    {isSubmitting ? "處理中..." : <><Save className="mr-2 w-5 h-5" /> 產出報告</>}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="h-14 px-10 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold text-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] transition-all"
                                >
                                    下一步 <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
