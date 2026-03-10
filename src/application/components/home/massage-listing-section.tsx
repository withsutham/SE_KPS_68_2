"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Leaf,
    Clock,
    Search,
    ImageOff,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
    X,
    CalendarCheck,
} from "lucide-react";
import Image from "next/image";

interface Massage {
    massage_id: number;
    massage_name: string;
    massage_price: number;
    massage_time: number | null;
    image_src: string | null;
}

type SortKey = "default" | "price_asc" | "price_desc" | "time_asc" | "time_desc";

// ─── Skeleton Cards ──────────────────────────────────────────────────────────
function MassageCardSkeleton() {
    return (
        <div className="shrink-0 w-72 rounded-xl border border-border/40 bg-card/40 overflow-hidden flex flex-col">
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="p-4 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
                <div className="flex gap-2 mt-1">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <Skeleton className="h-9 w-full rounded-full mt-1" />
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function MassageListingSection() {
    const [massages, setMassages] = useState<Massage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("default");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
    const [timeRange, setTimeRange] = useState<[number, number]>([0, 999]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // ── Fetch data ──
    useEffect(() => {
        async function fetchMassages() {
            try {
                const res = await fetch("/api/massage");
                const json = await res.json();
                if (!json.success) throw new Error(json.error);
                setMassages(json.data);
            } catch (e: any) {
                setError(e.message ?? "ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setLoading(false);
            }
        }
        fetchMassages();
    }, []);

    // ── Dynamic bounds ──
    const bounds = useMemo(() => {
        if (massages.length === 0) return { minPrice: 0, maxPrice: 9999, minTime: 0, maxTime: 999 };
        const prices = massages.map((m) => m.massage_price);
        const times = massages.filter((m) => m.massage_time != null).map((m) => m.massage_time as number);
        return {
            minPrice: Math.floor(Math.min(...prices)),
            maxPrice: Math.ceil(Math.max(...prices)),
            minTime: times.length ? Math.min(...times) : 0,
            maxTime: times.length ? Math.max(...times) : 999,
        };
    }, [massages]);

    useEffect(() => {
        if (massages.length > 0) {
            setPriceRange([bounds.minPrice, bounds.maxPrice]);
            setTimeRange([bounds.minTime, bounds.maxTime]);
        }
    }, [massages.length, bounds.minPrice, bounds.maxPrice, bounds.minTime, bounds.maxTime]);

    // ── Filter + Sort ──
    const filtered = useMemo(() => {
        let result = massages.filter((m) => {
            const nameMatch = m.massage_name.toLowerCase().includes(search.toLowerCase());
            const priceMatch = m.massage_price >= priceRange[0] && m.massage_price <= priceRange[1];
            const timeMatch = m.massage_time == null || (m.massage_time >= timeRange[0] && m.massage_time <= timeRange[1]);
            return nameMatch && priceMatch && timeMatch;
        });

        switch (sortKey) {
            case "price_asc": result = [...result].sort((a, b) => a.massage_price - b.massage_price); break;
            case "price_desc": result = [...result].sort((a, b) => b.massage_price - a.massage_price); break;
            case "time_asc": result = [...result].sort((a, b) => (a.massage_time ?? 0) - (b.massage_time ?? 0)); break;
            case "time_desc": result = [...result].sort((a, b) => (b.massage_time ?? 0) - (a.massage_time ?? 0)); break;
        }
        return result;
    }, [massages, search, priceRange, timeRange, sortKey]);

    // ── Active filter chips ──
    const activeFilters: { label: string; onRemove: () => void }[] = [];
    if (search) activeFilters.push({ label: `"${search}"`, onRemove: () => setSearch("") });
    if (priceRange[0] !== bounds.minPrice || priceRange[1] !== bounds.maxPrice)
        activeFilters.push({ label: `฿${priceRange[0].toLocaleString()}–฿${priceRange[1].toLocaleString()}`, onRemove: () => setPriceRange([bounds.minPrice, bounds.maxPrice]) });
    if (timeRange[0] !== bounds.minTime || timeRange[1] !== bounds.maxTime)
        activeFilters.push({ label: `${timeRange[0]}–${timeRange[1]} นาที`, onRemove: () => setTimeRange([bounds.minTime, bounds.maxTime]) });

    const isFiltered = activeFilters.length > 0;

    // ── Scroll controls ──
    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 8);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScrollButtons();
        el.addEventListener("scroll", updateScrollButtons, { passive: true });
        return () => el.removeEventListener("scroll", updateScrollButtons);
    }, [filtered, updateScrollButtons]);

    const scroll = (dir: "left" | "right") => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -312 : 312, behavior: "smooth" });
    };

    return (
        <section id="services" className="w-full max-w-7xl px-8 py-8 mx-auto flex flex-col gap-10 scroll-mt-24">

            {/* ── Header ── */}
            <div className="flex flex-col gap-5 text-center md:text-left items-center md:items-start">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-mitr">
                    บริการนวดของเรา
                </h2>
                <p className="text-muted-foreground max-w-3xl text-xl font-light">
                    เลือกสรรบริการที่ตรงกับความต้องการของคุณ ครบครันทุกเทคนิค ทั้งแบบไทยโบราณและสากล
                </p>

                {/* ── Controls Row ── */}
                <div className="flex flex-wrap items-center gap-3 w-full">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="massage-search"
                            type="text"
                            placeholder="ค้นหาบริการนวด..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 rounded-full border-border/50 bg-card/60 backdrop-blur-sm focus-visible:ring-primary/40"
                        />
                    </div>

                    {/* Sort */}
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                        <SelectTrigger id="sort-select" className="w-44 rounded-full border-border/50 bg-card/60 backdrop-blur-sm text-sm">
                            <SelectValue placeholder="เรียงตาม" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">เรียงตามค่าเริ่มต้น</SelectItem>
                            <SelectItem value="price_asc">ราคา: น้อย → มาก</SelectItem>
                            <SelectItem value="price_desc">ราคา: มาก → น้อย</SelectItem>
                            <SelectItem value="time_asc">เวลา: สั้น → ยาว</SelectItem>
                            <SelectItem value="time_desc">เวลา: ยาว → สั้น</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter Toggle */}
                    <button
                        id="toggle-filters"
                        onClick={() => setShowFilters((v) => !v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${showFilters || isFiltered
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border/50 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border"
                            }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        ตัวกรอง
                        {isFiltered && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                    </button>
                </div>

                {/* ── Filter Panel ── */}
                {showFilters && !loading && (
                    <div className="w-full max-w-xl bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">ช่วงราคา</span>
                                <span className="text-primary font-medium">฿{priceRange[0].toLocaleString()} – ฿{priceRange[1].toLocaleString()}</span>
                            </div>
                            <Slider id="price-slider" min={bounds.minPrice} max={bounds.maxPrice} step={50} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>฿{bounds.minPrice.toLocaleString()}</span>
                                <span>฿{bounds.maxPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        {bounds.maxTime > bounds.minTime && (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">ระยะเวลา</span>
                                    <span className="text-primary font-medium">{timeRange[0]} – {timeRange[1]} นาที</span>
                                </div>
                                <Slider id="time-slider" min={bounds.minTime} max={bounds.maxTime} step={15} value={timeRange} onValueChange={(v) => setTimeRange(v as [number, number])} />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{bounds.minTime} นาที</span>
                                    <span>{bounds.maxTime} นาที</span>
                                </div>
                            </div>
                        )}
                        {isFiltered && (
                            <button id="reset-filters" onClick={() => { setSearch(""); setPriceRange([bounds.minPrice, bounds.maxPrice]); setTimeRange([bounds.minTime, bounds.maxTime]); }} className="self-start text-sm text-muted-foreground hover:text-primary underline-offset-2 hover:underline transition-colors">
                                รีเซ็ตทั้งหมด
                            </button>
                        )}
                    </div>
                )}

                {/* ── Active Filter Chips + Result Count ── */}
                {!loading && (
                    <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
                        {activeFilters.map((f) => (
                            <span key={f.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                {f.label}
                                <button onClick={f.onRemove} className="hover:text-primary/60 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                            {isFiltered
                                ? `แสดง ${filtered.length} จาก ${massages.length} บริการ`
                                : `${massages.length} บริการทั้งหมด`}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Loading: Skeleton ── */}
            {loading && (
                <div className="flex gap-5 overflow-hidden pb-4">
                    {[...Array(4)].map((_, i) => <MassageCardSkeleton key={i} />)}
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div className="flex items-center justify-center py-16 text-destructive text-center">
                    <p>{error}</p>
                </div>
            )}

            {/* ── Empty State ── */}
            {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                    <div className="h-20 w-20 rounded-2xl bg-muted/40 flex items-center justify-center">
                        <Leaf className="h-10 w-10 opacity-20" />
                    </div>
                    <p className="text-lg font-light">ไม่พบบริการที่ตรงกับเงื่อนไขที่เลือก</p>
                    {isFiltered && (
                        <button onClick={() => { setSearch(""); setPriceRange([bounds.minPrice, bounds.maxPrice]); setTimeRange([bounds.minTime, bounds.maxTime]); }} className="text-sm text-primary hover:underline underline-offset-2">
                            ล้างตัวกรองทั้งหมด
                        </button>
                    )}
                </div>
            )}

            {/* ── Cards: Horizontal Scroll with Arrows ── */}
            {!loading && !error && filtered.length > 0 && (
                <div className="relative group/scroll">
                    {/* Fade Edges */}
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10" />

                    {/* Left Arrow */}
                    {canScrollLeft && (
                        <button
                            id="scroll-left"
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-foreground hover:bg-card hover:scale-105 active:scale-95 transition-all duration-150 backdrop-blur-sm"
                            aria-label="เลื่อนซ้าย"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}

                    {/* Right Arrow */}
                    {canScrollRight && (
                        <button
                            id="scroll-right"
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-card/90 border border-border/50 shadow-md flex items-center justify-center text-foreground hover:bg-card hover:scale-105 active:scale-95 transition-all duration-150 backdrop-blur-sm"
                            aria-label="เลื่อนขวา"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    )}

                    {/* Scroll Container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                    >
                        {filtered.map((massage) => (
                            <Card
                                key={massage.massage_id}
                                className="group snap-start shrink-0 w-96 border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden flex flex-col"
                            >
                                {/* Image */}
                                <div className="relative h-60 w-full bg-muted/40 overflow-hidden">
                                    {massage.image_src ? (
                                        <Image src={massage.image_src} alt={massage.massage_name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Leaf className="h-7 w-7 text-primary/70" />
                                            </div>
                                        </div>
                                    )}
                                    {!massage.image_src && (
                                        <ImageOff className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/30" />
                                    )}
                                </div>

                                {/* Title */}
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-medium leading-snug line-clamp-2">
                                        {massage.massage_name}
                                    </CardTitle>
                                </CardHeader>

                                {/* Badges + CTA */}
                                <CardContent className="flex flex-col gap-3 mt-auto">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-medium border-primary/30 text-primary bg-primary/5">
                                            ฿{massage.massage_price.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                                        </Badge>
                                        {massage.massage_time != null && (
                                            <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-light border-border/40 text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {massage.massage_time} นาที
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Book Now */}
                                    <Button
                                        id={`book-massage-${massage.massage_id}`}
                                        asChild
                                        className="w-full rounded-full mt-1 font-mitr gap-2 shadow-sm shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        size="sm"
                                    >
                                        <a href={`/booking?serviceId=${massage.massage_id}`}>
                                            <CalendarCheck className="h-4 w-4" />
                                            จองเลย
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
