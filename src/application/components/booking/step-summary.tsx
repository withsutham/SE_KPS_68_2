"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Calendar, Clock, User, Phone, Banknote, QrCode, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
import { StepProps } from "./types";

const PAYMENT_LABEL: Record<string, string> = {
  cash: "ชำระเงินสด",
  qr: "QR PromptPay",
  credit: "บัตรเครดิต/เดบิต",
};

const PAYMENT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  qr: QrCode,
  credit: CreditCard,
};

const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function StepSummary({ data }: Pick<StepProps, "data">) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dateStr = data.selectedDate
    ? `${data.selectedDate.getDate()} ${MONTHS_TH[data.selectedDate.getMonth()]} ${data.selectedDate.getFullYear() + 543}`
    : "-";

  const PaymentIcon = data.paymentMethod ? PAYMENT_ICON[data.paymentMethod] : Banknote;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Success banner */}
      <div className="text-center flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <div
            className={cn(
              "absolute -inset-2 rounded-full border-2 border-primary/20 transition-all duration-1000",
              visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            )}
          />
          <Sparkles
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 text-primary/60 transition-all duration-700 delay-300",
              visible ? "opacity-100 rotate-0" : "opacity-0 rotate-45"
            )}
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">
            การจองสำเร็จแล้ว!
          </h2>
          <p className="text-muted-foreground mt-1.5 font-sans">
            เราได้รับการจองของคุณเรียบร้อยแล้ว
          </p>
        </div>
        {data.bookingId && (
          <div className="bg-primary/5 border border-primary/15 rounded-full px-5 py-1.5">
            <span className="text-sm font-sans text-muted-foreground">รหัสการจอง: </span>
            <span className="text-sm font-medium text-primary font-mono">{data.bookingId}</span>
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="max-w-lg mx-auto w-full bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6">
        <h3 className="font-medium font-mitr mb-5 text-foreground">รายละเอียดการจอง</h3>
        <div className="space-y-4 text-sm font-sans">
          {/* Service */}
          <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">บริการ</p>
              <p className="font-medium">{data.selectedServices.map(s => s.massage_name).join(', ')}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {data.selectedServices.reduce((sum, s) => sum + (s.duration ?? 60), 0)} นาที &nbsp;·&nbsp; ฿{data.selectedServices.reduce((sum, s) => sum + Number(s.massage_price), 0).toLocaleString()}
              </Badge>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Date */}
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">วันที่</p>
              <p className="font-medium">{dateStr}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">เวลา</p>
              <p className="font-medium">{data.selectedTime} น.</p>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          {/* Customer */}
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">ผู้จอง</p>
              <p className="font-medium">{data.firstName} {data.lastName}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">เบอร์โทรศัพท์</p>
              <p className="font-medium">{data.phone}</p>
            </div>
          </div>

          {data.specialRequests && (
            <div className="bg-muted/30 rounded-xl px-4 py-3 text-xs text-muted-foreground italic font-sans">
              "{data.specialRequests}"
            </div>
          )}

          <div className="h-px bg-border/60" />

          {/* Payment */}
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <PaymentIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">วิธีชำระเงิน</p>
              <p className="font-medium">
                {data.paymentMethod ? PAYMENT_LABEL[data.paymentMethod] : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link href="/">
          <Button size="lg" className="px-10 font-sans gap-2">
            กลับหน้าแรก
          </Button>
        </Link>
      </div>
    </div>
  );
}
