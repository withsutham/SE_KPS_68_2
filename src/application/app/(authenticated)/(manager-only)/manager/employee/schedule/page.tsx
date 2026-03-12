"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  GripVertical,
  Clock,
  CheckCircle2,
  Users,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
}

interface BookingDetail {
  booking_detail_id: number;
  booking_id: number;
  massage_id: number;
  employee_id: number | null;
  room_id: number | null;
  massage_start_dateTime: string;
  massage_end_dateTime: string;
  price: number;
}

interface Massage {
  massage_id: number;
  massage_name_th: string;
  massage_name_en?: string;
}

interface TherapistSkill {
  employee_id: number;
  massage_id: number;
}

// A merged group of consecutive booking_detail rows from the same booking_id
interface MergedSlot {
  bookingDetails: BookingDetail[];
  booking_id: number;
  massage_id: number;
  employee_id: number | null;
  startHourIndex: number; // index into HOURS array
  spanCount: number; // how many hour slots it spans
  dayIndex: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const HOURS = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00",
];

const DAY_LABELS = ["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์","อาทิตย์"];
const DAY_LABELS_SHORT = ["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."];

const DAY_BG_COLORS = [
  "bg-yellow-200 text-yellow-900 border-yellow-300 dark:bg-yellow-800/60 dark:text-yellow-200 dark:border-yellow-700",
  "bg-pink-200 text-pink-900 border-pink-300 dark:bg-pink-800/60 dark:text-pink-200 dark:border-pink-700",
  "bg-green-200 text-green-900 border-green-300 dark:bg-green-800/60 dark:text-green-200 dark:border-green-700",
  "bg-orange-200 text-orange-900 border-orange-300 dark:bg-orange-800/60 dark:text-orange-200 dark:border-orange-700",
  "bg-blue-200 text-blue-900 border-blue-300 dark:bg-blue-800/60 dark:text-blue-200 dark:border-blue-700",
  "bg-purple-200 text-purple-900 border-purple-300 dark:bg-purple-800/60 dark:text-purple-200 dark:border-purple-700",
  "bg-red-200 text-red-900 border-red-300 dark:bg-red-800/60 dark:text-red-200 dark:border-red-700",
];

