"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Plus, ImageIcon } from "lucide-react";

const CANVAS_W = 520;
const CANVAS_H = 380;
const PALETTE = ["#38bdf8", "#34d399", "#f59e0b", "#f87171", "#a78bfa", "#fb7185", "#4ade80"];

type Pt = { x: number; y: number };
type DrawMode = "rect" | "polygon";

// 只存像素面積，realArea 動態計算
interface Region { id: number; mode: DrawMode; points: Pt[]; pixelArea: number; color: string; label: string; }

function shoelace(pts: Pt[]) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(a / 2);
}

interface Props {
    licenseArea: number;
    onAddEnergyArea: (area: number) => void;
    onAddExemptArea: (area: number) => void;
}

export function FloorPlanTool({ licenseArea, onAddEnergyArea, onAddExemptArea }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const polyPtsRef = useRef<Pt[]>([]);
    const clickTimeRef = useRef(0);

    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [mode, setMode] = useState<DrawMode>("rect");
    const [regions, setRegions] = useState<Region[]>([]);
    const [rectStart, setRectStart] = useState<Pt | null>(null);
    const [rectCur, setRectCur] = useState<Pt | null>(null);
    const [isRect, setIsRect] = useState(false);
    const [polyPts, setPolyPts] = useState<Pt[]>([]);
    const [polyMouse, setPolyMouse] = useState<Pt | null>(null);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>): Pt => {
        const r = canvasRef.current!.getBoundingClientRect();
        return { x: (e.clientX - r.left) * (CANVAS_W / r.width), y: (e.clientY - r.top) * (CANVAS_H / r.height) };
    };

    // 核心計算：分母 = 所有已繪製區域像素之加總 → 各區域加總 = licenseArea
    const totalPixelArea = regions.reduce((sum, r) => sum + r.pixelArea, 0);
    const getRealArea = (pixelArea: number): number => {
        if (totalPixelArea <= 0 || licenseArea <= 0) return 0;
        return (pixelArea / totalPixelArea) * licenseArea;
    };

    const redraw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#18181b"; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        // grid
        ctx.strokeStyle = "#27272a"; ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke(); }
        for (let y = 0; y <= CANVAS_H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke(); }
        // image
        if (img) {
            const s = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
            ctx.globalAlpha = 0.85;
            ctx.drawImage(img, (CANVAS_W - img.naturalWidth * s) / 2, (CANVAS_H - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
            ctx.globalAlpha = 1;
        }
        // completed regions — label 顯示動態計算的 realArea
        const _total = regions.reduce((s, r) => s + r.pixelArea, 0);
        regions.forEach(r => {
            ctx.fillStyle = r.color + "33"; ctx.strokeStyle = r.color; ctx.lineWidth = 2;
            ctx.beginPath();
            if (r.mode === "rect") {
                const [p1, p2] = r.points; ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
            } else {
                r.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath();
            }
            ctx.fill(); ctx.stroke();
            const cx = r.points.reduce((s, p) => s + p.x, 0) / r.points.length;
            const cy = r.points.reduce((s, p) => s + p.y, 0) / r.points.length;
            const displayArea = (_total > 0 && licenseArea > 0) ? (r.pixelArea / _total) * licenseArea : 0;
            ctx.fillStyle = "#fff"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "center";
            ctx.fillText(displayArea > 0 ? `${displayArea.toFixed(1)}m²` : "", cx, cy + 4);
        });
        // rect preview
        if (isRect && rectStart && rectCur) {
            ctx.strokeStyle = "#38bdf8"; ctx.fillStyle = "#38bdf822"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 2]);
            ctx.beginPath(); ctx.rect(rectStart.x, rectStart.y, rectCur.x - rectStart.x, rectCur.y - rectStart.y);
            ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
        }
        // polygon preview
        if (polyPts.length > 0) {
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 2]);
            ctx.beginPath(); polyPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            if (polyMouse) ctx.lineTo(polyMouse.x, polyMouse.y);
            ctx.stroke(); ctx.setLineDash([]);
            polyPts.forEach(p => { ctx.fillStyle = "#38bdf8"; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
        }
    }, [img, regions, isRect, rectStart, rectCur, polyPts, polyMouse, licenseArea]);

    useEffect(() => { redraw(); }, [redraw]);

    const finishPolygon = (pts: Pt[]) => {
        if (pts.length < 3) return;
        const pixelArea = shoelace(pts);
        const color = PALETTE[regions.length % PALETTE.length];
        setRegions(prev => [...prev, { id: Date.now(), mode: "polygon", points: pts, pixelArea, color, label: `區域 ${prev.length + 1}` }]);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const image = new Image(); image.onload = () => setImg(image); image.src = URL.createObjectURL(file);
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode === "rect") { setRectStart(getPos(e)); setIsRect(true); }
    };
    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getPos(e);
        if (mode === "rect" && isRect) setRectCur(pos);
        if (mode === "polygon") setPolyMouse(pos);
    };
    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode === "rect" && isRect && rectStart) {
            const pos = getPos(e);
            const w = Math.abs(pos.x - rectStart.x), h = Math.abs(pos.y - rectStart.y);
            if (w > 5 && h > 5) {
                const x0 = Math.min(pos.x, rectStart.x), y0 = Math.min(pos.y, rectStart.y);
                const color = PALETTE[regions.length % PALETTE.length];
                // 只存 pixelArea，realArea 動態算
                setRegions(prev => [...prev, { id: Date.now(), mode: "rect", points: [{ x: x0, y: y0 }, { x: x0 + w, y: y0 + h }], pixelArea: w * h, color, label: `區域 ${prev.length + 1}` }]);
            }
            setIsRect(false); setRectStart(null); setRectCur(null);
        }
    };
    const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (mode !== "polygon") return;
        const now = Date.now();
        if (now - clickTimeRef.current < 300) return;
        clickTimeRef.current = now;
        const pos = getPos(e);
        polyPtsRef.current = [...polyPtsRef.current, pos];
        setPolyPts([...polyPtsRef.current]);
    };
    const onDblClick = () => {
        if (mode === "polygon" && polyPtsRef.current.length >= 3) {
            finishPolygon(polyPtsRef.current);
            polyPtsRef.current = []; setPolyPts([]); setPolyMouse(null);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all text-xs">
                    <Upload size={11} /> {img ? "重新上傳" : "上傳平面圖"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <div className="flex items-center gap-1 bg-secondary border border-border rounded-lg p-1">
                    {(["rect", "polygon"] as DrawMode[]).map(m => (
                        <button key={m} onClick={() => { setMode(m); polyPtsRef.current = []; setPolyPts([]); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                            {m === "rect" ? "矩形" : "多邊形"}
                        </button>
                    ))}
                </div>
                <button onClick={() => { setRegions([]); polyPtsRef.current = []; setPolyPts([]); }}
                    className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all" title="清除所有">
                    <Trash2 size={12} />
                </button>
            </div>

            {/* 面積加總說明 */}
            {licenseArea > 0 && regions.length > 0 && (
                <div className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="text-primary/70">各區域面積比例加總 =</span>
                    <span className="font-mono text-primary font-semibold">{licenseArea} m²</span>
                </div>
            )}
            {licenseArea <= 0 && regions.length > 0 && (
                <p className="text-[11px] text-amber-400/70 bg-amber-500/5 border border-amber-500/15 px-2 py-1 rounded-lg">
                    ⚠ 請填入樓層使用執照總面積以計算各分區實際面積
                </p>
            )}

            {mode === "polygon" && polyPts.length > 0 && (
                <p className="text-[11px] text-amber-400/80 bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded-lg">
                    已標記 {polyPts.length} 個頂點，雙擊完成多邊形
                </p>
            )}

            {/* Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-[#09090b] shadow-inner" style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, width: "100%", maxHeight: "320px" }}>
                <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
                    style={{ width: "100%", height: "100%", display: "block", cursor: mode === "rect" ? "crosshair" : "cell" }}
                    onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
                    onClick={onClick} onDoubleClick={onDblClick} />
                {!img && (
                    <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center pointer-events-none">
                        <ImageIcon size={28} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground text-xs">上傳平面圖後可在此繪製分區</p>
                        <p className="text-muted-foreground/60 text-[11px]">未上傳亦可直接在格線上繪製</p>
                    </div>
                )}
            </div>

            {/* Regions list */}
            {regions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">已繪製區域</p>
                        <p className="text-[10px] text-muted-foreground/60">面積依比例動態分配</p>
                    </div>
                    <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5">
                        {regions.map(r => {
                            const realArea = getRealArea(r.pixelArea);
                            const pct = totalPixelArea > 0 ? ((r.pixelArea / totalPixelArea) * 100).toFixed(1) : "0";
                            return (
                                <div key={r.id} className="flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-1.5">
                                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                                    <span className="text-xs text-foreground/80 flex-1 truncate">{r.label}</span>
                                    <span className="text-[10px] text-muted-foreground/60 shrink-0">{pct}%</span>
                                    <span className="text-xs font-mono text-foreground shrink-0 font-semibold">
                                        {realArea > 0 ? `${realArea.toFixed(1)} m²` : "-- m²"}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => onAddEnergyArea(realArea)} disabled={realArea <= 0}
                                            className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-30 shrink-0">
                                            <Plus size={8} /> 耗能
                                        </button>
                                        <button onClick={() => onAddExemptArea(realArea)} disabled={realArea <= 0}
                                            className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all disabled:opacity-30 shrink-0">
                                            <Plus size={8} /> 免評
                                        </button>
                                    </div>
                                    <button onClick={() => setRegions(prev => prev.filter(x => x.id !== r.id))}
                                        className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 ml-1">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    {/* 加總驗證 */}
                    <div className="flex items-center justify-between px-1 text-[11px]">
                        <span className="text-muted-foreground/60">合計</span>
                        <span className={`font-mono font-semibold ${licenseArea > 0 ? "text-primary" : "text-muted-foreground/40"}`}>
                            {licenseArea > 0
                                ? `${regions.reduce((s, r) => s + getRealArea(r.pixelArea), 0).toFixed(1)} m² = ${licenseArea} m²`
                                : `${regions.length} 個區域`}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
