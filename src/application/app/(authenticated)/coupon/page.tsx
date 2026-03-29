"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Ticket,
  History,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyCouponState } from "@/components/coupon/empty-coupon-state";
import { ActiveCouponCard } from "@/components/coupon/active-coupon-card";
import { AvailableCouponCard } from "@/components/coupon/available-coupon-card";
import { HistoryCouponList } from "@/components/coupon/history-coupon-list";

export default function CouponPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("my-coupons");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("9");
  const [sortBy, setSortBy] = useState("discount_desc");
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  // Reset page when rowsPerPage or sortBy changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, sortBy]);

  // Adjust default rows per page based on tab
  useEffect(() => {
    setCurrentPage(1);
    setRowsPerPage(activeTab === "history" ? "10" : "9");
  }, [activeTab]);

  // Normalize sort option when switching tabs
  useEffect(() => {
    if (
      activeTab === "my-coupons" &&
      (sortBy === "newest" || sortBy === "expiring_soon")
    ) {
      setSortBy("discount_desc");
    }
  }, [activeTab]);
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  useEffect(() => {
    const checkUserAndFetchCoupons = async () => {
      const supabase = createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/auth/login");
        return;
      }

      try {
        // Fetch customer ID
        const customerRes = await fetch(
          `/api/customer?profile_id=${session.user.id}`,
        );
        const customerData = await customerRes.json();

        if (!customerData.success || !customerData.data) {
          throw new Error("Could not fetch customer info");
        }

        const customer_id = Array.isArray(customerData.data)
          ? customerData.data[0]?.customer_id
          : customerData.data?.customer_id;

        if (!customer_id) {
          throw new Error("Customer ID not found");
        }

        await fetchCoupons(customer_id);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchCoupons();
  }, [router]);

  const fetchCoupons = async (customer_id: number) => {
    try {
      const [availableRes, myRes] = await Promise.all([
        fetch("/api/coupon"),
        fetch(`/api/member_coupon?customer_id=${customer_id}`),
      ]);

      const availableData = await availableRes.json();
      const myData = await myRes.json();

      if (availableData.success) {
        setCoupons(availableData.data || []);
      }
      if (myData.success) {
        setMyCoupons(myData.data || []);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleClaimCoupon = async (coupon_id: number) => {
    setIsClaiming(coupon_id.toString());
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        showAlert("Please sign in first", "error");
        return;
      }

      const customerRes = await fetch(
        `/api/customer?profile_id=${session.user.id}`,
      );
      const customerData = await customerRes.json();
      const customer_id = Array.isArray(customerData.data)
        ? customerData.data[0]?.customer_id
        : customerData.data?.customer_id;

      if (!customer_id) {
        showAlert("Customer record not found", "error");
        return;
      }

      // check if already claimed
      const alreadyClaimed = myCoupons.find((mc) => mc.coupon_id === coupon_id);
      if (alreadyClaimed) {
        showAlert(
          alreadyClaimed.is_used
            ? "คุณเคยเก็บและใช้คูปองนี้แล้ว"
            : "คุณมีคูปองนี้แล้ว",
          "error",
        );
        setIsClaiming(null);
        return;
      }

      const res = await fetch("/api/member_coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer_id,
          coupon_id: coupon_id,
          is_used: false,
          expire_dateTime: null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert("เก็บคูปองสำเร็จแล้ว!", "success");
        // Refresh list
        await fetchCoupons(customer_id);
      } else {
        showAlert(data.error || "Failed to claim coupon", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("An error occurred while claiming", "error");
    } finally {
      setIsClaiming(null);
    }
  };

  const activeCoupons = myCoupons.filter((mc) => !mc.is_used);
  const historyCoupons = myCoupons.filter((mc) => mc.is_used);
  const collectableCoupons = coupons.filter(
    (c) => !myCoupons.some((mc) => mc.coupon_id === c.coupon_id),
  );

  const sortCouponsList = (items: any[]) => {
    if (sortBy === "expiring_soon") {
      return [...items].sort((a, b) => {
        const getDeadline = (item: any) => {
          if (item.coupon && item.coupon.collect_deadline) {
            return new Date(item.coupon.collect_deadline).getTime();
          }
          if (item.collect_deadline) {
            return new Date(item.collect_deadline).getTime();
          }
          // If no deadline, put it at the end
          return Infinity;
        };
        return getDeadline(a) - getDeadline(b);
      });
    }

    if (sortBy === "newest") return items;
    
    return [...items].sort((a, b) => {
      const getDiscount = (item: any) => {
        if (item.coupon && typeof item.coupon.discount_percent !== "undefined") {
          return item.coupon.discount_percent;
        }
        return item.discount_percent || 0;
      };

      const discountA = getDiscount(a);
      const discountB = getDiscount(b);

      if (sortBy === "discount_desc") return discountB - discountA;
      if (sortBy === "discount_asc") return discountA - discountB;
      return 0;
    });
  };

  let currentList: any[] = [];
  if (activeTab === "my-coupons") {
    currentList = sortCouponsList(activeCoupons);
  } else if (activeTab === "discover") {
    currentList = sortCouponsList(collectableCoupons);
  } else if (activeTab === "history") {
    currentList = historyCoupons;
  }

  const totalItems = currentList.length;
  const itemsPerPageNum = rowsPerPage === "all" ? totalItems : parseInt(rowsPerPage, 10) || 9;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPageNum));
  const startIndex = (currentPage - 1) * itemsPerPageNum;
  const endIndex = rowsPerPage === "all" ? totalItems : Math.min(startIndex + itemsPerPageNum, totalItems);

  const paginatedList = currentList.slice(startIndex, endIndex);

  return (
    <main className="min-h-screen bg-background font-mitr relative overflow-hidden">
      {alertMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 p-4 px-6 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${alertMessage.type === "success" ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]" : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"}`}
        >
          {alertMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="font-medium font-sans">{alertMessage.message}</p>
        </div>
      )}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      {isLoading ? (
        <div className="flex justify-center items-center py-20 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 relative z-10 space-y-8">
          <div className="flex flex-col items-center text-center mb-8 border-b border-border/50 pb-8">
            <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
              ฟื้นใจ · Massage & Spa
            </p>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-3">
              คูปองส่วนลด
            </h1>
            <p className="text-muted-foreground font-sans max-w-lg">
              จัดการคูปองของคุณ
              หรือเก็บคูปองใหม่เพื่อใช้เป็นส่วนลดในการจองบริการ
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 h-12 rounded-xl bg-muted/40 p-1 font-sans overflow-visible">
              <TabsTrigger
                value="my-coupons"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full"
              >
                <Ticket className="h-4 w-4 hidden sm:block" />
                <span className="text-sm">ของฉัน</span>
                <span className={cn(
                  "ml-1.5 text-[10px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center font-bold transition-colors",
                  activeTab === "my-coupons" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {activeCoupons.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="discover"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full relative overflow-visible"
              >
                <PlusCircle className="h-4 w-4 hidden sm:block" />
                <span className="text-sm">เก็บเพิ่ม</span>
                {collectableCoupons.length > 0 && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] rounded-xl shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-300 font-bold hidden sm:block">
                    มี {collectableCoupons.length} คูปองใหม่
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                  </div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 h-full"
              >
                <History className="h-4 w-4 hidden sm:block" />
                <span className="text-sm">ประวัติ</span>
                <span className={cn(
                  "ml-1.5 text-[10px] h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center font-bold transition-colors",
                  activeTab === "history" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {historyCoupons.length}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Filter and Count Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border/40">
              <p className="text-sm text-muted-foreground font-sans">
                พบทั้งหมด <span className="font-semibold text-foreground">{totalItems}</span> คูปอง
              </p>
              
              {activeTab !== "history" && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-muted-foreground whitespace-nowrap font-sans">จัดเรียง:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-background font-sans h-9">
                      <SelectValue placeholder="จัดเรียงตาม" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTab === "discover" && (
                        <SelectItem value="expiring_soon" className="font-sans">ใกล้หมดวันเก็บ</SelectItem>
                      )}
                      <SelectItem value="discount_desc" className="font-sans">ส่วนลด (มากไปน้อย)</SelectItem>
                      <SelectItem value="discount_asc" className="font-sans">ส่วนลด (น้อยไปมาก)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <TabsContent
              value="my-coupons"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {activeCoupons.length === 0 ? (
                <EmptyCouponState
                  icon={<Ticket className="h-12 w-12" />}
                  message="คุณยังไม่มีคูปองที่พร้อมใช้งานในขณะนี้"
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedList.map(
                      (mc, index) =>
                        mc.coupon && (
                          <ActiveCouponCard
                            key={`active-${mc.member_coupon_id}-${index}`}
                            coupon={mc.coupon}
                          />
                        ),
                    )}
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

            <TabsContent
              value="discover"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {coupons.length === 0 ? (
                <EmptyCouponState
                  icon={<PlusCircle className="h-12 w-12" />}
                  message="ไม่มีคูปองใหม่ที่สามารถเก็บได้ในขณะนี้"
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedList.map((coupon, index) => {
                      const claimedRecord = myCoupons.find(
                        (mc) => mc.coupon_id === coupon.coupon_id,
                      );
                      return (
                        <AvailableCouponCard
                          key={`avail-${coupon.coupon_id}-${index}`}
                          coupon={coupon}
                          isClaimed={!!claimedRecord}
                          isUsed={!!claimedRecord?.is_used}
                          isClaiming={isClaiming === coupon.coupon_id.toString()}
                          onClaim={handleClaimCoupon}
                        />
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

            <TabsContent
              value="history"
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {historyCoupons.length === 0 ? (
                <EmptyCouponState
                  icon={<History className="h-12 w-12" />}
                  message="คุณยังไม่มีประวัติการใช้คูปอง"
                />
              ) : (
                <div className="space-y-6">
                  <HistoryCouponList coupons={paginatedList} />
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
        </div>
      )
      }
    </main >
  );
}
