"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, Edit, Save, X } from "lucide-react";

// Phone number formatting utility
function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

// Format date in Thai
function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface CustomerProfile {
  customer_id: number;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email_address: string | null;
  regis_datetime: string;
}

function ProfilePageInner() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Form state for editing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }>({});

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          window.location.href = "/auth/login?returnTo=/profile";
          return;
        }

        const res = await fetch("/api/profile");
        if (res.ok) {
          const { data } = await res.json();
          setProfile(data);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setPhoneNumber(data.phone_number || "");
        } else {
          showAlert("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้", "error");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        showAlert("เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form to original values
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setPhoneNumber(profile.phone_number || "");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = "กรุณากรอกชื่อ";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "กรุณากรอกนามสกุล";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
    } else {
      const cleanedPhone = phoneNumber.replace(/[-\s]/g, "");
      if (!/^[0-9]{9,10}$/.test(cleanedPhone)) {
        newErrors.phoneNumber = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber || null,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setProfile(result.data);
        setIsEditing(false);
        showAlert("บันทึกข้อมูลสำเร็จ", "success");
      } else {
        showAlert(result.error || "ไม่สามารถบันทึกข้อมูลได้", "error");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showAlert("เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground font-mitr">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="mt-2 text-muted-foreground font-mitr">ไม่พบข้อมูลโปรไฟล์</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-60 h-[400px] w-[400px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-24 relative z-10 space-y-8">
        {/* Page header */}
        <div className="flex flex-col items-center text-center mb-8 border-b border-border/50 pb-8">
          <p className="text-xs font-medium tracking-widest text-primary/60 uppercase font-sans mb-3">
            ฟื้นใจ · Massage & Spa
          </p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight font-mitr text-foreground mb-3">
            โปรไฟล์ของฉัน
          </h1>
          <p className="text-muted-foreground font-sans max-w-lg">
            จัดการข้อมูลส่วนตัวและช่องทางการติดต่อของคุณ
          </p>
        </div>

        <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xl font-medium font-mitr">
              ข้อมูลส่วนตัว
            </CardTitle>
            {!isEditing && (
              <Button
                onClick={handleEdit}
                className="font-mitr rounded-full px-4 !bg-emerald-600 hover:!bg-emerald-700 !text-white shadow-sm transition-colors"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                แก้ไขข้อมูล
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-mitr">
                    ชื่อ <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="กรอกชื่อ"
                    className={`font-mitr transition-all ${errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive font-mitr">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-mitr">
                    นามสกุล <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="กรอกนามสกุล"
                    className={`font-mitr transition-all ${errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive font-mitr">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-mitr">
                  เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์ (9-10 หลัก)"
                  className={`font-mitr transition-all ${errors.phoneNumber ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive font-mitr">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  อีเมล
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={profile.email_address || "-"}
                    disabled
                    className="font-mitr bg-muted/50 border-dashed"
                  />
                  <span className="text-muted-foreground text-sm" title="ไม่สามารถแก้ไขอีเมลได้">🔒</span>
                </div>
                <p className="text-xs text-muted-foreground/70 font-mitr">
                  ไม่สามารถแก้ไขอีเมลได้
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  สมาชิกตั้งแต่
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formatDate(profile.regis_datetime)}
                    disabled
                    className="font-mitr bg-muted/50 border-dashed"
                  />
                  <span className="text-muted-foreground text-sm" title="ไม่สามารถแก้ไขข้อมูลนี้ได้">🔒</span>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border/50">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 font-mitr rounded-full"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 font-mitr rounded-full shadow-md !bg-emerald-600 hover:!bg-emerald-700 !text-white transition-colors"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  บันทึกข้อมูล
                </Button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="font-mitr text-muted-foreground/80 text-sm">ชื่อ</Label>
                  <div className="text-base font-medium font-mitr bg-muted/20 p-3 rounded-lg border border-border/40 text-foreground">
                    {profile.first_name}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mitr text-muted-foreground/80 text-sm">
                    นามสกุล
                  </Label>
                  <div className="text-base font-medium font-mitr bg-muted/20 p-3 rounded-lg border border-border/40 text-foreground">
                    {profile.last_name}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mitr text-muted-foreground/80 text-sm">
                  เบอร์โทรศัพท์
                </Label>
                <div className="text-base font-medium font-mitr bg-muted/20 p-3 rounded-lg border border-border/40 text-foreground">
                  {profile.phone_number
                    ? formatPhoneNumber(profile.phone_number)
                    : <span className="text-muted-foreground/50 italic">- ไม่ได้ระบุ -</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mitr text-muted-foreground/80 text-sm">
                  อีเมล
                </Label>
                <div className="text-base font-medium font-mitr bg-muted/20 p-3 rounded-lg border border-border/40 text-foreground flex justify-between items-center">
                  <span>{profile.email_address || "-"}</span>
                  <span className="text-muted-foreground/40 text-xs">ยืนยันแล้ว</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="font-mitr text-muted-foreground/80 text-sm">
                  สมาชิกตั้งแต่
                </Label>
                <div className="text-base font-medium font-mitr bg-muted/20 p-3 rounded-lg border border-border/40 text-foreground">
                  {formatDate(profile.regis_datetime)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Alert Message */}
      {alertMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 p-4 px-6 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
            alertMessage.type === "success"
              ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
              : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
          }`}
        >
          {alertMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 relative top-[1px]" />
          ) : (
            <AlertCircle className="h-5 w-5 relative top-[1px]" />
          )}
          <p className="font-medium font-mitr">{alertMessage.message}</p>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
