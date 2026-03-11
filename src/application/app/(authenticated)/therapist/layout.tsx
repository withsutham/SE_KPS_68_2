import Sidebar from "@/components/therapist/Sidebar";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F0F5FA]">
      {/* Sidebar จะถูกโหลดแค่ครั้งเดียวที่นี่ */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* เนื้อหาแต่ละหน้าจะมาแสดงที่ children */}
        {children}
      </div>
    </div>
  );
}