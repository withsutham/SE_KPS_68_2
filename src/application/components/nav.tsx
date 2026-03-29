import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { Flower2, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavScrollLink } from "@/components/nav-scroll-link";

export async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isTherapist = false;
  if (user) {
    const adminSupabase = await createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("user_type")
      .eq("profile_id", user.id)
      .single();
    isTherapist = profile?.user_type === "therapist";
  }

  return (
    <nav className="print:hidden w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl flex justify-between items-center gap-3 py-3 px-4 sm:p-6 sm:px-10">
        <div className="flex gap-3 sm:gap-12 items-center min-w-0">
          <div className="md:hidden">
            <Suspense fallback={<div className="h-9 w-9 rounded-md bg-muted animate-pulse" />}>
              <MobileNavMenu />
            </Suspense>
          </div>
          
          {isTherapist ? (
            <div className="flex items-center gap-2 shrink-0">
              <Flower2 className="h-7 w-7 text-primary" />
              <span className="font-semibold text-base sm:text-xl tracking-normal sm:tracking-wider uppercase whitespace-nowrap text-foreground/90 font-mitr max-[340px]:hidden">ฟื้นใจ</span>
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Flower2 className="h-7 w-7 text-primary transition-transform group-hover:rotate-45 duration-500" />
              <span className="font-semibold text-base sm:text-xl tracking-normal sm:tracking-wider uppercase whitespace-nowrap text-foreground/90 font-mitr max-[340px]:hidden">ฟื้นใจ</span>
            </Link>
          )}

          <div className="hidden md:flex items-center gap-2">
            <Suspense fallback={null}>
              <NavLinkGroup />
            </Suspense>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
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

async function NavLinkGroup() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <NavScrollLink
        href="/#services"
        className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4"
      >
        ดูบริการนวด
      </NavScrollLink>
    );
  }

  // Use admin client to read the profile — user identity already verified above via getUser()
  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("user_type")
    .eq("profile_id", user.id)
    .single();

  const role = profile?.user_type;

  // Customer-specific nav links
  if (role === "customer") {
    return (
      <>
        <NavScrollLink
          href="/#services"
          className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4"
        >
          ดูบริการนวด
        </NavScrollLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:ring-0 text-foreground/80 font-mitr font-normal h-10 px-3">
              <span className="text-sm">การจอง</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 font-mitr border-border/50 backdrop-blur-xl bg-background/95">
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/booking" className="w-full cursor-pointer py-2.5 px-3 text-base">
                จองคิวรับบริการ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/booking/history" className="w-full cursor-pointer py-2.5 px-3 text-base">
                ดูประวัติการจอง
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/coupon" className="text-sm">
            คูปอง
          </Link>
        </Button>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/package" className="text-sm">
            แพ็กเกจ
          </Link>
        </Button>
      </>
    );
  }

  // manager, shop_owner — can manage employees, bookings, packages, coupons and see dashboard
  if (role === "manager" || role === "shop_owner") {
    return null;
  }

  // therapist — no extra links in top nav as they use the sidebar
  if (role === "therapist") {
    return null;
  }

  return (
    <NavScrollLink
      href="/#services"
      className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4"
    >
      ดูบริการนวด
    </NavScrollLink>
  );
}

async function MobileNavMenu() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const adminSupabase = await createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("user_type")
      .eq("profile_id", user.id)
      .single();
    role = profile?.user_type ?? null;
  }

  if (role === "manager" || role === "shop_owner") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground/80 hover:text-primary">
          <Menu className="h-5 w-5" />
          <span className="sr-only">เมนูนำทาง</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 font-mitr border-border/50 backdrop-blur-xl bg-background/95">
        {role !== "therapist" && (
          <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
            <Link href="/#services" className="w-full cursor-pointer py-2.5 px-3 text-base">
              ดูบริการนวด
            </Link>
          </DropdownMenuItem>
        )}

        {!user && null}

        {role === "customer" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/booking" className="w-full cursor-pointer py-2.5 px-3 text-base">
                จองคิวรับบริการ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/booking/history" className="w-full cursor-pointer py-2.5 px-3 text-base">
                ดูประวัติการจอง
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/coupon" className="w-full cursor-pointer py-2.5 px-3 text-base">
                คูปอง
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/package" className="w-full cursor-pointer py-2.5 px-3 text-base">
                แพ็กเกจ
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* Cleaned up therapist mobile menu items */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
