import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Flower2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <nav className="w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl flex justify-between items-center p-6 px-10">
        <div className="flex gap-12 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Flower2 className="h-7 w-7 text-primary transition-transform group-hover:rotate-45 duration-500" />
            <span className="font-semibold text-xl tracking-wider uppercase text-foreground/90 font-mitr">ฟื้นใจ</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
              <Link href="/#services" className="text-[1.05rem]">
                ดูบริการนวด
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:ring-0 text-foreground/80 font-mitr font-normal h-10 px-4">
                  <span className="text-[1.05rem]">การจอง</span>
                  <ChevronDown className="h-4 w-4 opacity-50 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 font-mitr border-border/50 backdrop-blur-xl bg-background/95">
                <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
                  <Link href="/booking/history" className="w-full cursor-pointer py-2.5 px-3 text-base">
                    ดูประวัติการจอง
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
                  <Link href="/booking" className="w-full cursor-pointer py-2.5 px-3 text-base">
                    ทำการจอง
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
              <Link href="/coupon" className="text-[1.05rem]">
                คูปอง
              </Link>
            </Button>

            <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
              <Link href="/package" className="text-[1.05rem]">
                แพคเกจ
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-8 w-20 animate-pulse bg-muted rounded"></div>}>
            {hasEnvVars ? <AuthButton /> : null}
          </Suspense>
          <div className="h-6 w-px bg-border/40 mx-2 hidden sm:block" />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}
