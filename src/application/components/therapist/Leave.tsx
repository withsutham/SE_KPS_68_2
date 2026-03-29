"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Send, CalendarDays, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
// หมายเหตุ: เช็ค path ของ employee_actions ให้ตรงกับโฟลเดอร์โปรเจกต์ของคุณด้วยนะครับ
import { createLeaveRecord } from '@/components/therapist/employee_actions'; 

export default function Leave() {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (end < start) return 0;
        return differenceInDays(end, start) + 1;
    }, [startDate, endDate]);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('กรุณาระบุเหตุผลการลา');
            return;
        }

        setSubmitting(true);
        try {
            const startStr = `${startDate}T00:00:00`;
            const endStr = `${endDate}T23:59:59`;

            await createLeaveRecord({
                start_datetime: startStr,
                end_datetime: endStr,
                reason: reason,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/therapist/leavehistory');
            }, 2000);
        } catch (error: any) {
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <header className="flex flex-col items-center justify-center text-center gap-2 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">ยื่นคำขอลา</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">ข้อมูลการลาและการทำงานของคุณ</p>
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1b231e] p-8 rounded-3xl shadow-sm border border-white dark:border-[#2b3530] space-y-6 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-gray-200">วันที่เริ่มต้น</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={today}
                                        className="w-full pl-10 p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 transition-all font-medium appearance-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-gray-200">วันที่สิ้นสุด</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full pl-10 p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 transition-all font-medium appearance-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {totalDays > 0 && (
                            <div className="flex items-center gap-2 p-4 bg-[#62846E]/5 dark:bg-[#62846E]/10 rounded-2xl border border-[#62846E]/10 dark:border-[#62846E]/20">
                                <CalendarDays className="text-[#62846E]" size={20} />
                                <span className="text-sm font-bold text-[#62846E]">
                                    รวมจำนวนวันลา: {totalDays} วัน
                                </span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-gray-200">เหตุผลการลา</label>
                            <textarea
                                rows={4}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="ระบุเหตุผลในการลาของคุณ..."
                                className="w-full p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {success ? (
                                <div className="flex-1 bg-green-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold animate-pulse shadow-lg md:shadow-none">
                                    <CheckCircle2 size={18} />
                                    ส่งคำขอสำเร็จ! กำลังไปที่หน้าประวัติ...
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex-1 bg-[#62846E] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all font-bold"
                                    >
                                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        {submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอลา'}
                                    </button>
                                    <Link
                                        href="/therapist"
                                        className="px-8 bg-gray-50 dark:bg-white/5 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                                    >
                                        ยกเลิก
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-[#62846E]/5 dark:bg-[#62846E]/10 p-6 rounded-3xl border border-[#62846E]/10 dark:border-[#62846E]/20">
                    <h4 className="text-[#62846E] font-bold text-sm mb-2 text-center">ข้อควรรู้</h4>
                    <p className="text-[#62846E]/70 dark:text-[#62846E]/90 text-xs leading-relaxed text-center">
                        การยื่นคำขอลาควรแจ้งล่วงหน้าอย่างน้อย 3 วันทำการ (ยกเว้นกรณีฉุกเฉิน) และต้องได้รับการอนุมัติจากหัวหน้าแผนกก่อนจึงจะถือว่าการลาเสร็จสมบูรณ์
                    </p>
                </div>
            </div>
        </>
    );
}