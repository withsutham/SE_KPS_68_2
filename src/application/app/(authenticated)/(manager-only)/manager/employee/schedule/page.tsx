"use client";

import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  XCircle,
  Search,
  BarChart3,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  image_url?: string | null;
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
  massage_name: string;
  massage_name_en?: string;
}

interface WorkSchedule {
  work_schedule_id: number;
  weekday: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  start_time: string;
  end_time: string;
  employee_id: number;
}

interface LeaveRecord {
  leave_record_id: number;
  approval_status: "pending" | "approved" | "rejected";
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  employee_id: number;
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
  columnIndex?: number;
  totalColumns?: number;
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

function formatDateShort(d: Date | string): string {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS_TH[dt.getMonth()]}`;
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

  // Calculate Overlaps for each day
  for (let dayIdx = 0; dayIdx < weekDates.length; dayIdx++) {
    const daySlots = result.filter(s => s.dayIndex === dayIdx);
    if (daySlots.length === 0) continue;

    // Sort by start time, then duration
    daySlots.sort((a, b) => {
      if (a.startHourIndex !== b.startHourIndex) return a.startHourIndex - b.startHourIndex;
      return b.spanCount - a.spanCount;
    });

    // Identify overlapping groups
    let groups: MergedSlot[][] = [];
    let lastEnd = -1;

    for (const slot of daySlots) {
      if (slot.startHourIndex >= lastEnd) {
        groups.push([slot]);
      } else {
        groups[groups.length - 1].push(slot);
      }
      lastEnd = Math.max(lastEnd, slot.startHourIndex + slot.spanCount);
    }

    // For each group, assign columns
    for (const group of groups) {
      const columns: MergedSlot[][] = [];
      for (const slot of group) {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const lastInColumn = columns[i][columns[i].length - 1];
          if (slot.startHourIndex >= lastInColumn.startHourIndex + lastInColumn.spanCount) {
            columns[i].push(slot);
            slot.columnIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          slot.columnIndex = columns.length;
          columns.push([slot]);
        }
      }
      // Assign totalColumns based on max concurrent slots in the group
      // A simple heuristic: totalColumns = columns.length for the whole group
      for (const slot of group) {
        slot.totalColumns = columns.length;
      }
    }
  }

  return result;
}

// ─── Day abbreviations for badges ─────────────────────────────────────────────
const DAY_SHORT: Record<string, string> = {
  MON: "จ.", TUE: "อ.", WED: "พ.", THU: "พฤ.", FRI: "ศ.", SAT: "ส.", SUN: "อา."
};
const DAY_ORDER: ("MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Draggable Employee Card ──────────────────────────────────────────────────
function DraggableEmployee({ employee, schedules, leaveRecords, bookings }: {
  employee: Employee;
  schedules: WorkSchedule[];
  leaveRecords: LeaveRecord[];
  bookings: BookingDetail[];
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `employee-${employee.employee_id}`,
    data: { employee },
  });

  // Compute shift day badges
  const myDays = new Set(schedules.filter(s => s.employee_id === employee.employee_id).map(s => s.weekday));
  const sortedDays = DAY_ORDER.filter(d => myDays.has(d));

  // Check for leave collisions: are there bookings assigned to this employee
  // that fall inside an approved leave window?
  const approvedLeaves = leaveRecords.filter(
    l => l.employee_id === employee.employee_id && l.approval_status === "approved"
  );
  const myBookings = bookings.filter(b => b.employee_id === employee.employee_id);
  
  const employeeCollisions = myBookings.filter(b => {
    return approvedLeaves.some(leave => {
      const leaveStart = new Date(leave.start_datetime).getTime();
      const leaveEnd = new Date(leave.end_datetime).getTime();
      const bStart = new Date(b.massage_start_dateTime).getTime();
      const bEnd = new Date(b.massage_end_dateTime).getTime();
      return bStart < leaveEnd && bEnd > leaveStart;
    });
  });

  const collisionCount = employeeCollisions.length;

  // Find earliest collision date for navigation
  const firstCollisionDate = useMemo(() => {
    if (employeeCollisions.length === 0) return null;
    return new Date(Math.min(...employeeCollisions.map(b => new Date(b.massage_start_dateTime).getTime())));
  }, [employeeCollisions]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (firstCollisionDate) {
      const monday = getMonday(firstCollisionDate);
      const weekKey = toDateKey(monday);
      router.push(`/manager/employee/schedule?week=${weekKey}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 select-none",
        "bg-background/60 border-border/30 hover:border-primary/40 hover:bg-primary/5",
        isDragging && "opacity-30 scale-95"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden relative">
          {employee.image_url ? (
            <img src={employee.image_url} alt={`${employee.first_name}`} className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium font-mitr truncate max-w-[120px]">
              {employee.first_name} {employee.last_name}
            </p>
            {collisionCount > 0 && (
              <button
                type="button"
                onClick={handleBadgeClick}
                onPointerDown={(e) => e.stopPropagation()}
                title="คลิกเพื่อไปที่สัปดาห์ที่มีปัญหา"
                className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-background hover:scale-110 active:scale-95 transition-transform"
              >
                {collisionCount}
              </button>
            )}
          </div>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      </div>
      {/* Day shift badges — show all 7 days */}
      <div className="flex gap-[3px] ml-11">
        {DAY_ORDER.map(d => {
          const hasShift = myDays.has(d);
          return (
            <span
              key={d}
              className={cn(
                "text-[10px] w-[26px] text-center py-[3px] rounded font-sans font-medium leading-none transition-colors",
                hasShift
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground/30 border border-border/30"
              )}
            >
              {DAY_SHORT[d]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Booking Details Dialog ───────────────────────────────────────────────────
function BookingDetailsDialog({
  state,
  onClose,
  onUnassign,
  employees,
  massages,
  saving,
}: {
  state: { open: boolean; slot: MergedSlot | null };
  onClose: () => void;
  onUnassign: (slot: MergedSlot) => void;
  employees: Employee[];
  massages: Massage[];
  saving: boolean;
}) {
  if (!state.slot) return null;

  const slot = state.slot;
  const massage = massages.find((m) => m.massage_id === slot.massage_id);
  const employee = employees.find((e) => e.employee_id === slot.employee_id);
  const startTime = new Date(slot.bookingDetails[0].massage_start_dateTime);
  const endTime = new Date(slot.bookingDetails[slot.bookingDetails.length - 1].massage_end_dateTime);

  return (
    <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="font-mitr flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" /> รายละเอียดการจอง #{slot.booking_id}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2 font-sans">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground text-sm">บริการ</span>
              <span className="font-medium">{massage?.massage_name ?? `บริการ #${slot.massage_id}`}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground text-sm">วัน/เวลา</span>
              <span className="font-medium">
                {formatDateShort(startTime)} | {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground text-sm">ระยะเวลา</span>
              <span className="font-medium">{slot.spanCount} ชั่วโมง</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground text-sm">พนักงานที่ได้รับมอบหมาย</span>
              {employee ? (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {employee.image_url ? (
                      <img src={employee.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-3 w-3 text-primary" />
                    )}
                  </div>
                  <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                </div>
              ) : (
                <span className="text-amber-500 font-medium">รอจัดคน</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {employee && (
              <Button
                variant="destructive"
                className="w-full rounded-xl gap-2 font-mitr font-normal h-11"
                onClick={() => onUnassign(slot)}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                นำพนักงานออก (ยกเลิกการจัดคิว)
              </Button>
            )}
            <Button variant="outline" className="w-full rounded-xl font-mitr font-normal h-11" onClick={onClose}>
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Droppable Merged Slot ────────────────────────────────────────────────────
function DroppableMergedSlot({
  slot,
  employees,
  massages,
  leaveRecords,
  onClick,
}: {
  slot: MergedSlot;
  employees: Employee[];
  massages: Massage[];
  leaveRecords: LeaveRecord[];
  onClick: (slot: MergedSlot) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `merged-${slot.dayIndex}-${slot.startHourIndex}-${slot.booking_id}`,
    data: { mergedSlot: slot },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: `assigned-${slot.booking_id}`,
    data: { assignedSlot: slot },
    disabled: !slot.employee_id,
  });

  const getEmployeeName = (id: number | null) => {
    if (!id) return null;
    const emp = employees.find((e) => e.employee_id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : `#${id}`;
  };

  const massage = massages.find((m) => m.massage_id === slot.massage_id);
  const massageName = massage?.massage_name ?? `บริการ #${slot.massage_id}`;

  const heightPx = slot.spanCount * 52 + (slot.spanCount - 1) * 4;

  // Check if this slot's assigned employee has an approved leave that overlaps
  const hasLeaveCollision = slot.employee_id ? leaveRecords.some(l => {
    if (l.employee_id !== slot.employee_id || l.approval_status !== "approved") return false;
    const leaveStart = new Date(l.start_datetime).getTime();
    const leaveEnd = new Date(l.end_datetime).getTime();
    const bStart = new Date(slot.bookingDetails[0].massage_start_dateTime).getTime();
    const bEnd = new Date(slot.bookingDetails[slot.bookingDetails.length - 1].massage_end_dateTime).getTime();
    return bStart < leaveEnd && bEnd > leaveStart;
  }) : false;

  const slotColor = isOver
    ? "bg-primary/20 border-primary shadow-lg shadow-primary/10 scale-[1.02] z-10"
    : hasLeaveCollision
      ? "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700 ring-1 ring-red-200"
      : slot.employee_id
        ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700"
        : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700";

  const badgeColor = hasLeaveCollision
    ? "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400"
    : slot.employee_id
      ? "border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
      : "border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-400";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute left-0 right-0 rounded-xl border transition-all duration-200 p-2 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/30",
        slotColor,
        isDragging && "opacity-0"
      )}
      style={{
        top: `${slot.startHourIndex * (52 + 4)}px`,
        height: `${heightPx}px`,
        left: slot.totalColumns && slot.totalColumns > 1 
          ? `${(slot.columnIndex || 0) * (100 / slot.totalColumns)}%` 
          : "0",
        width: slot.totalColumns && slot.totalColumns > 1 
          ? `${100 / slot.totalColumns}%` 
          : "100%",
      }}
      onPointerDown={(e) => {
        // If it's a click (not starting a drag), open dialog
        // Library's sensor distance constraint will handle distinguishing drag vs click
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(slot);
      }}
    >
      <div className="flex flex-col gap-1 h-full relative" ref={setDraggableRef} {...listeners} {...attributes}>
        <Badge
          variant="outline"
          className={cn("text-[10px] w-fit px-1.5 py-0 font-sans", badgeColor)}
        >
          {massageName}
        </Badge>
        {slot.employee_id ? (
          <div className="flex items-center gap-1">
            {hasLeaveCollision ? (
              <>
                <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                <span className="text-[11px] font-medium text-red-600 dark:text-red-400 truncate font-sans">
                  {getEmployeeName(slot.employee_id)}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 truncate font-sans">
                  {getEmployeeName(slot.employee_id)}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-sans">
              รอจัดคน
            </span>
          </div>
        )}
        {hasLeaveCollision && (
          <span className="text-[9px] text-red-500 font-sans font-medium">⚠ หลุดจากการลา</span>
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
      <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 overflow-hidden">
        {employee.image_url ? (
          <img src={employee.image_url} alt={`${employee.first_name}`} className="h-full w-full object-cover" />
        ) : (
          <User className="h-4 w-4 text-primary" />
        )}
      </div>
      <p className="text-sm font-medium font-mitr">
        {employee.first_name} {employee.last_name}
      </p>
    </div>
  );
}

function DragOverlayAssignedContent({ slot, employees, massages }: { slot: MergedSlot; employees: Employee[]; massages: Massage[] }) {
  const emp = employees.find(e => e.employee_id === slot.employee_id);
  const massage = massages.find(m => m.massage_id === slot.massage_id);
  return (
    <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl border border-red-400 bg-red-50/90 shadow-xl shadow-red-200 cursor-grabbing backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-500" />
        <p className="text-sm font-medium font-mitr text-red-700">
          ยกเลิกจัดคิว {emp?.first_name} {emp?.last_name}
        </p>
      </div>
      <p className="text-[10px] font-sans text-red-600/80">
        ปล่อยเมาส์ที่ว่างเพื่อคอมเฟิร์มการนำออก
      </p>
    </div>
  );
}

// ─── Block Assignment Dialog ─────────────────────────────────────────────────
function BlockAssignmentDialog({
  state,
  onClose,
}: {
  state: { open: boolean; title: string; reason: string };
  onClose: () => void;
}) {
  return (
    <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full border-red-200 dark:border-red-900/30">
        <DialogHeader>
          <DialogTitle className="font-mitr flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" /> {state.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm font-sans text-foreground/80 leading-relaxed">{state.reason}</p>
          <div className="flex justify-end mt-2">
            <Button variant="default" onClick={onClose} className="rounded-full font-sans bg-destructive hover:bg-destructive/90 text-white">
              กลับไปแก้ไข
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Confirm Dialog ───────────────────────────────────────────────────
function AssignConfirmDialog({
  state,
  onClose,
  onConfirm,
  saving,
  massages,
}: {
  state: { open: boolean; employee: Employee | null; slot: MergedSlot | null; hasSkill: boolean; };
  onClose: () => void;
  onConfirm: () => void;
  saving: boolean;
  massages: Massage[];
}) {
  const empName = state.employee ? `${state.employee.first_name} ${state.employee.last_name}` : "";
  const massageName = state.slot ? (massages.find(m => m.massage_id === state.slot?.massage_id)?.massage_name ?? "บริการ") : "";
  const d = state.slot ? new Date(state.slot.bookingDetails[0].massage_start_dateTime) : new Date();

  return (
    <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mitr flex items-center gap-2">
            {!state.hasSkill ? (
              <><AlertTriangle className="h-5 w-5 text-yellow-500" /> จัดลงบริการที่ไม่มีทักษะ</>
            ) : (
              <><CheckCircle2 className="h-5 w-5 text-primary" /> ยืนยันการจัดพนักงาน</>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm text-foreground font-sans">
            ต้องการจัดพนักงาน <span className="font-medium">{empName}</span> ให้ทำบริการ <span className="font-medium text-primary">{massageName}</span> ในวันที่ {formatDateShort(d)} เวลา {HOURS[state.slot?.startHourIndex ?? 0]} น. หรือไม่?
          </p>

          {!state.hasSkill && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-xl text-sm font-sans flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>พนักงานคนนี้ไม่มีทักษะสำหรับบริการนี้แนบไว้ในระบบ คุณแน่ใจหรือไม่ที่จะจัดพนักงานคนนี้?</p>
            </div>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={onClose} className="rounded-full font-sans">
              ยกเลิก
            </Button>
            <Button onClick={onConfirm} disabled={saving} className={cn("rounded-full font-sans gap-2", !state.hasSkill ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "")}>
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {state.hasSkill ? "ยืนยันจัดพนักงาน" : "ยืนยัน (ข้ามการเตือน)"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Monthly Stats Dialog ───────────────────────────────────────────────────
function MonthlyStatsDialog({
  open,
  onClose,
  weekMonday,
  employees,
  massages,
}: {
  open: boolean;
  onClose: () => void;
  weekMonday: Date;
  employees: Employee[];
  massages: Massage[];
}) {
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState<{ empName: string; hours: number; services: { name: string; count: number }[] }[] | null>(null);

  useEffect(() => {
    if (open) {
      loadStats();
    } else {
      setStatsData(null);
    }
  }, [open, weekMonday]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const y = weekMonday.getFullYear();
      const m = String(weekMonday.getMonth() + 1).padStart(2, "0");
      const startDate = `${y}-${m}-01T00:00:00+07:00`;
      
      const nextMonthD = new Date(weekMonday.getFullYear(), weekMonday.getMonth() + 1, 1);
      nextMonthD.setDate(nextMonthD.getDate() - 1);
      const endDay = String(nextMonthD.getDate()).padStart(2, "0");
      const endDate = `${y}-${m}-${endDay}T23:59:59+07:00`;

      const res = await fetch(`/api/booking_detail?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`);
      const json = await res.json();
      const allMonthBookings: BookingDetail[] = json.data || [];

      const empStats = employees.map(emp => {
        const empBookings = allMonthBookings.filter(b => b.employee_id === emp.employee_id);
        let totalHours = 0;
        const serviceCounts: Record<number, number> = {};

        empBookings.forEach(b => {
           const t1 = new Date(b.massage_start_dateTime).getTime();
           const t2 = new Date(b.massage_end_dateTime).getTime();
           const hrs = Math.max(1, Math.ceil((t2 - t1) / (1000 * 60 * 60)));
           totalHours += hrs;
           serviceCounts[b.massage_id] = (serviceCounts[b.massage_id] || 0) + 1;
        });

        const servicesArr = Object.entries(serviceCounts).map(([mId, count]) => {
           const m = massages.find(x => x.massage_id === Number(mId));
           const displayName = m?.massage_name ? `บริการ #${mId} - ${m.massage_name}` : `บริการ #${mId}`;
           return {
             name: displayName,
             count
           };
        });

        servicesArr.sort((a, b) => a.count - b.count);

        return {
          empName: `${emp.first_name} ${emp.last_name}`,
          hours: totalHours,
          services: servicesArr
        };
      });

      setStatsData(empStats);
    } catch(err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col p-0 font-mitr">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/20">
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">📊</span> สถิติชั่วโมงและบริการประจำเดือน {MONTHS_TH[weekMonday.getMonth()]} {weekMonday.getFullYear() + 543}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-muted/10 font-sans">
          {statsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-sans text-sm">กำลังโหลดข้อมูลดึงสถิติของทั้งเดือน...</p>
            </div>
          ) : statsData ? (
            <div className="grid gap-4 md:grid-cols-2">
              {statsData.map((stat, idx) => (
                <div key={idx} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary/40 transition-colors">
                  <div className="p-3 border-b bg-muted/40 flex justify-between items-center shrink-0">
                    <div className="font-mitr font-medium truncate pr-2 text-[15px]">{stat.empName}</div>
                    <Badge variant="outline" className="shrink-0 bg-background font-sans text-xs border-primary/30 text-primary px-2">
                      {stat.hours} ชม.
                    </Badge>
                  </div>
                  <div className="p-3 bg-card flex-1 font-sans text-sm">
                    {stat.services.length === 0 ? (
                      <div className="text-muted-foreground/60 text-xs italic text-center py-5">ยังไม่ได้ให้บริการใดๆ เลย</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {stat.services.map((s, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-muted-foreground line-clamp-1 text-xs truncate mr-2" title={s.name}>{s.name}</span>
                            <span className="font-medium text-[11px] bg-muted px-2 py-0.5 rounded-md border shrink-0 min-w-14 text-center">{s.count} ครั้ง</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-red-500 text-center py-8">เกิดข้อผิดพลาดในการดึงข้อมูล</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Massage Filter Dialog ──────────────────────────────────────────────────
function MassageFilterDialog({
  open,
  onClose,
  massages,
  currentId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  massages: Massage[];
  currentId: number | 'all';
  onSelect: (id: number | 'all') => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col p-0 font-sans">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/5 backdrop-blur-sm">
          <DialogTitle className="font-mitr text-xl flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" /> เลือกพนักงานตามทักษะบริการ
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <button
               onClick={() => { onSelect('all'); onClose(); }}
               className={cn(
                 "group relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all duration-200",
                 currentId === 'all' 
                   ? "bg-primary/10 border-primary shadow-sm shadow-primary/20 ring-1 ring-primary/20" 
                   : "bg-background hover:bg-primary/5 hover:border-primary/30 border-border/40"
               )}
             >
               <div className="flex items-center gap-2">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   currentId === 'all' ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
                 )} />
                 <span className="font-mitr font-medium text-base">บริการทั้งหมด</span>
               </div>
               <span className="text-[12px] text-muted-foreground leading-relaxed pl-4">
                 แสดงพนักงานทุกคนในระบบโดยไม่ระบุประเภทของการนวด
               </span>
               {currentId === 'all' && (
                 <div className="absolute top-3 right-3">
                   <CheckCircle2 className="h-4 w-4 text-primary" />
                 </div>
               )}
             </button>
             
             {massages.map((m) => (
               <button
                 key={m.massage_id}
                 onClick={() => { onSelect(m.massage_id); onClose(); }}
                 className={cn(
                   "group relative flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all duration-200",
                   currentId === m.massage_id 
                     ? "bg-primary/10 border-primary shadow-sm shadow-primary/20 ring-1 ring-primary/20" 
                     : "bg-background hover:bg-primary/5 hover:border-primary/30 border-border/40"
                 )}
               >
                 <div className="flex items-center gap-2">
                   <div className={cn(
                     "w-2 h-2 rounded-full",
                     currentId === m.massage_id ? "bg-primary animate-pulse" : "bg-primary/20 group-hover:bg-primary/40"
                   )} />
                   <span className="font-mitr font-medium text-base">{m.massage_name}</span>
                 </div>
                 {m.massage_name_en && (
                   <span className="text-[12px] text-muted-foreground leading-relaxed pl-4 uppercase tracking-wider font-sans opacity-80">
                     {m.massage_name_en}
                   </span>
                 )}
                 {currentId === m.massage_id && (
                   <div className="absolute top-3 right-3">
                     <CheckCircle2 className="h-4 w-4 text-primary" />
                   </div>
                 )}
               </button>
             ))}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-muted/20 flex justify-end items-center gap-4">
           <p className="text-[11px] text-muted-foreground font-sans italic mr-auto">
             * การเลือกบริการจะกรองเฉพาะพนักงานที่มี "ทักษะ" นั้นๆ
           </p>
           <Button variant="ghost" onClick={onClose} className="rounded-full px-6 font-mitr font-normal hover:bg-primary/5">
              ปิด
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function WeeklySchedulePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [allBookings, setAllBookings] = useState<BookingDetail[]>([]);
  const [massages, setMassages] = useState<Massage[]>([]);
  const [skills, setSkills] = useState<TherapistSkill[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchParams = useSearchParams();
  const [weekMonday, setWeekMonday] = useState(() => {
    const weekParam = searchParams.get('week');
    if (weekParam) {
      const parsed = new Date(weekParam);
      if (!isNaN(parsed.getTime())) return getMonday(parsed);
    }
    return getMonday(new Date());
  });
  
  // Watch for week param changes from client-side navigation
  useEffect(() => {
    const weekParam = searchParams.get('week');
    if (weekParam) {
      const parsed = new Date(weekParam);
      if (!isNaN(parsed.getTime())) {
        setWeekMonday(getMonday(parsed));
      }
    }
  }, [searchParams]);

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [activeAssignedSlot, setActiveAssignedSlot] = useState<MergedSlot | null>(null);

  // Confirm dialog state combining skill mismatch warning
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    employee: Employee | null;
    slot: MergedSlot | null;
    hasSkill: boolean;
  }>({ open: false, employee: null, slot: null, hasSkill: true });

  const [blockDialog, setBlockDialog] = useState<{
    open: boolean;
    title: string;
    reason: string;
  }>({ open: false, title: "", reason: "" });

  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    slot: MergedSlot | null;
  }>({ open: false, slot: null });

  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMassageId, setFilterMassageId] = useState<number | 'all'>('all');
  const [filterStartTime, setFilterStartTime] = useState<string>("");
  const [filterEndTime, setFilterEndTime] = useState<string>("");
  const [filterDays, setFilterDays] = useState<string[]>([]);
  const [massageDialogOpen, setMassageDialogOpen] = useState(false);

  // Filter employees by search and massage skill
  const filteredEmployees = useMemo(() => {
    let result = employees;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
      );
    }
    
    // Filter by massage skill
    if (filterMassageId !== 'all') {
      result = result.filter(emp => 
        skills.some(s => s.employee_id === emp.employee_id && s.massage_id === filterMassageId)
      );
    }

    // Filter by time range (Working hours)
    if (filterStartTime || filterEndTime) {
      result = result.filter(emp => {
        const empSchs = schedules.filter(s => s.employee_id === emp.employee_id);
        const start = filterStartTime || "00:00";
        const end = filterEndTime || "23:59";
        
        return empSchs.some(sch => {
          const schStart = sch.start_time.slice(0, 5);
          const schEnd = sch.end_time.slice(0, 5);
          // Overlap: StartA < EndB AND StartB < EndA
          return schStart < end && start < schEnd;
        });
      });
    }

    // Filter by specific days
    if (filterDays.length > 0) {
      result = result.filter(emp => {
        const empDays = new Set(schedules.filter(s => s.employee_id === emp.employee_id).map(s => s.weekday));
        return filterDays.some(d => empDays.has(d as any));
      });
    }
    
    // Sort: Priority to those with leave collisions (Global)
    result = [...result].sort((a, b) => {
      const getCollisionCount = (emp: Employee) => {
        const approvedLeaves = leaveRecords.filter(l => l.employee_id === emp.employee_id && l.approval_status === "approved");
        const myBookings = allBookings.filter(b => b.employee_id === emp.employee_id);
        return myBookings.filter(b => {
          return approvedLeaves.some(l => {
            const bStart = new Date(b.massage_start_dateTime).getTime();
            const bEnd = new Date(b.massage_end_dateTime).getTime();
            const lStart = new Date(l.start_datetime).getTime();
            const lEnd = new Date(l.end_datetime).getTime();
            return bStart < lEnd && bEnd > lStart;
          });
        }).length;
      };

      const countA = getCollisionCount(a);
      const countB = getCollisionCount(b);
      return countB - countA; // Descending
    });
    
    return result;
  }, [employees, searchQuery, filterMassageId, skills, filterStartTime, filterEndTime, filterDays, schedules, leaveRecords, allBookings]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const weekStartStr = toDateKey(weekMonday);
      const [empRes, bdRes, allBdRes, massageRes, skillRes, schRes, leaveRes] = await Promise.all([
        fetch("/api/employee"),
        fetch(`/api/booking_detail?week_start=${weekStartStr}`),
        fetch("/api/booking_detail"),
        fetch("/api/massage"),
        fetch("/api/therapist_massage_skill"),
        fetch("/api/work_schedule"),
        fetch("/api/leave_record"),
      ]);
      const [empJson, bdJson, allBdJson, massageJson, skillJson, schJson, leaveJson] = await Promise.all([
        empRes.json(),
        bdRes.json(),
        allBdRes.json(),
        massageRes.json(),
        skillRes.json(),
        schRes.json(),
        leaveRes.json()
      ]);
      setEmployees(empJson.data ?? []);
      setBookings(bdJson.data ?? []);
      setAllBookings(allBdJson.data ?? []);
      setMassages(massageJson.data ?? []);
      setSkills(skillJson.data ?? []);
      setSchedules(schJson.data ?? []);
      setLeaveRecords(leaveJson.data ?? []);
    } catch {
      setEmployees([]);
      setBookings([]);
      setAllBookings([]);
      setSchedules([]);
      setLeaveRecords([]);
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
      window.dispatchEvent(new Event("schedule-refresh"));
    } catch (err) {
      console.error("Failed to assign employee:", err);
    } finally {
      setSaving(false);
    }
  };

  const unassignEmployee = async (slot: MergedSlot) => {
    setSaving(true);
    try {
      await Promise.all(
        slot.bookingDetails.map((b) =>
          fetch(`/api/booking_detail/${b.booking_detail_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: null }),
          })
        )
      );
      await fetchData();
      window.dispatchEvent(new Event("schedule-refresh"));
      setDetailsDialog({ open: false, slot: null });
    } catch (err) {
      console.error("Failed to unassign employee:", err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Drag Handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const emp = event.active.data.current?.employee as Employee | undefined;
    const assignedSlot = event.active.data.current?.assignedSlot as MergedSlot | undefined;
    
    if (emp) setActiveEmployee(emp);
    if (assignedSlot) setActiveAssignedSlot(assignedSlot);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveEmployee(null);
    setActiveAssignedSlot(null);
    const { over, active } = event;

    // Handle Drag out to Unassign
    if (!over && active.id.toString().startsWith("assigned-")) {
      const assignedSlot = active.data.current?.assignedSlot as MergedSlot | undefined;
      if (assignedSlot) {
        await unassignEmployee(assignedSlot);
      }
      return;
    }

    if (!over || !active) return;

    const employee = active.data.current?.employee as Employee | undefined;
    const mergedSlot = over.data.current?.mergedSlot as MergedSlot | undefined;
    if (!employee || !mergedSlot) return;

    // Boundary Validation Constants
    const bookingStartStr = mergedSlot.bookingDetails[0].massage_start_dateTime;
    const bookingEndStr = mergedSlot.bookingDetails[mergedSlot.bookingDetails.length - 1].massage_end_dateTime;
    const bookingStart = new Date(bookingStartStr);
    const bookingEnd = new Date(bookingEndStr);
    
    // Check 1: Leave Overlap (approved leaves only)
    const hasLeaveOverlap = leaveRecords.some(l => {
      if (l.employee_id !== employee.employee_id || l.approval_status !== "approved") return false;
      const leaveStart = new Date(l.start_datetime);
      const leaveEnd = new Date(l.end_datetime);
      // Overlap condition
      return bookingStart < leaveEnd && bookingEnd > leaveStart;
    });

    if (hasLeaveOverlap) {
      setBlockDialog({
         open: true,
         title: "พนักงานกำลังลางาน",
         reason: "พนักงานรายนี้ได้ทำการยื่นลางาน (ที่ถูกอนุมัติอล้ว) ในช่วงเวลาที่คุณพยายามเรียกตัว โปรดทำใจและเลือกพนักงานคนอื่นแทน"
      });
      return;
    }

    // Check 2: Shift Validation (Base Schedule)
    const WEEKDAYS: ("SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT")[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const slotWeekday = WEEKDAYS[bookingStart.getDay()];
    
    const empShift = schedules.find(s => s.employee_id === employee.employee_id && s.weekday === slotWeekday);
    
    let isOffShift = true;
    if (empShift) {
       const pad0 = (n: number) => String(n).padStart(2, '0');
       const bStartStr = `${pad0(bookingStart.getHours())}:${pad0(bookingStart.getMinutes())}`;
       const bEndStr = `${pad0(bookingEnd.getHours())}:${pad0(bookingEnd.getMinutes())}`;
       
       const sStartStr = empShift.start_time.slice(0, 5);
       const sEndStr = empShift.end_time.slice(0, 5);
       
       // Compare strict boundaries
       if (bStartStr >= sStartStr && bEndStr <= sEndStr) {
          isOffShift = false;
       }
    }

    if (isOffShift) {
      const dayLabels: Record<string, string> = { "SUN": "วันอาทิตย์", "MON": "วันจันทร์", "TUE": "วันอังคาร", "WED": "วันพุธ", "THU": "วันพฤหัสบดี", "FRI": "วันศุกร์", "SAT": "วันเสาร์" };
      
      setBlockDialog({
         open: true,
         title: "จัดให้บริการนอกเหนือเวลาทำงานไม่ได้",
         reason: `เวลาการจองคิวนี้ไม่ได้อยู่ภายใต้เวลาทำงานพื้นฐานของพนักงานใน${dayLabels[slotWeekday]} (โปรดให้แน่ใจว่าพนักงานมีเวลาทำงานในเวลาดังกล่าว หรือจัดพนักงานคนอื่นแทน)`
      });
      return;
    }

    // Check skill match
    const hasSkill = skills.some(
      (s) =>
        s.employee_id === employee.employee_id &&
        s.massage_id === mergedSlot.massage_id
    );

    setConfirmDialog({
      open: true,
      employee,
      slot: mergedSlot,
      hasSkill,
    });
  };

  const handleConfirmAssignment = async () => {
    if (confirmDialog.employee && confirmDialog.slot) {
      await assignEmployee(confirmDialog.employee, confirmDialog.slot);
    }
    setConfirmDialog({ open: false, employee: null, slot: null, hasSkill: true });
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

  // Stats (Sidebar Dashboard) - Based on All Data (matches Global Menu)
  const globalUnassignedCount = allBookings.filter(b => !b.employee_id).length;
  const globalApprovedLeaves = leaveRecords.filter(l => l.approval_status === "approved");
  const globalLeaveCollisionCount = allBookings.filter(b => {
    if (!b.employee_id) return false;
    return globalApprovedLeaves.some(l => {
      if (l.employee_id !== b.employee_id) return false;
      const bStart = new Date(b.massage_start_dateTime).getTime();
      const bEnd = new Date(b.massage_end_dateTime).getTime();
      const lStart = new Date(l.start_datetime).getTime();
      const lEnd = new Date(l.end_datetime).getTime();
      return bStart < lEnd && bEnd > lStart;
    });
  }).length;

  const totalBookings = mergedSlots.length;
  const assignedSlots = mergedSlots.filter((s) => s.employee_id);
  
  // Count slots with leave collision (Current Week Only)
  const currentWeekCollisionCount = assignedSlots.filter(slot => {
    return globalApprovedLeaves.some(l => {
      if (l.employee_id !== slot.employee_id) return false;
      const lStart = new Date(l.start_datetime).getTime();
      const lEnd = new Date(l.end_datetime).getTime();
      const bStart = new Date(slot.bookingDetails[0].massage_start_dateTime).getTime();
      const bEnd = new Date(slot.bookingDetails[slot.bookingDetails.length - 1].massage_end_dateTime).getTime();
      return bStart < lEnd && bEnd > lStart;
    });
  }).length;
  
  const assignedCount = assignedSlots.length - currentWeekCollisionCount;
  const pendingCount = totalBookings - assignedSlots.length;

  return (
    <main className="flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden bg-background">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* ─── SIDEBAR: Employee List (same as 5.4) ─────────────── */}
        <div className="w-full md:w-72 shrink-0 border-r border-border/40 bg-card/40 flex flex-col h-[calc(100vh-60px)] z-10">
          <div className="px-4 py-3 border-b border-border/40 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-mitr font-medium text-sm">พนักงาน</h2>
                <div className="flex gap-1 items-center">
                  {globalLeaveCollisionCount > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-background">
                      {globalLeaveCollisionCount}
                    </span>
                  )}
                  {globalUnassignedCount > 0 && (
                    <span className="shrink-0 min-w-5 h-5 px-1 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-background">
                      {globalUnassignedCount}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground font-sans">
                {employees.length} คน
              </span>
            </div>
            {/* Summary button at top */}
            <Button 
              variant="secondary" 
              onClick={() => setStatsDialogOpen(true)}
              className="w-full font-mitr text-xs gap-2 border shadow-sm bg-white hover:bg-slate-50 hover:text-primary dark:bg-card text-foreground transition-all h-8"
            >
              <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
              สรุปรวมประจำเดือน
            </Button>
            {/* Search */}
            <div className="relative space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input 
                  placeholder="ค้นหาชื่อพนักงาน..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-background/80 border-border/40 text-sm font-sans rounded-lg"
                />
              </div>
              
              {/* Working Hours Filter */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-sans ml-1">เวลาเริ่ม (ตั้งแต่)</span>
                  <Input 
                    type="time" 
                    value={filterStartTime} 
                    onChange={(e) => setFilterStartTime(e.target.value)}
                    className="h-8 text-xs font-sans bg-background/80"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-sans ml-1">เวลาเลิก (ถึง)</span>
                  <Input 
                    type="time" 
                    value={filterEndTime} 
                    onChange={(e) => setFilterEndTime(e.target.value)}
                    className="h-8 text-xs font-sans bg-background/80"
                  />
                </div>
              </div>

              {/* Day Filter */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground font-sans ml-1">วันทำงาน</span>
                <div className="flex gap-1">
                  {DAY_ORDER.map(d => {
                    const isActive = filterDays.includes(d);
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setFilterDays(prev => 
                            isActive ? prev.filter(x => x !== d) : [...prev, d]
                          );
                        }}
                        className={cn(
                          "text-[10px] w-8 h-7 flex items-center justify-center rounded-lg font-sans font-medium transition-all border",
                          isActive 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background/80 text-muted-foreground/60 border-border/40 hover:border-primary/40 hover:text-primary"
                        )}
                      >
                        {DAY_SHORT[d]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skill Filter Button (Dialog Trigger) */}
              <Button
                variant="outline"
                onClick={() => setMassageDialogOpen(true)}
                className="w-full h-9 justify-between font-sans text-xs bg-background/80 border-border/40 hover:bg-primary/5 hover:border-primary/40 transition-all rounded-lg px-3 group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Filter className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="truncate">
                    {filterMassageId === 'all' 
                      ? "เลือกตามบริการ (ทั้งหมด)" 
                      : (massages.find(m => m.massage_id === filterMassageId)?.massage_name ?? "เลือกบริการ")}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center opacity-50">
                <Inbox className="h-8 w-8 mb-2" />
                <p className="font-sans text-sm">{searchQuery ? "ไม่พบผลลัพธ์" : "ไม่พบพนักงาน"}</p>
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <DraggableEmployee
                  key={emp.employee_id}
                  employee={emp}
                  schedules={schedules}
                  leaveRecords={leaveRecords}
                  bookings={allBookings}
                />
              ))
            )}
          </div>
        </div>

        {/* ─── MAIN: Schedule Grid ──────────────────────────────── */}
        <div className="flex-1 h-[calc(100vh-60px)] overflow-y-auto overflow-x-auto bg-muted/5">
          <div className="p-4 md:px-6 md:pt-5 md:pb-24">
            {/* Top bar: Title + Week Navigation */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-2xl font-mitr font-medium text-foreground">จัดตารางงานรายสัปดาห์</h1>
                <p className="text-muted-foreground font-sans text-sm mt-0.5">ลากชื่อพนักงานจากด้านซ้ายไปวางในช่องที่มี booking</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={prevWeek} className="rounded-full h-9 w-9 border-border/40">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToday} className="rounded-full px-4 h-9 border-border/40 font-sans text-sm">
                  วันนี้
                </Button>
                <span className="px-3 py-2 text-sm font-medium font-mitr min-w-[200px] text-center">
                  {formatWeekRange(weekMonday)}
                </span>
                <Button variant="outline" size="icon" onClick={nextWeek} className="rounded-full h-9 w-9 border-border/40">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Summary badges */}
            {!loading && (
              <div className="flex flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 text-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="font-medium font-mitr">{totalBookings}</span>
                  <span className="text-muted-foreground font-sans">booking</span>
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
                    <span className="font-sans">จัดแล้ว</span>
                  </div>
                )}
                {currentWeekCollisionCount > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium font-mitr">{currentWeekCollisionCount}</span>
                    <span className="font-sans">หลุดจากการลา</span>
                  </div>
                )}
              </div>
            )}

            {saving && (
              <div className="flex items-center gap-2 mb-4 text-sm text-primary font-sans">
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
              <>
                {/* Schedule Grid */}
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

                    {/* Grid Body */}
                    <div className="flex gap-1">
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

                      {weekDates.map((_, dayIdx) => {
                        const daySlots = mergedSlots.filter(
                          (s) => s.dayIndex === dayIdx
                        );
                        return (
                          <div key={dayIdx} className="flex-1 relative">
                            <div className="flex flex-col gap-1">
                              {HOURS.map((hour) => (
                                <div
                                  key={`bg-${dayIdx}-${hour}`}
                                  className="rounded-lg border border-dashed border-border/20"
                                  style={{ height: 52 }}
                                />
                              ))}
                            </div>
                            {daySlots.map((slot) => (
                              <DroppableMergedSlot
                                key={`${slot.booking_id}-${slot.massage_id}-${slot.startHourIndex}`}
                                slot={slot}
                                employees={employees}
                                massages={massages}
                                leaveRecords={leaveRecords}
                                onClick={(s) => setDetailsDialog({ open: true, slot: s })}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground font-sans">
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
              </>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEmployee ? (
            <DragOverlayContent employee={activeEmployee} />
          ) : activeAssignedSlot ? (
            <DragOverlayAssignedContent slot={activeAssignedSlot} employees={employees} massages={massages} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Confirmation Dialog */}
      <AssignConfirmDialog
        state={confirmDialog}
        onClose={() => setConfirmDialog({ open: false, employee: null, slot: null, hasSkill: true })}
        onConfirm={handleConfirmAssignment}
        saving={saving}
        massages={massages}
      />

      {/* Block Notification Dialog */}
      <BlockAssignmentDialog
        state={blockDialog}
        onClose={() => setBlockDialog({ open: false, title: "", reason: "" })}
      />

      {/* Monthly Stats Summary Dialog */}
      <MonthlyStatsDialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        weekMonday={weekMonday}
        employees={employees}
        massages={massages}
      />

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        state={detailsDialog}
        onClose={() => setDetailsDialog({ open: false, slot: null })}
        onUnassign={unassignEmployee}
        employees={employees}
        massages={massages}
        saving={saving}
      />

      {/* Massage Filter Dialog */}
      <MassageFilterDialog
        open={massageDialogOpen}
        onClose={() => setMassageDialogOpen(false)}
        massages={massages}
        currentId={filterMassageId}
        onSelect={setFilterMassageId}
      />
    </main>
  );
}

