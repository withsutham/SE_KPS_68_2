"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Clock,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Timer,
  Inbox,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Weekday = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  work_since: string | null;
}

interface WorkSchedule {
  work_schedule_id: number;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  employee_id: number;
}

interface LeaveRecord {
  leave_record_id: number;
  approval_status: "pending" | "approved" | "rejected";
  start_dateTime: string;
  end_dateTime: string;
  reason: string | null;
  employee_id: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "MON", label: "จันทร์" },
  { key: "TUE", label: "อังคาร" },
  { key: "WED", label: "พุธ" },
  { key: "THU", label: "พฤหัสบดี" },
  { key: "FRI", label: "ศุกร์" },
  { key: "SAT", label: "เสาร์" },
  { key: "SUN", label: "อาทิตย์" },
];

const LEAVE_STATUS_CONFIG = {
  pending: {
    label: "รออนุมัติ",
    icon: Timer,
    color:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle2,
    color:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  rejected: {
    label: "ปฏิเสธ",
    icon: XCircle,
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
};

const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

function formatDateTimeTH(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} น.`;
}

function formatTime(t: string) {
  return t?.slice(0, 5) ?? "-";
}

// ─── Add Work Schedule Dialog ─────────────────────────────────────────────────
function AddScheduleDialog({
  open,
  onClose,
  employeeId,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  onAdded: () => void;
}) {
  const [weekday, setWeekday] = useState<Weekday>("MON");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/work_schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekday,
          start_time: startTime,
          end_time: endTime,
          employee_id: employeeId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "เกิดข้อผิดพลาด");
      onAdded();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="font-mitr">เพิ่มเวลาทำงาน</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block font-sans">
              วันทำงาน
            </label>
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value as Weekday)}
              className="w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {WEEKDAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block font-sans">
                เวลาเริ่มงาน
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block font-sans">
                เวลาเลิกงาน
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-full font-sans">
              ยกเลิก
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving} className="rounded-full font-sans gap-2">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({
  employee,
  schedules,
  leaveRecords,
  onRefresh,
}: {
  employee: Employee;
  schedules: WorkSchedule[];
  leaveRecords: LeaveRecord[];
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "leave">("schedule");
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingLeave, setUpdatingLeave] = useState<number | null>(null);

  const mySchedules = schedules.filter(
    (s) => s.employee_id === employee.employee_id
  );
  const myLeaves = leaveRecords.filter(
    (l) => l.employee_id === employee.employee_id
  );

  const handleDeleteSchedule = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/work_schedule/${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateLeaveStatus = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    setUpdatingLeave(id);
    try {
      await fetch(`/api/leave_record/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_status: status }),
      });
      onRefresh();
    } finally {
      setUpdatingLeave(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
        {/* Employee header row */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-4 p-5 text-left hover:bg-card/60 transition-all"
        >
          <div className="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium font-mitr text-foreground">
              {employee.first_name} {employee.last_name}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              {employee.phone_number && <span>{employee.phone_number}</span>}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mySchedules.length} วันทำงาน
              </span>
              <span className="flex items-center gap-1">
                <CalendarOff className="h-3 w-3" />
                {myLeaves.filter((l) => l.approval_status === "pending").length} คำขอลาหยุดรอการอนุมัติ
              </span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border/30">
            {/* Tabs */}
            <div className="flex items-center bg-muted/30 m-4 mb-0 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("schedule")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all font-sans",
                  activeTab === "schedule"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                เวลาทำงานพื้นฐาน
              </button>
              <button
                onClick={() => setActiveTab("leave")}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all font-sans flex items-center justify-center gap-1.5",
                  activeTab === "leave"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                คำขอลาหยุด
                {myLeaves.filter((l) => l.approval_status === "pending").length > 0 && (
                  <span className="h-4 w-4 text-[10px] rounded-full bg-yellow-500 text-white flex items-center justify-center">
                    {myLeaves.filter((l) => l.approval_status === "pending").length}
                  </span>
                )}
              </button>
            </div>

            <div className="p-4">
              {/* 5.4.1 — Default Working Time */}
              {activeTab === "schedule" && (
                <div className="flex flex-col gap-3">
                  {mySchedules.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                      <Inbox className="h-7 w-7 opacity-30" />
                      <p className="text-sm font-sans">ยังไม่มีตารางเวลาทำงาน</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {mySchedules.map((sch) => {
                        const day = WEEKDAYS.find((d) => d.key === sch.weekday);
                        return (
                          <div
                            key={sch.work_schedule_id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/30"
                          >
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium font-mitr">
                                วัน{day?.label ?? sch.weekday}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(sch.start_time)} – {formatTime(sch.end_time)} น.
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteSchedule(sch.work_schedule_id)}
                              disabled={deletingId === sch.work_schedule_id}
                              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                              {deletingId === sch.work_schedule_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddScheduleOpen(true)}
                    className="rounded-full border-dashed border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 gap-1.5 font-sans w-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่มวันทำงาน
                  </Button>
                </div>
              )}

              {/* 5.4.2 — Leave Request Management */}
              {activeTab === "leave" && (
                <div className="flex flex-col gap-2">
                  {myLeaves.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                      <Inbox className="h-7 w-7 opacity-30" />
                      <p className="text-sm font-sans">ไม่มีคำขอลาหยุด</p>
                    </div>
                  ) : (
                    myLeaves.map((leave) => {
                      const cfg =
                        LEAVE_STATUS_CONFIG[leave.approval_status] ??
                        LEAVE_STATUS_CONFIG.pending;
                      const StatusIcon = cfg.icon;
                      return (
                        <div
                          key={leave.leave_record_id}
                          className="flex flex-col gap-3 p-4 rounded-xl border border-border/40 bg-background/60"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                              <CalendarOff className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                                    cfg.color
                                  )}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTimeTH(leave.start_dateTime)} –{" "}
                                {formatDateTimeTH(leave.end_dateTime)}
                              </p>
                              {leave.reason && (
                                <p className="text-xs text-foreground/80 mt-1 font-sans">
                                  เหตุผล: {leave.reason}
                                </p>
                              )}
                            </div>
                          </div>

                          {leave.approval_status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-1.5 font-sans"
                                disabled={updatingLeave === leave.leave_record_id}
                                onClick={() =>
                                  handleUpdateLeaveStatus(
                                    leave.leave_record_id,
                                    "approved"
                                  )
                                }
                              >
                                {updatingLeave === leave.leave_record_id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                อนุมัติ
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-full border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5 font-sans"
                                disabled={updatingLeave === leave.leave_record_id}
                                onClick={() =>
                                  handleUpdateLeaveStatus(
                                    leave.leave_record_id,
                                    "rejected"
                                  )
                                }
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                ปฏิเสธ
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AddScheduleDialog
        open={addScheduleOpen}
        onClose={() => setAddScheduleOpen(false)}
        employeeId={employee.employee_id}
        onAdded={onRefresh}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [empRes, schRes, leaveRes] = await Promise.all([
        fetch("/api/employee"),
        fetch("/api/work_schedule"),
        fetch("/api/leave_record"),
      ]);
      const [empJson, schJson, leaveJson] = await Promise.all([
        empRes.json(),
        schRes.json(),
        leaveRes.json(),
      ]);
      setEmployees(empJson.data ?? []);
      setSchedules(schJson.data ?? []);
      setLeaveRecords(leaveJson.data ?? []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingLeaveCount = leaveRecords.filter(
    (l) => l.approval_status === "pending"
  ).length;

  return (
    <main className="flex-1 w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 -left-60 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-2">
            5.4
          </p>
          <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
            จัดการข้อมูลพนักงาน
          </h1>
          <p className="text-muted-foreground mt-2 font-sans text-sm">
            กำหนดเวลาทำงานพื้นฐาน และจัดการคำขอลาหยุดของพนักงาน
          </p>
        </div>

        {/* Summary badges */}
        {!loading && (
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium font-mitr">{employees.length}</span>
              <span className="text-muted-foreground font-sans">พนักงาน</span>
            </div>
            {pendingLeaveCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-400">
                <Timer className="h-4 w-4" />
                <span className="font-medium font-mitr">{pendingLeaveCount}</span>
                <span className="font-sans">คำขอลาหยุดรออนุมัติ</span>
              </div>
            )}
          </div>
        )}

        {/* Employees list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-sans">กำลังโหลด...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border/30 flex items-center justify-center">
              <Inbox className="h-8 w-8 opacity-30" />
            </div>
            <p className="font-mitr text-base">ยังไม่มีข้อมูลพนักงาน</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.employee_id}
                employee={emp}
                schedules={schedules}
                leaveRecords={leaveRecords}
                onRefresh={fetchData}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
