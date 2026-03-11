"use client";
import React from 'react';
import { Home, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // จัดการเมนูเป็น Array เพื่อให้ง่ายต่อการเพิ่ม/ลด
  const menuItems = [
    { icon: <Home size={20} />, label: "หน้าหลัก", href: "/therapist" },
    { icon: <Calendar size={20} />, label: "ตารางงาน", href: "/therapist/schedule" },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-[#fbfaf9] border-r border-slate-100 flex flex-col items-center py-6 gap-8 sticky top-0 h-screen">
      <div className="text-[#62846E]">
        <Home size={32} fill="currentColor" />
      </div>
      
      <nav className="flex flex-col gap-4 w-full px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[#62846E] text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-50'
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
  );
}