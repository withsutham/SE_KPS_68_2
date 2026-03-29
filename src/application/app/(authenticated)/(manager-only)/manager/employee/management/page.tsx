"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  Timer,
  Inbox,
  UserCheck,
  CalendarOff,
  AlertTriangle,
  Settings,
  XCircle,
  Pencil,
  BriefcaseMedical,
  Search,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Weekday = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  work_since: string | null;
  profile_id?: string | null;
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
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
  employee_id: number;
}

interface Massage {
  massage_id: number;
  massage_name: string;
}

interface TherapistSkill {
  employee_id: number;
  massage_id: number;
}

interface BookingDetail {
  booking_detail_id: number;
  booking_id: number;
  massage_id: number;
  employee_id: number | null;
  massage_start_dateTime: string;
  massage_end_dateTime: string;
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

const MONTHS_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

const LEAVE_STATUS_CONFIG = {
  pending: {
    label: "รออนุมัติ",
    icon: Timer,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  approved: {
    label: "อนุมัติแล้ว",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  rejected: {
    label: "ปฏิเสธคำขอ",
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
};

function formatDateTimeTH(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid Date";
  
  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(d);

  const formattedTime = new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(d);

  return `${formattedDate} ${formattedTime} น.`;
}

function getInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Component: EmployeeMasterDetail ──────────────────────────────────────────
export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [massages, setMassages] = useState<Massage[]>([]);
  const [skills, setSkills] = useState<TherapistSkill[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [empRes, schRes, leaveRes, msgRes, skRes] = await Promise.all([
        fetch("/api/employee"),
        fetch("/api/work_schedule"),
        fetch("/api/leave_record"),
        fetch("/api/massage"),
        fetch("/api/therapist_massage_skill")
      ]);
      const [empJson, schJson, leaveJson, msgJson, skJson] = await Promise.all([
        empRes.json(),
        schRes.json(),
        leaveRes.json(),
        msgRes.json(),
        skRes.json()
      ]);
      setEmployees(empJson.data ?? []);
      setSchedules(schJson.data ?? []);
      setLeaveRecords(leaveJson.data ?? []);
      setMassages(msgJson.data ?? []);
      setSkills(skJson.data ?? []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []); // Stable function

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Handle auto-selection:
  // 1. If nothing is selected
  // 2. If the selected employee is no longer in the list (deleted by someone else or this user)
  useEffect(() => {
    const stillExists = employees.some(e => e.employee_id === selectedEmpId);
    if (employees.length > 0 && (!selectedEmpId || !stillExists)) {
      setSelectedEmpId(employees[0].employee_id);
    } else if (employees.length === 0) {
      setSelectedEmpId(null);
    }
  }, [employees, selectedEmpId]);

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.employee_id === selectedEmpId) || null,
    [employees, selectedEmpId]
  );

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase();
    return employees.filter(e => 
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      (e.phone_number && e.phone_number.includes(q))
    );
  }, [employees, searchQuery]);

