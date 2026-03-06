"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, User, Phone, Mail } from "lucide-react";
import { StepProps } from "./types";

export function StepDetails({ data, onUpdate, onNext, onBack }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!data.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!data.phone.trim()) newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    else if (!/^[0-9]{9,10}$/.test(data.phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const fieldClass = (error?: string) =>
    cn(
      "bg-background/50 border-border/60 focus:border-primary transition-colors font-sans",
      error && "border-destructive focus:border-destructive"
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">
          ข้อมูลผู้จอง
        </h2>
        <p className="text-muted-foreground mt-2 font-sans">
          กรุณากรอกข้อมูลของคุณเพื่อยืนยันการจอง
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full">
        <div className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-2xl p-6 md:p-8 flex flex-col gap-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="font-sans text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                ชื่อ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="ชื่อ"
                value={data.firstName}
                onChange={e => { onUpdate({ firstName: e.target.value }); setErrors(p => ({ ...p, firstName: "" })); }}
                className={fieldClass(errors.firstName)}
              />
              {errors.firstName && <p className="text-destructive text-xs font-sans">{errors.firstName}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="font-sans text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-transparent" />
                นามสกุล <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="นามสกุล"
                value={data.lastName}
                onChange={e => { onUpdate({ lastName: e.target.value }); setErrors(p => ({ ...p, lastName: "" })); }}
                className={fieldClass(errors.lastName)}
              />
              {errors.lastName && <p className="text-destructive text-xs font-sans">{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="font-sans text-sm font-medium flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                เบอร์โทรศัพท์ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="08X-XXX-XXXX"
                type="tel"
                value={data.phone}
                onChange={e => { onUpdate({ phone: e.target.value }); setErrors(p => ({ ...p, phone: "" })); }}
                className={fieldClass(errors.phone)}
              />
              {errors.phone && <p className="text-destructive text-xs font-sans">{errors.phone}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="font-sans text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                อีเมล
              </Label>
              <Input
                id="email"
                placeholder="example@email.com"
                type="email"
                value={data.email}
                onChange={e => { onUpdate({ email: e.target.value }); setErrors(p => ({ ...p, email: "" })); }}
                className={fieldClass(errors.email)}
              />
              {errors.email && <p className="text-destructive text-xs font-sans">{errors.email}</p>}
            </div>
          </div>


          {/* Mini summary */}
          {data.selectedServices.length > 0 && data.selectedDate && data.selectedTime && (
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm font-sans mt-2">
              <p className="font-medium text-primary mb-1.5 font-mitr">สรุปการจองเบื้องต้น</p>
              <div className="text-muted-foreground space-y-0.5">
                <p>บริการ: {data.selectedServices.map(s => s.massage_name).join(', ')}</p>
                <p>วันที่: {data.selectedDate.toLocaleDateString("th-TH", { dateStyle: "long" })} เวลา {data.selectedTime} น.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-2 max-w-xl mx-auto w-full">
        <Button variant="outline" onClick={onBack} className="gap-2 font-sans" size="lg">
          <ChevronLeft className="h-4 w-4" />
          ย้อนกลับ
        </Button>
        <Button onClick={handleNext} className="gap-2 px-8 font-sans" size="lg">
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
