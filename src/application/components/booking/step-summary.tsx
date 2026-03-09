"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Calendar, Clock, User, Phone, Banknote, QrCode, CreditCard, Sparkles, Printer, FileText } from "lucide-react";
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
      id="receipt-container"
      className={cn(
        "flex flex-col gap-6 transition-all duration-700 bg-background",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {/* Print Only Header (Receipt format) */}
      <div className="hidden print:flex flex-col items-center text-center pb-4 border-b border-dashed border-black/30 mb-2 mt-0">
        <h1 className="text-xl font-bold font-mitr text-black mb-1">ฟื้นใจ · Massage & Spa</h1>
        <p className="text-xs text-black/70 font-sans mb-2">123 ถนนเพลินจิต กรุงเทพมหานคร 10110<br/>โทร: 02-123-4567</p>
        <div className="bg-black text-white px-3 py-0.5 rounded-full text-[10px] font-medium tracking-widest uppercase">
          ใบเสร็จรับเงิน / Receipt
        </div>
      </div>

      {/* Success banner (Hidden in Print) */}
      <div className="text-center flex flex-col items-center gap-4 print:hidden">
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
      <div className="max-w-lg mx-auto w-full bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 print:max-w-3xl print:mx-auto print:border-none print:shadow-none print:p-0 print:bg-transparent print:text-black">
        <div className="flex justify-between items-baseline mb-3 print:mb-2">
          <h3 className="font-medium font-mitr text-foreground print:text-black print:text-base">รายละเอียดการจอง</h3>
          {/* Print only Order ID at top right */}
          {data.bookingId && (
            <div className="hidden print:block text-xs font-sans text-black/60">
              เลขที่จอง: <span className="font-mono text-black">{data.bookingId}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 print:gap-2 text-sm print:text-xs font-sans print:text-black">
          {/* Services Setup */}
          <div className="flex flex-col gap-4">
            {data.bookingDetails ? (
              data.bookingDetails.map((detail: any, idx: number) => {
                const service = data.selectedServices.find(s => s.massage_id === detail.massage_id);
                return (
                  <div key={idx} className="flex gap-3 items-start print:gap-2 print:border-b print:border-black/10 print:pb-2 print:last:border-0 print:last:pb-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 print:hidden">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5 print:hidden">บริการ</p>
                      <p className="font-medium print:text-sm">{service?.massage_name || "บริการนวด"}</p>
                      <Badge variant="secondary" className="mt-1 text-xs mb-3 print:mb-1 print:border-black/20 print:bg-transparent print:text-[10px] print:px-1.5 print:py-0">
                        {service?.duration ?? 60} นาที &nbsp;·&nbsp; ฿{Number(service?.massage_price || 0).toLocaleString()}
                      </Badge>
                      
                      <div className="grid grid-cols-2 gap-3 bg-secondary/20 p-3 rounded-xl border border-border/40 print:bg-transparent print:border-none print:p-0 print:gap-1">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider print:text-black/60 print:mb-0 print:text-[8px] print:inline-block print:w-16">พนักงานนวด:</p>
                          <p className="text-sm font-medium text-foreground print:text-black print:text-xs print:inline-block ml-1">{detail.employee_name || "ไม่ได้ระบุ"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider print:text-black/60 print:mb-0 print:text-[8px] print:inline-block print:w-8">ห้อง:</p>
                          <p className="text-sm font-medium text-foreground print:text-black print:text-xs print:inline-block ml-1">{detail.room_name || "ไม่ได้ระบุ"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback if no booking details (e.g. error)
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
            )}
          </div>

          <div className="h-px bg-border/60 print:hidden" />

          {/* Grouped Information Grid */}
          <div className="grid grid-cols-1 gap-4 print:grid-cols-2 print:gap-y-2 print:gap-x-4 print:py-2 print:border-y border-dashed border-black/30 print:my-0">
            
            {/* Date */}
            <div className="flex gap-3 items-center print:gap-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 print:hidden">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="print:flex print:items-center print:w-full">
                <p className="text-xs text-muted-foreground mb-0.5 print:text-black/60 print:uppercase print:tracking-wider print:mb-0 print:w-16 print:text-[8px] print:font-semibold">วันที่:</p>
                <p className="font-medium print:text-xs print:text-black">{dateStr}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex gap-3 items-center print:gap-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 print:hidden">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="print:flex print:items-center print:w-full">
                <p className="text-xs text-muted-foreground mb-0.5 print:text-black/60 print:uppercase print:tracking-wider print:mb-0 print:w-16 print:text-[8px] print:font-semibold">เวลา:</p>
                <p className="font-medium print:text-xs print:text-black">{data.selectedTime} น.</p>
              </div>
            </div>

            <div className="h-px bg-border/60 print:hidden col-span-1" />

            {/* Customer */}
            <div className="flex gap-3 items-center print:gap-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 print:hidden">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="print:flex print:items-center print:w-full">
                <p className="text-xs text-muted-foreground mb-0.5 print:text-black/60 print:uppercase print:tracking-wider print:mb-0 print:w-16 print:text-[8px] print:font-semibold">ผู้จอง:</p>
                <p className="font-medium print:text-xs print:text-black">{data.firstName} {data.lastName}</p>
              </div>
            </div>

            <div className="flex gap-3 items-center print:gap-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 print:hidden">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div className="print:flex print:items-center print:w-full">
                <p className="text-xs text-muted-foreground mb-0.5 print:text-black/60 print:uppercase print:tracking-wider print:mb-0 print:w-16 print:text-[8px] print:font-semibold">เบอร์โทร:</p>
                <p className="font-medium print:text-xs print:text-black">{data.phone}</p>
              </div>
            </div>

            <div className="h-px bg-border/60 print:hidden col-span-1" />

            {/* Payment */}
            <div className="flex gap-3 items-center print:col-span-2 print:gap-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 print:hidden">
                <PaymentIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="print:flex print:items-center print:w-full">
                <p className="text-xs text-muted-foreground mb-0.5 print:text-black/60 print:uppercase print:tracking-wider print:mb-0 print:w-[6rem] print:text-[8px] print:font-semibold">วิธีชำระเงิน:</p>
                <p className="font-medium print:text-xs print:text-black">
                  {data.paymentMethod ? PAYMENT_LABEL[data.paymentMethod] : "-"}
                </p>
              </div>
            </div>

          </div>
          
          {/* Print only total block */}
          <div className="hidden print:block pt-2 mt-1">
            <div className="flex justify-between items-center text-base font-bold">
              <span>ยอดสุทธิ (Total)</span>
              <span>฿{data.selectedServices.reduce((sum, s) => sum + Number(s.massage_price), 0).toLocaleString()}</span>
            </div>
            <p className="text-center text-[10px] text-black/50 mt-4 italic">
              ขอบคุณที่ไว้วางใจใช้บริการฟื้นใจ Massage & Spa<br/>
              Thank you for trusting us.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center gap-4 pt-2 print:hidden">
        <Button variant="outline" size="lg" className="px-6 font-sans gap-2" onClick={() => window.print()}>
          <FileText className="h-4 w-4" />
          บันทึก PDF / พิมพ์
        </Button>
        <Button 
          size="lg" 
          className="px-10 font-sans gap-2" 
          onClick={() => {
            window.location.href = "/";
          }}
        >
          กลับหน้าแรก
        </Button>
      </div>
    </div>
  );
}
