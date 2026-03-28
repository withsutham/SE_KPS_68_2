import type { Metadata } from "next";
import { CouponManagement } from "@/components/manager/coupon-management";

export const metadata: Metadata = {
  title: "จัดการคูปอง",
};

export default function ManagerCouponPage() {
  return <CouponManagement />;
}
