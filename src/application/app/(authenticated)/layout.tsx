"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
                router.push(`/auth/login?returnTo=${encodeURIComponent(currentPath)}&message=auth_required`);
            } else {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [router, pathname, searchParams]);

    if (isChecking) {
        return (
            <main className="flex-1 w-full flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </main>
        );
    }

    return <>{children}</>;
}
