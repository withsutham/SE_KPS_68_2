"use client";

import { useEffect, useState, useCallback } from "react";
import {
    TrendingUp,
    Calendar,
    UserPlus,
    Receipt,
    UserCheck,
    Loader2,
    Inbox,
    ChevronDown,
    LayoutDashboard,
    RefreshCw,
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
    totalRevenue: number;
    prevTotalRevenue: number;
    totalBookings: number;
    prevTotalBookings: number;
    newCustomersThisMonth: number;
    newCustomersLastMonth: number;
    avgTransactionValue: number;
    availableTherapists: { employee_id: number; name: string }[];
    revenueByDay: { date: string; revenue: number }[];
    popularServices: { name: string; count: number }[];
    peakHours: { hour: string; count: number }[];
    roomUsage: { name: string; rate: number; totalMinutes: number; maxMinutes: number }[];
    therapistUtilization: { name: string; rate: number; totalMinutes: number; maxMinutes: number }[];
    couponRedemption: { total: number; used: number; rate: number };
    packageSalesUsage: { name: string; sold: number; used: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    return `฿${amount.toLocaleString("th-TH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
}

function formatDateTH(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

function calculateGrowth(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ─── Preset Date Ranges ────────────────────────────────────────────────────────

type Preset = "today" | "7d" | "30d" | "month" | "year" | "custom";

function getPresetRange(preset: Preset): { from: string; to: string } {
    const now = new Date();
    const toStr = now.toLocaleDateString("en-CA");
    if (preset === "today") {
        return { from: toStr, to: toStr };
    }
    if (preset === "7d") {
        const from = new Date(now);
        from.setDate(now.getDate() - 6);
        return { from: from.toLocaleDateString("en-CA"), to: toStr };
    }
    if (preset === "30d") {
        const from = new Date(now);
        from.setDate(now.getDate() - 29);
        return { from: from.toLocaleDateString("en-CA"), to: toStr };
    }
    if (preset === "month") {
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: from.toLocaleDateString("en-CA"), to: toStr };
    }
    if (preset === "year") {
        const from = new Date(now.getFullYear(), 0, 1);
        return { from: from.toLocaleDateString("en-CA"), to: toStr };
    }
    return { from: toStr, to: toStr };
}

const PRESET_LABELS: { key: Preset; label: string }[] = [
    { key: "today", label: "วันนี้" },
    { key: "7d", label: "7 วัน" },
    { key: "30d", label: "30 วัน" },
    { key: "month", label: "เดือนนี้" },
    { key: "year", label: "ปีนี้" },
];

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Inbox className="h-8 w-8 opacity-25" />
            <p className="text-sm font-sans">{message}</p>
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
    title,
    subtitle,
    icon: Icon,
    iconColor = "text-primary",
    iconBg = "bg-primary/10 border-primary/20",
    children,
}: {
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    iconColor?: string;
    iconBg?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
                <div
                    className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border",
                        iconBg
                    )}
                >
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
                <div>
                    <p className="font-medium font-mitr text-foreground">{title}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground font-sans">{subtitle}</p>
                    )}
                </div>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

// ─── Horizontal Bar ───────────────────────────────────────────────────────────

function HorizontalBar({
    label,
    rate,
    totalMinutes,
    maxMinutes,
}: {
    label: string;
    rate: number;
    totalMinutes: number;
    maxMinutes: number;
}) {
    const pct = Math.max(0, Math.min(100, rate));
    const barColor =
        pct >= 75
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
            : pct >= 40
                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";

    const hours = (totalMinutes / 60).toFixed(1);
    const totalHours = (maxMinutes / 60).toFixed(0);

    return (
        <div className="flex flex-col gap-1.5 group">
            <div className="flex justify-between items-center px-0.5">
                <p className="text-xs font-medium font-sans text-foreground/80 truncate max-w-[120px]">
                    {label}
                </p>
                <p className="text-[10px] font-sans text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {hours} / {totalHours} ชม.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-[11px] font-bold font-sans text-foreground/70 w-8 text-right shrink-0">
                    {pct}%
                </p>
            </div>
        </div>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
    label,
    value,
    growth,
    icon: Icon,
    iconColor,
    iconBg,
    sub,
}: {
    label: string;
    value: string;
    growth?: number;
    icon: any;
    iconColor: string;
    iconBg: string;
    sub?: string;
}) {
    return (
        <div className="group relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md p-4 flex flex-col gap-2 transition-all hover:scale-[1.02] hover:bg-card/60 hover:border-white/20 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex justify-between items-start">
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border", iconBg)}>
                    <Icon className={cn("h-4.5 w-4.5", iconColor)} />
                </div>
                {growth !== undefined && (
                    <div className={cn(
                        "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans",
                        growth >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {growth >= 0 ? "+" : ""}{growth}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[11px] text-muted-foreground font-sans font-medium uppercase tracking-wider mb-1">
                    {label}
                </p>
                <p className="text-xl font-bold font-mitr text-foreground leading-none tracking-tight">
                    {value}
                </p>
            </div>
            {sub && (
                <p className="text-[10px] text-muted-foreground font-sans line-clamp-1 opacity-80">
                    {sub}
                </p>
            )}
        </div>
    );
}

// ─── Coupon Ring ──────────────────────────────────────────────────────────────

function CouponRing({ rate, used, total }: { rate: number; used: number; total: number }) {
    const radius = 44;
    const circ = 2 * Math.PI * radius;
    const dash = (rate / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeLinecap="round"
                        className="text-violet-500 transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold font-mitr text-foreground">{rate}%</p>
                </div>
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground font-sans">
                    ใช้แล้ว {used} จาก {total} ใบ
                </p>
            </div>
        </div>
    );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card/95 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl min-w-[120px]">
            <p className="font-bold text-foreground mb-2 font-mitr text-sm border-b border-white/5 pb-1">{label}</p>
            <div className="flex flex-col gap-1.5">
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-muted-foreground font-sans text-[11px] font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold font-sans text-[11px] text-foreground">
                            {typeof entry.value === "number" && (entry.name?.includes("รายได้") || entry.dataKey === "revenue")
                                ? formatCurrency(entry.value)
                                : entry.value.toLocaleString("th-TH")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [preset, setPreset] = useState<Preset>("month");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");
    const [showCustom, setShowCustom] = useState(false);

    const getRange = useCallback(() => {
        if (preset === "custom" && customFrom && customTo) {
            return { from: customFrom, to: customTo };
        }
        return getPresetRange(preset);
    }, [preset, customFrom, customTo]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { from, to } = getRange();
            const res = await fetch(`/api/dashboard?from=${from}&to=${to}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [getRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const kpiCards = data
        ? [
            {
                label: "รายได้รวม",
                value: formatCurrency(data.totalRevenue),
                growth: calculateGrowth(data.totalRevenue, data.prevTotalRevenue),
                icon: TrendingUp,
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
                label: "การจอง",
                value: data.totalBookings.toLocaleString("th-TH"),
                growth: calculateGrowth(data.totalBookings, data.prevTotalBookings),
                icon: Calendar,
                iconColor: "text-blue-500",
                iconBg: "bg-blue-500/10 border-blue-500/20",
            },
            {
                label: "ลูกค้าใหม่",
                value: data.newCustomersThisMonth.toLocaleString("th-TH"),
                sub: data.newCustomersLastMonth > 0
                    ? `เดือนก่อน ${data.newCustomersLastMonth} คน`
                    : "เดือนก่อนไม่มีลูกค้าใหม่",
                icon: UserPlus,
                iconColor: "text-violet-500",
                iconBg: "bg-violet-500/10 border-violet-500/20",
            },
            {
                label: "เฉลี่ยต่อบิล",
                value: formatCurrency(data.avgTransactionValue),
                sub: "ในเดือนนี้",
                icon: Receipt,
                iconColor: "text-amber-500",
                iconBg: "bg-amber-500/10 border-amber-500/20",
            },
            {
                label: "พร้อมทำงาน",
                value: data.availableTherapists.length.toLocaleString("th-TH"),
                sub: data.availableTherapists.length > 0
                    ? data.availableTherapists.map((t) => t.name).slice(0, 2).join(", ") +
                    (data.availableTherapists.length > 2 ? ` +${data.availableTherapists.length - 2}` : "")
                    : "ไม่มีหมอนวดวันนี้",
                icon: UserCheck,
                iconColor: "text-teal-500",
                iconBg: "bg-teal-500/10 border-teal-500/20",
            },
        ]
        : [];

    return (
        <main className="flex-1 w-full">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 -left-60 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-24">
                {/* ── Header ──────────────────────────────────────────────────── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-inner shadow-primary/20">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-primary/70 uppercase font-sans mb-2">
                        System Overview · แดชบอร์ดผู้จัดการ
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold font-mitr text-foreground tracking-tight">
                        สรุปผลการดำเนินงาน
                    </h1>
                </div>

                {/* ── Date Range Picker ───────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-3 mb-10">
                    <div className="flex flex-wrap items-center gap-2 justify-center p-1.5 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm">
                        {PRESET_LABELS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => {
                                    setPreset(p.key);
                                    setShowCustom(false);
                                }}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all",
                                    preset === p.key && !showCustom
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                setPreset("custom");
                                setShowCustom((v) => !v);
                            }}
                            className={cn(
                                "px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5",
                                preset === "custom"
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            กำหนดเอง
                            <ChevronDown className={cn("h-3 w-3 transition-transform", showCustom && "rotate-180")} />
                        </button>
                        <div className="w-px h-4 bg-border/40 mx-1" />
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </button>
                    </div>

                    {showCustom && (
                        <div className="flex items-center gap-3 flex-wrap justify-center p-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">เริ่มต้น</label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                                />
                            </div>
                            <span className="text-muted-foreground text-sm font-sans mt-4">→</span>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">สิ้นสุด</label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                                />
                            </div>
                            <Button size="sm" className="rounded-xl font-bold font-sans mt-4 px-6" onClick={fetchData}>
                                ตกลง
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-6 w-6 rounded-full bg-primary/10" />
                            </div>
                        </div>
                        <span className="text-sm font-medium font-sans tracking-wide">กำลังประมวลผลข้อมูล...</span>
                    </div>
                ) : !data ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
                        <Inbox className="h-10 w-10 opacity-20" />
                        <p className="font-mitr text-base">ไม่สามารถโหลดข้อมูลได้</p>
                        <Button variant="outline" size="sm" onClick={fetchData} className="rounded-full font-sans">
                            ลองใหม่อีกครั้ง
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* ── ① KPI Cards ─────────────────────────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {kpiCards.map((card) => (
                                <KPICard key={card.label} {...card} />
                            ))}
                        </div>

                        {/* ── ② Charts Row 1 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 2.1 Revenue Trend */}
                            <SectionCard
                                title="แนวโน้มรายได้"
                                subtitle="รายได้รวมแยกตามวัน"
                                icon={TrendingUp}
                            >
                                {data.revenueByDay.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลรายได้ในช่วงเวลานี้" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={data.revenueByDay.map((d) => ({ ...d, date: formatDateTH(d.date) }))}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.2} vertical={false} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis tick={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="revenue" name="รายได้" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>

                            {/* 2.2 Popular Services */}
                            <SectionCard
                                title="บริการยอดนิยม"
                                subtitle="จำนวนการจองแยกตามบริการ"
                                icon={Calendar}
                                iconColor="text-blue-500"
                                iconBg="bg-blue-500/10 border-blue-500/20"
                            >
                                {data.popularServices.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลการจองบริการในช่วงเวลานี้" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.popularServices} layout="vertical" margin={{ left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontFamily: "sans-serif", fontWeight: 500 }} tickLine={false} axisLine={false} width={100} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="จำนวน" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── ② Charts Row 2 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 2.3 Peak Hours */}
                            <SectionCard
                                title="ชั่วโมงยอดนิยม"
                                subtitle="จำนวนการนวดแยกตามช่วงเวลา"
                                icon={Calendar}
                                iconColor="text-amber-500"
                                iconBg="bg-amber-500/10 border-amber-500/20"
                            >
                                {data.peakHours.every((h) => h.count === 0) ? (
                                    <EmptyState message="ยังไม่มีข้อมูลในช่วงเวลานี้" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.peakHours}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />
                                            <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="จำนวน" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>

                            {/* 2.7 Package Sales vs Usage */}
                            <SectionCard
                                title="แพ็กเกจ: ขายได้ vs ใช้แล้ว"
                                subtitle="การขายเทียบกับการใช้งานแต่ละแพ็กเกจ"
                                icon={Receipt}
                                iconColor="text-violet-500"
                                iconBg="bg-violet-500/10 border-violet-500/20"
                            >
                                {data.packageSalesUsage.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลแพ็กเกจ" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.packageSalesUsage}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 10, fontFamily: "sans-serif", paddingTop: 10 }} />
                                            <Bar dataKey="sold" name="ขายได้" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="used" name="ใช้แล้ว" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── ② Charts Row 3 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 2.4 Room Usage */}
                            <SectionCard
                                title="อัตราการใช้ห้อง"
                                subtitle="อ้างอิงจากเวลาเปิดร้าน 10 ชม./วัน"
                                icon={Calendar}
                                iconColor="text-teal-500"
                                iconBg="bg-teal-500/10 border-teal-500/20"
                            >
                                {data.roomUsage.length === 0 ? (
                                    <EmptyState message="ยังไม่มีห้อง" />
                                ) : (
                                    <div className="flex flex-col gap-5 py-2">
                                        {data.roomUsage.map((r) => (
                                            <HorizontalBar
                                                key={r.name}
                                                label={r.name}
                                                rate={r.rate}
                                                totalMinutes={r.totalMinutes}
                                                maxMinutes={r.maxMinutes}
                                            />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            {/* 2.5 Therapist Utilization */}
                            <SectionCard
                                title="อัตราการใช้งานหมอนวด"
                                subtitle="อ้างอิงจากเวลาทำงาน 8 ชม./วัน"
                                icon={UserCheck}
                                iconColor="text-primary"
                            >
                                {data.therapistUtilization.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลหมอนวด" />
                                ) : (
                                    <div className="flex flex-col gap-5 py-2">
                                        {data.therapistUtilization.slice(0, 6).map((t) => (
                                            <HorizontalBar
                                                key={t.name}
                                                label={t.name}
                                                rate={t.rate}
                                                totalMinutes={t.totalMinutes}
                                                maxMinutes={t.maxMinutes}
                                            />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            {/* 2.6 Coupon Redemption */}
                            <SectionCard
                                title="อัตราแลกคูปอง"
                                subtitle="คูปองทั้งหมดในระบบ"
                                icon={Receipt}
                                iconColor="text-violet-500"
                                iconBg="bg-violet-500/10 border-violet-500/20"
                            >
                                {data.couponRedemption.total === 0 ? (
                                    <EmptyState message="ยังไม่มีคูปองในระบบ" />
                                ) : (
                                    <div className="flex justify-center py-6">
                                        <CouponRing
                                            rate={data.couponRedemption.rate}
                                            used={data.couponRedemption.used}
                                            total={data.couponRedemption.total}
                                        />
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
