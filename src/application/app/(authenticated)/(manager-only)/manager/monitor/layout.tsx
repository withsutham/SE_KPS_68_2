import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "มอนิเตอร์",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
