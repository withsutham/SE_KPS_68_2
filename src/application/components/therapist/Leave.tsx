"use client";

import React, { useState, useMemo } from 'react';
import { Calendar, Send, CalendarDays, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
// หมายเหตุ: เช็ค path ของ employee_actions ให้ตรงกับโฟลเดอร์โปรเจกต์ของคุณด้วยนะครับ
import { createLeaveRecord } from '@/components/therapist/employee_actions'; 

export default function Leave() {
    // ใช้ toLocaleDateString('en-CA') เพื่อดึงวันที่ตาม Timezone ท้องถิ่นในรูปแบบ YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [modal, setModal] = useState<{ show: boolean, title: string, message: string, type: 'warning' | 'error' }>({ 
        show: false, 
        title: '', 
        message: '', 
        type: 'warning' 
    });
    const router = useRouter();

    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 0;
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (end < start) return 0;
        return differenceInDays(end, start) + 1;
    }, [startDate, endDate]);

    const handleStartDateChange = (val: string) => {
        setStartDate(val);
        // ถ้าวันเริ่มที่เลือกใหม่ มากกว่าวันสิ้นสุดปัจจุบัน ให้ปรับวันสิ้นสุดตาม
        if (endDate < val) {
            setEndDate(val);
        }
    };

    const handleSubmit = async () => {
        // 0. ตรวจสอบว่าเลือกวันที่หรือยัง
        if (!startDate || !endDate) {
            setModal({
                show: true,
                title: 'กรุณาเลือกวันที่',
                message: 'โปรดเลือกวันที่เริ่มต้นและวันสิ้นสุดการลาของคุณ',
                type: 'warning'
            });
            return;
        }

        // 1. ตรวจสอบวันที่ห้ามเป็นอดีต
        if (startDate < today) {
            setModal({
                show: true,
                title: 'วันที่ไม่ถูกต้อง',
                message: 'ไม่สามารถเลือกวันที่เริ่มต้นย้อนหลังได้ กรุณาตรวจสอบอีกครั้ง',
                type: 'warning'
            });
            return;
        }

        // 2. ตรวจสอบวันเริ่มต้องไม่เกินวันสิ้นสุด
        if (endDate < startDate) {
            setModal({
                show: true,
                title: 'ช่วงเวลาไม่ถูกต้อง',
                message: 'วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มต้น',
                type: 'warning'
            });
            return;
        }

        if (!reason.trim()) {
            setModal({
                show: true,
                title: 'กรุณาระบุเหตุผล',
                message: 'โปรดระบุเหตุผลในการลาของคุณเพื่อให้หัวหน้างานประกอบการพิจารณา',
                type: 'warning'
            });
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
            setModal({
                show: true,
                title: 'เกิดข้อผิดพลาด',
                message: error.message || 'ไม่สามารถส่งคำขอลาได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
                type: 'error'
            });
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
                                        onChange={(e) => handleStartDateChange(e.target.value)}
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

            {/* Custom Modal Notification */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1b231e] rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white dark:border-white/5">
                        <div className="p-8 text-center space-y-4">
                            <div className={cn(
                                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                                modal.type === 'warning' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" : "bg-red-50 dark:bg-red-500/10 text-red-500"
                            )}>
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{modal.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
                                {modal.message}
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50/50 dark:bg-[#1c2621] flex flex-col gap-2 border-t border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setModal({ ...modal, show: false })}
                                className="w-full py-4 rounded-2xl font-bold text-white bg-[#62846E] hover:bg-[#4a6353] shadow-lg transition-all flex items-center justify-center text-sm"
                            >
                                เข้าใจแล้ว
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Helper funtion for class names
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}