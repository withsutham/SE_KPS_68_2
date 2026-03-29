import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function CustomerGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?message=auth_required");
  }

  const adminSupabase = await createAdminClient();
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("user_type")
    .eq("profile_id", user.id)
    .single();

  if (profile?.user_type === "manager" || profile?.user_type === "shop_owner") {
    redirect("/manager/dashboard");
  }

  return <>{children}</>;
}
