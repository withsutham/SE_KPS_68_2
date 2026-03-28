import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="w-full relative overflow-hidden flex flex-col items-center justify-center min-h-[75vh] px-4">
            {/* Subtle Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-color-dodge pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-secondary/30 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-color-dodge pointer-events-none" />

            <div className="w-full max-w-6xl mx-auto text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
                    <Sparkles className="mr-2 h-4 w-4" /> ค้นพบสมดุลแห่งธรรมชาติในตัวคุณ
                </div>
                <h1 className="text-7xl md:text-9xl font-light tracking-tighter text-foreground leading-[1.05] font-mitr">
                    ผ่อนคลาย. <span className="font-medium italic text-primary">ฟื้นฟู.</span> <br className="hidden md:block" /> คืนความสมดุล.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                    สัมผัสประสบการณ์การนวดบำบัดระดับพรีเมียมที่ผสานศาสตร์แห่งประสาทสัมผัส เพื่อปรับสมดุลออร่าในพื้นที่แห่งความสงบที่หลอมรวมธรรมชาติและจิตวิญญาณ
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                    <Link href="/booking">
                        <Button size="lg" className="rounded-full px-12 py-8 text-xl font-medium shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 font-mitr">
                            จองคิวรับบริการ
                        </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="rounded-full px-12 py-8 text-xl font-medium border-border/50 hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 font-mitr">
                        เลือกชมแพ็กเกจ
                    </Button>
                </div>
            </div>
        </section>
    );
}
