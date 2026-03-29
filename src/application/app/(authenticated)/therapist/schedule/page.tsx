import ScheduleContent from "@/components/therapist/schedule";
import { createClient } from '@/lib/supabase/server';
import { redirect } from "next/navigation"; // นำเข้า redirect เพื่อเด้งกลับหน้า login
import { getEmployeeByUserId } from "@/lib/user-actions";

export default async function SchedulePage() {
  const supabase = await createClient();

  // 1. ตรวจสอบสถานะ User ปัจจุบันก่อน
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 2. ถ้าไม่มี User ล็อกอินอยู่ ให้แสดง Log และ (เลือกได้) เด้งไปหน้า Login
  if (!user || authError) {
    console.error("ไม่มี User ล็อกอินอยู่! ระบบกำลังดึงข้อมูลด้วยสิทธิ์ anon");
    // แนะนำให้เปิดคอมเมนต์บรรทัดล่างนี้เพื่อบังคับให้ไปล็อกอินก่อน
    redirect('/auth/login'); 
    return null;
  }

  // 3. ดึงข้อมูล Profile พนักงานจาก userId
  const employee = await getEmployeeByUserId(user.id);
  
  if (!employee) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6 text-red-600">ไม่พบโปรไฟล์พนักงานของคุณ</h1>
        <p>กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบข้อมูลของคุณ (ID: {user.id})</p>
      </>
    );
  }

  const targetEmployeeId = employee.employee_id;
  console.log("Fetching bookings for employee_id:", targetEmployeeId);

  // 4. ดึงข้อมูลตารางงาน และ Join กับ table massage, room และ booking
  const { data: bookings, error } = await supabase
    .from('booking_detail')
    .select(`
      *,
      massage:massage_id (massage_name),
      room:room_id (room_name),
      booking:booking_id (customer_name)
    `)
    .eq('employee_id', targetEmployeeId);

  if (error) {
    console.error("Error fetching bookings:", error.message);
  }

  console.log("Raw Bookings Found:", bookings?.length || 0, "records");
  if (bookings && bookings.length > 0) {
    console.log("Sample Booking Date:", bookings[0].massage_start_dateTime);
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">ตารางงานของคุณ</h1>
      <ScheduleContent initialBookings={(bookings as any) || []} />
    </>
  );
}