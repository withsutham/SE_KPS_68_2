import { BookingManagement } from "@/components/manager/booking-management";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการการจอง",
  description: "ระบบจัดการรายการจองคิวลูกค้า",
};

export default function BookingManagementPage() {
  return <BookingManagement />;
}
