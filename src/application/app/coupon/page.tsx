"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, TicketPercent, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CouponPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [myCoupons, setMyCoupons] = useState<any[]>([]);
    const [isClaiming, setIsClaiming] = useState<string | null>(null);

    useEffect(() => {
        const checkUserAndFetchCoupons = async () => {
            const supabase = createClient();
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                router.push("/sign-in");
                return;
            }

            try {
                // Fetch customer ID
                const customerRes = await fetch(`/api/customer?profile_id=${session.user.id}`);
                const customerData = await customerRes.json();

                if (!customerData.success || !customerData.data) {
                    throw new Error("Could not fetch customer info");
                }

                const customer_id = customerData.data.customer_id;

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
                fetch('/api/coupon'),
                fetch(`/api/member_coupon?customer_id=${customer_id}`)
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
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Please sign in first");
                return;
            }

            const customerRes = await fetch(`/api/customer?profile_id=${session.user.id}`);
            const customerData = await customerRes.json();
            const customer_id = customerData.data?.customer_id;

            if (!customer_id) {
                toast.error("Customer record not found");
                return;
            }

            // check if already claimed
            const alreadyClaimed = myCoupons.find(mc => mc.coupon_id === coupon_id);
            if (alreadyClaimed) {
                toast.error("You have already claimed this coupon");
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
                    expire_datetime: null
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Coupon claimed successfully!");
                // Refresh list
                await fetchCoupons(customer_id);
            } else {
                toast.error(data.error || "Failed to claim coupon");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while claiming");
        } finally {
            setIsClaiming(null);
        }
    };

    return (
        <main className="min-h-screen bg-background font-mitr relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

            {isLoading ? (
                <div className="flex justify-center items-center py-20 min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 space-y-16">

                    <div className="flex flex-col items-center text-center mb-12 border-b border-border/50 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                            คูปองส่วนลด
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl font-light">
                            เก็บคูปองส่วนลดพิเศษเพื่อใช้เป็นส่วนลดในการจองบริการนวดของคุณ
                        </p>
                    </div>

                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <h2 className="text-2xl font-bold text-foreground">คูปองของฉัน</h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-full px-3">{myCoupons.length} รายการ</Badge>
                        </div>

                        {myCoupons.length === 0 ? (
                            <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <p className="text-lg text-muted-foreground">คุณยังไม่มีคูปองส่วนลด</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {myCoupons.map((mc, index) => {
                                    const coupon = mc.coupon;
                                    if (!coupon) return null;

                                    return (
                                        <Card key={`my-${mc.member_coupon_id}-${index}`} className={`border-primary/20 backdrop-blur-sm overflow-hidden relative flex flex-col transition-all hover:shadow-md ${mc.is_used ? 'bg-muted/30 opacity-70 grayscale' : 'bg-background/80'}`}>
                                            <div className="absolute top-4 right-4 z-10">
                                                {mc.is_used ? (
                                                    <Badge variant="secondary" className="text-xs">ใช้แล้ว</Badge>
                                                ) : (
                                                    <Badge variant="default" className="text-xs bg-primary/10 text-primary border-0 shadow-none">พร้อมใช้</Badge>
                                                )}
                                            </div>

                                            <CardContent className="p-0 flex items-center h-[120px]">
                                                <div className="w-1/3 bg-primary/5 flex flex-col items-center justify-center h-full relative">
                                                    <span className="text-2xl font-bold tracking-tighter text-primary">
                                                        {coupon.discount_percent}%
                                                    </span>
                                                    <div className="absolute -right-[1px] top-0 bottom-0 w-[2px] border-r-2 border-dashed border-border/70 z-10" />
                                                </div>
                                                <div className="w-2/3 p-5 flex flex-col justify-center">
                                                    <h3 className="font-semibold text-base line-clamp-1 mb-1">{coupon.coupon_name}</h3>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {coupon.description || "ใช้เป็นส่วนลดในการจองบริการ"}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className="pt-8 border-t border-border/40">
                        {(() => {
                            const uncollectedCoupons = coupons.filter(c => !myCoupons.some(mc => mc.coupon_id === c.coupon_id));

                            return (
                                <>
                                    <div className="flex items-center gap-3 mb-8">
                                        <h2 className="text-2xl font-bold text-foreground">คูปองทั้งหมดที่สามารถเก็บได้</h2>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-full px-3">{uncollectedCoupons.length} รายการ</Badge>
                                    </div>

                                    {uncollectedCoupons.length === 0 ? (
                                        <div className="bg-muted/30 border border-border/50 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                                            <TicketPercent className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                            <p className="text-lg text-muted-foreground">ไม่มีคูปองที่สามารถเก็บได้ในขณะนี้</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {uncollectedCoupons.map((coupon, index) => {
                                                return (
                                                    <Card key={`avail-${coupon.coupon_id}-${index}`} className="border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:border-primary/40 group">
                                                        <div className="flex aspect-[3/1] bg-primary/5 border-b border-primary/10 relative overflow-hidden items-center justify-center">
                                                            <div className="absolute -left-4 w-8 h-8 rounded-full bg-background border-r border-primary/10"></div>
                                                            <div className="absolute -right-4 w-8 h-8 rounded-full bg-background border-l border-primary/10"></div>
                                                            <TicketPercent className="h-12 w-12 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-3xl font-bold tracking-tighter text-primary">
                                                                    {coupon.discount_percent}%
                                                                </span>
                                                                <span className="text-xs font-medium uppercase tracking-widest text-primary/70">ส่วนลด</span>
                                                            </div>
                                                        </div>
                                                        <CardHeader className="pt-6">
                                                            <CardTitle className="text-xl font-medium line-clamp-1">{coupon.coupon_name}</CardTitle>
                                                            <CardDescription className="line-clamp-2 min-h-[40px] mt-2">
                                                                {coupon.description || "ใช้เป็นส่วนลดในการจองบริการ"}
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardFooter className="pt-2 pb-6 mt-auto">
                                                            <Button
                                                                className="w-full gap-2 relative overflow-hidden group/btn"
                                                                disabled={isClaiming === coupon.coupon_id.toString()}
                                                                onClick={() => handleClaimCoupon(coupon.coupon_id)}
                                                            >
                                                                {isClaiming === coupon.coupon_id.toString() ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    "เก็บคูปอง"
                                                                )}
                                                            </Button>
                                                        </CardFooter>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </section>
                </div>
            )}
        </main>
    );
}
