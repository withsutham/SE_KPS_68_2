import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Flower2 } from "lucide-react";

export function Nav() {
  return (
    <nav className="w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50 print:hidden">
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
  );
}
