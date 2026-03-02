import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground">สวัสดี, {user.email}</span>
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
