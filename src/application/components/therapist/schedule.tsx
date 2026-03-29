"use client";
import React, { useMemo, useState, useRef } from 'react';
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

  // Drag to scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

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
        const startMinute = startDate.getMinutes().toString().padStart(2, '0');
        const endHour = endDate.getHours().toString().padStart(2, '0');
        const endMinute = endDate.getMinutes().toString().padStart(2, '0');
        const timeString = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;

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

  // สร้าง time slots แบบ Dynamic ให้ขยายตามชั่วโมงของนัดหมายที่ดึกที่สุด
  const times = useMemo(() => {
    let maxHour = 20; // Default end hour: 20:00 (08:00 - 20:00)
    
    appointments.forEach((app) => {
      let endHr = app.endDate.getHours();
      // ถ้านาทีมากกว่า 0 ให้ปัดชั่วโมงขึ้นเพื่อให้ครอบคลุม
      if (app.endDate.getMinutes() > 0) {
        endHr += 1;
      }
      if (endHr > maxHour) {
        maxHour = endHr;
      }
    });

    const generatedTimes = [];
    // สร้างช่วงเวลาเริ่มตั้งแต่ 08.00 น. ไปจนถึง maxHour โดยข้ามช่วง 12.00-13.00
    for (let h = 8; h < maxHour; h++) {
      if (h === 12) continue; // Skip Noon
      const startH = h.toString().padStart(2, '0');
      const endH = (h + 1).toString().padStart(2, '0');
      generatedTimes.push(`${startH}:00 - ${endH}:00`);
    }
    return generatedTimes;
  }, [appointments]);

  // รูปแบบการแสดงผลช่วงวันที่
  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const startStr = startOfWeek.toLocaleDateString('th-TH', options);
    const endStr = endOfWeek.toLocaleDateString('th-TH', { ...options, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  // ---------------------------------
  // Mouse Drag to Scroll Event Handlers
  // ---------------------------------
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // ความเร็วในการเลื่อน
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="space-y-6">
      {/* ส่วนควบคุมความเปลี่ยนของสัปดาห์ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1b231e] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-[#2b3530] transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#62846E]/10 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-[#62846E]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">ช่วงวันที่แสดง</h2>
            <p className="text-lg font-bold text-[#62846E]">{formatDateRange()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10 dark:text-gray-200"
          >
            วันนี้
          </Button>
          <div className="flex bg-gray-50 dark:bg-[#161c18] p-1 rounded-lg border border-gray-100 dark:border-[#2b3530]">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek(-1)}
              className="h-8 w-8 hover:bg-white dark:hover:bg-[#1b231e] hover:shadow-sm text-slate-700 dark:text-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateWeek(1)}
              className="h-8 w-8 hover:bg-white dark:hover:bg-[#1b231e] hover:shadow-sm text-slate-700 dark:text-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        className={`overflow-x-auto rounded-xl border-2 border-[#62846E] dark:border-[#2b3530] bg-white dark:bg-[#1b231e] shadow-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <table className="w-max min-w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-[#fbfaf9] dark:bg-[#1c2621] select-none">
              <th className="border-b-2 border-r-2 border-[#62846E] dark:border-[#2b3530] p-4 w-36 min-w-[9rem] bg-[#fbfaf9] dark:bg-[#1c2621] relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#62846E" strokeWidth="1" />
                </svg>
                <div className="text-[11px] font-bold absolute top-2 right-2 text-[#62846E] uppercase">เวลา</div>
                <div className="text-[11px] font-bold absolute bottom-2 left-2 text-[#62846E] uppercase">วัน</div>
              </th>
              {times.map((time) => (
                <th key={time} className="border-b-2 border-r border-[#62846E] dark:border-[#2b3530] p-3 w-48 min-w-[12rem] text-[11px] font-bold text-[#62846E] uppercase tracking-wider text-center">
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
                  <td className="border-b border-r-2 border-[#62846E] dark:border-[#2b3530] bg-[#fbfaf9] dark:bg-[#1c2621] text-center transition-colors group-hover:bg-[#f5f4f2] dark:group-hover:bg-[#202b25] select-none">
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
                      
                      // ค้นหานัดหมายที่เริ่มในช่องเวลานี้ หรือเริ่มก่อนแต่นี่เป็น slot แรกที่มี (สำหรับ edge cases)
                      if (slotStartHour === appStartHour) return true;
                      if (timeIdx === 0 && appStartHour < slotStartHour && app.endDate.getHours() > slotStartHour) return true;
                      
                      return false;
                    });

                    if (appointment) {
                      const appStartHour = appointment.startDate.getHours();
                      const appStartMinute = appointment.startDate.getMinutes();
                      const appEndHour = appointment.endDate.getHours();
                      const appEndMinute = appointment.endDate.getMinutes();
                      
                      let activeSlots = 0;
                      for (let i = timeIdx; i < times.length; i++) {
                         const slotHour = parseInt(times[i].split(':')[0]);
                         if (slotHour < appEndHour || (slotHour === appEndHour && appEndMinute > 0)) {
                             activeSlots++;
                         } else {
                             break;
                         }
                      }
                      
                      const colSpan = Math.max(1, activeSlots);
                      skipCount = colSpan - 1;
                      
                      let totalDrawMinutes = 0;
                      for (let i = timeIdx; i < timeIdx + colSpan; i++) {
                         const slotH = parseInt(times[i].split(':')[0]);
                         const spanStart = Math.max((appStartHour * 60) + appStartMinute, slotH * 60);
                         const spanEnd = Math.min((appEndHour * 60) + appEndMinute, (slotH + 1) * 60);
                         
                         if (spanEnd > spanStart) {
                             totalDrawMinutes += (spanEnd - spanStart);
                         }
                      }

                      const firstSlotHour = parseInt(times[timeIdx].split(':')[0]);
                      const startOffsetMinutes = Math.max(0, ((appStartHour * 60) + appStartMinute) - (firstSlotHour * 60));
                      
                      const marginLeftPercent = (startOffsetMinutes / (colSpan * 60)) * 100;
                      const widthPercent = Math.max(5, (totalDrawMinutes / (colSpan * 60)) * 100);

                      return (
                        <td 
                          key={time} 
                          colSpan={colSpan} 
                          className="border-b border-r border-gray-100 dark:border-white/5 p-0 transition-colors group-hover:bg-gray-50/50 dark:group-hover:bg-white/5"
                        >
                          <div className="h-full w-full relative block px-1.5 py-1.5">
                            <div 
                              style={{ width: `${widthPercent}%`, marginLeft: `${marginLeftPercent}%` }}
                              className={`h-full min-h-[90px] p-2 rounded-lg ${appointment.color} flex flex-col justify-start items-start shadow-sm border border-white/50 dark:border-white/10 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden z-10 select-none`}
                            >
                              <p className="text-[12px] font-bold leading-tight truncate w-full pointer-events-none">{appointment.service}</p>
                              <p className="text-[10px] mt-0.5 font-medium opacity-90 truncate w-full text-left pointer-events-none">{appointment.time}</p>
                              <p className="text-[10px] mt-1 text-gray-700/80 bg-white/50 dark:bg-black/10 px-1 py-0.5 rounded italic truncate w-full pointer-events-none">
                                ลูกค้า: {appointment.customer}
                              </p>
                              <div className="mt-auto pt-1 w-full pointer-events-none">
                                <span className="inline-block text-[10px] font-bold border border-white/60 bg-white/30 px-1.5 py-0.5 rounded-md truncate max-w-full">
                                  {appointment.room}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={time} className="border-b border-r border-gray-100 dark:border-white/5 p-1.5 transition-colors group-hover:bg-gray-50/50 dark:group-hover:bg-white/5">
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
        <p className="text-right text-[10px] text-gray-300 italic uppercase font-bold tracking-widest">Wellness Center System</p>
      </div>
    </div>
  );
}
