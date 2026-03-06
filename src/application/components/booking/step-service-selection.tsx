"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Leaf, Wind, Droplets, Flower, Sparkles, ChevronRight, Loader2, AlertCircle, CheckCircle2, Circle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MassageService, StepProps } from "./types";

const SERVICE_ICONS = [Leaf, Wind, Droplets, Flower, Sparkles];

const SERVICE_META: Record<string, { description: string; duration: number }> = {
  "นวดไทยต้นตำรับ":    { description: "ศาสตร์การนวดแผนโบราณที่ผสานการยืดเหยียดและการกดจุด เพื่อเพิ่มความยืดหยุ่นและกระตุ้นการไหลเวียนของพลังงาน", duration: 60 },
  "นวดสวีดิชผ่อนคลาย": { description: "เทคนิคการนวดแบบยุโรปคลาสสิกที่เน้นความนุ่มนวลและลื่นไหล เพื่อสลายความตึงเครียดอย่างสมบูรณ์", duration: 90 },
  "นวดอโรมาเธอราพี":   { description: "การเดินทางสู่ความสมดุลแบบองค์รวม ผสานท่านวดที่ผ่อนคลายร่วมกับน้ำมันหอมระเหยสูตรพิเศษ", duration: 90 },
  "นวดหินร้อน":         { description: "สัมผัสความอบอุ่นจากหินภูเขาไฟที่ถูกคัดสรรมาเป็นพิเศษ ช่วยคลายกล้ามเนื้อที่ตึงเครียดในเชิงลึก", duration: 120 },
  "นวดฝ่าเท้า":         { description: "กระตุ้นจุดรีเฟล็กซ์บนฝ่าเท้าที่สอดคล้องกับอวัยวะภายใน เพื่อฟื้นฟูพลังงานและความสดชื่น", duration: 45 },
  "ทรีทเมนท์สปาหรู":   { description: "ประสบการณ์สปาสุดพิเศษ ผสานการนวดพร้อมหน้ากากโคลนและสครับสมุนไพรในบรรยากาศสุดหรู", duration: 150 },
};

const DEFAULT_DURATION = 60;

export function StepServiceSelection({ data, onUpdate, onNext }: StepProps) {
  const [services, setServices] = useState<MassageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services
    .filter(service => {
      const isSelected = data.selectedServices.some(s => s.massage_id === service.massage_id);
      if (isSelected) return true;
      
      const lowerQuery = searchQuery.toLowerCase();
      return service.massage_name.toLowerCase().includes(lowerQuery) || 
             (service.description && service.description.toLowerCase().includes(lowerQuery));
    })
    .sort((a, b) => {
      const aSelected = data.selectedServices.some(s => s.massage_id === a.massage_id);
      const bSelected = data.selectedServices.some(s => s.massage_id === b.massage_id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/massage");
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? "Failed to load services");
        }

        const enriched: MassageService[] = (json.data as MassageService[]).map(s => ({
          ...s,
          description: SERVICE_META[s.massage_name]?.description,
          duration:    SERVICE_META[s.massage_name]?.duration ?? DEFAULT_DURATION,
        }));

        setServices(enriched);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleSelect = (service: MassageService) => {
    const isSelected = data.selectedServices.some(s => s.massage_id === service.massage_id);
    if (isSelected) {
      onUpdate({ selectedServices: data.selectedServices.filter(s => s.massage_id !== service.massage_id) });
    } else {
      onUpdate({ selectedServices: [...data.selectedServices, service] });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">
          เลือกบริการที่ต้องการ
        </h2>
        <p className="text-muted-foreground mt-2 font-sans">
          เลือกทรีทเมนท์ที่เหมาะกับความต้องการของคุณ
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-sans text-sm">
          <Loader2 className="h-6 w-6 animate-spin mb-4" />
          กำลังโหลดบริการ...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground font-sans text-sm">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <p>โหลดบริการไม่สำเร็จ: {error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            ลองอีกครั้ง
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
<<<<<<< HEAD
=======
          {/* Search Bar */}
>>>>>>> 52774cc (feat: Implement automatic therapist and room assignment in booking API and dynamic time slot availability based on service duration.)
          <div className="max-w-2xl mx-auto w-full mb-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="ค้นหาบริการ..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-card/40 backdrop-blur-md border border-border/40 rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans text-sm shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {filteredServices.length === 0 ? (
<<<<<<< HEAD
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground font-sans text-sm bg-card/20 rounded-[28px] max-w-2xl mx-auto w-full border border-dashed border-border/40">
              <p>ไม่พบบริการที่ตรงกับ "{searchQuery}"</p>
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-[28px] max-w-2xl mx-auto w-full overflow-hidden shadow-sm flex flex-col max-h-[500px]">
              <div className="overflow-y-auto custom-scrollbar p-2">
=======
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground font-sans text-sm bg-card/20 rounded-[28px] max-w-2xl mx-auto w-full">
              <p>ไม่พบบริการที่ตรงกับ "{searchQuery}"</p>
            </div>
          ) : (
            <div className="bg-card/40 backdrop-blur-md border border-border/40 rounded-[28px] max-w-2xl mx-auto w-full overflow-hidden shadow-sm flex flex-col max-h-[400px]">
              <div className="overflow-y-auto custom-scrollbar">
>>>>>>> 52774cc (feat: Implement automatic therapist and room assignment in booking API and dynamic time slot availability based on service duration.)
                {filteredServices.map((service, index) => {
                  const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
                  const isSelected = data.selectedServices.some(s => s.massage_id === service.massage_id);
                  return (
                    <button
                      key={service.massage_id}
                      onClick={() => handleSelect(service)}
                      className={cn(
<<<<<<< HEAD
                        "group flex items-center justify-between p-4 px-5 w-full bg-transparent transition-all text-left outline-none rounded-2xl mb-1",
                        isSelected ? "bg-primary/10 shadow-sm" : "hover:bg-muted/40"
=======
                        "group flex items-center justify-between p-4 px-5 w-full bg-transparent transition-colors text-left outline-none hover:bg-muted/30 active:bg-muted/50",
                        index !== filteredServices.length - 1 && "border-b border-border/40",
                        isSelected && "bg-primary/5 hover:bg-primary/10 active:bg-primary/15"
>>>>>>> 52774cc (feat: Implement automatic therapist and room assignment in booking API and dynamic time slot availability based on service duration.)
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
<<<<<<< HEAD
                          "h-10 w-10 shrink-0 rounded-[14px] flex items-center justify-center transition-all duration-300",
                          isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" : "bg-primary/10 text-primary/70 group-hover:scale-110"
=======
                          "h-10 w-10 shrink-0 rounded-[14px] flex items-center justify-center transition-colors duration-200",
                          isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-primary/10 text-primary/70 group-hover:text-primary"
>>>>>>> 52774cc (feat: Implement automatic therapist and room assignment in booking API and dynamic time slot availability based on service duration.)
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className={cn(
                            "font-medium font-mitr transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {service.massage_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-sans">{service.duration ?? DEFAULT_DURATION} นาที</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-semibold text-primary font-sans">
                            ฿{Number(service.massage_price).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-center">
                          {isSelected ? (
                            <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-sm" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end pt-2 max-w-2xl mx-auto w-full">
        <Button
          onClick={onNext}
          disabled={data.selectedServices.length === 0}
          className="gap-2 px-8 font-sans"
          size="lg"
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
