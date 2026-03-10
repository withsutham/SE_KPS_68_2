import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { Suspense } from "react";

async function AuthGuard({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?message=auth_required");
    }

    return <>{children}</>;
}

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense>
            <AuthGuard>{children}</AuthGuard>
        </Suspense>
    );
}
