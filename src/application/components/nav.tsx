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
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NavScrollLink } from "@/components/nav-scroll-link";

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
            <Suspense fallback={null}>
              <NavLinkGroup />
            </Suspense>
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
            แพคเกจ
          </Link>
        </Button>
      </>
    );
  }

  // manager, shop_owner — can manage employees, bookings, packages, coupons and see dashboard
  if (role === "manager" || role === "shop_owner") {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 hover:text-primary transition-colors focus-visible:ring-0 text-foreground/80 font-mitr font-normal h-10 px-3">
              <span className="text-sm">พนักงาน</span>
              <ChevronDown className="h-4 w-4 opacity-50 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 font-mitr border-border/50 backdrop-blur-xl bg-background/95">
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/service-ip/manager/employee/timetable" className="w-full cursor-pointer py-2.5 px-3 text-base">
                ตารางทำงานพนักงาน
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary">
              <Link href="/service-ip/manager/employee/management" className="w-full cursor-pointer py-2.5 px-3 text-base">
                จัดการข้อมูลพนักงาน
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/service-ip/manager/booking" className="text-sm">
            จัดการการจอง
          </Link>
        </Button>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/service-ip/manager/package" className="text-sm">
            จัดการแพคเกจ
          </Link>
        </Button>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/service-ip/manager/coupon" className="text-sm">
            จัดการคูปอง
          </Link>
        </Button>

        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/service-ip/manager/dashboard" className="text-sm">
            แดชบอร์ด
          </Link>
        </Button>
      </>
    );
  }

  // therapist — can view their own timetable
  if (role === "therapist") {
    return (
      <>
        <NavScrollLink
          href="/#services"
          className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4"
        >
          ดูบริการนวด
        </NavScrollLink>
        <Button variant="ghost" asChild className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4">
          <Link href="/service-ip/manager/employee/timetable" className="text-sm">
            ตารางทำงาน
          </Link>
        </Button>
      </>
    );
  }

  // for any other authenticated role (just in case)
  return (
    <NavScrollLink
      href="/#services"
      className="hover:text-primary transition-colors text-foreground/80 font-mitr font-normal h-10 px-4"
    >
      ดูบริการนวด
    </NavScrollLink>
  );
}
