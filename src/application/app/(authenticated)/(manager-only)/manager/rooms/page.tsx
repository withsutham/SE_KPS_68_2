import { RoomManagement } from "@/components/manager/room-management";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการห้องนวด",
  description: "ระบบจัดการห้องนวดและประเภทบริการ",
};

export default function RoomsManagementPage() {
  return <RoomManagement />;
}
