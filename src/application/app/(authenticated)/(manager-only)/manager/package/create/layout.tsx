import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สร้างแพ็กเกจ",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
