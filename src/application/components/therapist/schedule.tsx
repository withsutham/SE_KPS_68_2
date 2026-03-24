"use client";
import React from 'react';

export default function ScheduleCalendar() {
  const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์' , 'อาทิตย์'];
  const times = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
  ];

  // สมมติข้อมูลนัดหมายที่ระบุวันและเวลา
  const appointments = [
    { day: 'จันทร์', time: '09:00 - 10:00', patient: 'สมชาย รักดี', color: 'bg-blue-100 text-blue-700' },
    { day: 'พุธ', time: '11:00 - 12:00', patient: 'สมหญิง จริงใจ', color: 'bg-pink-100 text-pink-700' },
    { day: 'ศุกร์', time: '14:00 - 15:00', patient: 'วิชัย กล้าหาญ', color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Container: เส้นขอบด้านนอกสุด ใช้สี [#62846E] */}
      <div className="overflow-x-auto rounded-xl border-2 border-[#62846E] bg-[#fbfaf9] shadow-sm">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
             {/* ช่องหัวมุม: เปลี่ยนมาใช้ SVG เพื่อให้เส้นพอดีมุมเป๊ะและไม่ทะลุกรอบ */}
              <th className="border border-[#62846E] p-4 w-32 relative bg-[#fbfaf9] overflow-hidden">
                {/* วาดเส้นทแยงมุมด้วย SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#62846E" strokeWidth="1" />
                </svg>
                
                <div className="text-[10px] absolute top-2 right-2 text-[#62846E]">เวลา</div>
                <div className="text-[10px] absolute bottom-2 left-2 text-[#62846E]">วัน</div>
              </th>
              {times.map((time) => (
                <th key={time} className="border border-[#62846E] p-3 text-xs font-semibold text-[#62846E] bg-[#fbfaf9]">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="h-24">
                {/* ช่องชื่อวัน: เส้นขอบ [#62846E] */}
                <td className="border border-[#62846E] bg-[#fbfaf9] text-center">
                  <span className="px-4 py-1.5 rounded-full bg-[#62846E]/10 text-[#62846E] text-xs font-bold shadow-sm">
                    {day}
                  </span>
                </td>
                {times.map((time) => {
                  const appointment = appointments.find(
                    (app) => app.day === day && app.time === time
                  );

                  return (
                    /* ช่องตารางด้านใน: เส้นขอบ [#62846E] */
                    <td key={time} className="border border-[#62846E] p-1 bg-[#fbfaf9]">
                      {appointment && (
                        <div className={`h-full w-full p-2 rounded-lg ${appointment.color} flex flex-col justify-center items-center text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                          <p className="text-[11px] font-bold leading-tight">{appointment.patient}</p>
                          <p className="text-[9px] opacity-75 mt-1 uppercase italic font-medium">Confirmed</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-right text-xs text-gray-300 italic">ALL THE TIME :)</p>
    </div>
  );
}