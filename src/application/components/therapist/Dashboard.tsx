"use client";
import React, { useState } from 'react';
import { User, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface LeaveRecord {
  leave_record_id: number;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  approval_status: string;
}

interface DashboardClientProps {
  employee: any;
  recentLeaves: LeaveRecord[];
  allLeaves: LeaveRecord[];
}

export default function DashboardClient({ employee, recentLeaves, allLeaves }: DashboardClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const viewMonth = currentDate.getMonth();
  const viewYear = currentDate.getFullYear();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(viewYear, viewMonth + offset, 1));
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 shrink-0">
            {employee?.image_src ? (
              <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white shadow-md relative">
                <Image
                  src={employee.image_src}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-[#62846E]/10 border-2 border-white shadow-sm flex items-center justify-center text-[#62846E]">
                <User size={32} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
              {employee ? `${employee.first_name || ''} ${employee.last_name || ''}` : 'ไม่พบข้อมูลชื่อ'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 bg-[#62846E]/10 text-[#62846E] text-[10px] font-bold rounded-full uppercase tracking-wider">
                Therapist
              </span>
              <span className="text-gray-300 text-[10px]">•</span>
              <span className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">
                Wellness Center
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-white max-w-4xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">รายการลาล่าสุด</h3>
            <Link href="/therapist/leavehistory" className="text-[#62846E] text-sm font-bold flex items-center gap-1 hover:underline">
              ดูประวัติทั้งหมด <ChevronRightIcon size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentLeaves.length === 0 ? (
              <div className="col-span-full py-6 text-center text-gray-400 text-sm italic">
                ยังไม่มีประวัติการลา
              </div>
            ) : (
              recentLeaves.map((item) => (
                <LeaveSummaryItem
                  key={item.leave_record_id}
                  reason={item.reason || 'ไม่ระบุเหตุผล'}
                  dateRange={formatSimpleDateTH(item.start_datetime, item.end_datetime)}
                  status={item.approval_status}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-white flex flex-col w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700">ปฏิทิน</h3>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1.5 bg-[#62846E]/10 text-[#62846E] text-xs font-bold rounded-xl hover:bg-[#62846E]/20 transition-all border border-[#62846E]/5"
            >
              วันนี้
            </button>
          </div>

          <div className="flex justify-between items-center text-base mb-6 px-4">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
              <ChevronLeft size={20} className="text-[#62846E]" />
            </button>
            <span className="font-bold text-lg text-[#62846E]">
              {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
              <ChevronRight size={20} className="text-[#62846E]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs flex-1">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
              <div key={d} className="text-gray-400 font-bold py-2 uppercase tracking-tight">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate() && viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear();
              
              const dayStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isOffDay = allLeaves.some(leave => {
                 if (leave.approval_status !== 'approved') return false;
                 const start = leave.start_datetime.split('T')[0];
                 const end = leave.end_datetime.split('T')[0];
                 return dayStr >= start && dayStr <= end;
              });

              return (
                <div 
                  key={day} 
                  className={`
                    py-2 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center font-bold text-sm min-h-[56px]
                    ${isToday 
                      ? 'bg-[#62846E] text-white shadow-md shadow-green-100' 
                      : 'text-slate-600 hover:bg-gray-50 hover:text-[#62846E]'
                    }
                  `}
                >
                  <span className={`${isOffDay && !isToday ? 'text-gray-400/80' : ''}`}>{day}</span>
                  {isOffDay && (
                    <span className={`text-[9px] mt-0.5 font-bold px-1.5 py-0.5 rounded ${isToday ? 'bg-white/30 text-white' : 'bg-red-50 text-red-500'}`}>
                      OFF
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function LeaveSummaryItem({ reason, dateRange, status }: { reason: string, dateRange: string, status: string }) {
  const statusConfig = {
    approved: { icon: <CheckCircle size={16} />, color: "text-green-500", bg: "bg-green-50", label: "อนุมัติแล้ว" },
    rejected: { icon: <XCircle size={16} />, color: "text-red-500", bg: "bg-red-50", label: "ปฏิเสธ" },
    pending: { icon: <Clock size={16} />, color: "text-amber-500", bg: "bg-amber-50", label: "รอการตรวจสอบ" }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl border border-gray-50 bg-[#F9FBFA] hover:border-[#62846E]/20 transition-all">
      <div className={`mt-1 p-2 rounded-xl bg-white shadow-sm ${config.color}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-700 truncate">{reason}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400 font-medium">{dateRange}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatSimpleDateTH(isoStart: string, isoEnd: string) {
  const start = new Date(isoStart);
  const end = new Date(isoEnd);
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  
  const startDay = start.getUTCDate();
  const startMonth = monthNames[start.getUTCMonth()];
  
  if (start.getUTCDate() === end.getUTCDate() && start.getUTCMonth() === end.getUTCMonth()) {
    return `${startDay} ${startMonth}`;
  }
  
  const endDay = end.getUTCDate();
  const endMonth = monthNames[end.getUTCMonth()];
  
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}
