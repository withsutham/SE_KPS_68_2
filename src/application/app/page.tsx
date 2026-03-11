import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HeroSection } from "@/components/home/hero-section";
import { ServicesSection } from "@/components/home/services-section";
import { FeaturesSection } from "@/components/home/features-section";
import { MassageListingSection } from "@/components/home/massage-listing-section";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Redirect managers and shop owners to the monitor page
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const adminSupabase = await createAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("user_type")
      .eq("profile_id", user.id)
      .single();

    if (profile?.user_type === "manager" || profile?.user_type === "shop_owner") {
      redirect("/manager/dashboard");
    }
  }

  return (
    <main className="flex flex-col items-center">
      <HeroSection />
      <ServicesSection />
      <MassageListingSection />
      <FeaturesSection />
    </main>
  );
}
