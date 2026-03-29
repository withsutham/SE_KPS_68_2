"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Timer, Loader2, Inbox, Pencil, X, Trash2 } from 'lucide-react';
import { updateLeaveRecord, deleteLeaveRecord } from '@/components/therapist/employee_actions';

const MONTHS_TH = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatDateTH(isoStart: string, isoEnd: string) {
    const start = new Date(isoStart);
    const end = new Date(isoEnd);
    
    // Use UTC methods to avoid timezone shift issues (especially when stored as UTC+0)
    const startDay = start.getUTCDate();
    const startMonth = start.getUTCMonth();
    const startYear = start.getUTCFullYear();
    
    const endDay = end.getUTCDate();
    const endMonth = end.getUTCMonth();
    const endYear = end.getUTCFullYear();
    
    const isSameDay = startDay === endDay && startMonth === endMonth && startYear === endYear;
    const isSameMonth = startMonth === endMonth;
    const isSameYear = startYear === endYear;
    
    if (isSameDay) {
        return `${startDay} ${MONTHS_TH[startMonth]} ${startYear + 543}`;
    }
    
    if (isSameMonth && isSameYear) {
        return `${startDay} - ${endDay} ${MONTHS_TH[startMonth]} ${startYear + 543}`;
    }
    
    return `${startDay} ${MONTHS_TH[startMonth]} - ${endDay} ${MONTHS_TH[endMonth]} ${startYear + 543}`;
}

