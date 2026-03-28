import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Tag, Gift } from "lucide-react";
import Link from "next/link";

//─── Helper: Shuffle array and select a few items ─────────────────────────────────
function shuffleAndPick<T>(array: T[], count: number): T[] {
    if (!array || array.length === 0) {
        return [];
    }
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

//─── Main Component ───────────────────────────────────────────────────────────────
export async function PackagesAdvertisementSection() {

    const supabase = await createAdminClient();
    const today = new Date().toISOString();

    const { data: packages, error } = await supabase
        .from('package')
        .select(`
            package_id,
            package_name,
            package_price,
            image_src,
            package_detail (
                *,
                massage:massage_id (
                    massage_name
                )
            )
        `)
        .lte('campaign_start_datetime', today)
        .gte('campaign_end_datetime', today);

    if (error) {
        console.error("Error fetching packages:", error.message);
        return null; // Don't render the section if there's a DB error
    }

    const featuredPackages = shuffleAndPick(packages, 3);

    if (featuredPackages.length === 0) {
        return null; // Don't render if no packages are available
    }

    return (
        <section className="w-full max-w-7xl px-8 py-32 mx-auto flex flex-col gap-16">
            <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-mitr">แพ็กเกจสุดคุ้มสำหรับคุณ</h2>
                <p className="text-muted-foreground max-w-3xl text-xl font-light">
                    ซื้อล่วงหน้าในราคาพิเศษ พร้อมใช้บริการได้ทุกเมื่อ
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPackages.map((pkg) => {
                    const services = pkg.package_detail.map(detail => detail.massage?.massage_name).filter(Boolean);
                    return (
                        <Card
                            key={pkg.package_id}
                            className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 flex flex-col overflow-hidden"
                        >
                            <div className="relative w-full h-48 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                                {pkg.image_src ? (
                                    <Image
                                        src={pkg.image_src}
                                        alt={pkg.package_name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Gift className="h-12 w-12 text-primary/40" />
                                        <span className="text-sm">แพ็กเกจ</span>
                                    </div>
                                )}
                            </div>
                            <CardHeader className="pt-6">
                                <div className="flex items-center justify-between gap-4">
                                    <CardTitle className="text-xl font-medium line-clamp-2">{pkg.package_name}</CardTitle>
                                    <Badge variant="outline" className="rounded-full px-3.5 py-1 text-base font-bold border-primary/30 text-primary bg-primary/5 shrink-0">
                                        ฿{Number(pkg.package_price).toLocaleString()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 mt-auto">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        บริการในแพ็กเกจ:
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {services.map((name, i) => (
                                            <Badge key={i} variant="secondary" className="font-normal">{name}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <Button asChild className="w-full rounded-full mt-2 font-mitr gap-2">
                                    <Link href={`/package?tab=discover&packageId=${pkg.package_id}`}>
                                        ดูรายละเอียดและสั่งซื้อ <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {packages && packages.length > 3 && (
                <div className="flex justify-center mt-4">
                    <Button variant="ghost" asChild>
                        <Link href="/package" className="gap-2 font-mitr">
                            ดูแพ็กเกจทั้งหมด
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </section>
    );
}
