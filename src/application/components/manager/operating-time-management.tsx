"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Clock, Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OperatingTime = {
  operate_time_id: number;
  open_time: string;
  close_time: string;
  create_date: string;
};

type OperatingTimeFormState = {
  open_time: string;
  close_time: string;
};

const INITIAL_FORM_STATE: OperatingTimeFormState = {
  open_time: "09:00",
  close_time: "20:00",
};

export function OperatingTimeManagement() {
  const [operatingTime, setOperatingTime] = useState<OperatingTime | null>(null);
  const [formState, setFormState] = useState<OperatingTimeFormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadOperatingTime();
  }, []);

  async function loadOperatingTime() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/operate_time", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load operating hours");
      }

      if (result.data) {
        setOperatingTime(result.data);
        // Format TIME string (HH:mm:ss or HH:mm) to HH:mm for input type="time"
        const formatTime = (timeStr: string) => {
          return timeStr.split(":").slice(0, 2).join(":");
        };
        setFormState({
          open_time: formatTime(result.data.open_time),
          close_time: formatTime(result.data.close_time),
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load operating hours");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        open_time: formState.open_time,
        close_time: formState.close_time,
      };

      if (!payload.open_time || !payload.close_time) {
        throw new Error("กรุณาระบุเวลาเปิดและเวลาปิด");
      }

      const response = await fetch("/api/operate_time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "บันทึกเวลาทำการล้มเหลว");
      }

      setSuccessMessage("อัปเดตเวลาทำการสำเร็จ");
      await loadOperatingTime();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save operating hours");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="relative flex-1 w-full font-mitr">
      {/* Background elements to match other pages */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        {/* Consistent Header Section */}
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">ผู้จัดการ · Manager</p>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">จัดการเวลาทำการ</h1>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
            กำหนดเวลาเปิด-ปิดของร้านเพื่อให้ลูกค้าสามารถเลือกจองคิวในช่วงเวลาที่ถูกต้อง
          </p>

          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={() => void loadOperatingTime()} disabled={isLoading} className="h-11 rounded-full px-8 shadow-sm">
              <RefreshCw className={isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
              รีเฟรชข้อมูล
            </Button>
          </div>
        </header>

        {(errorMessage || successMessage) && (
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${errorMessage
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-primary/20 bg-primary/10 text-foreground"
              }`}
          >
            {errorMessage ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-primary" />}
            {errorMessage ?? successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="overflow-hidden border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="font-medium text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                ตั้งค่าเวลาทำการปัจจุบัน
              </CardTitle>
              <CardDescription>ปรับปรุงเวลาเปิดและปิดของร้าน</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="open_time" className="text-base">เวลาเปิดร้าน</Label>
                    <div className="relative">
                      <Input
                        id="open_time"
                        type="time"
                        value={formState.open_time}
                        onChange={(event) => setFormState((current) => ({ ...current, open_time: event.target.value }))}
                        className="h-12 text-lg focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="close_time" className="text-base">เวลาปิดร้าน</Label>
                    <div className="relative">
                      <Input
                        id="close_time"
                        type="time"
                        value={formState.close_time}
                        onChange={(event) => setFormState((current) => ({ ...current, close_time: event.target.value }))}
                        className="h-12 text-lg focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isSaving || isLoading} className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        บันทึกการตั้งค่า
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
            <CardHeader className="border-b border-border/60 bg-muted/30">
              <CardTitle className="font-medium text-2xl">ข้อมูลสรุป</CardTitle>
              <CardDescription>สถานะเวลาทำการในปัจจุบัน</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
                <span className="text-muted-foreground">เวลาเปิดปัจจุบัน:</span>
                <span className="text-2xl font-semibold text-primary">{operatingTime ? operatingTime.open_time.split(":").slice(0, 2).join(":") : "ยังไม่ได้กำหนด"}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
                <span className="text-muted-foreground">เวลาปิดปัจจุบัน:</span>
                <span className="text-2xl font-semibold text-primary">{operatingTime ? operatingTime.close_time.split(":").slice(0, 2).join(":") : "ยังไม่ได้กำหนด"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">แก้ไขล่าสุดเมื่อ:</p>
                <p className="font-medium">
                  {operatingTime 
                    ? new Date(operatingTime.create_date).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "ไม่มีข้อมูล"}
                </p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800/80">
                  การเปลี่ยนแปลงเวลาทำการจะมีผลต่อการจองคิวใหม่ทันที โปรดตรวจสอบให้แน่ใจว่าได้แจ้งพนักงานให้ทราบถึงการเปลี่ยนแปลง
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
