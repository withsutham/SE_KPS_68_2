"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Button onClick={logout} size="sm" className="font-mitr">
      <LogOut className="h-4 w-4 sm:hidden" />
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </Button>
  );
}
