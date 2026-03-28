import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แดชบอร์ด",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
