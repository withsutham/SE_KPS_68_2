"use client"; // ต้องใส่เพราะมีการใช้ State/Event
import React, { useState, useEffect } from 'react';
import { Home, User, Calendar, Bell, ChevronLeft, ChevronRight, Send, Folder } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getEmployeeByUserId } from '@/lib/user-actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function HRDashboard() {
  // 1. สร้าง State สำหรับปฏิทิน
  const [currentDate, setCurrentDate] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. จำลองการดึงข้อมูลจาก API ( useEffect )
  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const empData = await getEmployeeByUserId(user.id);
          setEmployee(empData);
        }
      } catch (error) {
        console.error("Error fetching therapist profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    // Mock announcements
    const mockData = [
      { id: 1, title: "การอบรมพนักงานใหม่", date: "25 เมษายน 2567", type: "train" },
      { id: 2, title: "หยุดทำงานวันแรงงาน", date: "1 พฤษภาคม 2567", type: "holiday" },
    ];
    setAnnouncements(mockData);
  }, []);

  // 3. Logic คำนวณวันในปฏิทิน
  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(viewYear, viewMonth + offset, 1));
  };

  return (
    <div className="min-h-screen bg-[#fbfaf9] flex">
      {/* Sidebar - แก้ไข bg-[#fffffff] เป็น bg-white */}
      {/* <aside className="w-20 lg:w-64 bg-[#fffffff] border-r flex flex-col items-center py-6 gap-8">
        <div className="text-[#62846E]"><Home size={32} fill="currentColor" /></div>
        <nav className="flex flex-col gap-4 w-full px-4">
            <SidebarItem 
                icon={<Home size={20} />} 
                label="หน้าหลัก" 
                href="/therapist" 
            />
            <SidebarItem 
                icon={<Calendar size={20} />} 
                label="ตารางงาน" 
                href="/therapist/schedule" 
            />
        </nav>
      </aside> */}

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-800">
                  {employee ? `${employee.first_name} ${employee.last_name}` : 'ไม่พบข้อมูลชื่อ'}
                </h1>
                <p className="text-gray-500 text-sm">Therapist</p>
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Calendar Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-white flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">ปฏิทิน</h3>
                <div className="flex gap-1"><div className="w-1 h-1 bg-gray-300 rounded-full"></div>...</div>
             </div>

             <div className="flex justify-between items-center text-sm mb-6"> 
                <button onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
                <span className="font-bold text-base">
                  {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
             </div>

             <div className="grid grid-cols-7 gap-2 text-center text-xs flex-1">
                {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => <div key={d} className="text-gray-400 font-bold py-2">{d}</div>)}
                {/* ช่องว่างก่อนวันที่ 1 */}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {/* วันที่ 1 ถึงสิ้นเดือน */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate() && viewMonth === new Date().getMonth();
                  return (
                    <div key={day} className={`py-2 rounded-full cursor-pointer transition-all ${isToday ? 'bg-[#62846E] text-white' : 'hover:bg-gray-50'}`}>
                      {day}
                    </div>
                  );
                })}
             </div>

             {/* <button className="w-full mt-6 bg-[#62846E] text-white py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-green-100 transition">
                บันทึกเวลาการทำงาน <ChevronRight size={16} />
             </button> */}
          </div>

          {/* Announcements & Action Buttons */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm flex-1">
              <h3 className="font-bold mb-4">ประกาศล่าสุด</h3>
              <div className="space-y-3">
                {/* 4. ดึงข้อมูลมาวนลูปแสดงผล */}
                {announcements.map((item: any) => (
                  <AnnouncementItem 
                    key={item.id}
                    title={item.title} 
                    date={item.date} 
                    icon={item.type === 'train' ? <User size={16} /> : <Calendar size={16} />} 
                    color={item.type === 'train' ? "text-blue-500" : "text-red-500"} 
                  />
                ))}
              </div>
              <button className="text-blue-600 text-sm mt-4 font-bold flex items-center gap-1 float-right">
                ดูประกาศทั้งหมด <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ActionButton label="ยื่นคำขอลา" icon={<Send size={24} />} color="bg-[#62846E]" />
              {/* <ActionButton label="ส่งเอกสาร" icon={<Folder size={24} />} color="bg-[#62846E]" /> */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Components เหมือนเดิมของคุณ แต่แก้ CSS เล็กน้อยให้ดูสวยขึ้น ---
function SidebarItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  const pathname = usePathname();
  // เช็คว่า pathname ปัจจุบันตรงกับ href ของปุ่มนี้หรือไม่
  const isActive = pathname === href;

  return (
    <Link href={href} className={`
      flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
      ${isActive 
        ? 'bg-[#62846E] text-white shadow-md' 
        : 'text-gray-400 hover:bg-gray-50 hover:text-[#62846E]'
      }
    `}>
      {icon}
      <span className="text-sm font-medium hidden lg:block">{label}</span>
    </Link>
  );
}

function AnnouncementItem({ title, date, icon, color }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-50 bg-[#F9FBFA]">
      <div className={`mt-1 p-2 rounded-lg bg-white shadow-sm ${color}`}>{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-slate-700">{title} <span className="font-normal text-blue-400 ml-1">{date}</span></h4>
        <p className="text-[10px] text-gray-400">รายละเอียดข้อมูลประกาศเบื้องต้นจากระบบ...</p>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, color }: any) {
  return (
    <button className={`${color} text-white py-5 px-6 rounded-2xl flex flex-row items-center justify-center gap-3 shadow-md hover:scale-[1] transition-transform`}>
      {icon}
      <span className="text-sm font-bold tracking-wide">{label}</span>
    </button>
  );
}