const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateShort(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return `${monday.getDate()} ${MONTHS_TH[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS_TH[sunday.getMonth()]} ${sunday.getFullYear() + 543}`;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getHourIndex(dateStr: string): number {
  const d = new Date(dateStr);
  const h = d.getHours();
  return HOURS.findIndex((hr) => {
    const [hh] = hr.split(":").map(Number);
    return hh === h;
  });
}

function buildMergedSlots(
  bookings: BookingDetail[],
  weekDates: Date[]
): MergedSlot[] {
  const result: MergedSlot[] = [];

  for (let dayIdx = 0; dayIdx < weekDates.length; dayIdx++) {
    const dayDate = weekDates[dayIdx];
    const dayKey = toDateKey(dayDate);

    // Get bookings for this day
    const dayBookings = bookings.filter((b) => {
      const bDate = new Date(b.massage_start_dateTime);
      return toDateKey(bDate) === dayKey;
    });

    // Group by booking_id + massage_id
    const groups = new Map<string, BookingDetail[]>();
    for (const b of dayBookings) {
      const key = `${b.booking_id}-${b.massage_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(b);
    }

    for (const [, details] of groups) {
      // Sort by start time
      details.sort(
        (a, b) =>
          new Date(a.massage_start_dateTime).getTime() -
          new Date(b.massage_start_dateTime).getTime()
      );

      const startIdx = getHourIndex(details[0].massage_start_dateTime);
      if (startIdx < 0) continue;

      // Calculate span from first start to last end
      const lastEnd = new Date(
        details[details.length - 1].massage_end_dateTime
      );
      const firstStart = new Date(details[0].massage_start_dateTime);
      const spanHours = Math.max(
        1,
        Math.ceil(
          (lastEnd.getTime() - firstStart.getTime()) / (60 * 60 * 1000)
        )
      );

      result.push({
        bookingDetails: details,
        booking_id: details[0].booking_id,
        massage_id: details[0].massage_id,
        employee_id: details[0].employee_id,
        startHourIndex: startIdx,
        spanCount: spanHours,
        dayIndex: dayIdx,
      });
    }
  }

  return result;
}

// ─── Draggable Employee Card ──────────────────────────────────────────────────
function DraggableEmployee({ employee }: { employee: Employee }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `employee-${employee.employee_id}`,
    data: { employee },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 select-none",
        "bg-background/60 border-border/30 hover:border-primary/40 hover:bg-primary/5",
        isDragging && "opacity-30 scale-95"
      )}
    >
      <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-mitr truncate">
          {employee.first_name} {employee.last_name}
        </p>
      </div>
      <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </div>
  );
}

// ─── Droppable Merged Slot ────────────────────────────────────────────────────
function DroppableMergedSlot({
  slot,
  employees,
  massages,
}: {
  slot: MergedSlot;
  employees: Employee[];
  massages: Massage[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `merged-${slot.dayIndex}-${slot.startHourIndex}-${slot.booking_id}`,
    data: { mergedSlot: slot },
  });

  const getEmployeeName = (id: number | null) => {
    if (!id) return null;
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : `#${id}`;
  };

  const massage = massages.find((m) => m.massage_id === slot.massage_id);
  const massageName = massage?.massage_name_th ?? `บริการ #${slot.massage_id}`;

  const heightPx = slot.spanCount * 52 + (slot.spanCount - 1) * 4; // 52px per slot + gap

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute left-0 right-0 rounded-xl border transition-all duration-200 p-2 overflow-hidden",
        isOver
          ? "bg-primary/20 border-primary shadow-lg shadow-primary/10 scale-[1.02] z-10"
          : slot.employee_id
            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700"
            : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700"
      )}
      style={{
        top: `${slot.startHourIndex * (52 + 4)}px`,
        height: `${heightPx}px`,
      }}
    >
      <div className="flex flex-col gap-1 h-full">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] w-fit px-1.5 py-0 font-sans",
            slot.employee_id
              ? "border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
              : "border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-400"
          )}
        >
          {massageName}
        </Badge>
        {slot.employee_id ? (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate font-sans">
              {getEmployeeName(slot.employee_id)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-sans">
              รอจัดคน
            </span>
          </div>
        )}
        <span className="text-[10px] text-muted-foreground/60 font-sans">
          Booking #{slot.booking_id} · {slot.spanCount} ชม.
        </span>
      </div>
    </div>
  );
}

// ─── Drag Overlay ─────────────────────────────────────────────────────────────
function DragOverlayContent({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-primary/40 bg-card shadow-xl shadow-primary/20 cursor-grabbing backdrop-blur-sm">
      <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <User className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm font-medium font-mitr">
        {employee.first_name} {employee.last_name}
      </p>
    </div>
  );
}

