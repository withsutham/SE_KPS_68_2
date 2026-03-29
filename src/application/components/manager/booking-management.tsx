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
    DoorOpen,
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
    
    // --- Filters & Search ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [idSearch, setIdSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // --- Pagination ---
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
        // ID Search
        if (idSearch && b.booking_id.toString() !== idSearch.trim()) return false;

        // Text Search (Name, Phone, Email)
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            b.customer_name.toLowerCase().includes(search) || 
            b.customer_phone.includes(search) ||
            (b.customer_email?.toLowerCase().includes(search));
        
        if (!matchesSearch) return false;

        // Status Filter
        if (statusFilter !== "all" && b.payment_status !== statusFilter) return false;

        // Date Range
        const bookingDate = new Date(b.booking_dateTime);
        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            if (bookingDate < from) return false;
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            if (bookingDate > to) return false;
        }

        return true;
    });

    const totalFiltered = filteredBookings.length;
    const totalPages = Math.ceil(totalFiltered / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setIdSearch("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    return (
        <main className="relative flex-1 w-full font-mitr">
            {/* Background elements to match other pages */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
                <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
            </div>

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
                {/* Consistent Header Section */}
                <header className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                        <Calendar className="h-7 w-7 text-primary" />
                    </div>
                    <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">ผู้จัดการ · Manager</p>
                    <h1 className="text-3xl font-bold text-foreground md:text-4xl">จัดการการจอง</h1>
                    <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
                        ตรวจสอบ ติดตาม และจัดการรายการจองคิวของลูกค้าทั้งหมด
                    </p>
                    
                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" onClick={loadBookings} disabled={isLoading} className="h-11 rounded-full px-8 shadow-sm">
                            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                            รีเฟรชข้อมูล
                        </Button>
                    </div>
                </header>

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
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }} className="w-full md:w-auto">
                                    <TabsList className="bg-muted/50 p-1">
                                        <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                                        <TabsTrigger value="pending">รอตรวจสอบ</TabsTrigger>
                                        <TabsTrigger value="confirmed">ยืนยันแล้ว</TabsTrigger>
                                        <TabsTrigger value="completed">เสร็จสิ้น</TabsTrigger>
                                        <TabsTrigger value="cancelled">ยกเลิก</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-full md:w-72">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="ค้นหาชื่อหรือเบอร์โทร..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                            className="pl-9 h-10 bg-background/50"
                                        />
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className={cn("h-10 w-10 shrink-0", showAdvanced && "bg-primary/10 border-primary/30 text-primary")}
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                    {(searchTerm || statusFilter !== "all" || idSearch || dateFrom || dateTo) && (
                                        <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs font-sans h-10 px-3 hover:text-destructive">
                                            ล้างตัวกรอง
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {showAdvanced && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/40 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Booking ID</label>
                                        <Input 
                                            placeholder="ค้นหาตาม ID..." 
                                            value={idSearch}
                                            onChange={(e) => { setIdSearch(e.target.value); setCurrentPage(1); }}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">ตั้งแต่วันที่</label>
                                        <Input 
                                            type="date" 
                                            value={dateFrom}
                                            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">ถึงวันที่</label>
                                        <Input 
                                            type="date" 
                                            value={dateTo}
                                            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            )}
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
                                        {paginatedBookings.map((b) => {
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
                    {/* Pagination Footer */}
                    {!isLoading && totalFiltered > 0 && (
                        <div className="flex flex-col border-t border-border/60 bg-muted/20 px-6 py-4 md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground order-2 md:order-1">
                                <p className="font-sans">
                                    แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, totalFiltered)} จาก {totalFiltered} รายการ
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs whitespace-nowrap">แสดงหน้าละ:</span>
                                    <select 
                                        value={itemsPerPage} 
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="h-8 rounded-lg border border-border/40 bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    >
                                        {[10, 20, 50, 100].map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-center gap-1.5 order-1 md:order-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-xl transition-all"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                
                                <div className="flex items-center gap-1 px-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Show pages around current page
                                        let pageNum = i + 1;
                                        if (totalPages > 5) {
                                            if (currentPage > 3) pageNum = currentPage - 3 + i + 1;
                                            if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                                        }
                                        if (pageNum <= 0) pageNum = i + 1;
                                        if (pageNum > totalPages) return null;

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "h-9 w-9 rounded-xl font-sans text-xs font-bold transition-all",
                                                    currentPage === pageNum ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                                )}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 rounded-xl transition-all"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
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
