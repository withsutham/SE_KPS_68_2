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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="font-mitr">
          <CardHeader>
            <CardTitle className="text-2xl">เช็คอีเมลของคุณ</CardTitle>
            <CardDescription>ส่งคำแนะนำการตั้งรหัสผ่านใหม่แล้ว</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              หากคุณลงทะเบียนไว้ด้วยอีเมลนี้ คุณจะได้รับอีเมลสำหรับตั้งรหัสผ่านใหม่
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="font-mitr">
          <CardHeader>
            <CardTitle className="text-2xl">ตั้งรหัสผ่านใหม่</CardTitle>
            <CardDescription>
              ใส่อีเมลของคุณแล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
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
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full font-mitr" disabled={isLoading}>
                  {isLoading ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่าน"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm font-mitr">
                มีบัญชีอยู่แล้วใช่หรือไม่?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
