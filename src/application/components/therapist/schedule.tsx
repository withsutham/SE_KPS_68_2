"use client";
import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Booking {
  booking_detail_id: number;
  massage_start_dateTime: string;
  massage_end_dateTime: string;
  massage?: { massage_name: string };
  room?: { room_name: string };
  booking?: { customer_name: string };
}

export default function ScheduleCalendar({ initialBookings }: { initialBookings: Booking[] }) {
  // วันที่สำหรับสัปดาห์ที่กำลังแสดง (ค่าเริ่มต้นคือวันนี้)
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
  const times = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
    '18:00 - 19:00',
    '19:00 - 20:00'
  ];

  // คำนวณวันอาทิตย์ของสัปดาห์ปัจจุบัน
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    d.setDate(d.getDate() - day); // ถอยหลังไปที่วันอาทิตย์
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  // คำนวณวันเสาร์ของสัปดาห์ปัจจุบัน
  const endOfWeek = useMemo(() => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [startOfWeek]);

  // เลื่อนสัปดาห์
  const navigateWeek = (weeks: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (weeks * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // กรองนัดหมายเฉพาะในสัปดาห์ที่เลือก
  const appointments = useMemo(() => {
    console.log("Current Week Range:", startOfWeek.toLocaleDateString(), "-", endOfWeek.toLocaleDateString());
    console.log("Total Bookings to Filter:", initialBookings?.length || 0);

    if (!initialBookings) return [];

    const colors = [
      'bg-blue-100 text-blue-700 border-l-4 border-blue-500', 
      'bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500', 
      'bg-amber-100 text-amber-700 border-l-4 border-amber-500', 
      'bg-purple-100 text-purple-700 border-l-4 border-purple-500',
      'bg-rose-100 text-rose-700 border-l-4 border-rose-500',
      'bg-cyan-100 text-cyan-700 border-l-4 border-cyan-500'
    ];

    const filtered = initialBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.massage_start_dateTime);
        const isInRange = bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        return isInRange;
      });

    console.log("Bookings after Weekly Filter:", filtered.length);
    if (filtered.length > 0) {
      filtered.forEach((b, i) => {
        console.log(`Booking ${i+1} details:`, {
          start: b.massage_start_dateTime,
          end: b.massage_end_dateTime,
          day: days[new Date(b.massage_start_dateTime).getDay()]
        });
      });
    }

    return filtered.map((booking, index) => {
        const startDate = new Date(booking.massage_start_dateTime);
        const endDate = new Date(booking.massage_end_dateTime);
        
        const dayName = days[startDate.getDay()];
        
        const startHour = startDate.getHours().toString().padStart(2, '0');
        const endHour = endDate.getHours().toString().padStart(2, '0');
        const timeString = `${startHour}:00 - ${endHour}:00`;

        return {
          day: dayName,
          time: timeString,
          startDate, // Store raw date for better matching
          endDate,   // Store raw date for better matching
          service: booking.massage?.massage_name || 'ไม่ระบุบริการ',
          room: booking.room?.room_name || 'ไม่ระบุห้อง',
          customer: booking.booking?.customer_name || 'ไม่ระบุลูกค้า',
          color: colors[index % colors.length]
        };
      });
  }, [initialBookings, startOfWeek, endOfWeek, days]);

  // รูปแบบการแสดงผลช่วงวันที่
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = startOfWeek.toLocaleDateString('th-TH', options);
    const endStr = endOfWeek.toLocaleDateString('th-TH', { ...options, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-6">
      {/* ส่วนควบคุมความเปลี่ยนของสัปดาห์ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#62846E]/10 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-[#62846E]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-700">ช่วงวันที่แสดง</h2>
            <p className="text-lg font-bold text-[#62846E]">{formatDateRange()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="hover:bg-gray-50 border-gray-200"
          >
            วันนี้
          </Button>
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek(-1)}
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek(1)}
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-[#62846E] bg-white shadow-md">
        <table className="w-full border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#fbfaf9]">
              <th className="border-b-2 border-r-2 border-[#62846E] p-4 w-36 relative bg-[#fbfaf9] overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#62846E" strokeWidth="1" />
                </svg>
                <div className="text-[11px] font-bold absolute top-2 right-2 text-[#62846E] uppercase">เวลา</div>
                <div className="text-[11px] font-bold absolute bottom-2 left-2 text-[#62846E] uppercase">วัน</div>
              </th>
              {times.map((time) => (
                <th key={time} className="border-b-2 border-r border-[#62846E] p-3 text-[11px] font-bold text-[#62846E] uppercase tracking-wider">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              let skipCount = 0;
              return (
                <tr key={day} className="h-28 group">
                  <td className="border-b border-r-2 border-[#62846E] bg-[#fbfaf9] text-center sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <span className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all bg-[#62846E]/10 text-[#62846E] border border-transparent">
                      {day}
                    </span>
                  </td>
                  {times.map((time, timeIdx) => {
                    if (skipCount > 0) {
                      skipCount--;
                      return null;
                    }

                    const slotStartHour = parseInt(time.split(':')[0]);
                    
                    const appointment = appointments.find((app) => {
                      if (app.day !== day) return false;
                      const appStartHour = app.startDate.getHours();
                      const appEndHour = app.endDate.getHours();
                      
                      // ตรวจสอบว่า slot นี้อยู่ในช่วงเวลาของนัดหมายหรือไม่
                      return slotStartHour >= appStartHour && slotStartHour < appEndHour;
                    });

                    if (appointment) {
                      const appEndHour = appointment.endDate.getHours();
                      const duration = Math.max(1, appEndHour - slotStartHour);
                      const remainingSlots = times.length - timeIdx;
                      const colSpan = Math.min(duration, remainingSlots);
                      
                      skipCount = colSpan - 1;

                      return (
                        <td 
                          key={time} 
                          colSpan={colSpan} 
                          className="border-b border-r border-gray-100 p-1.5 transition-colors group-hover:bg-gray-50/50"
                        >
                          <div className={`h-full w-full p-3 rounded-lg ${appointment.color} flex flex-col justify-center items-start shadow-sm border border-white/50 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5`}>
                            <p className="text-[12px] font-bold leading-tight line-clamp-1">{appointment.service}</p>
                            <p className="text-[10px] mt-0.5 font-medium opacity-90">{appointment.room}</p>
                            <p className="text-[10px] mt-1 text-gray-600 bg-white/40 px-1.5 py-0.5 rounded italic whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                              ลูกค้า: {appointment.customer}
                            </p>
                            <div className="flex items-center gap-1 mt-auto pt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              <p className="text-[9px] opacity-80 uppercase font-black">ยืนยันแล้ว</p>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={time} className="border-b border-r border-gray-100 p-1.5 transition-colors group-hover:bg-gray-50/50">
                        {/* Empty cell */}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center px-2">
        <p className="text-xs text-gray-400 font-medium tracking-tight">แสดงตารางงานสำหรับปี {new Date().getFullYear() + 543}</p>
        <p className="text-right text-[10px] text-gray-300 italic uppercase font-bold tracking-widest">Wellness Center System</p>
      </div>
    </div>
  );
}