// ─── Skill Mismatch Dialog ────────────────────────────────────────────────────
function SkillMismatchDialog({
  open,
  onClose,
  onConfirm,
  employeeName,
  massageName,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string;
  massageName: string;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="font-mitr flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ทักษะไม่ตรงกับบริการ
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm text-muted-foreground font-sans">
            พนักงาน <span className="font-medium text-foreground">{employeeName}</span> ไม่มีทักษะสำหรับบริการ <span className="font-medium text-foreground">{massageName}</span>
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            ต้องการจัดพนักงานคนนี้ต่อหรือไม่?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-full font-sans">
              ยกเลิก
            </Button>
            <Button size="sm" onClick={onConfirm} disabled={saving} className="rounded-full font-sans gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              จัดพนักงานต่อ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WeeklySchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [massages, setMassages] = useState<Massage[]>([]);
  const [skills, setSkills] = useState<TherapistSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekMonday, setWeekMonday] = useState(() => getMonday(new Date()));
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  // Skill mismatch dialog state
  const [mismatchDialog, setMismatchDialog] = useState<{
    open: boolean;
    employee: Employee | null;
    slot: MergedSlot | null;
    massageName: string;
  }>({ open: false, employee: null, slot: null, massageName: "" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const weekStartStr = toDateKey(weekMonday);
      const [empRes, bdRes, massageRes, skillRes] = await Promise.all([
        fetch("/api/employee"),
        fetch(`/api/booking_detail?week_start=${weekStartStr}`),
        fetch("/api/massage"),
        fetch("/api/therapist_massage_skill"),
      ]);
      const [empJson, bdJson, massageJson, skillJson] = await Promise.all([
        empRes.json(),
        bdRes.json(),
        massageRes.json(),
        skillRes.json(),
      ]);
      setEmployees(empJson.data ?? []);
      setBookings(bdJson.data ?? []);
      setMassages(massageJson.data ?? []);
      setSkills(skillJson.data ?? []);
    } catch {
      setEmployees([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [weekMonday]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Week Navigation ───────────────────────────────────────────────────────
  const prevWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() - 7);
    setWeekMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() + 7);
    setWeekMonday(d);
  };
  const goToday = () => setWeekMonday(getMonday(new Date()));

  // ─── Assign Employee ───────────────────────────────────────────────────────
  const assignEmployee = async (employee: Employee, slot: MergedSlot) => {
    setSaving(true);
    try {
      await Promise.all(
        slot.bookingDetails.map((b) =>
          fetch(`/api/booking_detail/${b.booking_detail_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: employee.employee_id }),
          })
        )
      );
      await fetchData();
    } catch (err) {
      console.error("Failed to assign employee:", err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Drag Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const emp = event.active.data.current?.employee as Employee | undefined;
    setActiveEmployee(emp ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveEmployee(null);
    const { over, active } = event;
    if (!over || !active) return;

    const employee = active.data.current?.employee as Employee | undefined;
    const mergedSlot = over.data.current?.mergedSlot as MergedSlot | undefined;
    if (!employee || !mergedSlot) return;

    // Check skill match
    const hasSkill = skills.some(
      (s) =>
        s.employee_id === employee.employee_id &&
        s.massage_id === mergedSlot.massage_id
    );

    if (!hasSkill) {
      const massage = massages.find((m) => m.massage_id === mergedSlot.massage_id);
      setMismatchDialog({
        open: true,
        employee,
        slot: mergedSlot,
        massageName: massage?.massage_name_th ?? `บริการ #${mergedSlot.massage_id}`,
      });
      return;
    }

    await assignEmployee(employee, mergedSlot);
  };

  const handleMismatchConfirm = async () => {
    if (mismatchDialog.employee && mismatchDialog.slot) {
      await assignEmployee(mismatchDialog.employee, mismatchDialog.slot);
    }
    setMismatchDialog({ open: false, employee: null, slot: null, massageName: "" });
  };

  // ─── Build week dates & merged slots ───────────────────────────────────────
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date();
  const todayKey = toDateKey(today);
  const mergedSlots = buildMergedSlots(bookings, weekDates);

  // Stats
  const totalBookings = mergedSlots.length;
  const assignedCount = mergedSlots.filter((s) => s.employee_id).length;
  const pendingCount = totalBookings - assignedCount;

  return (
    <main className="flex-1 w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <CalendarDays className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-medium font-mitr text-foreground">
            จัดตารางงานรายสัปดาห์
          </h1>
          <p className="text-muted-foreground mt-2 font-sans text-sm">
            ลากชื่อพนักงานจากด้านซ้ายไปวางในช่องที่มี booking เท่านั้น
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button variant="outline" size="icon" onClick={prevWeek} className="rounded-full h-9 w-9 border-border/40">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToday} className="rounded-full px-5 h-9 border-border/40 font-sans text-sm">
            วันนี้
          </Button>
          <span className="px-4 py-2 text-sm font-medium font-mitr min-w-[220px] text-center">
            {formatWeekRange(weekMonday)}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek} className="rounded-full h-9 w-9 border-border/40">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary badges */}
        {!loading && (
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium font-mitr">{employees.length}</span>
              <span className="text-muted-foreground font-sans">พนักงาน</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 text-sm">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="font-medium font-mitr">{totalBookings}</span>
              <span className="text-muted-foreground font-sans">booking ทั้งหมด</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-400">
                <Clock className="h-4 w-4" />
                <span className="font-medium font-mitr">{pendingCount}</span>
                <span className="font-sans">รอจัดเทอราปิส</span>
              </div>
            )}
            {assignedCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium font-mitr">{assignedCount}</span>
                <span className="font-sans">จัดเทอราปิสแล้ว</span>
              </div>
            )}
          </div>
        )}

        {saving && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-primary font-sans">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังบันทึก...
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-sans">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4">
              {/* ─── Left Panel: Employee List ─────────────────────────── */}
              <div className="w-56 shrink-0">
                <div className="sticky top-20">
                  <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary/10 to-transparent">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium font-mitr">พนักงาน</span>
                        <span className="ml-auto text-xs text-muted-foreground font-sans">
                          {employees.length} คน
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1.5 max-h-[calc(100vh-260px)] overflow-y-auto">
                      {employees.map((emp) => (
                        <DraggableEmployee key={emp.employee_id} employee={emp} />
                      ))}
                      {employees.length === 0 && (
                        <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                          <Inbox className="h-7 w-7 opacity-30" />
                          <p className="text-xs font-sans">ไม่พบพนักงาน</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Right Panel: Weekly Schedule Grid ─────────────────── */}
              <div className="flex-1 overflow-x-auto">
                <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
                  <div className="min-w-[800px] p-3">
                    {/* Grid Header */}
                    <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-1">
                      <div />
                      {weekDates.map((date, i) => {
                        const isToday = toDateKey(date) === todayKey;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "text-center py-2.5 rounded-xl border text-sm font-medium font-mitr",
                              DAY_BG_COLORS[i],
                              isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                            )}
                          >
                            <span className="hidden md:inline">{DAY_LABELS[i]}</span>
                            <span className="md:hidden">{DAY_LABELS_SHORT[i]}</span>
                            <div className={cn(
                              "text-[11px] mt-0.5 font-sans",
                              isToday ? "text-primary font-bold" : "opacity-70"
                            )}>
                              {formatDateShort(date)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Grid Body — flex layout with relative day columns */}
                    <div className="flex gap-1">
                      {/* Time labels column */}
                      <div className="w-[60px] shrink-0 flex flex-col gap-1">
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="flex items-center justify-end pr-2 text-xs text-muted-foreground font-mono"
                            style={{ height: 52 }}
                          >
                            {hour}
                          </div>
                        ))}
                      </div>

                      {/* Day columns */}
                      {weekDates.map((_, dayIdx) => {
                        const daySlots = mergedSlots.filter(
                          (s) => s.dayIndex === dayIdx
                        );
                        return (
                          <div key={dayIdx} className="flex-1 relative">
                            {/* Background dashed cells */}
                            <div className="flex flex-col gap-1">
                              {HOURS.map((hour) => (
                                <div
                                  key={`bg-${dayIdx}-${hour}`}
                                  className="rounded-lg border border-dashed border-border/20"
                                  style={{ height: 52 }}
                                />
                              ))}
                            </div>
                            {/* Merged booking slots overlay */}
                            {daySlots.map((slot) => (
                              <DroppableMergedSlot
                                key={`${slot.booking_id}-${slot.massage_id}-${slot.startHourIndex}`}
                                slot={slot}
                                employees={employees}
                                massages={massages}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeEmployee ? (
                <DragOverlayContent employee={activeEmployee} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground font-sans">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-muted/30 border border-dashed" />
            <span>ว่าง (ไม่มี booking)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>มี booking – รอจัดเทอราปิส</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            <span>จัดเทอราปิสแล้ว (ลากวางทับเพื่อเปลี่ยน)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
            <span>แจ้งเตือนเมื่อทักษะไม่ตรง</span>
          </div>
        </div>
      </div>

      {/* Skill Mismatch Dialog */}
      <SkillMismatchDialog
        open={mismatchDialog.open}
        onClose={() => setMismatchDialog({ open: false, employee: null, slot: null, massageName: "" })}
        onConfirm={handleMismatchConfirm}
        employeeName={
          mismatchDialog.employee
            ? `${mismatchDialog.employee.first_name} ${mismatchDialog.employee.last_name}`
            : ""
        }
        massageName={mismatchDialog.massageName}
        saving={saving}
      />
    </main>
  );
}
