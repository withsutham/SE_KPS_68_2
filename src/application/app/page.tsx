import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower2, Sparkles, Wind, Droplets, Leaf, Clock, HeartHandshake } from "lucide-react";
import { CurrentYear } from "@/components/current-year";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Navigation */}
      <nav className="w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-7xl flex justify-between items-center p-6 px-10 text-base">
          <div className="flex gap-4 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <Flower2 className="h-6 w-6 text-primary transition-transform group-hover:rotate-45 duration-500" />
              <span className="font-semibold text-lg tracking-wider uppercase text-foreground/90 font-mitr">ฟื้นใจ</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Suspense fallback={<div className="h-8 w-20 animate-pulse bg-muted rounded"></div>}>
              {hasEnvVars ? <AuthButton /> : null}
            </Suspense>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
            <Button size="lg" className="rounded-full px-12 py-8 text-xl font-medium shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 font-mitr">
              จองคิวรับบริการ
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-12 py-8 text-xl font-medium border-border/50 hover:bg-muted/50 transition-all hover:scale-105 active:scale-95 font-mitr">
              เลือกชมแพ็คเกจ
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

      {/* Features Section / Why Us */}
      <section className="w-full bg-secondary/10 border-y border-primary/10 py-32 px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col gap-20">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-5xl font-light tracking-tight text-primary font-mitr">ประสบการณ์แห่งฟื้นใจ</h2>
            <p className="text-muted-foreground font-light text-xl">
              เราเน้นความเรียบง่าย ตัดทอนสิ่งที่รบกวนสายตา เพื่อให้คุณให้ความสำคัญกับสุขภาพและความเป็นอยู่ที่ดีอย่างเต็มที่
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-start">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <HeartHandshake className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight">นักบำบัดผู้เชี่ยวชาญ</h3>
              <p className="text-muted-foreground font-light px-4 leading-relaxed">
                ผู้เชี่ยวชาญที่มีใบรับรองของเราจะสัมผัสถึงความต้องการของร่างกายคุณ พร้อมปรับแรงกดและเทคนิคให้เหมาะสมกับแต่ละบุคคล
              </p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Clock className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight">ช่วงเวลาที่ไม่เร่งรีบ</h3>
              <p className="text-muted-foreground font-light px-4 leading-relaxed">
                เราให้เวลาในการรับบริการที่เพียงพอเพื่อให้คุณไม่รู้สึกเร่งรัด เวลาในพื้นที่แห่งนี้จะไหลผ่านไปอย่างสงบและมีคุณภาพ
              </p>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Flower2 className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-medium tracking-tight">พื้นที่แห่งความสงบ</h3>
              <p className="text-muted-foreground font-light px-4 leading-relaxed">
                ห้องพักผ่อนที่เรียบง่าย ปราศจากสิ่งรบกวน ท่ามกลางแสงอุ่นที่นุ่มนวลและกลิ่นหอมจากพรรณไม้ เพื่อกล่อมเกลาจิตใจให้สงบ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/30 bg-background pt-24 pb-12 px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <Link href="/" className="flex items-center gap-2 justify-center md:justify-start">
              <Flower2 className="h-5 w-5 text-primary opacity-80" />
              <span className="font-semibold text-base tracking-wider uppercase text-foreground/80 font-mitr">ฟื้นใจ</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm font-light">
              ยกระดับศิลปะแห่งการนวดผ่านความเรียบง่ายและการดูแลที่เชี่ยวชาญ
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center md:text-left text-sm text-muted-foreground">
            <div className="flex flex-col gap-3">
              <span className="font-medium text-foreground">เมนู</span>
              <Link href="#" className="hover:text-primary transition-colors">บริการของเรา</Link>
              <Link href="#" className="hover:text-primary transition-colors">อัตราค่าบริการ</Link>
              <Link href="#" className="hover:text-primary transition-colors">เกี่ยวกับเรา</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-medium text-foreground">กฎหมาย</span>
              <Link href="#" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link href="#" className="hover:text-primary transition-colors">ข้อกำหนดการใช้งาน</Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© <CurrentYear /> ฟื้นใจ มาสสาจ (Feun-Jai Massage). สงวนลิขสิทธิ์.</p>
          <p>
            สร้างโดย{" "}
            <a href="https://supabase.com" target="_blank" className="font-medium hover:underline" rel="noreferrer">
              Supabase
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
