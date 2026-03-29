"use client";
import React, { useState, useEffect } from 'react';
import { Home, Calendar, Send, History, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getEmployeeByUserId } from '@/lib/user-actions';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const empData = await getEmployeeByUserId(user.id);
        setEmployee(empData);
      }
    }
    fetchProfile();
  }, []);

  // จัดการเมนูเป็น Array เพื่อให้ง่ายต่อการเพิ่ม/ลด
  const menuItems = [
    { icon: <Home size={20} />, label: "หน้าหลัก", href: "/therapist" },
    { icon: <Calendar size={20} />, label: "ตารางงาน", href: "/therapist/schedule" },
    { icon: <Send size={20} />, label: "ส่งใบลา", href: "/therapist/leave" },
    { icon: <History size={20} />, label: "ประวัติการลา", href: "/therapist/leavehistory" },
  ];

  return (
    <>
      {/* Sidebar สำหรับหน้าจอ Desktop (md และขึ้นไป) */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-[#fbfaf9] border-r border-slate-100 flex-col items-center py-6 gap-8 sticky top-0 h-screen transition-all">
        {/* Profile Section at Top - Horizontal Layout */}
        <div className="flex items-center lg:w-full lg:px-4 gap-3">
          <div className="relative h-10 w-10 shrink-0">
            {employee?.image_src ? (
              <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-white shadow-sm relative">
                <Image
                  src={employee.image_src}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-[#62846E]/10 border-2 border-white shadow-sm flex items-center justify-center text-[#62846E]">
                <User size={20} />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {employee ? `${employee.first_name}` : '...'}
            </p>
            <p className="text-[9px] text-[#62846E] font-bold uppercase tracking-wider">Therapist</p>
          </div>
        </div>

        <nav className="flex flex-col gap-4 w-full px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                  ? 'bg-[#62846E] text-white shadow-md shadow-green-100'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-[#62846E]'
                  }`}
              >
                {item.icon}
                <span className="text-sm font-medium hidden lg:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Navigation สำหรับหน้าจอ Mobile (เล็กกว่า md) */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-6 py-3 flex justify-between items-center z-50 animate-in slide-in-from-bottom-10 duration-700">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${isActive
                ? 'text-[#62846E]'
                : 'text-gray-400'
                }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-[#62846E]/10 scale-110' : ''}`}>
                {item.icon}
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}