export default function LeaveHistoryClient({ initialRecords }: { initialRecords: any[] }) {
    const [history, setHistory] = useState<any[]>(initialRecords);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({ startDate: '', endDate: '', reason: '' });

    // Sync state when initialRecords updates (after revalidatePath triggers a refetch from server)
    useEffect(() => {
        setHistory(initialRecords);
    }, [initialRecords]);

    const openEdit = (record: any) => {
        setEditingRecord(record);
        setEditForm({
            startDate: record.start_datetime.split('T')[0],
            endDate: record.end_datetime.split('T')[0],
            reason: record.reason || ''
        });
    };

    const handleUpdate = async () => {
        if (!editingRecord) return;
        if (!editForm.reason.trim()) {
            alert('กรุณาระบุเหตุผล');
            return;
        }

        setEditLoading(true);
        try {
            await updateLeaveRecord(editingRecord.leave_record_id, {
                start_datetime: `${editForm.startDate}T00:00:00`,
                end_datetime: `${editForm.endDate}T23:59:59`,
                reason: editForm.reason
            });
            setEditingRecord(null);
        } catch (error) {
            alert('แก้ไขข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingRecord) return;
        
        setEditLoading(true);
        try {
            await deleteLeaveRecord(editingRecord.leave_record_id);
            setEditingRecord(null);
            setShowDeleteConfirm(false);
        } catch (error) {
            alert('ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="flex items-center justify-center text-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">ประวัติการลา</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">ตรวจสอบรายการลาที่ผ่านมาของคุณ</p>
                </div>
            </header>

            <div className="bg-white dark:bg-[#1b231e] rounded-3xl shadow-sm border border-white dark:border-[#2b3530] overflow-hidden transition-colors">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <Inbox className="h-10 w-10 opacity-20" />
                        <span className="text-sm font-medium">ยังไม่มีประวัติการลา</span>
                    </div>
                ) : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-[#1c2621]">
                                    <th className="p-4 text-sm font-bold text-slate-700 dark:text-gray-200">ลำดับ</th>
                                    <th className="p-4 text-sm font-bold text-slate-700 dark:text-gray-200">วันที่</th>
                                    <th className="p-4 text-sm font-bold text-slate-700 dark:text-gray-200">สถานะ</th>
                                    <th className="p-4 text-sm font-bold text-slate-700 dark:text-gray-200">เหตุผล</th>
                                    <th className="p-4 text-sm font-bold text-slate-700 dark:text-gray-200 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {history
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((item, index) => (
                                        <tr key={item.leave_record_id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-sm text-gray-500 dark:text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatDateTH(item.start_datetime, item.end_datetime)}
                                            </td>
                                            <td className="p-4">
                                                {item.approval_status === 'approved' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-emerald-500/10 text-green-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                                                        <CheckCircle size={14} /> อนุมัติ
                                                    </span>
                                                ) : item.approval_status === 'rejected' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
                                                        <XCircle size={14} /> ไม่อนุมัติ
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">
                                                        <Timer size={14} /> รออนุมัติ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-gray-400 dark:text-gray-500">{item.reason || '-'}</td>
                                            <td className="p-4 text-center">
                                                {item.approval_status === 'pending' && (
                                                    <button 
                                                        onClick={() => openEdit(item)}
                                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-[#62846E] dark:hover:text-[#62846E] hover:bg-[#62846E]/10 rounded-xl transition-all"
                                                        title="แก้ไขคำขอลา"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {history.length > itemsPerPage && (
                            <div className="flex items-center justify-between p-4 bg-gray-50/30 dark:bg-[#161c18] border-t border-gray-100 dark:border-white/5">
                                <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    แสดง {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, history.length)} จาก {history.length} รายการ
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1b231e] border border-gray-100 dark:border-white/10 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ก่อนหน้า
                                    </button>
                                    <div className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-[#62846E] bg-[#62846E]/10 rounded-lg">
                                        {currentPage} / {Math.ceil(history.length / itemsPerPage)}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(history.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(history.length / itemsPerPage)}
                                        className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1b231e] border border-gray-100 dark:border-white/10 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Dialog */}
            {editingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1b231e] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-[#1c2621]">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">แก้ไขการลา</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ระบุข้อมูลใหม่ที่คุณต้องการแก้ไข</p>
                            </div>
                            <button onClick={() => setEditingRecord(null)} className="p-2 hover:bg-white dark:hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">วันที่เริ่มต้น</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={editForm.startDate} 
                                        onChange={e => setEditForm({...editForm, startDate: e.target.value})}
                                        className="w-full p-3.5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 font-medium transition-all" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">วันที่สิ้นสุด</label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={editForm.endDate} 
                                        onChange={e => setEditForm({...editForm, endDate: e.target.value})}
                                        className="w-full p-3.5 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 font-medium transition-all" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">เหตุผลการลา</label>
                                <textarea 
                                    rows={3}
                                    value={editForm.reason} 
                                    onChange={e => setEditForm({...editForm, reason: e.target.value})}
                                    placeholder="ระบุเหตุผลในการแก้ไข..."
                                    className="w-full p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#161c18] dark:text-gray-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#62846E]/20 resize-none font-medium transition-all" 
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50/50 dark:bg-[#1c2621] flex gap-3 border-t border-gray-100 dark:border-white/5">
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={editLoading}
                                className="p-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm flex items-center justify-center"
                                title="ลบคำขอลา"
                            >
                                <Trash2 size={18} />
                            </button>
                            <div className="flex-1 flex gap-3">
                                <button 
                                    onClick={() => setEditingRecord(null)}
                                    className="flex-1 py-4 px-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all text-sm"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    onClick={handleUpdate}
                                    disabled={editLoading}
                                    className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-[#62846E] shadow-lg hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    {editLoading ? <Loader2 size={18} className="animate-spin" /> : 'บันทึกการแก้ไข'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1b231e] rounded-[32px] shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">ยืนยันการลบ?</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                คุณแน่ใจหรือไม่ว่าต้องการลบคำขอลาคำขอนี้? ข้อมูลจะไม่สามารถกู้คืนได้
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50/50 dark:bg-[#1c2621] flex flex-col gap-2">
                            <button 
                                onClick={handleDelete}
                                disabled={editLoading}
                                className="w-full py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                {editLoading ? <Loader2 size={18} className="animate-spin" /> : 'ยืนยันลบข้อมูล'}
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={editLoading}
                                className="w-full py-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5 transition-all text-sm"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
