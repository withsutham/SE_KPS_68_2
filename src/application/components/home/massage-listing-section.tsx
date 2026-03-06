"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Leaf, Clock, Search, Loader2, ImageOff } from "lucide-react";
import Image from "next/image";

interface Massage {
    massage_id: number;
    massage_name: string;
    massage_price: number;
    massage_time: number | null;
    image_src: string | null;
}

export function MassageListingSection() {
    const [massages, setMassages] = useState<Massage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchMassages() {
            try {
                const res = await fetch("/api/massage");
                const json = await res.json();
                if (!json.success) throw new Error(json.error);
                setMassages(json.data);
            } catch (e: any) {
                setError(e.message ?? "ไม่สามารถโหลดข้อมูลได้");
            } finally {
                setLoading(false);
            }
        }
        fetchMassages();
    }, []);

    const filtered = massages.filter((m) =>
        m.massage_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className="w-full max-w-7xl px-8 py-32 mx-auto flex flex-col gap-16">
            {/* Section Header */}
            <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-mitr">
                    บริการนวดของเรา
                </h2>
                <p className="text-muted-foreground max-w-3xl text-xl font-light">
                    เลือกสรรบริการที่ตรงกับความต้องการของคุณ ครบครันทุกเทคนิค ทั้งแบบไทยโบราณและสากล
                </p>

                {/* Search Bar */}
                <div className="relative w-full max-w-md mt-2">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        id="massage-search"
                        type="text"
                        placeholder="ค้นหาบริการนวด..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 rounded-full border-border/50 bg-card/60 backdrop-blur-sm focus-visible:ring-primary/40"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg font-light">กำลังโหลดข้อมูลบริการ...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex items-center justify-center py-24 text-destructive text-center">
                    <p>{error}</p>
                </div>
            )}

            {/* Empty State (after search) */}
            {!loading && !error && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                    <Search className="h-10 w-10 opacity-30" />
                    <p className="text-lg font-light">ไม่พบบริการที่ตรงกับ &ldquo;{search}&rdquo;</p>
                </div>
            )}

            {/* Massage Cards Grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((massage) => (
                        <Card
                            key={massage.massage_id}
                            className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden flex flex-col"
                        >
                            {/* Image Area */}
                            <div className="relative h-44 w-full bg-muted/40 overflow-hidden">
                                {massage.image_src ? (
                                    <Image
                                        src={massage.image_src}
                                        alt={massage.massage_name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                            <Leaf className="h-7 w-7 text-primary/70" />
                                        </div>
                                    </div>
                                )}
                                {/* Image fallback overlay */}
                                {!massage.image_src && (
                                    <ImageOff className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/30" />
                                )}
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-medium leading-snug">
                                    {massage.massage_name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex flex-col gap-3 mt-auto">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Price Badge */}
                                    <Badge
                                        variant="outline"
                                        className="rounded-full px-3 py-1 text-sm font-medium border-primary/30 text-primary bg-primary/5"
                                    >
                                        ฿{massage.massage_price.toLocaleString("th-TH", { minimumFractionDigits: 0 })}
                                    </Badge>

                                    {/* Duration Badge */}
                                    {massage.massage_time != null && (
                                        <Badge
                                            variant="outline"
                                            className="rounded-full px-3 py-1 text-sm font-light border-border/40 text-muted-foreground flex items-center gap-1"
                                        >
                                            <Clock className="h-3 w-3" />
                                            {massage.massage_time} นาที
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
