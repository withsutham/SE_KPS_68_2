import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Droplets, Leaf } from "lucide-react";

export function ServicesSection() {
    return (
        <section className="w-full max-w-7xl px-8 py-32 mx-auto flex flex-col gap-16">
            <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start">
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight font-mitr">ทรีทเมนท์ที่เราคัดสรรเพื่อคุณ</h2>
                <p className="text-muted-foreground max-w-3xl text-xl font-light">
                    พบกับทรีทเมนท์ที่ได้รับการออกแบบเป็นพิเศษเพื่อประสานร่างกายและจิตวิญญาณของคุณให้เป็นหนึ่งเดียว
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Service 1 */}
                <Card className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                            <Leaf className="h-6 w-6 text-primary/80" />
                        </div>
                        <CardTitle className="text-xl font-medium">นวดไทยต้นตำรับ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-base font-light leading-relaxed">
                            ศาสตร์การนวดแผนโบราณที่ผสานการยืดเหยียดและการกดจุด เพื่อเพิ่มความยืดหยุ่นและกระตุ้นการไหลเวียนของพลังงาน
                        </CardDescription>
                    </CardContent>
                </Card>

                {/* Service 2 */}
                <Card className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                            <Wind className="h-6 w-6 text-primary/80" />
                        </div>
                        <CardTitle className="text-xl font-medium">นวดสวีดิชผ่อนคลาย</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-base font-light leading-relaxed">
                            เทคนิคการนวดแบบยุโรปคลาสสิกที่เน้นความนุ่มนวลและลื่นไหล เพื่อสลายความตึงเครียดและนำพาร่างกายเข้าสู่ความผ่อนคลายอย่างสมบูรณ์
                        </CardDescription>
                    </CardContent>
                </Card>

                {/* Service 3 */}
                <Card className="group border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                            <Droplets className="h-6 w-6 text-primary/80" />
                        </div>
                        <CardTitle className="text-xl font-medium">นวดอโรมาเธอราพี</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-base font-light leading-relaxed">
                            การเดินทางสู่ความสมดุลแบบองค์รวม ผสานท่านวดที่ผ่อนคลายร่วมกับน้ำมันหอมระเหยสูตรพิเศษ เพื่อปรับสมดุลทางอารมณ์อย่างล้ำลึก
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
