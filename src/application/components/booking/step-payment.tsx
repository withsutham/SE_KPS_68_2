"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, Banknote, QrCode, CreditCard, Lock, Loader2 } from "lucide-react";
import { StepProps } from "./types";

const PAYMENT_METHODS = [
  {
    id: "cash" as const,
    icon: Banknote,
    label: "ชำระเงินสด",
    sublabel: "ชำระที่สาขา",
  },
  {
    id: "qr" as const,
    icon: QrCode,
    label: "QR PromptPay",
    sublabel: "โอนผ่าน QR Code",
  },
  {
    id: "credit" as const,
    icon: CreditCard,
    label: "บัตรเครดิต/เดบิต",
    sublabel: "Visa, Mastercard",
  },
];

const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function StepPayment({ data, onUpdate, onNext, onBack }: StepProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!data.paymentMethod) return;
    setLoading(true);

    try {
      // Date and Time properly formatted
      const datePart = data.selectedDate?.toISOString().split("T")[0];
      const timePart = data.selectedTime;
      const bookingDateTime = `${datePart}T${timePart}:00+07:00`;

      const payload = {
        customer_id: data.customerId ?? null,
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_phone: data.phone,
        customer_email: data.email,
        booking_datetime: bookingDateTime,
        services: data.selectedServices.map(s => ({
          massage_id: s.massage_id,
          price: s.massage_price,
          duration: s.duration || 60,
        })),
        payment_method: data.paymentMethod,
        total_price: data.selectedServices.reduce((sum, s) => sum + Number(s.massage_price), 0),
      };

      let bookingId: string | null = null;
      let bookingDetails: any[] | null = null;
      try {
        const res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          bookingId = json.data?.id ?? null;
          bookingDetails = json.data?.details ?? null;
        }
      } catch (err) {
        console.error("Booking submission error:", err);
      }

      onUpdate({
        bookingId: bookingId ?? `FJ-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        bookingDetails,
      });

      // Simulate processing delay
      await new Promise(r => setTimeout(r, 800));
      onNext();
    } finally {
      setLoading(false);
    }
  };

  const dateStr = data.selectedDate
    ? `${data.selectedDate.getDate()} ${MONTHS_TH[data.selectedDate.getMonth()]} ${data.selectedDate.getFullYear() + 543}`
    : "-";

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">
          ชำระเงิน
        </h2>
        <p className="text-muted-foreground mt-2 font-sans">
          ตรวจสอบรายการจองและเลือกวิธีชำระเงิน
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
        {/* Order summary card */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6">
          <h3 className="font-medium font-mitr mb-4 text-foreground">สรุปรายการ</h3>
          <div className="space-y-3 text-sm font-sans">
            <div className="flex justify-between">
              <span className="text-muted-foreground">บริการ</span>
              <span className="font-medium max-w-[200px] text-right truncate" title={data.selectedServices.map(s => s.massage_name).join(', ')}>
                {data.selectedServices.map(s => s.massage_name).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ระยะเวลา</span>
              <span>{data.selectedServices.reduce((sum, s) => sum + (s.duration ?? 60), 0)} นาที</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">วันที่</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">เวลา</span>
              <span>{data.selectedTime} น.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ผู้จอง</span>
              <span>{data.firstName} {data.lastName}</span>
            </div>
            {data.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">อีเมล</span>
                <span>{data.email}</span>
              </div>
            )}
            <div className="h-px bg-border/60 my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>ยอดชำระ</span>
              <span className="text-primary">฿{data.selectedServices.reduce((sum, s) => sum + Number(s.massage_price), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6">
          <h3 className="font-medium font-mitr mb-4 text-foreground">วิธีชำระเงิน</h3>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon;
              const selected = data.paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => onUpdate({ paymentMethod: method.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center",
                    selected
                      ? "border-primary bg-primary/5 text-primary shadow-md shadow-primary/10"
                      : "border-border/40 bg-background/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium font-sans leading-tight">{method.label}</span>
                  <span className="text-[10px] text-muted-foreground font-sans">{method.sublabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans justify-center">
          <Lock className="h-3 w-3" />
          <span>ข้อมูลของคุณได้รับการเข้ารหัสและปลอดภัย</span>
        </div>
      </div>

      <div className="flex justify-between pt-2 max-w-xl mx-auto w-full">
        <Button variant="outline" onClick={onBack} disabled={loading} className="gap-2 font-sans" size="lg">
          <ChevronLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!data.paymentMethod || loading}
          className="gap-2 px-8 font-sans"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังดำเนินการ...
            </>
          ) : (
            "ยืนยันการชำระเงิน"
          )}
        </Button>
      </div>
    </div>
  );
}
