"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// หมายเหตุ: เช็ค path ของ action และ ui components ให้ตรงกับโปรเจกต์ของคุณด้วยนะครับ
import { getEmployeeByUserId, updateEmployeeProfile, uploadEmployeePhoto } from "@/components/therapist/employee_actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Upload, 
  Loader2, 
  Save, 
  Phone, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TherapistSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    image_src: ""
  });
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const data = await getEmployeeByUserId(user.id);
        if (data) {
          setEmployee(data);
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone_number: data.phone_number || "",
            image_src: data.image_src || ""
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone_number") {
      // Only allow numbers and max 10 characters
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const result = await uploadEmployeePhoto(formDataUpload);

      if (!result.success) throw new Error("Upload failed");

      setFormData(prev => ({ ...prev, image_src: result.publicUrl! }));
      setMessage({ type: 'success', text: 'อัปโหลดรูปภาพเรียบร้อยแล้ว (อย่าลืมกดบันทึกข้อมูล)' });
    } catch (error: any) {
      console.error("Upload error:", error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateEmployeeProfile(employee.employee_id, formData);
      setMessage({ type: 'success', text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' });
      
      // Force refresh data and then hard reload to ensure layout updates
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      // Update local state
      setEmployee({ ...employee, ...formData });
    } catch (error: any) {
      console.error("Update error:", error);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 dark:bg-white/5" />
        <div className="bg-white dark:bg-[#1b231e] rounded-3xl p-8 space-y-8 shadow-sm border border-transparent dark:border-[#2b3530]">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-3xl dark:bg-white/5" />
            <Skeleton className="h-4 w-32 dark:bg-white/5" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full dark:bg-white/5" />
            <Skeleton className="h-12 w-full dark:bg-white/5" />
            <Skeleton className="h-12 w-full dark:bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/therapist" 
          className="h-10 w-10 rounded-xl bg-white dark:bg-[#1b231e] shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#62846E] transition-all border border-transparent dark:border-[#2b3530]"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 font-mitr">ตั้งค่าข้อมูลส่วนตัว</h1>
      </div>

      <div className="bg-white dark:bg-[#1b231e] rounded-3xl shadow-sm overflow-hidden border border-slate-100 dark:border-[#2b3530] transition-colors">
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-[#2b3530] shadow-xl relative bg-slate-50 dark:bg-[#161c18]">
                {formData.image_src ? (
                  <Image 
                    src={formData.image_src} 
                    alt="Profile Preview" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300 dark:text-gray-600">
                    <User size={48} />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10 text-[#62846E]">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-[#62846E] text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
              >
                <Upload size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800 dark:text-gray-200">รูปประจำตัว</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Success/Error Message */}
            {message && (
              <div className={cn(
                "p-4 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2",
                message.type === 'success' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
              )}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-gray-400 ml-1">ชื่อ</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="ระบุชื่อของคุณ"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#161c18] border-none focus:ring-2 focus:ring-[#62846E]/20 text-slate-800 dark:text-gray-100 placeholder:text-slate-300 dark:placeholder:text-gray-700 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-gray-400 ml-1">นามสกุล</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="ระบุนามสกุลของคุณ"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#161c18] border-none focus:ring-2 focus:ring-[#62846E]/20 text-slate-800 dark:text-gray-100 placeholder:text-slate-300 dark:placeholder:text-gray-700 transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-600 dark:text-gray-400 ml-1">เบอร์โทรศัพท์</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="08X-XXX-XXXX"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#161c18] border-none focus:ring-2 focus:ring-[#62846E]/20 text-slate-800 dark:text-gray-100 placeholder:text-slate-300 dark:placeholder:text-gray-700 transition-all font-medium"
                  maxLength={10}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving || uploading}
              className="w-full h-14 rounded-2xl bg-[#62846E] hover:bg-[#4a6353] text-white font-bold text-lg shadow-lg transition-all gap-2"
            >
              {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}