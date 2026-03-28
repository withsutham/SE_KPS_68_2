import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
