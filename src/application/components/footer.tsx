import Link from "next/link";
import { Flower2 } from "lucide-react";
import { CurrentYear } from "@/components/current-year";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/30 bg-background pt-24 pb-12 px-8 mt-auto print:hidden">
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
    );
}
