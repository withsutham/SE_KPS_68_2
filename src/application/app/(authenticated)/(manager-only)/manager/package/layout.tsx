import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการแพ็กเกจ",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
