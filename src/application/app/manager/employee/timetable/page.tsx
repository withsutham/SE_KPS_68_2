"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Loader2,
  Users,
  Clock,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
type Weekday = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

interface WorkSchedule {
  work_schedule_id: number;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  dateTime_added: string;
  employee_id: number;
}

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  work_since: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const WEEKDAYS: { key: Weekday; label: string; short: string }[] = [
  { key: "MON", label: "วันจันทร์", short: "จ" },
  { key: "TUE", label: "วันอังคาร", short: "อ" },
  { key: "WED", label: "วันพุธ", short: "พ" },
  { key: "THU", label: "วันพฤหัสบดี", short: "พฤ" },
  { key: "FRI", label: "วันศุกร์", short: "ศ" },
  { key: "SAT", label: "วันเสาร์", short: "ส" },
  { key: "SUN", label: "วันอาทิตย์", short: "อา" },
];

const WEEKDAY_COLORS: Record<Weekday, string> = {
  MON: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  TUE: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
  WED: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  THU: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  FRI: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  SAT: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  SUN: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

function formatTime(time: string) {
  return time?.slice(0, 5) ?? "-";
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TherapistTimetablePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<number | "all">("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, schRes] = await Promise.all([
          fetch("/api/employee"),
          fetch("/api/work_schedule"),
        ]);
        const [empJson, schJson] = await Promise.all([empRes.json(), schRes.json()]);
        setEmployees(empJson.data ?? []);
        setSchedules(schJson.data ?? []);
      } catch {
        setEmployees([]);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredSchedules =
    selectedEmployee === "all"
      ? schedules
      : schedules.filter((s) => s.employee_id === selectedEmployee);

  const getEmployeeName = (id: number) => {
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : `พนักงาน #${id}`;
  };

  const schedulesForDay = (day: Weekday) =>
    filteredSchedules.filter((s) => s.weekday === day);

  return (
    <main className="flex-1 w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <CalendarDays className="h-7 w-7 text-primary" />
          </div>
          <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-2">
            5.3
          </p>
          <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
            ตารางทำงานเทอราปิส
          </h1>
          <p className="text-muted-foreground mt-2 font-sans text-sm">
            ดูตารางเวลาทำงานประจำสัปดาห์ของเทอราปิสทั้งหมด
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-sans">กำลังโหลด...</span>
          </div>
        ) : (
          <>
            {/* Employee filter */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground font-sans">กรองตามพนักงาน</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEmployee("all")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                    selectedEmployee === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  ทั้งหมด
                </button>
                {employees.map((emp) => (
                  <button
                    key={emp.employee_id}
                    onClick={() => setSelectedEmployee(emp.employee_id)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
                      selectedEmployee === emp.employee_id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/50 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {emp.first_name} {emp.last_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly schedule grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {WEEKDAYS.map(({ key, label }) => {
                const daySchedules = schedulesForDay(key);
                return (
                  <div
                    key={key}
                    className="flex flex-col rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Day header */}
                    <div className={cn("px-4 py-3 border-b border-border/30", WEEKDAY_COLORS[key])}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium font-mitr text-sm">{label}</span>
                        {daySchedules.length > 0 && (
                          <span className="ml-auto text-xs font-medium opacity-80">
                            {daySchedules.length} คน
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Schedule list */}
                    <div className="flex flex-col gap-2 p-3 flex-1">
                      {daySchedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/50">
                          <Inbox className="h-6 w-6 mb-1" />
                          <span className="text-xs font-sans">ไม่มีตาราง</span>
                        </div>
                      ) : (
                        daySchedules.map((sch) => (
                          <div
                            key={sch.work_schedule_id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/30"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium font-mitr truncate">
                                {getEmployeeName(sch.employee_id)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(sch.start_time)} – {formatTime(sch.end_time)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
