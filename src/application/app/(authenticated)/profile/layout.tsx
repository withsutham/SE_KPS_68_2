import { CustomerGuard } from "@/components/guards/CustomerGuard";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerGuard>{children}</CustomerGuard>;
}
