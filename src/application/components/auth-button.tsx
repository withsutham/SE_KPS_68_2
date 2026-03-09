import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  let displayName = "";
  if (user && user.sub) {
    try {
      // In Next.js App Router, using fetch to a local API route requires the full URL.
      // We can construct it via headers().
      const headersList = await headers();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = headersList.get("x-forwarded-proto") || "http";
      const baseUrl = `${protocol}://${host}`;

      const res = await fetch(`${baseUrl}/api/customer?profile_id=${user.sub}`);
      if (res.ok) {
        const { data } = await res.json();
        // Since we filtered by profile_id and there should only be one match, we take the first element (if it exists)
        if (data && data.length > 0) {
          const customer = data[0];
          displayName = `${customer.first_name} ${customer.last_name}`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch customer name via API:", e);
    }
  }

  if (!displayName) {
    displayName = user?.email || "Unknown user";
  }

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground font-mitr">
        สวัสดีคุณ {displayName}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"} className="font-mitr">
        <Link href="/auth/login">เข้าสู่ระบบ</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className="font-mitr">
        <Link href="/auth/sign-up">สมัครสมาชิก</Link>
      </Button>
    </div>
  );
}
