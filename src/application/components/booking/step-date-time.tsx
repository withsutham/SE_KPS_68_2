"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
=======
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
>>>>>>> 40ed005 (inital the booking)
import { StepProps } from "./types";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

<<<<<<< HEAD
=======
// Simulated unavailable slots
const UNAVAILABLE_SLOTS = new Set(["10:30", "14:00", "15:30"]);

>>>>>>> 40ed005 (inital the booking)
const DAYS_OF_WEEK = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function StepDateTime({ data, onUpdate, onNext, onBack }: StepProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(viewYear, viewMonth, day);
    if (clicked < today && clicked.toDateString() !== today.toDateString()) return;
    onUpdate({ selectedDate: clicked, selectedTime: null });
  };

  const handleTimeClick = (slot: string) => {
<<<<<<< HEAD
    onUpdate({ selectedTime: slot });
  };

  const [bookedSlots, setBookedSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Fetch real times when date changes
  useEffect(() => {
    if (!data.selectedDate) return;

    const fetchBookings = async () => {
      setLoadingTimes(true);
      try {
        const year = data.selectedDate!.getFullYear();
        const month = String(data.selectedDate!.getMonth() + 1).padStart(2, "0");
        const day = String(data.selectedDate!.getDate()).padStart(2, "0");

        const res = await fetch(`/api/booking_detail?date=${year}-${month}-${day}`);
        const json = await res.json();

        if (json.success) {
          const slots = json.data.map((d: any) => ({
            start: new Date(d.massage_start_dateTime),
            end: new Date(d.massage_end_dateTime),
          }));
          setBookedSlots(slots);
        }
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
      } finally {
        setLoadingTimes(false);
      }
    };
    fetchBookings();
  }, [data.selectedDate]);

  const totalDuration = data.selectedServices.reduce((sum, s) => sum + (s.duration ?? 60), 0);

  const checkSlotAvailability = (slot: string) => {
    if (!data.selectedDate) return false;
    
    const [h, m] = slot.split(":").map(Number);
    const proposedStart = new Date(data.selectedDate);
    proposedStart.setHours(h, m, 0, 0);
    
    const proposedEnd = new Date(proposedStart.getTime() + totalDuration * 60000);

    // Business closes at 20:00 (for example, to prevent impossibly long bookings past closing)
    const closingTime = new Date(data.selectedDate);
    closingTime.setHours(20, 0, 0, 0);
    if (proposedEnd > closingTime) return false;

    // Reject times in the past for today
    if (proposedStart < new Date()) return false;

    for (const b of bookedSlots) {
       // if (StartA < EndB) and (EndA > StartB)
       if (proposedStart < b.end && proposedEnd > b.start) {
         return false; // overlap exists
       }
    }
    return true;
  };

=======
    if (UNAVAILABLE_SLOTS.has(slot)) return;
    onUpdate({ selectedTime: slot });
  };

>>>>>>> 40ed005 (inital the booking)
  const isDateDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };
  const isDateSelected = (day: number) => {
    if (!data.selectedDate) return false;
    const d = data.selectedDate;
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && d.getDate() === day;
  };

  const canProceed = data.selectedDate && data.selectedTime;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">
          เลือกวันและเวลา
        </h2>
        <p className="text-muted-foreground mt-2 font-sans">
          เลือกวันและช่วงเวลาที่สะดวกสำหรับคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handlePrevMonth}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-base font-medium font-mitr">
              {MONTHS_TH[viewMonth]} {viewYear + 543}
            </h3>
            <button
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1 font-sans">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  disabled={disabled}
                  className={cn(
                    "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-sans transition-all duration-200",
                    disabled && "text-muted-foreground/40 cursor-not-allowed",
                    !disabled && !selected && "hover:bg-primary/10 hover:text-primary cursor-pointer",
                    isToday && !selected && "border border-primary/40 text-primary font-medium",
                    selected && "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-base font-medium font-mitr">
              {data.selectedDate
                ? `${data.selectedDate.getDate()} ${MONTHS_TH[data.selectedDate.getMonth()]} ${data.selectedDate.getFullYear() + 543}`
                : "เลือกวันก่อน"}
            </h3>
          </div>

          {data.selectedDate ? (
<<<<<<< HEAD
            loadingTimes ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground font-sans text-sm">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                กำลังตรวจสอบคิวว่าง...
              </div>
            ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => {
                  const unavailable = !checkSlotAvailability(slot);
=======
            <>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => {
                  const unavailable = UNAVAILABLE_SLOTS.has(slot);
>>>>>>> 40ed005 (inital the booking)
                  const selected = data.selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => handleTimeClick(slot)}
                      disabled={unavailable}
                      className={cn(
                        "rounded-xl py-2 text-sm font-sans font-medium transition-all duration-200 border",
                        unavailable && "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through",
                        !unavailable && !selected && "border-border/40 bg-background/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                        selected && "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-primary/80" /> ว่าง
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-muted/50 border border-border/30" /> ไม่ว่าง
                </span>
              </div>
            </>
<<<<<<< HEAD
            )
=======
>>>>>>> 40ed005 (inital the booking)
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground font-sans text-sm">
              กรุณาเลือกวันที่ก่อน
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2 font-sans" size="lg">
          <ChevronLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="gap-2 px-8 font-sans" size="lg">
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
