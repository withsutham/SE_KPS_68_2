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

    if (phoneNumber) {
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
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl font-bold font-mitr">
            โปรไฟล์ของฉัน
          </CardTitle>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              variant="outline"
              size="sm"
              className="font-mitr"
            >
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            // Edit Mode
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-mitr">
                  ชื่อ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="กรอกชื่อ"
                  className={`font-mitr ${errors.firstName ? "border-destructive" : ""}`}
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
                  className={`font-mitr ${errors.lastName ? "border-destructive" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive font-mitr">
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="font-mitr">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์ (9-10 หลัก)"
                  className={`font-mitr ${errors.phoneNumber ? "border-destructive" : ""}`}
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
                    className="font-mitr bg-muted"
                  />
                  <span className="text-muted-foreground text-sm">🔒</span>
                </div>
                <p className="text-xs text-muted-foreground font-mitr">
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
                    className="font-mitr bg-muted"
                  />
                  <span className="text-muted-foreground text-sm">🔒</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 font-mitr"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 font-mitr"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  บันทึก
                </Button>
              </div>
            </>
          ) : (
            // Display Mode
            <>
              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">ชื่อ</Label>
                <p className="text-lg font-mitr">{profile.first_name}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  นามสกุล
                </Label>
                <p className="text-lg font-mitr">{profile.last_name}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  เบอร์โทรศัพท์
                </Label>
                <p className="text-lg font-mitr">
                  {profile.phone_number
                    ? formatPhoneNumber(profile.phone_number)
                    : "-"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  อีเมล
                </Label>
                <p className="text-lg font-mitr">
                  {profile.email_address || "-"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mitr text-muted-foreground">
                  สมาชิกตั้งแต่
                </Label>
                <p className="text-lg font-mitr">
                  {formatDate(profile.regis_datetime)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
