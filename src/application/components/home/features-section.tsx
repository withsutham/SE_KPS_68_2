import { Layers, Package, TicketPercent } from "lucide-react";

export function FeaturesSection() {
    return (
        <section className="w-full bg-secondary/10 border-y border-primary/10 py-24 px-8 mt-16">
            <div className="max-w-7xl mx-auto flex flex-col gap-16">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-4xl font-light tracking-tight text-primary font-mitr">จองง่าย ครบจบในที่เดียว</h2>
                    <p className="text-muted-foreground font-light text-lg">
                        เราตั้งใจพัฒนาระบบจองที่ยืดหยุ่น ให้คุณเลือกบริการได้ตามใจ
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-start">
                    <div className="flex flex-col items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Layers className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight">เลือกได้หลายบริการในครั้งเดียว</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed text-sm">
                            จองนวดหลายประเภทพร้อมกัน จัดลำดับได้ตามต้องการ ไม่ต้องจองแยกหลายครั้ง
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Package className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight">แพ็กเกจสุดคุ้ม</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed text-sm">
                            ซื้อแพ็กเกจล่วงหน้าในราคาพิเศษ เก็บไว้ใช้ได้เมื่อสะดวก ผสมกับบริการอื่นได้
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <TicketPercent className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-medium tracking-tight">คูปองส่วนลด</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed text-sm">
                            สะสมคูปองและใช้ส่วนลดได้ทันทีตอนจอง ยิ่งใช้บ่อย ยิ่งคุ้ม
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
