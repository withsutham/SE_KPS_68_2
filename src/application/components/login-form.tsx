"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { getUserType } from "@/components/therapist/employee_actions";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const packageId = searchParams.get("packageId");
  const message = searchParams.get("message") ?? (tab ? "auth_required" : null);
  let returnTo = searchParams.get("returnTo") || "/";

  if (!searchParams.get("returnTo") && tab) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (packageId) {
      params.set("packageId", packageId);
    }
    returnTo = `/package?${params.toString()}`;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Check user role for redirect via server action (to bypass RLS safely)
      if (authData?.user) {
        const userType = await getUserType(authData.user.id);
        if (userType === "therapist") {
          window.location.href = "/therapist";
          return;
        }
      }

      // Redirect to the intended page, or home by default
      window.location.href = returnTo;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="font-mitr">
        <CardHeader>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            ใส่อีเมลของคุณด้านล่างเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message === "booking" && (
            <div className="bg-amber-100 text-amber-900 text-sm p-3 mb-6 rounded-md font-mitr border border-amber-200">
              กรุณาเข้าสู่ระบบก่อนทำการจองบริการ
            </div>
          )}
          {message === "auth_required" && (
            <div className="bg-amber-100 text-amber-900 text-sm p-3 mb-6 rounded-md font-mitr border border-amber-200">
              กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ลืมรหัสผ่านใช่ไหม?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full font-mitr" disabled={isLoading}>
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              ยังไม่มีบัญชีใช่หรือไม่?{" "}
              <Link
                href={`/auth/sign-up${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
                className="underline underline-offset-4"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
