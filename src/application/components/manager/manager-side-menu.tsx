"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Tag,
  Monitor,
  Users,
  Calendar,
  Settings,
  ClipboardList,
  DoorOpen,
  Clock,
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const topItems: MenuItem[] = [
  { href: "/manager/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/manager/monitor", label: "มอนิเตอร์", icon: Monitor },
  { href: "/manager/booking", label: "จัดการการจอง", icon: ClipboardList },
  { href: "/manager/rooms", label: "จัดการห้องนวด", icon: DoorOpen },
  { href: "/manager/massage", label: "จัดการบริการนวด", icon: Sparkles },
  { href: "/manager/package", label: "จัดการแพ็กเกจ", icon: Package },
  { href: "/manager/coupon", label: "จัดการคูปอง", icon: Tag },
  { href: "/manager/operating-time", label: "เวลาทำการ", icon: Clock },
];

const employeeItems: MenuItem[] = [
  { href: "/manager/employee/schedule", label: "จัดตารางงานรายสัปดาห์", icon: Calendar },
  { href: "/manager/employee/management", label: "จัดการข้อมูลพนักงาน", icon: Settings },
];

type BadgeData = { count: number; color: "yellow" | "red" };

function MenuLink({ 
  item, 
  active, 
  collapsed, 
  badge, 
  badges,
  onBadgeClick 
}: { 
  item: MenuItem; 
  active: boolean; 
  collapsed: boolean; 
  badge?: number; 
  badges?: BadgeData[];
  onBadgeClick?: (color: "yellow" | "red") => void;
}) {
  const Icon = item.icon;
  const allBadges: BadgeData[] = badges || (badge && badge > 0 ? [{ count: badge, color: "yellow" }] : []);
  const validBadges = allBadges.filter((b: BadgeData) => b.count > 0);

  return (
    <div className="relative group/link">
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      </Link>

      {!collapsed && validBadges.length > 0 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
          {validBadges.map((b, i) => (
            <button
              key={i}
              onClick={(e) => {
                if (onBadgeClick) {
                  e.preventDefault();
                  e.stopPropagation();
                  onBadgeClick(b.color);
                }
              }}
              className={cn(
                "h-5 min-w-[20px] rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background px-1 transition-transform hover:scale-110 active:scale-95",
                b.color === "yellow" ? "bg-yellow-500 text-white" : "bg-red-500 text-white",
                onBadgeClick && "cursor-pointer"
              )}
            >
              {b.count > 99 ? "99+" : b.count}
            </button>
          ))}
        </div>
      )}

      {collapsed && validBadges.length > 0 && (
        <span className={cn(
          "absolute top-2 right-2 h-2.5 w-2.5 rounded-full ring-2 ring-background",
          validBadges[0].color === "yellow" ? "bg-yellow-500" : "bg-red-500"
        )} />
      )}
    </div>
  );
}

export function ManagerSideMenu() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [leaveCollisionCount, setLeaveCollisionCount] = useState(0);
  const [firstCollisionDate, setFirstCollisionDate] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const [leaveRes, bookingRes] = await Promise.all([
        fetch("/api/leave_record"),
        fetch("/api/booking_detail")
      ]);

      const leaveJson = await leaveRes.json();
      const bookingJson = await bookingRes.json();

      if (leaveJson.data && bookingJson.data) {
        const leaves = leaveJson.data;
        const bookings = bookingJson.data;

        // 1. Pending Leaves (Yellow badge on Management)
        const pending = leaves.filter((l: any) => l.approval_status === "pending").length;
        setPendingCount(pending);

        // 2. Unassigned bookings
        const unassigned = bookings.filter((b: any) => !b.employee_id).length;
        setUnassignedCount(unassigned);

        // 3. Leave collisions (Red badge on Schedule)
        const approvedLeaves = leaves.filter((l: any) => l.approval_status === "approved");
        let collisions = 0;
        let earliestCollision: number | null = null;

        bookings.forEach((b: any) => {
          if (!b.employee_id) return;

          const isColliding = approvedLeaves.some((l: any) => {
            if (l.employee_id !== b.employee_id) return false;
            
            const bStart = new Date(b.massage_start_dateTime).getTime();
            const bEnd = new Date(b.massage_end_dateTime).getTime();
            const lStart = new Date(l.start_datetime).getTime();
            const lEnd = new Date(l.end_datetime).getTime();

            return (bStart < lEnd && bEnd > lStart);
          });

          if (isColliding) {
            collisions++;
            const bStart = new Date(b.massage_start_dateTime).getTime();
            if (earliestCollision === null || bStart < earliestCollision) {
              earliestCollision = bStart;
            }
          }
        });

        setLeaveCollisionCount(collisions);
        if (earliestCollision) {
          setFirstCollisionDate(new Date(earliestCollision).toISOString().split("T")[0]);
        } else {
          setFirstCollisionDate(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch menu metrics:", err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchMetrics();

    const handleRefresh = () => {
      fetchMetrics();
    };

    window.addEventListener("schedule-refresh", handleRefresh);
    return () => window.removeEventListener("schedule-refresh", handleRefresh);
  }, [fetchMetrics]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen shrink-0 border-r border-border/50 bg-background/95 backdrop-blur",
        "flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">เมนูผู้จัดการ</p>
              <p className="text-xs text-muted-foreground">ระบบจัดการร้าน</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {!collapsed && <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">ภาพรวม</p>}
          {topItems.map((item) => (
            <MenuLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
          ))}
        </div>

        <div className="mt-5 space-y-1">
          {!collapsed && <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">พนักงาน</p>}
          <MenuLink 
            item={employeeItems[0]} 
            active={pathname === employeeItems[0].href} 
            collapsed={collapsed} 
            badges={[
              ...(leaveCollisionCount > 0 ? [{ count: leaveCollisionCount, color: "red" as const }] : []),
              ...(unassignedCount > 0 ? [{ count: unassignedCount, color: "yellow" as const }] : [])
            ]}
            onBadgeClick={(color) => {
              if (color === "red" && firstCollisionDate) {
                window.location.href = `/manager/employee/schedule?week=${firstCollisionDate}`;
              }
            }}
          />
          <MenuLink 
            item={employeeItems[1]} 
            active={pathname === employeeItems[1].href} 
            collapsed={collapsed} 
            badge={pendingCount}
          />
        </div>
      </div>

      <div className="border-t border-border/50 p-3 space-y-2">
        <Button
          variant="ghost"
          onClick={handleThemeToggle}
          disabled={!mounted}
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? (theme === "light" ? "Dark mode" : "Light mode") : undefined}
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {mounted && (theme === "light" ? (
            <Moon className="h-4 w-4 shrink-0" />
          ) : (
            <Sun className="h-4 w-4 shrink-0" />
          ))}
          {!collapsed && <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "ออกจากระบบ" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </Button>
      </div>
    </aside>
  );
}
