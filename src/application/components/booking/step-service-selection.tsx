"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Leaf, Wind, Droplets, Flower, Sparkles, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MassageService, StepProps } from "./types";

const SERVICE_ICONS = [Leaf, Wind, Droplets, Flower, Sparkles];

// UI enrichment per service name (descriptions + durations — not stored in DB)
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

        // Enrich with UI metadata using service name as key
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

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground font-sans">
          <AlertCircle className="h-8 w-8 text-destructive/60" />
          <p className="text-sm">โหลดบริการไม่สำเร็จ: {error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            ลองอีกครั้ง
          </Button>
        </div>
      )}

      {/* Service grid */}
      {!loading && !error && (
        <>
          {services.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground font-sans text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ไม่พบข้อมูลบริการ
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => {
                const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
                const isSelected = data.selectedServices.some(s => s.massage_id === service.massage_id);
                return (
                  <Card
                    key={service.massage_id}
                    onClick={() => handleSelect(service)}
                    className={cn(
                      "group cursor-pointer border-2 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/40 bg-card/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                          isSelected ? "bg-primary/20" : "bg-primary/10"
                        )}>
                          <Icon className={cn("h-5 w-5 transition-colors", isSelected ? "text-primary" : "text-primary/70")} />
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <ChevronRight className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-base font-medium font-mitr mt-3">
                        {service.massage_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {service.description && (
                        <CardDescription className="text-sm font-light leading-relaxed line-clamp-2 mb-3">
                          {service.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-xs font-sans">
                            {service.duration ?? DEFAULT_DURATION} นาที
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium font-sans transition-colors",
                            isSelected && "bg-primary/15 text-primary border-primary/20"
                          )}
                        >
                          ฿{Number(service.massage_price).toLocaleString()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="flex justify-end pt-2">
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
