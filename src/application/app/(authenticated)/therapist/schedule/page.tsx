import ScheduleContent from "@/components/therapist/schedule"; 
// ^ สมมติว่าไฟล์ใน components ชื่อ schedule.tsx

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#fbfaf9] p-8">
      <h1 className="text-2xl font-bold mb-6">ตารางงานของคุณ</h1>
      <ScheduleContent />
    </div>
  );
}