  return (
    <main className="flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* ─── SIDEBAR: Employee List ────────────────────────── */}
      <div className="w-full md:w-96 shrink-0 border-r border-border/40 bg-card/40 flex flex-col h-[calc(100vh-60px)] z-10">
        <div className="p-4 border-b border-border/40 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-mitr font-medium">รายชื่อพนักงาน</h2>
            </div>
            <EmployeeFormDialog mode="add" massages={massages} onSaved={fetchData} />
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input 
              placeholder="ค้นหาชื่อพนักงาน..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/80 border-border/40 text-sm font-sans rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredEmployees.length === 0 ? (
             <div className="py-12 flex flex-col items-center justify-center opacity-50">
               <Inbox className="h-8 w-8 mb-2" />
               <p className="font-sans text-sm">{searchQuery ? "ไม่พบผลลัพธ์" : "ไม่มีข้อมูลพนักงาน"}</p>
             </div>
          ) : (
            filteredEmployees.map(emp => {
               const empLeaves = leaveRecords.filter(l => l.employee_id === emp.employee_id && l.approval_status === 'pending');
               const isActive = selectedEmpId === emp.employee_id;
               return (
                 <button
                   key={emp.employee_id}
                   onClick={() => setSelectedEmpId(emp.employee_id)}
                   className={cn(
                     "w-full text-left px-3 py-3 rounded-xl transition-all border outline-none font-sans",
                     isActive ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-transparent border-transparent hover:bg-muted/50"
                   )}
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn(
                       "h-10 w-10 min-w-10 rounded-full flex items-center justify-center text-sm font-mitr font-medium border",
                       isActive ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border shadow-sm text-foreground/70"
                     )}>
                       {getInitials(emp.first_name, emp.last_name)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-mitr truncate text-[15px]">{emp.first_name} {emp.last_name}</p>
                       <p className="text-xs text-muted-foreground truncate">{emp.phone_number || "ไม่มีเบอร์"}</p>
                     </div>
                     {empLeaves.length > 0 && (
                       <span className="shrink-0 h-5 w-5 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-[10px] font-bold ring-1 ring-yellow-300">
                         {empLeaves.length}
                       </span>
                     )}
                   </div>
                 </button>
               )
            })
          )}
        </div>
      </div>

      {/* ─── MAIN: Employee Hub ──────────────────────────── */}
      <div className="flex-1 h-[calc(100vh-60px)] overflow-y-auto bg-muted/5">
        {!selectedEmployee ? (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50">
             <UserCheck className="h-20 w-20 mb-4 opacity-50" />
             <p className="font-mitr text-xl">เลือกรายชื่อพนักงานเพื่อดูข้อมูล</p>
           </div>
        ) : (
           <EmployeeDetailPanel 
             employee={selectedEmployee} 
             schedules={schedules} 
             leaveRecords={leaveRecords}
             massages={massages}
             skills={skills}
             onRefresh={fetchData} 
           />
        )}
      </div>
    </main>
  );
}

