"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Calendar,
    Search,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    Eye,
    Trash2,
    AlertCircle,
    Check,
    CreditCard,
    Phone,
    Mail,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
    booking_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    booking_dateTime: string;
    total_price: number;
    payment_status: string;
    customer_id: number | null;
}

interface BookingDetail {
    booking_detail_id: number;
    massage_start_dateTime: string;
    massage_end_dateTime: string;
    price: number;
    massage: { massage_name: string };
    employee: { first_name: string; last_name: string } | null;
    room: { room_name: string } | null;
}

interface Payment {
    payment_id: number;
    payment_date: string;
    payment_method: string;
    payment_status: string;
    amount: number;
    payment_slip_url: string | null;
    payment_type: string;
}

interface FullBooking extends Booking {
    booking_detail: BookingDetail[];
    payment: Payment[];
    customer: any | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
    return `฿${Number(amount).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateTH(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "รอตรวจสอบ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    confirmed: { label: "ยืนยันแล้ว", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    completed: { label: "เสร็จสิ้น", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
    cancelled: { label: "ยกเลิก", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export function BookingManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<FullBooking | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/booking", { cache: "no-store" });
            const json = await res.json();
            if (json.success) {
                // Sort by date descending
                const sorted = (json.data || []).sort((a: Booking, b: Booking) => 
                    new Date(b.booking_dateTime).getTime() - new Date(a.booking_dateTime).getTime()
                );
                setBookings(sorted);
            } else {
                setErrorMessage(json.error || "Failed to load bookings");
            }
        } catch (err) {
            setErrorMessage("An error occurred while loading bookings");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const viewDetails = async (id: number) => {
        try {
            const res = await fetch(`/api/booking/${id}`);
            const json = await res.json();
            if (json.success) {
                setSelectedBooking(json.data);
                setIsDetailsOpen(true);
            }
        } catch (err) {
            console.error("Failed to load booking details:", err);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        setIsUpdating(true);
        setErrorMessage(null);
        try {
            const res = await fetch(`/api/booking/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_status: status }),
            });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage(`อัปเดตสถานะเป็น ${STATUS_CONFIG[status]?.label || status} สำเร็จ`);
                loadBookings();
                if (selectedBooking?.booking_id === id) {
                    setIsDetailsOpen(false);
                }
            } else {
                setErrorMessage(json.error || "Failed to update status");
            }
        } catch (err) {
            setErrorMessage("An error occurred while updating status");
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteBooking = async (id: number) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
        
        try {
            const res = await fetch(`/api/booking/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
                setSuccessMessage("ลบการจองสำเร็จ");
                loadBookings();
            } else {
                setErrorMessage(json.error || "Failed to delete booking");
            }
        } catch (err) {
            setErrorMessage("An error occurred while deleting booking");
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.customer_phone.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || b.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <main className="flex-1 font-mitr">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/5 backdrop-blur-sm">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.45),_transparent_35%)]" />
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/70">คอนโซลผู้จัดการ</p>
                            <h1 className="font-mitr text-3xl text-foreground md:text-4xl">จัดการการจอง</h1>
                            <p className="text-muted-foreground">ตรวจสอบ ติดตาม และจัดการรายการจองคิวของลูกค้าทั้งหมด</p>
                        </div>
                        <Button variant="outline" onClick={loadBookings} disabled={isLoading} className="w-full sm:w-auto">
                            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                            รีเฟรช
                        </Button>
                    </div>
                </section>

                {(errorMessage || successMessage) && (
                    <div
                        className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2",
                            errorMessage ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/20 bg-primary/10 text-foreground"
                        )}
                    >
                        {errorMessage ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
                        {errorMessage ?? successMessage}
                    </div>
                )}

                <Card className="border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
                    <CardHeader className="border-b border-border/60 bg-muted/30 p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                                <TabsList className="bg-muted/50 p-1">
                                    <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                                    <TabsTrigger value="pending">รอตรวจสอบ</TabsTrigger>
                                    <TabsTrigger value="confirmed">ยืนยันแล้ว</TabsTrigger>
                                    <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
                                    <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-primary/40" />
                            </div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Calendar className="h-12 w-12 opacity-20" />
                                <p>ไม่พบรายการจอง</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead className="bg-muted/20 text-muted-foreground font-medium border-b border-border/40">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">ลูกค้า</th>
                                            <th className="px-6 py-4">วันเวลา</th>
                                            <th className="px-6 py-4 text-right">ยอดรวม</th>
                                            <th className="px-6 py-4">สถานะ</th>
                                            <th className="px-6 py-4 text-right">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {filteredBookings.map((b) => {
                                            const config = STATUS_CONFIG[b.payment_status] || { label: b.payment_status, color: "bg-gray-100", icon: AlertCircle };
                                            return (
                                                <tr key={b.booking_id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{b.booking_id}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{b.customer_name}</span>
                                                            <span className="text-xs text-muted-foreground">{b.customer_phone}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span>{new Date(b.booking_dateTime).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: '2-digit' })}</span>
                                                            <span className="text-xs text-muted-foreground">{new Date(b.booking_dateTime).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} น.</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-semibold text-primary">{formatCurrency(b.total_price)}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={cn("font-normal", config.color)}>
                                                            <config.icon className="mr-1 h-3 w-3" />
                                                            {config.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => viewDetails(b.booking_id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => deleteBooking(b.booking_id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl font-mitr p-0 overflow-hidden border-none shadow-2xl">
                    {selectedBooking && (
                        <>
                            <DialogHeader className="p-6 bg-primary text-primary-foreground">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <DialogTitle className="text-2xl font-mitr">รายละเอียดการจอง #{selectedBooking.booking_id}</DialogTitle>
                                        <DialogDescription className="text-primary-foreground/80 font-mitr mt-1">
                                            ทำรายการเมื่อ {formatDateTH(selectedBooking.booking_dateTime)}
                                        </DialogDescription>
                                    </div>
                                    <Badge className={cn("text-base py-1 px-3", STATUS_CONFIG[selectedBooking.payment_status]?.color || "bg-white text-black")}>
                                        {STATUS_CONFIG[selectedBooking.payment_status]?.label}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="grid md:grid-cols-3 gap-0">
                                <div className="p-6 bg-muted/30 border-r border-border/40 space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ข้อมูลลูกค้า</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                                                <span className="font-medium">{selectedBooking.customer_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Phone className="h-4 w-4" /></div>
                                                <span>{selectedBooking.customer_phone}</span>
                                            </div>
                                            {selectedBooking.customer_email && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Mail className="h-4 w-4" /></div>
                                                    <span className="truncate">{selectedBooking.customer_email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">การชำระเงิน</h4>
                                        {selectedBooking.payment && selectedBooking.payment.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedBooking.payment.map(p => (
                                                    <div key={p.payment_id} className="p-3 rounded-xl bg-background border border-border/40 text-sm">
                                                        <div className="flex justify-between font-medium mb-1">
                                                            <span>{p.payment_type === 'deposit' ? 'เงินมัดจำ' : 'ยอดเต็ม'}</span>
                                                            <span className="text-primary">{formatCurrency(p.amount)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>{p.payment_method}</span>
                                                            <span className={p.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                                                                {p.payment_status === 'paid' ? 'ชำระแล้ว' : 'รอตรวจสอบ'}
                                                            </span>
                                                        </div>
                                                        {p.payment_slip_url && (
                                                            <a href={p.payment_slip_url} target="_blank" rel="noopener noreferrer" className="mt-2 block w-full text-center py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
                                                                ดูหลักฐานการโอน
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground italic"><AlertCircle className="h-4 w-4" /> ไม่มีข้อมูลการชำระเงิน</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-2 p-6 space-y-6 max-h-[500px] overflow-y-auto">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">รายการนวด</h4>
                                    <div className="space-y-4">
                                        {selectedBooking.booking_detail.map((detail, idx) => (
                                            <div key={detail.booking_detail_id} className="p-4 rounded-2xl bg-muted/20 border border-border/40 relative">
                                                <div className="absolute -left-2 top-4 h-8 w-1 bg-primary rounded-full" />
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="font-semibold text-lg">{detail.massage?.massage_name || "ไม่ระบุชื่อบริการ"}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(detail.massage_start_dateTime).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} - {new Date(detail.massage_end_dateTime).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' })} น.
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-primary">{formatCurrency(detail.price)}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm pt-3 border-t border-border/20">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">ผู้นวด: </span>
                                                        <span className="font-medium">{detail.employee ? `${detail.employee.first_name} ${detail.employee.last_name || ""}` : "ยังไม่ได้มอบหมาย"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">ห้อง: </span>
                                                        <span className="font-medium">{detail.room?.room_name || "ยังไม่ได้มอบหมาย"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-border/40">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-lg font-medium">ราคาสุทธิ</span>
                                            <span className="text-2xl font-bold text-primary">{formatCurrency(selectedBooking.total_price)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedBooking.payment_status === 'pending' && (
                                                <Button onClick={() => updateStatus(selectedBooking.booking_id, 'confirmed')} disabled={isUpdating} className="w-full h-11">
                                                    {isUpdating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                                    ยืนยันการจอง
                                                </Button>
                                            )}
                                            {selectedBooking.payment_status === 'confirmed' && (
                                                <Button onClick={() => updateStatus(selectedBooking.booking_id, 'completed')} disabled={isUpdating} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700">
                                                    {isUpdating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                                    เสร็จสิ้นบริการ
                                                </Button>
                                            )}
                                            <Button variant="outline" onClick={() => updateStatus(selectedBooking.booking_id, 'cancelled')} disabled={isUpdating || selectedBooking.payment_status === 'cancelled'} className="h-11">
                                                ยกเลิกการจอง
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </main>
    );
}

function DoorOpen(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M13 4h3a2 2 0 0 1 2 2v14" />
            <path d="M2 20h20" />
            <path d="M13 20V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16" />
            <path d="M9 12v.01" />
            <path d="M13 12h.01" />
        </svg>
    );
}
