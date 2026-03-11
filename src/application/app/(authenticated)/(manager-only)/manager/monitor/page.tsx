"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Monitor,
    UserCheck,
    DoorOpen,
    Loader2,
    Inbox,
    RefreshCw,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TherapistStatus = "available" | "in_service" | "on_leave" | "off_duty";
type RoomStatus = "available" | "occupied";

interface TherapistStatusItem {
    employee_id: number;
    name: string;
    status: TherapistStatus;
    currentService: string | null;
    serviceEndTime: string | null;
}

interface RoomStatusItem {
    room_id: number;
    name: string;
    status: RoomStatus;
    currentService: string | null;
    serviceEndTime: string | null;
    therapistName: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_TH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatTimeTH(iso: string) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} น.`;
}

// ─── Therapist Status Config ───────────────────────────────────────────────────

const THERAPIST_STATUS_CONFIG: Record<
    TherapistStatus,
    { label: string; dotColor: string; cardBg: string; cardBorder: string; badgeStyle: string }
> = {
    available: {
        label: "ว่าง",
        dotColor: "bg-emerald-500",
        cardBg: "bg-emerald-50/60 dark:bg-emerald-900/10",
        cardBorder: "border-emerald-200 dark:border-emerald-800/50",
        badgeStyle:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    in_service: {
        label: "กำลังให้บริการ",
        dotColor: "bg-blue-500",
        cardBg: "bg-blue-50/60 dark:bg-blue-900/10",
        cardBorder: "border-blue-200 dark:border-blue-800/50",
        badgeStyle:
            "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    },
    on_leave: {
        label: "ลาหยุด",
        dotColor: "bg-red-500",
        cardBg: "bg-red-50/60 dark:bg-red-900/10",
        cardBorder: "border-red-200 dark:border-red-800/50",
        badgeStyle:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
    off_duty: {
        label: "ไม่มีตารางงานวันนี้",
        dotColor: "bg-muted-foreground/40",
        cardBg: "bg-muted/10",
        cardBorder: "border-border/30",
        badgeStyle:
            "bg-muted/50 text-muted-foreground border-border/40",
    },
};

// ─── Room Status Config ────────────────────────────────────────────────────────

const ROOM_STATUS_CONFIG: Record<
    RoomStatus,
    { label: string; dotColor: string; cardBg: string; cardBorder: string; badgeStyle: string }
> = {
    available: {
        label: "ว่าง",
        dotColor: "bg-emerald-500",
        cardBg: "bg-emerald-50/60 dark:bg-emerald-900/10",
        cardBorder: "border-emerald-200 dark:border-emerald-800/50",
        badgeStyle:
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    },
    occupied: {
        label: "ใช้งานอยู่",
        dotColor: "bg-red-500",
        cardBg: "bg-red-50/60 dark:bg-red-900/10",
        cardBorder: "border-red-200 dark:border-red-800/50",
        badgeStyle:
            "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    },
};

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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MonitorPage() {
    const [therapistStatus, setTherapistStatus] = useState<TherapistStatusItem[]>([]);
    const [roomStatus, setRoomStatus] = useState<RoomStatusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const today = new Date().toLocaleDateString("en-CA");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard?from=${today}&to=${today}`);
            const json = await res.json();
            if (json.success) {
                setTherapistStatus(json.data.therapistStatus ?? []);
                setRoomStatus(json.data.roomStatus ?? []);
                setLastRefresh(new Date());
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [today]);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const therapistCounts = {
        available: therapistStatus.filter((t) => t.status === "available").length,
        in_service: therapistStatus.filter((t) => t.status === "in_service").length,
        on_leave: therapistStatus.filter((t) => t.status === "on_leave").length,
    };

    const roomCounts = {
        available: roomStatus.filter((r) => r.status === "available").length,
        occupied: roomStatus.filter((r) => r.status === "occupied").length,
    };

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
                        <Monitor className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-2">
                        สถานะแบบเรียลไทม์ · Live Monitor
                    </p>
                    <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
                        มอนิเตอร์
                    </h1>
                    <p className="text-muted-foreground mt-2 font-sans text-sm">
                        สถานะหมอนวดและห้องแบบเรียลไทม์ อัปเดตทุก 60 วินาที
                    </p>

                    {/* Refresh + last updated */}
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/40 bg-card/60 text-xs text-muted-foreground hover:text-foreground transition-all font-sans"
                        >
                            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                            อัปเดตข้อมูล
                        </button>
                        <span className="text-xs text-muted-foreground font-sans">
                            อัปเดตล่าสุด {formatTimeTH(lastRefresh.toISOString())}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <span className="text-sm font-sans">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {/* ── ③ Therapist Status Board ────────────────────────────── */}
                        <SectionCard
                            title="สถานะหมอนวด"
                            subtitle={`ว่าง ${therapistCounts.available} · กำลังให้บริการ ${therapistCounts.in_service} · ลาหยุด ${therapistCounts.on_leave}`}
                            icon={UserCheck}
                            iconColor="text-primary"
                        >
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {(
                                    [
                                        { status: "available", label: "ว่าง" },
                                        { status: "in_service", label: "กำลังให้บริการ" },
                                        { status: "on_leave", label: "ลาหยุด" },
                                        { status: "off_duty", label: "ไม่มีตารางงานวันนี้" },
                                    ] as { status: TherapistStatus; label: string }[]
                                ).map((s) => {
                                    const cfg = THERAPIST_STATUS_CONFIG[s.status];
                                    return (
                                        <div key={s.status} className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                                            <div className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                                            {s.label}
                                        </div>
                                    );
                                })}
                            </div>

                            {therapistStatus.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                                    <Inbox className="h-7 w-7 opacity-30" />
                                    <p className="text-sm font-sans">ยังไม่มีข้อมูลหมอนวด</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {therapistStatus.map((t) => {
                                        const cfg = THERAPIST_STATUS_CONFIG[t.status];
                                        return (
                                            <div
                                                key={t.employee_id}
                                                className={cn(
                                                    "rounded-xl border p-4 flex flex-col gap-2",
                                                    cfg.cardBg,
                                                    cfg.cardBorder
                                                )}
                                            >
                                                {/* Avatar + name */}
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="h-9 w-9 rounded-full bg-card/60 border border-border/30 flex items-center justify-center text-sm font-mitr text-foreground">
                                                            {t.name.charAt(0)}
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                                                                cfg.dotColor
                                                            )}
                                                        />
                                                    </div>
                                                    <p className="font-medium font-mitr text-foreground text-sm leading-tight flex-1 min-w-0 truncate">
                                                        {t.name}
                                                    </p>
                                                </div>

                                                {/* Status badge */}
                                                <span
                                                    className={cn(
                                                        "self-start text-xs px-2 py-0.5 rounded-full border font-medium font-sans",
                                                        cfg.badgeStyle
                                                    )}
                                                >
                                                    {cfg.label}
                                                </span>

                                                {/* Current service + end time */}
                                                {t.currentService && (
                                                    <div className="text-xs text-muted-foreground font-sans leading-relaxed">
                                                        <p className="text-foreground/80">{t.currentService}</p>
                                                        {t.serviceEndTime && (
                                                            <p className="flex items-center gap-1 mt-0.5">
                                                                <Clock className="h-3 w-3" />
                                                                เสร็จ {formatTimeTH(t.serviceEndTime)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>

                        {/* ── ③ Room Status Board ──────────────────────────────────── */}
                        <SectionCard
                            title="สถานะห้อง"
                            subtitle={`ว่าง ${roomCounts.available} · ใช้งานอยู่ ${roomCounts.occupied}`}
                            icon={DoorOpen}
                            iconColor="text-teal-500"
                            iconBg="bg-teal-500/10 border-teal-500/20"
                        >
                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {(
                                    [
                                        { status: "available", label: "ว่าง" },
                                        { status: "occupied", label: "ใช้งานอยู่" },
                                    ] as { status: RoomStatus; label: string }[]
                                ).map((s) => {
                                    const cfg = ROOM_STATUS_CONFIG[s.status];
                                    return (
                                        <div key={s.status} className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                                            <div className={cn("h-2 w-2 rounded-full", cfg.dotColor)} />
                                            {s.label}
                                        </div>
                                    );
                                })}
                            </div>

                            {roomStatus.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                                    <Inbox className="h-7 w-7 opacity-30" />
                                    <p className="text-sm font-sans">ยังไม่มีข้อมูลห้อง</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {roomStatus.map((r) => {
                                        const cfg = ROOM_STATUS_CONFIG[r.status];
                                        return (
                                            <div
                                                key={r.room_id}
                                                className={cn(
                                                    "rounded-xl border p-4 flex flex-col gap-2",
                                                    cfg.cardBg,
                                                    cfg.cardBorder
                                                )}
                                            >
                                                {/* Room icon + name */}
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="h-9 w-9 rounded-xl bg-card/60 border border-border/30 flex items-center justify-center">
                                                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                                                                cfg.dotColor
                                                            )}
                                                        />
                                                    </div>
                                                    <p className="font-medium font-mitr text-foreground text-sm leading-tight flex-1 min-w-0 truncate">
                                                        {r.name}
                                                    </p>
                                                </div>

                                                {/* Status badge */}
                                                <span
                                                    className={cn(
                                                        "self-start text-xs px-2 py-0.5 rounded-full border font-medium font-sans",
                                                        cfg.badgeStyle
                                                    )}
                                                >
                                                    {cfg.label}
                                                </span>

                                                {/* Booking info */}
                                                {r.currentService && (
                                                    <div className="text-xs text-muted-foreground font-sans leading-relaxed">
                                                        <p className="text-foreground/80">{r.currentService}</p>
                                                        {r.therapistName && (
                                                            <p className="flex items-center gap-1 mt-0.5">
                                                                <UserCheck className="h-3 w-3" />
                                                                {r.therapistName}
                                                            </p>
                                                        )}
                                                        {r.serviceEndTime && (
                                                            <p className="flex items-center gap-1 mt-0.5">
                                                                <Clock className="h-3 w-3" />
                                                                เสร็จ {formatTimeTH(r.serviceEndTime)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                )}
            </div>
        </main>
    );
}
