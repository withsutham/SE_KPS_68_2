"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  PanelLeft,
  PanelLeftClose,
  LogOut,
  Sun,
  Moon,
  Clock
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
  { href: "/manager/package", label: "จัดการแพ็กเกจ", icon: Package },
  { href: "/manager/coupon", label: "จัดการคูปอง", icon: Tag },
  { href: "/manager/operating-time", label: "เวลาทำการ", icon: Clock },
];

const employeeItems: MenuItem[] = [
  { href: "/manager/employee/schedule", label: "จัดตารางงานรายสัปดาห์", icon: Calendar },
  { href: "/manager/employee/management", label: "จัดการข้อมูลพนักงาน", icon: Settings },
];

function MenuLink({ item, active, collapsed }: { item: MenuItem; active: boolean; collapsed: boolean }) {
  const Icon = item.icon;
  return (
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
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function ManagerSideMenu() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true);
  }, []);

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
          {employeeItems.map((item) => (
            <MenuLink key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} />
          ))}
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
