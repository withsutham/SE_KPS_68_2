import { Flower2, Clock, HeartHandshake } from "lucide-react";

export function FeaturesSection() {
    return (
        <section className="w-full bg-secondary/10 border-y border-primary/10 py-32 px-8 mt-16">
            <div className="max-w-7xl mx-auto flex flex-col gap-20">
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <h2 className="text-5xl font-light tracking-tight text-primary font-mitr">ประสบการณ์แห่งฟื้นใจ</h2>
                    <p className="text-muted-foreground font-light text-xl">
                        เราเน้นความเรียบง่าย ตัดทอนสิ่งที่รบกวนสายตา เพื่อให้คุณให้ความสำคัญกับสุขภาพและความเป็นอยู่ที่ดีอย่างเต็มที่
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center items-start">
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <HeartHandshake className="h-9 w-9" />
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight">นักบำบัดผู้เชี่ยวชาญ</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed">
                            ผู้เชี่ยวชาญที่มีใบรับรองของเราจะสัมผัสถึงความต้องการของร่างกายคุณ พร้อมปรับแรงกดและเทคนิคให้เหมาะสมกับแต่ละบุคคล
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Clock className="h-9 w-9" />
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight">ช่วงเวลาที่ไม่เร่งรีบ</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed">
                            เราให้เวลาในการรับบริการที่เพียงพอเพื่อให้คุณไม่รู้สึกเร่งรัด เวลาในพื้นที่แห่งนี้จะไหลผ่านไปอย่างสงบและมีคุณภาพ
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Flower2 className="h-9 w-9" />
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight">พื้นที่แห่งความสงบ</h3>
                        <p className="text-muted-foreground font-light px-4 leading-relaxed">
                            ห้องพักผ่อนที่เรียบง่าย ปราศจากสิ่งรบกวน ท่ามกลางแสงอุ่นที่นุ่มนวลและกลิ่นหอมจากพรรณไม้ เพื่อกล่อมเกลาจิตใจให้สงบ
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
