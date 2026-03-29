import Sidebar from "@/components/therapist/Sidebar";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#fbfaf9]">
      {/* Sidebar จะถูกโหลดแค่ครั้งเดียวที่นี่ */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {/* เนื้อหาแต่ละหน้าจะมาแสดงที่ children */}
          {children}
        </div>
      </div>
    </div>
  );
}