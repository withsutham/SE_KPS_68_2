import Sidebar from "@/components/therapist/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { getEmployeeByUserId } from "@/components/therapist/employee_actions";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let employee = null;
  if (user) {
    employee = await getEmployeeByUserId(user.id);
  }

  return (
    <div className="flex min-h-screen bg-[#fbfaf9]">
      {/* Sidebar จะถูกโหลดแค่ครั้งเดียวที่นี่แบบ Server Component */}
      <Sidebar employee={employee} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {/* เนื้อหาแต่ละหน้าจะมาแสดงที่ children */}
          {children}
        </div>
      </div>
    </div>
  );
}