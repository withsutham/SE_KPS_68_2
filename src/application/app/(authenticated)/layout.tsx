"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const params = new URLSearchParams({
          returnTo: currentPath,
          message: "auth_required",
        });
        window.location.replace(`/auth/login?${params.toString()}`);
      } else {
        setIsChecking(false);
      }
    };

        checkAuth();
    }, []);

    if (isChecking) {
        return (
            <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </main>
        );
    }

    return <>{children}</>;
}
