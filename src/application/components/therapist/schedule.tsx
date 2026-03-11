"use client";
import React from 'react';
import { Clock, User, ChevronRight } from 'lucide-react';

export default function ScheduleCalendar() {
  // สมมติข้อมูลนัดหมาย
  const appointments = [
    { id: 1, time: "09:00 - 10:00", patient: "สมชาย รักดี", type: "กายภาพบำบัด" },
    { id: 2, time: "11:00 - 12:00", patient: "สมหญิง จริงใจ", type: "นวดแผนไทย" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">ตารางนัดหมายวันนี้</h2>
      <div className="grid gap-4 ">
        {appointments.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-700">{item.time}</p>
                <p className="text-sm text-slate-500">{item.patient}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-blue-600">
              <ChevronRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}