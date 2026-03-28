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
    totalBookings: number;
    newCustomersThisMonth: number;
    newCustomersLastMonth: number;
    avgTransactionValue: number;
    availableTherapists: { employee_id: number; name: string }[];
    revenueByDay: { date: string; revenue: number }[];
    popularServices: { name: string; count: number }[];
    peakHours: { hour: string; count: number }[];
    roomUsage: { name: string; rate: number }[];
    therapistUtilization: { name: string; rate: number }[];
    couponRedemption: { total: number; used: number; rate: number };
    packageSalesUsage: { name: string; sold: number; used: number }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    return `฿${amount.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateTH(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
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
    color = "bg-primary",
}: {
    label: string;
    rate: number;
    color?: string;
}) {
    const pct = Math.max(0, Math.min(100, rate));
    const barColor =
        pct >= 75
            ? "bg-emerald-500"
            : pct >= 40
                ? "bg-blue-500"
                : "bg-amber-500";

    return (
        <div className="flex items-center gap-3">
            <p className="text-xs font-sans text-foreground/80 w-28 shrink-0 truncate">{label}</p>
            <div className="flex-1 h-2 rounded-full bg-muted/60">
                <div
                    className={cn("h-2 rounded-full transition-all duration-700", barColor)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <p className="text-xs font-sans text-muted-foreground w-9 text-right shrink-0">
                {pct}%
            </p>
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
        <div className="bg-card border border-border/50 rounded-xl px-3 py-2 text-xs shadow-lg">
            <p className="font-medium text-foreground mb-1 font-mitr">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} style={{ color: entry.color }} className="font-sans">
                    {entry.name}: {typeof entry.value === "number" && entry.name?.includes("รายได้")
                        ? formatCurrency(entry.value)
                        : entry.value}
                </p>
            ))}
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
                icon: TrendingUp,
                gradient: "from-emerald-500/20 to-emerald-600/5",
                border: "border-emerald-500/20",
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
                label: "การจองทั้งหมด",
                value: data.totalBookings.toLocaleString("th-TH"),
                icon: Calendar,
                gradient: "from-blue-500/20 to-blue-600/5",
                border: "border-blue-500/20",
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
                gradient: "from-violet-500/20 to-violet-600/5",
                border: "border-violet-500/20",
                iconColor: "text-violet-500",
                iconBg: "bg-violet-500/10 border-violet-500/20",
            },
            {
                label: "เฉลี่ยต่อบิล",
                value: formatCurrency(data.avgTransactionValue),
                sub: "ในเดือนนี้",
                icon: Receipt,
                gradient: "from-amber-500/20 to-amber-600/5",
                border: "border-amber-500/20",
                iconColor: "text-amber-500",
                iconBg: "bg-amber-500/10 border-amber-500/20",
            },
            {
                label: "หมอนวดพร้อมวันนี้",
                value: data.availableTherapists.length.toLocaleString("th-TH"),
                sub: data.availableTherapists.length > 0
                    ? data.availableTherapists.map((t) => t.name).slice(0, 3).join(", ") +
                    (data.availableTherapists.length > 3 ? ` +${data.availableTherapists.length - 3}` : "")
                    : "ไม่มีหมอนวดประจำวันนี้",
                icon: UserCheck,
                gradient: "from-teal-500/20 to-teal-600/5",
                border: "border-teal-500/20",
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
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <LayoutDashboard className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-2">
                        ผู้จัดการ · Manager
                    </p>
                    <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
                        แดชบอร์ด
                    </h1>
                    <p className="text-muted-foreground mt-2 font-sans text-sm">
                        ภาพรวมร้านและสถิติสำคัญ
                    </p>
                </div>

                {/* ── Date Range Picker ───────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="flex flex-wrap items-center gap-2 justify-center">
                        {PRESET_LABELS.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => {
                                    setPreset(p.key);
                                    setShowCustom(false);
                                }}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-sans border transition-all",
                                    preset === p.key && !showCustom
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card/60 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
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
                                "px-4 py-1.5 rounded-full text-sm font-sans border transition-all flex items-center gap-1",
                                preset === "custom"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card/60 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            กำหนดเอง
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="h-8 w-8 rounded-full border border-border/40 bg-card/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                        >
                            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        </button>
                    </div>

                    {showCustom && (
                        <div className="flex items-center gap-3 flex-wrap justify-center">
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                            />
                            <span className="text-muted-foreground text-sm font-sans">ถึง</span>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-xl border border-border/50 bg-muted/30 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                            />
                            <Button size="sm" className="rounded-full font-sans" onClick={fetchData}>
                                ดูข้อมูล
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <span className="text-sm font-sans">กำลังโหลดข้อมูล...</span>
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
                    <div className="flex flex-col gap-6">
                        {/* ── ① KPI Cards ─────────────────────────────────────────── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {kpiCards.map((card) => (
                                <div
                                    key={card.label}
                                    className={cn(
                                        "rounded-2xl border bg-gradient-to-br p-4 flex flex-col gap-2",
                                        card.border,
                                        card.gradient
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-8 w-8 rounded-xl flex items-center justify-center border",
                                            card.iconBg
                                        )}
                                    >
                                        <card.icon className={cn("h-4 w-4", card.iconColor)} />
                                    </div>
                                    <p className="text-xs text-muted-foreground font-sans">{card.label}</p>
                                    <p className="text-lg font-bold font-mitr text-foreground leading-tight">
                                        {card.value}
                                    </p>
                                    {card.sub && (
                                        <p className="text-[11px] text-muted-foreground font-sans leading-tight">
                                            {card.sub}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── ② Charts Row 1 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 2.1 Revenue Trend */}
                            <SectionCard
                                title="แนวโน้มรายได้"
                                subtitle="รายได้รวมแยกตามวัน"
                                icon={TrendingUp}
                            >
                                {data.revenueByDay.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลรายได้ในช่วงเวลานี้" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={data.revenueByDay.map((d) => ({ ...d, date: formatDateTH(d.date) }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="revenue" name="รายได้" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                        </LineChart>
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
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.popularServices} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} width={90} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="จำนวน" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── ② Charts Row 2 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.peakHours}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                                            <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" name="จำนวน" fill="#f59e0b" radius={[4, 4, 0, 0]} />
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
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.packageSalesUsage}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} />
                                            <YAxis tick={{ fontSize: 11, fontFamily: "sans-serif" }} tickLine={false} axisLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                                            <Bar dataKey="sold" name="ขายได้" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="used" name="ใช้แล้ว" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                        </div>

                        {/* ── ② Charts Row 3 ─────────────────────────────────────── */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 2.4 Room Usage */}
                            <SectionCard
                                title="อัตราการใช้ห้อง"
                                subtitle="ช่วงเวลาที่เลือก"
                                icon={Calendar}
                                iconColor="text-teal-500"
                                iconBg="bg-teal-500/10 border-teal-500/20"
                            >
                                {data.roomUsage.length === 0 ? (
                                    <EmptyState message="ยังไม่มีห้อง" />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {data.roomUsage.map((r) => (
                                            <HorizontalBar key={r.name} label={r.name} rate={r.rate} />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            {/* 2.5 Therapist Utilization */}
                            <SectionCard
                                title="อัตราการใช้งานหมอนวด"
                                subtitle="ช่วงเวลาที่เลือก"
                                icon={UserCheck}
                                iconColor="text-primary"
                            >
                                {data.therapistUtilization.length === 0 ? (
                                    <EmptyState message="ยังไม่มีข้อมูลหมอนวด" />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {data.therapistUtilization.map((t) => (
                                            <HorizontalBar key={t.name} label={t.name} rate={t.rate} />
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
                                    <div className="flex justify-center py-2">
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