// ─── Sub-Component: Employee Detail Hub ──────────────────────────────────────
function EmployeeDetailPanel({ employee, schedules, leaveRecords, massages, skills, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState<"schedule" | "leave">("schedule");

  const mySchedules = schedules.filter((s: any) => s.employee_id === employee.employee_id);
  const myLeaves = leaveRecords.filter((l: any) => l.employee_id === employee.employee_id);
  const mySkills = skills.filter((s: any) => s.employee_id === employee.employee_id);

  const uniqueDays = new Set(mySchedules.map((s: any) => s.weekday)).size;
  let totalHours = 0;
  mySchedules.forEach((s: any) => {
    const start = s.start_time.split(':').map(Number);
    const end = s.end_time.split(':').map(Number);
    const startHour = start[0] + (start[1] || 0) / 60;
    const endHour = end[0] + (end[1] || 0) / 60;
    if (endHour > startHour) {
      totalHours += (endHour - startHour);
    }
  });

  // Count approved leaves this month
  const now = new Date();
  const thisMonthApproved = myLeaves.filter((l: any) => {
    if (l.approval_status !== "approved") return false;
    const d = new Date(l.start_datetime);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border-b border-border/40">
        <div className="flex items-center gap-5">
           <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg flex items-center justify-center text-3xl font-mitr font-medium border border-primary/20">
             {getInitials(employee.first_name, employee.last_name)}
           </div>
           <div>
             <h1 className="text-3xl font-mitr font-medium">{employee.first_name} {employee.last_name}</h1>
             <p className="text-muted-foreground font-sans mt-1">📞 {employee.phone_number || "ไม่ระบุ"} &nbsp;•&nbsp; เริ่มงาน {employee.work_since ? new Date(employee.work_since).toLocaleDateString('th-TH') : "ไม่ระบุ"}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <EmployeeFormDialog mode="edit" employee={employee} massages={massages} currentSkills={mySkills} onSaved={onRefresh} />
           <DeleteEmployeeDialog employee={employee} onDelete={onRefresh} />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-sm text-muted-foreground font-sans mb-1 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary"/> กะทำงาน (วัน/สัปดาห์)</span>
          <div className="flex items-end gap-2 text-2xl font-mitr">
             {uniqueDays}
             {uniqueDays < 3 && <span className="text-xs text-red-500 font-sans mb-1.5 px-2 bg-red-50 rounded-full border border-red-200">ขั้นต่ำ 3</span>}
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-sm text-muted-foreground font-sans mb-1 flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/> ชั่วโมงรวม (ชม./สัปดาห์)</span>
          <div className="flex items-end gap-2 text-2xl font-mitr">
             {Math.round(totalHours * 10) / 10}
             {totalHours < 18 && <span className="text-xs text-red-500 font-sans mb-1.5 px-2 bg-red-50 rounded-full border border-red-200">ขั้นต่ำ 18</span>}
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-sm text-muted-foreground font-sans mb-1 flex items-center gap-2"><BriefcaseMedical className="h-4 w-4 text-primary"/> ทักษะการนวด</span>
          <div className="flex items-end gap-2 text-2xl font-mitr">
             {mySkills.length} 
             <span className="text-xs text-muted-foreground font-sans mb-1.5">บริการ</span>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-sm text-muted-foreground font-sans mb-1 flex items-center gap-2"><CalendarOff className="h-4 w-4 text-primary"/> หยุดเดือนนี้</span>
          <div className="flex items-end gap-2 text-2xl font-mitr">
             {thisMonthApproved} 
             <span className="text-xs text-muted-foreground font-sans mb-1.5">ครั้ง</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
         <div className="flex border-b border-border/40 font-mitr">
           <button 
             onClick={() => setActiveTab('schedule')} 
             className={cn("flex-1 py-4 text-center transition-colors border-b-2", activeTab === 'schedule' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted/30")}
           >
             ตั้งเวลาทำงานพื้นฐาน
           </button>
           <button 
             onClick={() => setActiveTab('leave')}
             className={cn("flex-1 py-4 text-center transition-colors border-b-2 flex items-center justify-center gap-2", activeTab === 'leave' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted/30")}
           >
             คำขอลาหยุด 
             {myLeaves.filter((l: any) => l.approval_status === "pending").length > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold leading-none ring-1 ring-yellow-300">
                  {myLeaves.filter((l: any) => l.approval_status === "pending").length}
                </span>
             )}
           </button>
         </div>

         <div className="p-6">
            {activeTab === 'schedule' ? (
              <ScheduleTabContent employee={employee} schedules={mySchedules} onRefresh={onRefresh} />
            ) : (
              <LeaveTabContent employee={employee} leaves={myLeaves} onRefresh={onRefresh} />
            )}
         </div>
      </div>
    </div>
  )
}

// ─── Dialogs ────────────────────────────────────────────────────────────────
function EmployeeFormDialog({ mode, employee, massages, currentSkills, onSaved }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
     email: "",
     password: "",
     first_name: employee?.first_name || "",
     last_name: employee?.last_name || "",
     phone_number: employee?.phone_number || "",
     work_since: employee?.work_since || "",
  });
  const [selectedSkills, setSelectedSkills] = useState<number[]>(currentSkills?.map((s: any) => s.massage_id) || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
       const url = mode === "add" ? "/api/employee" : `/api/employee/${employee.employee_id}`;
       const method = mode === "add" ? "POST" : "PUT";
       
       const payload = {
          ...formData,
          work_since: formData.work_since || null,
          phone_number: formData.phone_number || null,
          skills: selectedSkills
       };
       
       const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
       });
       
       if (!res.ok) {
          const errorJson = await res.json();
          alert(`เกิดข้อผิดพลาด: ${errorJson.error}`);
          return;
       }
       setOpen(false);
       onSaved();
    } catch(err) {
       console.error(err)
    } finally {
       setLoading(false);
    }
  }

  const toggleSkill = (id: number) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter(s => s !== id));
    } else {
      setSelectedSkills([...selectedSkills, id]);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className={mode === "add" ? "rounded-full shadow-sm" : "rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-2 font-sans"}>
        {mode === "add" ? <><Plus className="h-4 w-4 mr-1" /> เพิ่มพนักงาน</> : <><Pencil className="h-4 w-4"/> แก้ไข</>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mitr text-xl">{mode === "add" ? "เพิ่มพนักงานใหม่" : "แก้ไขข้อมูลพนักงาน"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-sans">
            {mode === "add" && (
              <>
                <div className="space-y-2">
                  <Label>อีเมลสำหรับเข้าสู่ระบบ</Label>
                  <Input required type="email" placeholder="employee@therapist.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>รหัสผ่าน</Label>
                  <Input required type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} minLength={6} />
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>ชื่อ</Label>
                  <Input required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>นามสกุล</Label>
                  <Input required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
               </div>
            </div>
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์</Label>
              <Input type="tel" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>วันที่เริ่มงาน</Label>
              <Input type="date" value={formData.work_since} onChange={(e) => setFormData({...formData, work_since: e.target.value})} />
            </div>
            
            <div className="space-y-2 pt-2">
              <Label>ทักษะบริการนวด (เลือกได้มากกว่าหนึ่ง)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                 {massages.map((msg: any) => {
                    const active = selectedSkills.includes(msg.massage_id);
                    return (
                      <Badge 
                         key={msg.massage_id} 
                         onClick={() => toggleSkill(msg.massage_id)}
                         className={cn("cursor-pointer border py-1.5 transition-colors", active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-card text-muted-foreground hover:bg-muted")}
                      >
                         {msg.massage_name}
                      </Badge>
                    )
                 })}
              </div>
            </div>

            <DialogFooter className="pt-4">
               <Button type="submit" disabled={loading} className="w-full">
                 {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                 บันทึกข้อมูล
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DeleteEmployeeDialog({ employee, onDelete }: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employee/${employee.employee_id}`, { method: "DELETE" });
      if (res.ok) {
        setOpen(false);
        onDelete();
      } else {
        const errorJson = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorJson.error || "ไม่สามารถลบได้"}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)} className="rounded-full gap-2 font-sans">
        <Trash2 className="h-4 w-4" /> ลบพนักงาน
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mitr text-destructive flex gap-2 items-center"><AlertTriangle className="h-5 w-5" /> ยืนยันการลบ</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-sm font-sans text-muted-foreground">คุณแน่ใจหรือไม่ว่าต้องการลบพนักงาน <strong className="text-foreground">{employee.first_name}</strong>? กรณีนี้จะรวมถึงการเพิกถอนสิทธิ์ระบบรหัสผ่านด้วย การกระทำนี้ไม่สามารถย้อนกลับได้</p>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setOpen(false)}>ยกเลิก</Button>
               <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
                 {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ลบพนักงาน"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  )
}


// ─── Content Helpers ─────────────────────────────────────────────────────────

function ScheduleTabContent({ employee, schedules, onRefresh }: any) {
  const [addingDay, setAddingDay] = useState<Weekday>("MON");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSaveSchedule = async () => {
    if (!startTime || !endTime) return;
    
    const h1 = Number(startTime.replace(":", ""));
    const h2 = Number(endTime.replace(":", ""));
    if (h1 >= h2) {
      alert("เวลาเริ่มงานต้องมาก่อนเวลาเลิกงาน");
      return;
    }

    const sameDayShifts = schedules.filter((s: any) => s.weekday === addingDay);
    const hasOverlap = sameDayShifts.some((s: any) => {
       const sh1 = Number(s.start_time.substring(0,5).replace(":", ""));
       const sh2 = Number(s.end_time.substring(0,5).replace(":", ""));
       return (h1 < sh2 && h2 > sh1);
    });

    if (hasOverlap) {
       alert("ไม่สามารถบันทึกได้! เนื่องจากช่วงเวลานี้ทับซ้อนกับกะเดิมที่คุณตั้งไว้แล้วในวันเดียวกัน กรุณาลบอันเก่าออกหรือเปลี่ยนเวลาใหม่");
       return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/work_schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.employee_id,
          weekday: addingDay,
          start_time: startTime + ":00",
          end_time: endTime + ":00",
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/work_schedule/${id}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 bg-muted/20 p-4 rounded-xl border border-border/40 font-sans">
        <select
          value={addingDay}
          onChange={(e) => setAddingDay(e.target.value as Weekday)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none"
        >
          {WEEKDAYS.map((w) => (
            <option key={w.key} value={w.key}>วัน{w.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 flex-1">
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <span className="text-muted-foreground">ถึง</span>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <Button onClick={handleSaveSchedule} disabled={saving} className="md:w-32">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "บันทึกกะทํางาน"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[200px] content-start">
        {schedules.map((s: any) => (
          <div key={s.work_schedule_id} className="flex items-center justify-between p-3 rounded-xl border bg-card shadow-sm font-sans text-sm group">
             <div className="flex items-center gap-3">
                <span className="h-8 w-16 bg-primary/10 text-primary font-mitr font-medium rounded-lg flex items-center justify-center">
                  {WEEKDAYS.find(w => w.key === s.weekday)?.label}
                </span>
                <span className="font-mono text-muted-foreground">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)} น.</span>
             </div>
             <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteSchedule(s.work_schedule_id)}
                disabled={deletingId === s.work_schedule_id}
                className="text-red-500 opacity-50 hover:opacity-100 hover:bg-red-50 transition-opacity"
              >
                {deletingId === s.work_schedule_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground/50">
             <CalendarOff className="h-10 w-10 mb-2 opacity-50" />
             <p className="font-sans">ยังไม่ได้กำหนดกะเวลาเข้างาน</p>
          </div>
        )}
      </div>
    </div>
  )
}

function LeaveTabContent({ employee, leaves, onRefresh }: any) {
  const router = useRouter();
  const [updatingLeave, setUpdatingLeave] = useState<number | null>(null);
  const [leaveSubTab, setLeaveSubTab] = useState<"pending" | "reviewed">("pending");
  const [collisionDialog, setCollisionDialog] = useState<{
    open: boolean;
    leaveId: number | null;
    action: string;
    collisions: { date: string; time: string; bookingId: number }[];
  }>({ open: false, leaveId: null, action: "", collisions: [] });

  const pendingLeaves = leaves.filter((l: any) => l.approval_status === "pending");
  const reviewedLeaves = leaves.filter((l: any) => l.approval_status !== "pending");

  // Count approved leaves this month
  const now = new Date();
  const approvedThisMonth = leaves.filter((l: any) => {
    if (l.approval_status !== "approved") return false;
    const d = new Date(l.start_datetime);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const checkBookingCollisions = async (leave: any): Promise<{ date: string; time: string; bookingId: number }[]> => {
    try {
      const leaveStart = new Date(leave.start_datetime);
      const leaveEnd = new Date(leave.end_datetime);
      const weekStart = toDateKey(getMonday(leaveStart));
      const res = await fetch(`/api/booking_detail?week_start=${weekStart}`);
      const json = await res.json();
      const allBookings: BookingDetail[] = json.data || [];

      const collisions: { date: string; time: string; bookingId: number }[] = [];
      allBookings.forEach(b => {
        if (b.employee_id !== employee.employee_id) return;
        const bStart = new Date(b.massage_start_dateTime);
        const bEnd = new Date(b.massage_end_dateTime);
        if (bStart < leaveEnd && bEnd > leaveStart) {
          collisions.push({
            date: formatDateTimeTH(b.massage_start_dateTime).split(" ").slice(0, 3).join(" "),
            time: `${new Date(b.massage_start_dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })} - ${new Date(b.massage_end_dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}`,
            bookingId: b.booking_id
          });
        }
      });
      return collisions;
    } catch {
      return [];
    }
  };

  const handleLeaveAction = async (leaveId: number, action: string, leave: any) => {
    if (action === "approved") {
      // Check for booking collisions first
      const collisions = await checkBookingCollisions(leave);
      if (collisions.length > 0) {
        setCollisionDialog({ open: true, leaveId, action, collisions });
        return;
      }
    }
    await executeLeaveUpdate(leaveId, action);
  };

  const executeLeaveUpdate = async (id: number, status: string) => {
    setUpdatingLeave(id);
    try {
      await fetch(`/api/leave_record/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_status: status }),
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingLeave(null);
    }
  };

  const handleConfirmCollision = async () => {
    if (collisionDialog.leaveId) {
      await executeLeaveUpdate(collisionDialog.leaveId, collisionDialog.action);
    }
    setCollisionDialog({ open: false, leaveId: null, action: "", collisions: [] });
  };

  const navigateToScheduleWeek = (leave: any) => {
    const leaveDate = new Date(leave.start_datetime);
    const monday = getMonday(leaveDate);
    const weekKey = toDateKey(monday);
    router.push(`/manager/employee/schedule?week=${weekKey}`);
  };

  const displayedLeaves = leaveSubTab === "pending" ? pendingLeaves : reviewedLeaves;

  return (
    <div className="space-y-4 min-h-[200px]">
      {/* Sub-tabs within Leave */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setLeaveSubTab("pending")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-sans transition-colors border",
            leaveSubTab === "pending"
              ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700"
              : "bg-card text-muted-foreground border-border/40 hover:bg-muted/50"
          )}
        >
          รอพิจารณา {pendingLeaves.length > 0 && <span className="ml-1 font-bold">({pendingLeaves.length})</span>}
        </button>
        <button
          onClick={() => setLeaveSubTab("reviewed")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-sans transition-colors border",
            leaveSubTab === "reviewed"
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-card text-muted-foreground border-border/40 hover:bg-muted/50"
          )}
        >
          พิจารณาแล้ว {reviewedLeaves.length > 0 && <span className="ml-1">({reviewedLeaves.length})</span>}
        </button>
      </div>

      {/* Monthly leave stats for pending tab */}
      {leaveSubTab === "pending" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 text-sm font-sans">
          <CalendarOff className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground">เดือนนี้หยุดไปแล้ว</span>
          <span className="font-mitr font-medium text-foreground">{approvedThisMonth} ครั้ง</span>
          <span className="text-muted-foreground/60 text-xs">({MONTHS_TH[now.getMonth()]} {now.getFullYear() + 543})</span>
        </div>
      )}

      {/* Leave list */}
      {displayedLeaves.map((leave: any) => {
         const cfg = LEAVE_STATUS_CONFIG[leave.approval_status as keyof typeof LEAVE_STATUS_CONFIG];
         const StatusIcon = cfg.icon;
         return (
            <div key={leave.leave_record_id} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border bg-card shadow-sm">
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 font-sans">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", cfg.color)}>
                       <StatusIcon className="h-3.5 w-3.5" /> {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                       {formatDateTimeTH(leave.start_datetime)} – {formatDateTimeTH(leave.end_datetime)}
                    </span>
                  </div>
                  {leave.reason && <p className="text-sm font-sans mt-2 ml-1 text-foreground/80">เหตุผล: {leave.reason}</p>}
               </div>
               <div className="flex items-center gap-2 font-sans shrink-0">
                 {leave.approval_status === "pending" && (
                   <>
                     <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleLeaveAction(leave.leave_record_id, "rejected", leave)}
                        disabled={updatingLeave === leave.leave_record_id}
                      >
                        ปฏิเสธ
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLeaveAction(leave.leave_record_id, "approved", leave)}
                        disabled={updatingLeave === leave.leave_record_id}
                      >
                        {updatingLeave === leave.leave_record_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "อนุมัติการลา"}
                      </Button>
                   </>
                 )}
                 {leave.approval_status === "approved" && (
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => navigateToScheduleWeek(leave)}
                     className="gap-1.5 text-xs"
                   >
                     <ExternalLink className="h-3.5 w-3.5" /> ดูตารางสัปดาห์นั้น
                   </Button>
                 )}
               </div>
            </div>
         )
      })}
      {displayedLeaves.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
            <Timer className="h-10 w-10 mb-2 opacity-50" />
            <p className="font-sans">{leaveSubTab === "pending" ? "ไม่มีคำขอรอพิจารณา" : "ไม่มีประวัติที่พิจารณาแล้ว"}</p>
         </div>
      )}

      {/* Collision Warning Dialog */}
      <Dialog open={collisionDialog.open} onOpenChange={(v) => !v && setCollisionDialog({ open: false, leaveId: null, action: "", collisions: [] })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mitr flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" /> พบคิวงานที่หลุดจากการลา
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 font-sans">
            <p className="text-sm text-muted-foreground">
              หากอนุมัติคำขอลานี้ จะมีคิวงานต่อไปนี้ที่ตรงกับช่วงเวลาลา:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collisionDialog.collisions.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm">
                  <Calendar className="h-4 w-4 text-red-500 shrink-0" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-400">{c.date}</p>
                    <p className="text-red-600/70 dark:text-red-400/70 text-xs">{c.time} • Booking #{c.bookingId}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              คุณยังคงต้องการอนุมัติใช่หรือไม่? คิวงานเหล่านี้จะยังคงถูกกำหนดไว้เหมือนเดิม แต่ระบบจะแจ้งเตือนว่ามีความขัดแย้ง
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCollisionDialog({ open: false, leaveId: null, action: "", collisions: [] })}>
              ยกเลิก
            </Button>
            <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleConfirmCollision}>
              ยืนยันอนุมัติ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
