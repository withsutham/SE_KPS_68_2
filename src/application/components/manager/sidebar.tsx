"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Package,
  Ticket,
  Clock,
  Monitor,
  Flower2,
  ChevronRight,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

const SIDEBAR_LINKS = [
  {
    title: "แดชบอร์ด",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "จัดการการจอง",
    href: "/manager/booking",
    icon: CalendarDays,
  },
  {
    title: "มอนิเตอร์",
    href: "/manager/monitor",
    icon: Monitor,
  },
  {
    title: "พนักงาน",
    icon: Users,
    items: [
      { title: "ตารางงานรายสัปดาห์", href: "/manager/employee/schedule" },
      { title: "จัดการข้อมูลพนักงาน", href: "/manager/employee/management" },
    ],
  },
  {
    title: "จัดการแพ็กเกจ",
    href: "/manager/package",
    icon: Package,
  },
  {
    title: "จัดการคูปอง",
    href: "/manager/coupon",
    icon: Ticket,
  },
  {
    title: "เวลาทำการ",
    href: "/manager/operating-time",
    icon: Clock,
  },
];

export function ManagerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-border/40 bg-card/50 backdrop-blur-xl transition-transform dark:bg-card/20">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo */}
        <div className="mb-10 px-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:rotate-12">
              <Flower2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-mitr text-xl font-bold tracking-tight text-foreground/90 uppercase">ฟื้นใจ</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">Management</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            if (link.items) {
              const isGroupActive = link.items.some((item) => pathname === item.href);
              return (
                <div key={link.title} className="space-y-1">
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground">
                    <link.icon className="h-5 w-5" />
                    <span>{link.title}</span>
                  </div>
                  <div className="ml-4 border-l border-border/60 pl-4 space-y-1">
                    {link.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary",
                          pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground/80"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <link.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "group-hover:text-primary")} />
                <span>{link.title}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-1 pt-4 border-t border-border/40">
           <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary" asChild>
             <Link href="/">
                <User className="h-5 w-5" />
                ดูมุมมองลูกค้า
             </Link>
           </Button>
           <LogoutButton className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive" />
        </div>
      </div>
    </aside>
  );
}
