import { OperatingTimeManagement } from "@/components/manager/operating-time-management";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการเวลาทำการ | ฟื้นใจ",
  description: "จัดการเวลาเปิด-ปิดของร้าน",
};

export default function OperatingTimePage() {
  return <OperatingTimeManagement />;
}
