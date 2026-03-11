"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Calendar,
    Clock,
    CreditCard,
    Flower2,
    Loader2,
    User,
    Phone,
    Mail,
    Sparkles,
    ChevronRight,
    Banknote,
    QrCode,
    Building2,
    CheckCircle2,
    XCircle,
    Timer,
    Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BookingDetail {
    booking_detail_id: number;
    massage_start_dateTime: string;
    massage_end_dateTime: string;
    price: number;
    massage_id: number;
    massage: { massage_name: string; massage_time: number; massage_price: number } | null;
    employee: { first_name: string; last_name: string } | null;
    room: { room_name: string } | null;
}

interface Payment {
    payment_id: number;
    payment_method: string;
    payment_status: string;
    amount: number;
    payment_date: string;
}

interface Booking {
    booking_id: number;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    booking_dateTime: string;
    is_coupon_use: boolean;
    payment: Payment[];
    booking_detail: BookingDetail[];
}

type TabKey = "upcoming" | "completed" | "all";

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getBookingStatus(booking: Booking): "upcoming" | "completed" | "cancelled" {
    const now = new Date();
    const paymentStatus = booking.payment?.[0]?.payment_status;

    if (paymentStatus === "cancelled") return "cancelled";

    // Find the end time of the last service in this booking
    const details = booking.booking_detail ?? [];
    if (details.length > 0) {
        const latestEnd = details.reduce((latest, d) => {
            const end = new Date(d.massage_end_dateTime);
            return end > latest ? end : latest;
        }, new Date(0));

        return latestEnd > now ? "upcoming" : "completed";
    }

    // Fallback: use booking start time if no details
    const bookingDate = new Date(booking.booking_dateTime);
    return bookingDate > now ? "upcoming" : "completed";
}

const STATUS_CONFIG = {
    upcoming: {
        label: "กำลังจะมาถึง",
        color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: Timer,
    },
    completed: {
        label: "เสร็จสิ้น",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        icon: CheckCircle2,
    },
    cancelled: {
        label: "ยกเลิก",
        color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        icon: XCircle,
    },
};

const PAYMENT_ICON: Record<string, React.ElementType> = {
    cash: Banknote,
    qr: QrCode,
    credit: CreditCard,
};

const PAYMENT_LABEL: Record<string, string> = {
    cash: "ชำระเงินสด",
    qr: "QR PromptPay",
    credit: "บัตรเครดิต/เดบิต",
};

