"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calendar, CheckCircle2, Clock, Check, ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PackagePage() {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [customerId, setCustomerId] = useState<number | null>(null);

    const [availablePackages, setAvailablePackages] = useState<any[]>([]);
    const [myPackages, setMyPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [buyingPackageId, setBuyingPackageId] = useState<number | null>(null);

    // Check auth and fetch user ID
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                const currentPath = window.location.pathname + window.location.search;
                window.location.href = `/auth/login?returnTo=${encodeURIComponent(currentPath)}&message=package`;
            } else {
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
                setIsAuthenticating(false);
            }
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (!isAuthenticating && customerId) {
            fetchPackages();
        }
    }, [isAuthenticating, customerId]);

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

    const handleBuyPackage = async (pkg: any) => {
        if (!customerId) return;
        setBuyingPackageId(pkg.package_id);

        try {
            // For each package_detail, create a member_package
            const details = pkg.package_detail;
            const expireDate = new Date();
            expireDate.setMonth(expireDate.getMonth() + 6); // Set valid for 6 months

            const insertPromises = details.map((d: any) => fetch('/api/member_package', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    member_id: customerId,
                    package_detail_id: d.package_detail_id,
                    is_used: false,
                    expire_datetime: expireDate.toISOString()
                })
            }));

            const results = await Promise.all(insertPromises);
            const hasError = results.some(r => !r.ok);

            if (!hasError) {
                // Refresh packages
                await fetchPackages();
                // Give time for user to see they bought it
                alert("Package purchased successfully!");
            } else {
                alert("Failed to purchase package");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to purchase package");
        } finally {
            setBuyingPackageId(null);
        }
    };

    if (isAuthenticating || isLoading) {
        return (
            <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </main>
        );
    }

    // Group member packages by their actual package to display beautifully
    const groupedMyPackages: Record<number, { pkgInfo: any, details: any[] }> = {};
    myPackages.forEach(mp => {
        const pInfo = mp.package_detail?.package;
        if (pInfo) {
            if (!groupedMyPackages[pInfo.package_id]) {
                groupedMyPackages[pInfo.package_id] = { pkgInfo: pInfo, details: [] };
            }
            groupedMyPackages[pInfo.package_id].details.push(mp);
        }
    });

    return (
        <main className="flex-1 w-full">
            {/* Background motif */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/30 blur-3xl" />
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-24 font-mitr">
                {/* Header */}
                <div className="mb-10 text-center">
                    <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
                        Massage & Spa
                    </p>
                    <h1 className="text-3xl md:text-4xl font-medium text-foreground">
                        บริการแพคเกจ
                    </h1>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                        เลือกซื้อแพคเกจการนวดและสปาที่คุ้มค่ากว่า เพื่อความผ่อนคลายอย่างเหนือระดับ
                    </p>
                </div>

                {/* My Packages Section */}
                {Object.keys(groupedMyPackages).length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl mb-6 font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-primary" /> แพคเกจที่ฉันมี
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.values(groupedMyPackages).map(({ pkgInfo, details }, index) => {
                                const totalUsed = details.filter(d => d.is_used).length;
                                const totalServices = details.length;
                                const expireStr = details[0]?.expire_datetime
                                    ? new Date(details[0].expire_datetime).toLocaleDateString("th-TH") : "-";

                                return (
                                    <Card key={`${pkgInfo.package_id}-${index}`} className="border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                                        <div className="h-1 bg-gradient-to-r from-primary to-secondary w-full" />
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg font-medium">{pkgInfo.package_name}</CardTitle>
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                    {totalUsed === totalServices ? "ใช้หมดแล้ว" : "พร้อมใช้งาน"}
                                                </Badge>
                                            </div>
                                            <CardDescription className="flex items-center gap-1 mt-2 text-xs">
                                                <Clock className="h-3 w-3" /> หมดอายุ {expireStr}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-4">
                                            <p className="font-semibold text-sm mb-3">บริการในแพคเกจ:</p>
                                            <ul className="space-y-2">
                                                {details.map((mp, i) => {
                                                    const massage = mp.package_detail?.massage;
                                                    return (
                                                        <li key={mp.member_package_id || i} className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0">
                                                            <span className="flex items-center gap-2">
                                                                <span className={`h-1.5 w-1.5 rounded-full ${mp.is_used ? 'bg-muted-foreground' : 'bg-primary'}`}></span>
                                                                <span className={mp.is_used ? 'text-muted-foreground line-through' : ''}>
                                                                    {massage?.massage_name || "บริการ"}
                                                                </span>
                                                            </span>
                                                            {mp.is_used ? (
                                                                <Badge variant="secondary" className="text-[10px] h-5">ใช้แล้ว</Badge>
                                                            ) : (
                                                                <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-0">รอใช้งาน</Badge>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </CardContent>
                                        <CardFooter className="pt-0 justify-between text-xs text-muted-foreground">
                                            <span>ใช้ไปแล้ว {totalUsed}/{totalServices} บริการ</span>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* All Available Packages Section */}
                <section>
                    <h2 className="text-2xl mb-6 font-medium flex items-center gap-2">
                        <Tag className="h-6 w-6 text-primary" /> แพคเกจที่เปิดขาย
                    </h2>
                    {availablePackages.length === 0 ? (
                        <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                            <p className="text-muted-foreground">ไม่มีแพคเกจที่เปิดขายในขณะนี้</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availablePackages.map((pkg) => {
                                const isBuying = buyingPackageId === pkg.package_id;
                                const endStr = pkg.campaign_end_datetime
                                    ? new Date(pkg.campaign_end_datetime).toLocaleDateString("th-TH") : "";

                                return (
                                    <Card key={pkg.package_id} className="flex flex-col group overflow-hidden border-border/60 hover:border-primary/40 transition-all hover:shadow-lg dark:hover:shadow-primary/5 bg-background">
                                        <CardHeader className="pb-4 relative pt-7">
                                            <div className="absolute top-4 right-4 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <ShoppingCart className="h-5 w-5 text-primary" />
                                            </div>
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
                                            <div className="mb-4">
                                                <span className="text-3xl font-bold font-sans tracking-tight text-primary">฿{Number(pkg.package_price).toLocaleString()}</span>
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
                                                onClick={() => handleBuyPackage(pkg)}
                                                disabled={isBuying || !!buyingPackageId}
                                            >
                                                {isBuying ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        กำลังดำเนินการ...
                                                    </>
                                                ) : (
                                                    "ซื้อแพคเกจนี้"
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}
