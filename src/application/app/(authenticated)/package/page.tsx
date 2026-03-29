"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, Calendar, CheckCircle2, Clock, Check, ShoppingCart, Tag, ExternalLink, AlertCircle, Package, PlusCircle, History, Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { PaymentDialog } from "@/components/package/payment-dialog";

function PackagePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [customerId, setCustomerId] = useState<number | null>(null);

    const [availablePackages, setAvailablePackages] = useState<any[]>([]);
    const [myPackages, setMyPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPackageToBuy, setSelectedPackageToBuy] = useState<any>(null);
    const [alertMessage, setAlertMessage] = useState<{
        message: string;
        type: "success" | "error";
    } | null>(null);
    const [activeTab, setActiveTab] = useState("my-packages");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState("9");

    // Adjust default rows per page based on tab and reset page
    useEffect(() => {
        setCurrentPage(1);
        setRowsPerPage(activeTab === "history" ? "10" : "9");
    }, [activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [rowsPerPage]);

    // Handle URL params for redirect flow
    useEffect(() => {
        if (isLoading) return;

        const tab = searchParams.get("tab");
        const packageId = searchParams.get("packageId");

        if (tab) {
            setActiveTab(tab);
        }

        if (packageId) {
            const pkg = availablePackages.find(p => p.package_id === Number(packageId));
            if (pkg) {
                setSelectedPackageToBuy(pkg);
            }
        }
    }, [searchParams, availablePackages, isLoading]);

    const showAlert = (message: string, type: "success" | "error") => {
        setAlertMessage({ message, type });
        setTimeout(() => setAlertMessage(null), 3000);
    };

    // Fetch customer ID on mount (auth is handled by layout)
    useEffect(() => {
        const fetchCustomerId = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                try {
                    const res = await fetch(`/api/customer?profile_id=${session.user.id}`);
                    if (res.ok) {
                        const { data } = await res.json();
                        if (data && data.length > 0) {
                            setCustomerId(data[0].customer_id);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch customer data:", error);
                }
            }
        };
        fetchCustomerId();
    }, []);

    useEffect(() => {
        if (customerId) {
            fetchPackages();
        }
    }, [customerId]);

    const fetchPackages = async () => {
        setIsLoading(true);

        try {
            // Fetch available packages via API
            const pkgsRes = await fetch('/api/package');
            if (pkgsRes.ok) {
                const pkgsJson = await pkgsRes.json();
                if (pkgsJson.success && pkgsJson.data) {
                    setAvailablePackages(pkgsJson.data);
                }
            }

            // Fetch my packages via API
            if (customerId) {
                const myPkgsRes = await fetch(`/api/member_package?member_id=${customerId}`);
                if (myPkgsRes.ok) {
                    const myPkgsJson = await myPkgsRes.json();
                    if (myPkgsJson.success && myPkgsJson.data) {
                        setMyPackages(myPkgsJson.data);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Using PaymentDialog instead of handleBuyPackage

    if (isLoading) {
        return (
            <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </main>
        );
    }

    // Group member packages by their actual package and order to display beautifully
    const groupedMyPackages: Record<string, { pkgInfo: any, details: any[] }> = {};
    myPackages.forEach(mp => {
        const pInfo = mp.package_detail?.package;
        if (pInfo) {
            // Use package_order_id if available to separate distinct purchases, otherwise fallback to package_id 
            // (Note: for old data without package_order_id from before the DB change, we fallback to grouping by package_id)
            const groupKey = mp.package_order_id
                ? `order_${mp.package_order_id}_pkg_${pInfo.package_id}`
                : `pkg_${pInfo.package_id}`;

            if (!groupedMyPackages[groupKey]) {
                groupedMyPackages[groupKey] = { pkgInfo: pInfo, details: [] };
            }
            groupedMyPackages[groupKey].details.push(mp);
        }
    });

    const activePackages = Object.values(groupedMyPackages).filter(v => v.details.some(d => !d.is_used));
    const historyPackages = myPackages
        .filter(mp => mp.is_used)
        .sort((a, b) => b.member_package_id - a.member_package_id); // Sort descending to show latest roughly first
    const filteredAvailable = availablePackages.filter(pkg => {
        const now = new Date();
        const start = pkg.campaign_start_datetime ? new Date(pkg.campaign_start_datetime) : null;
        const end = pkg.campaign_end_datetime ? new Date(pkg.campaign_end_datetime) : null;
        return (!start || start <= now) && (!end || end >= now);
    });

    let currentList: any[] = [];
    if (activeTab === "my-packages") {
        currentList = activePackages;
    } else if (activeTab === "discover") {
        currentList = filteredAvailable;
    } else if (activeTab === "history") {
        currentList = historyPackages;
    }

    const totalItems = currentList.length;
    const itemsPerPageNum = rowsPerPage === "all" ? totalItems : parseInt(rowsPerPage, 10) || 9;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPageNum));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPageNum;
    const endIndex = rowsPerPage === "all" ? totalItems : Math.min(startIndex + itemsPerPageNum, totalItems);

    const paginatedList = currentList.slice(startIndex, endIndex);

    return (
        <main className="min-h-screen bg-background font-mitr relative overflow-hidden">
            {alertMessage && (
                <div
                    className={`fixed bottom-8 right-8 z-50 p-4 px-6 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${alertMessage.type === "success" ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]" : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"}`}
                >
                    {alertMessage.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 relative top-[1px]" />
                    ) : (
                        <AlertCircle className="h-5 w-5 relative top-[1px]" />
                    )}
                    <p className="font-medium font-sans">{alertMessage.message}</p>
                </div>
            )}

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 relative z-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8 border-b border-border/50 pb-8">
                    <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
                        ฟื้นใจ · Massage & Spa
                    </p>
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-3">
                        แพ็กเกจและบริการ
                    </h1>
                    <p className="text-muted-foreground font-sans max-w-lg">
                        จัดการแพ็กเกจของคุณ
                        หรือซื้อแพ็กเกจใหม่การนวดและสปาเพื่อความผ่อนคลายอย่างเหนือระดับ
                    </p>
                </div>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-12 rounded-xl bg-muted/40 p-1 font-sans">
                        <TabsTrigger value="my-packages" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full">
                            <Package className="h-4 w-4" /> แพ็กเกจที่มี
                            <span className={cn(
                                "ml-1.5 text-[10px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center font-bold transition-colors",
                                activeTab === "my-packages" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {activePackages.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="discover" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full">
                            <PlusCircle className="h-4 w-4" /> ซื้อแพ็กเกจ
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full">
                            <History className="h-4 w-4" /> ประวัติ
                            <span className={cn(
                                "ml-1.5 text-[10px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center font-bold transition-colors",
                                activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {historyPackages.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Active Packages Tab */}
                    <TabsContent value="my-packages" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {activePackages.length === 0 ? (
                            <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="text-muted-foreground mb-4 opacity-50 flex items-center justify-center">
                                    <Package className="h-12 w-12" />
                                </div>
                                <p className="text-lg text-muted-foreground">คุณยังไม่มีแพ็กเกจที่พร้อมใช้งานในขณะนี้</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeTab === "my-packages" && paginatedList.map(({ pkgInfo, details }, index) => {
                                        const totalUsed = details.filter((d: any) => d.is_used).length;
                                        const totalServices = details.length;

                                    return (
                                        <Dialog key={`${pkgInfo.package_id}-${index}`}>
                                            <DialogTrigger asChild>
                                                <Card className="group/card relative border-border/50 bg-background hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col shadow-sm hover:shadow-md active:scale-[0.98]">
                                                    {/* Image section */}
                                                    <div className="relative h-40 w-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                                                        {pkgInfo.image_src ? (
                                                            <Image
                                                                src={pkgInfo.image_src}
                                                                alt={pkgInfo.package_name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                <Gift className="h-10 w-10 text-primary/40" />
                                                                <span className="text-xs">แพ็กเกจ</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <CardHeader className="pt-4 pb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover/card:bg-primary group-hover/card:text-white transition-colors">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                        </div>
                                                        <CardTitle className="text-xl font-medium mt-2 group-hover/card:text-primary transition-colors leading-relaxed">
                                                            {pkgInfo.package_name}
                                                        </CardTitle>
                                                    </CardHeader>

                                                    <CardContent className="flex-1 pb-6 pt-2">
                                                        <div className="mb-4">
                                                            <div className="flex justify-between items-end mb-1.5">
                                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">การใช้งาน</span>
                                                                <span className="text-sm font-bold text-primary">{totalUsed}/{totalServices} <span className="text-[10px] text-muted-foreground font-normal">บริการ</span></span>
                                                            </div>
                                                            <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                                                    style={{ width: `${(totalUsed / totalServices) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                                                                <Clock className="h-3.5 w-3.5 text-primary/70" />
                                                                <span>คงเหลือ {totalServices - totalUsed} บริการที่พร้อมให้คุณใช้งาน</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>

                                                    <CardFooter className="pt-0 pb-6">
                                                        <div className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 bg-primary/5 text-primary rounded-xl group-hover/card:bg-primary group-hover/card:text-white transition-all">
                                                            <span>ดูรายละเอียดและจองบริการ</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </DialogTrigger>

                                            <DialogContent className="sm:max-w-md font-mitr">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-medium text-primary flex items-center gap-2">
                                                        <CheckCircle2 className="h-6 w-6" /> {pkgInfo.package_name}
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <div className="mt-4 space-y-4">
                                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                        <h4 className="text-sm font-semibold mb-2">สรุปการใช้งาน</h4>
                                                        <div className="flex items-center mb-1">
                                                            <span className="text-sm font-medium text-foreground/80">ใช้ไปแล้ว {totalUsed} บริการจาก {totalServices} บริการ</span>
                                                        </div>
                                                        <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500"
                                                                style={{ width: `${(totalUsed / totalServices) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold flex items-center gap-1">
                                                            <Tag className="h-4 w-4 text-primary" /> เลือกบริการที่ต้องการจอง
                                                        </h4>
                                                        <div className="grid gap-3">
                                                            {details.map((mp: any, i: number) => {
                                                                const massage = mp.package_detail?.massage;
                                                                return (
                                                                    <div key={mp.member_package_id || i} className={`p-3 rounded-lg border ${mp.is_used ? 'bg-muted/30 border-border/50 text-muted-foreground' : 'bg-background border-primary/20 hover:border-primary/50 transition-colors'}`}>
                                                                        <div className="flex justify-between items-center">
                                                                            <div className="flex flex-col">
                                                                                <span className={`font-medium ${mp.is_used ? 'line-through' : ''}`}>
                                                                                    {massage?.massage_name || "บริการ"}
                                                                                </span>
                                                                                <span className="text-[10px] flex items-center gap-1 opacity-70">
                                                                                    <Clock className="h-3 w-3" /> {massage?.massage_time || 60} นาที
                                                                                </span>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant={mp.is_used ? "secondary" : "default"}
                                                                                className="h-8 gap-1"
                                                                                disabled={mp.is_used || !massage?.massage_id}
                                                                                onClick={() => {
                                                                                    if (massage?.massage_id) {
                                                                                        router.push(`/booking?packageServiceId=${mp.member_package_id}&massageId=${massage.massage_id}`);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {mp.is_used ? "ใช้แล้ว" : "จองทันที"}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    );
                                })}
                                </div>
                                {totalItems > 0 && (
                                    <div className="mt-8 rounded-xl overflow-hidden border border-border/40">
                                        <DataTablePagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            showingFrom={startIndex + 1}
                                            showingTo={endIndex}
                                            rowsPerPage={rowsPerPage}
                                            onPageChange={setCurrentPage}
                                            onRowsPerPageChange={(value) => {
                                                setRowsPerPage(value);
                                                setCurrentPage(1);
                                            }}
                                            pageOptions={["9", "18", "27", "all"]}
                                            labels={{
                                                showing: "แสดง",
                                                of: "จาก",
                                                items: "รายการ",
                                                rowsPerPage: "จำนวนต่อหน้า:",
                                                all: "ทั้งหมด"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* Discover Packages Tab */}
                    <TabsContent value="discover" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {filteredAvailable.length === 0 ? (
                            <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="text-muted-foreground mb-4 opacity-50 flex items-center justify-center">
                                    <PlusCircle className="h-12 w-12" />
                                </div>
                                <p className="text-lg text-muted-foreground">ไม่มีแพ็กเกจที่เปิดขายในขณะนี้</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeTab === "discover" && paginatedList.map((pkg) => {
                                        const endStr = pkg.campaign_end_datetime
                                        ? new Date(pkg.campaign_end_datetime).toLocaleDateString("th-TH") : "";
                                    const originalPrice = pkg.package_detail?.reduce((sum: number, detail: any) => sum + (Number(detail.massage?.massage_price) || 0), 0) || 0;

                                    return (
                                        <Card key={pkg.package_id} className="flex flex-col group overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-lg dark:hover:shadow-primary/5 bg-background">
                                            {/* Image section */}
                                            <div className="relative h-44 w-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                                                {pkg.image_src ? (
                                                    <Image
                                                        src={pkg.image_src}
                                                        alt={pkg.package_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Gift className="h-10 w-10 text-primary/40" />
                                                        <span className="text-xs">แพ็กเกจ</span>
                                                    </div>
                                                )}
                                            </div>

                                            <CardHeader className="pb-4 relative pt-5">
                                                <CardTitle className="text-xl font-medium leading-tight">
                                                    {pkg.package_name}
                                                </CardTitle>
                                                {endStr && (
                                                    <CardDescription className="flex items-center gap-1 mt-2 text-xs">
                                                        <Calendar className="h-3 w-3" /> ขายถึง {endStr}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent className="flex-1 pb-6">
                                                <div className="mb-4 flex items-end gap-2">
                                                    <span className="text-3xl font-bold font-sans tracking-tight text-primary">฿{Number(pkg.package_price).toLocaleString()}</span>
                                                    {originalPrice > Number(pkg.package_price) && (
                                                        <span className="text-sm font-sans text-muted-foreground line-through mb-1">
                                                            ฿{originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="font-medium text-sm mb-3 text-foreground/80">รับสิทธิบริการ:</p>
                                                <ul className="space-y-2">
                                                    {pkg.package_detail?.map((detail: any) => (
                                                        <li key={detail.package_detail_id} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                            <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                                                            <span>{detail.massage?.massage_name || "บริการนวดสปา"}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button
                                                    className="w-full gap-2 transition-all shadow-md group-hover:shadow-lg"
                                                    size="lg"
                                                    onClick={() => setSelectedPackageToBuy(pkg)}
                                                >
                                                    ซื้อแพ็กเกจนี้
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                                </div>
                                {totalItems > 0 && (
                                    <div className="mt-8 rounded-xl overflow-hidden border border-border/40">
                                        <DataTablePagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            showingFrom={startIndex + 1}
                                            showingTo={endIndex}
                                            rowsPerPage={rowsPerPage}
                                            onPageChange={setCurrentPage}
                                            onRowsPerPageChange={(value) => {
                                                setRowsPerPage(value);
                                                setCurrentPage(1);
                                            }}
                                            pageOptions={["9", "18", "27", "all"]}
                                            labels={{
                                                showing: "แสดง",
                                                of: "จาก",
                                                items: "รายการ",
                                                rowsPerPage: "จำนวนต่อหน้า:",
                                                all: "ทั้งหมด"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {historyPackages.length === 0 ? (
                            <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <div className="text-muted-foreground mb-4 opacity-50 flex items-center justify-center">
                                    <History className="h-12 w-12" />
                                </div>
                                <p className="text-lg text-muted-foreground">คุณยังไม่มีประวัติการใช้บริการจากแพ็กเกจ</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-3">
                                    {activeTab === "history" && paginatedList.map((mp: any, index: number) => {
                                        const pInfo = mp.package_detail?.package;
                                        const massage = mp.package_detail?.massage;

                                        return (
                                            <div
                                                key={`history-${mp.member_package_id || index}`}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/40 bg-muted/20 opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0 gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0 border border-primary/10 text-primary">
                                                        <CheckCircle2 className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-foreground">{massage?.massage_name || "บริการนวด"}</span>
                                                        <span className="text-xs text-muted-foreground mt-0.5">จากแพ็กเกจ: {pInfo?.package_name || "ไม่ระบุ"}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                                    <Badge variant="secondary" className="text-[10px] font-normal px-2 py-0 h-5 w-fit">
                                                        ใช้แล้ว
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {massage?.massage_time || 60} นาที
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {totalItems > 0 && (
                                    <div className="mt-8 rounded-xl overflow-hidden border border-border/40">
                                        <DataTablePagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            showingFrom={startIndex + 1}
                                            showingTo={endIndex}
                                            rowsPerPage={rowsPerPage}
                                            onPageChange={setCurrentPage}
                                            onRowsPerPageChange={(value) => {
                                                setRowsPerPage(value);
                                                setCurrentPage(1);
                                            }}
                                            pageOptions={["10", "20", "30", "all"]}
                                            labels={{
                                                showing: "แสดง",
                                                of: "จาก",
                                                items: "รายการ",
                                                rowsPerPage: "จำนวนต่อหน้า:",
                                                all: "ทั้งหมด"
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Include Payment Dialog */}
                <PaymentDialog
                    open={!!selectedPackageToBuy}
                    onClose={() => setSelectedPackageToBuy(null)}
                    pkg={selectedPackageToBuy}
                    customerId={customerId}
                    onSuccess={() => {
                        setSelectedPackageToBuy(null);
                        fetchPackages();
                        showAlert('ซื้อแพ็กเกจสำเร็จ', 'success');
                    }}
                />

            </div>
        </main>
    );
}

export default function PackagePage() {
    return (
        <Suspense fallback={
            <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </main>
        }>
            <PackagePageContent />
        </Suspense>
    );
}
