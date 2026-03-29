import type { Metadata } from "next";
import { CustomerGuard } from "@/components/guards/CustomerGuard";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "จองคิวนวด",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <CustomerGuard>{children}</CustomerGuard>
    </Suspense>
  );
}