const MONTHS_TH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatDateTH(iso: string) {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function formatTimeTH(iso: string) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} น.`;
}

// ─── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onClick }: { booking: Booking; onClick: () => void }) {
    const status = getBookingStatus(booking);
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    const payment = booking.payment?.[0];
    const services = booking.booking_detail ?? [];
    const totalTime = services.reduce((sum, d) => sum + (d.massage?.massage_time ?? 60), 0);

    return (
        <button
            onClick={onClick}
            className="w-full text-left group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl hover:border-primary/30 hover:bg-card/80 hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
        >
            {/* Date badge */}
            <div className="shrink-0 flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                <span className="text-2xl font-bold font-mitr leading-none">{new Date(booking.booking_dateTime).getDate()}</span>
                <span className="text-xs font-medium">{MONTHS_TH[new Date(booking.booking_dateTime).getMonth()]}</span>
                <span className="text-[10px] text-primary/60">{new Date(booking.booking_dateTime).getFullYear() + 543}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-medium font-mitr text-foreground text-sm line-clamp-1">
                        {services.length > 0
                            ? services.map(d => d.massage?.massage_name ?? "นวด").join(", ")
                            : "รายการจอง"}
                    </span>
                    {status !== "completed" && (
                        <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium", cfg.color)}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeTH(booking.booking_dateTime)} · {totalTime} นาที
                    </span>
                    {payment && (
                        <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {PAYMENT_LABEL[payment.payment_method] ?? payment.payment_method}
                        </span>
                    )}
                </div>
            </div>

            {/* Price + Arrow */}
            <div className="flex items-center gap-3 shrink-0">
                {payment && (
                    <span className="font-semibold text-primary font-mitr">
                        ฿{Number(payment.amount).toLocaleString()}
                    </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
        </button>
    );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function BookingDetailModal({ booking, open, onClose }: { booking: Booking | null; open: boolean; onClose: () => void }) {
    if (!booking) return null;

    const status = getBookingStatus(booking);
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    const payment = booking.payment?.[0];
    const PayIcon = PAYMENT_ICON[payment?.payment_method ?? "cash"] ?? CreditCard;

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30">
                    <div className="flex items-start gap-2">
                        <div>
                            <DialogTitle className="font-mitr text-lg leading-snug text-foreground">
                                รายละเอียดการจอง
                                <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ml-2 align-middle", cfg.color)}>
                                    <Icon className="h-3 w-3" />
                                    {cfg.label}
                                </span>
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground font-sans mt-1">เลขที่จอง: <span className="font-mono text-foreground">#{booking.booking_id}</span></p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 flex flex-col gap-5">
                    {/* Booking date/time */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <Calendar className="h-5 w-5 text-primary shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground font-sans">วันและเวลา</p>
                            <p className="font-medium font-mitr">{formatDateTH(booking.booking_dateTime)} เวลา {formatTimeTH(booking.booking_dateTime)}</p>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-sans">บริการที่จอง</h4>
                        <div className="flex flex-col gap-3">
                            {booking.booking_detail?.length > 0 ? (
                                booking.booking_detail.map((detail, idx) => (
                                    <div key={detail.booking_detail_id} className="flex gap-3 p-4 rounded-xl border border-border/40 bg-card/40">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium font-mitr text-sm">{detail.massage?.massage_name ?? `บริการที่ ${idx + 1}`}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimeTH(detail.massage_start_dateTime)} – {formatTimeTH(detail.massage_end_dateTime)}
                                                </span>
                                                <span className="text-xs font-medium text-primary">฿{Number(detail.price).toLocaleString()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {detail.employee && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <User className="h-3 w-3 shrink-0" />
                                                        <span>{detail.employee.first_name} {detail.employee.last_name}</span>
                                                    </div>
                                                )}
                                                {detail.room && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Building2 className="h-3 w-3 shrink-0" />
                                                        <span>{detail.room.room_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground font-sans italic">ไม่มีข้อมูลบริการ</p>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-sans">ข้อมูลผู้จอง</h4>
                        <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/40 bg-card/40">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="font-medium">{booking.customer_name}</span>
                            </div>
                            {booking.customer_phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>{booking.customer_phone}</span>
                                </div>
                            )}
                            {booking.customer_email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>{booking.customer_email}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment */}
                    {payment && (
                        <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 font-sans">การชำระเงิน</h4>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/40">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <PayIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{PAYMENT_LABEL[payment.payment_method] ?? payment.payment_method}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{payment.payment_status}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-primary font-mitr text-lg">฿{Number(payment.amount).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string }[] = [
    { key: "upcoming", label: "กำลังจะมาถึง" },
    { key: "completed", label: "ประวัติ" },
    { key: "all", label: "ทั้งหมด" },
];

export default function BookingHistoryPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabKey>("upcoming");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/auth/login?returnTo=/booking/history&message=booking`);
                return;
            }

            try {
                const res = await fetch("/api/booking/history");
                if (!res.ok) throw new Error("Fetch failed");
                const json = await res.json();
                setBookings(json.data ?? []);
            } catch {
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const filtered = bookings.filter(b => {
        const status = getBookingStatus(b);
        if (tab === "upcoming") return status === "upcoming";
        if (tab === "completed") return status === "completed" || status === "cancelled";
        return true;
    });

    const tabCount = (key: TabKey) => {
        if (key === "upcoming") return bookings.filter(b => getBookingStatus(b) === "upcoming").length;
        if (key === "completed") return bookings.filter(b => getBookingStatus(b) !== "upcoming").length;
        return bookings.length;
    };

    return (
        <main className="flex-1 w-full">
            {/* Background motifs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 -left-60 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />
            </div>

            <div className="w-full max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-24">
                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
                        ฟื้นใจ · Massage & Spa
                    </p>
                    <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">ประวัติการจอง</h1>
                    <p className="text-muted-foreground mt-2 font-sans text-sm">รายการจองบริการทั้งหมดของคุณ</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center bg-muted/40 rounded-full p-1 border border-border/30 mb-6">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium transition-all duration-200 font-sans",
                                tab === t.key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t.label}
                            {!loading && (
                                <span className={cn(
                                    "text-xs h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center font-medium",
                                    tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {tabCount(t.key)}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm font-sans">กำลังโหลด...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center">
                            <Inbox className="h-8 w-8 opacity-30" />
                        </div>
                        <p className="font-mitr text-base">ไม่มีรายการจอง</p>
                        <p className="text-sm font-sans opacity-70">
                            {tab === "upcoming" ? "คุณยังไม่มีการจองที่กำลังจะมาถึง" : "ยังไม่มีประวัติการจอง"}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-2 rounded-full font-mitr"
                            onClick={() => router.push("/booking")}
                        >
                            จองบริการเลย
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(b => (
                            <BookingCard
                                key={b.booking_id}
                                booking={b}
                                onClick={() => setSelectedBooking(b)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <BookingDetailModal
                booking={selectedBooking}
                open={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
            />
        </main>
    );
}
