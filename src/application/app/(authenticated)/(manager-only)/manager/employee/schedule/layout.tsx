import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ตารางงานพนักงาน",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
