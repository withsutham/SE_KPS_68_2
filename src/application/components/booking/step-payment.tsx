"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  QrCode,
  Lock,
  Loader2,
  Ticket,
  Upload,
} from "lucide-react";
import { StepProps } from "./types";
import generatePayload from "promptpay-qr";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

const PAYMENT_METHODS = [
  {
    id: "qr" as const,
    icon: QrCode,
    label: "QR PromptPay",
    sublabel: "โอนผ่าน QR Code",
  },
];

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function StepPayment({ data, onUpdate, onNext, onBack }: StepProps) {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    if (data.customerId) {
      fetch(`/api/member_coupon?customer_id=${data.customerId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const available = json.data.filter(
              (c: any) =>
                !c.is_used &&
                (!c.expire_dateTime ||
                  new Date(c.expire_dateTime) > new Date()),
            );
            setCoupons(available);
          }
        })
        .catch((err) => console.error("Failed to fetch coupons", err));
    }
  }, [data.customerId]);

  const subtotal = data.selectedServices.reduce(
    (sum, s) => sum + Number(s.massage_price),
    0,
  );
  let discount = 0;

  if (data.selectedCouponId) {
    const selectedCoupon = coupons.find(
      (c) => c.member_coupon_id === data.selectedCouponId,
    );
    if (selectedCoupon && selectedCoupon.coupon) {
      discount =
        subtotal * (Number(selectedCoupon.coupon.discount_percent) / 100);
    }
  }

  const total = Math.max(0, subtotal - discount);
  const depositAmount = Math.max(0, Math.round(total * 0.3)); // 30% Deposit

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetPromptPay = "0643981531"; // Replace with your actual shop phone/ID
  const qrPayload = generatePayload(targetPromptPay, { amount: depositAmount });

  const handleConfirm = async () => {
    if (!data.paymentMethod) return;
    if (data.paymentMethod === "qr" && !data.paymentSlipFile) {
      alert("กรุณาอัปโหลดสลิปการโอนเงินมัดจำ (Please upload deposit slip)");
      return;
    }

    setLoading(true);

    try {
      let slipUrl = null;
      if (data.paymentMethod === "qr" && data.paymentSlipFile) {
        const supabase = createClient();
        const fileExt = data.paymentSlipFile.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("payment_slips")
          .upload(`public/${fileName}`, data.paymentSlipFile);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          alert("เกิดข้อผิดพลาดในการอัปโหลดสลิป");
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("payment_slips")
          .getPublicUrl(`public/${fileName}`);

        slipUrl = publicUrlData.publicUrl;
      }

      // Build date string from local date parts to avoid UTC shift (toISOString shifts to UTC, causing wrong date for UTC+7)
      const d = data.selectedDate!;
      const datePart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const timePart = data.selectedTime;
      const bookingDateTime = `${datePart}T${timePart}:00+07:00`;

      const payload = {
        customer_id: data.customerId ?? null,
        customer_name: `${data.firstName} ${data.lastName}`,
        customer_phone: data.phone,
        customer_email: data.email,
        booking_datetime: bookingDateTime,
        services: data.selectedServices.map((s) => ({
          massage_id: s.massage_id,
          price: s.massage_price,
          duration: s.duration || 60,
        })),
        payment_method: data.paymentMethod,
        total_price: total,
        deposit_amount: depositAmount,
        member_coupon_id: data.selectedCouponId,
        payment_slip_url: slipUrl,
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
        bookingId:
          bookingId ?? `FJ-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        bookingDetails,
        discountAmount: discount,
      });

      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 800));
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
          <h3 className="font-medium font-mitr mb-4 text-foreground">
            สรุปรายการ
          </h3>
          <div className="space-y-3 text-sm font-sans">
            <div className="flex justify-between">
              <span className="text-muted-foreground">บริการ</span>
              <span
                className="font-medium max-w-[200px] text-right truncate"
                title={data.selectedServices
                  .map((s) => s.massage_name)
                  .join(", ")}
              >
                {data.selectedServices.map((s) => s.massage_name).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ระยะเวลา</span>
              <span>
                {data.selectedServices.reduce(
                  (sum, s) => sum + (s.duration ?? 60),
                  0,
                )}{" "}
                นาที
              </span>
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
              <span>
                {data.firstName} {data.lastName}
              </span>
            </div>
            {data.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">อีเมล</span>
                <span>{data.email}</span>
              </div>
            )}

            <div className="h-px bg-border/60 my-2" />

            <div className="flex justify-between text-muted-foreground">
              <span>ยอดรวม</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>

            {/* Coupon selection */}
            {data.customerId && coupons.length > 0 && (
              <div className="py-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
                  <Ticket className="h-3.5 w-3.5" /> ส่วนลด / คูปอง
                </label>
                <div className="flex flex-wrap gap-2">
                  {coupons.map((c) => (
                    <button
                      key={c.member_coupon_id}
                      onClick={() =>
                        onUpdate({
                          selectedCouponId:
                            data.selectedCouponId === c.member_coupon_id
                              ? null
                              : c.member_coupon_id,
                        })
                      }
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-all",
                        data.selectedCouponId === c.member_coupon_id
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "bg-background border-border/60 hover:border-primary/40 text-muted-foreground",
                      )}
                    >
                      {c.coupon?.coupon_name} (-
                      {Number(c.coupon?.discount_percent)}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>ส่วนลดคูปอง</span>
                <span>
                  -฿
                  {discount.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-medium pt-1">
              <span>ยอดรวมทั้งสิ้น (Total)</span>
              <span>
                ฿{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/60">
              <span>ยอดมัดจำที่ต้องชำระ (Deposit 30%)</span>
              <span className="text-primary">
                ฿
                {depositAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6">
          <h3 className="font-medium font-mitr mb-4 text-foreground">
            วิธีชำระเงินมัดจำ
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {PAYMENT_METHODS.map((method) => {
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
                      : "border-border/40 bg-background/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium font-sans leading-tight">
                    {method.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-sans">
                    {method.sublabel}
                  </span>
                </button>
              );
            })}
          </div>

          {data.paymentMethod === "qr" && (
            <div className="mt-6 flex flex-col items-center gap-4 p-4 border border-primary/20 bg-primary/5 rounded-xl animate-in fade-in slide-in-from-top-4">
              <p className="text-sm font-medium text-foreground">
                สแกน QR Code เพื่อชำระเงินมัดจำ
              </p>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG value={qrPayload} size={200} />
              </div>
              <p className="text-xs text-muted-foreground">
                ยอดชำระ: ฿{depositAmount.toLocaleString()}
              </p>

              <div className="w-full mt-2">
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  อัปโหลดสลิปการโอนเงิน
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onUpdate({ paymentSlipFile: file });
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {data.paymentSlipFile
                    ? data.paymentSlipFile.name
                    : "เลือกรูปภาพสลิป"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans justify-center">
          <Lock className="h-3 w-3" />
          <span>ข้อมูลของคุณได้รับการเข้ารหัสและปลอดภัย</span>
        </div>
      </div>

      <div className="flex justify-between pt-2 max-w-xl mx-auto w-full">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="gap-2 font-sans"
          size="lg"
        >
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
