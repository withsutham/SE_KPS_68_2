"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Clock,
  Leaf,
  Wind,
  Droplets,
  Flower,
  Sparkles,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Search,
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  CheckCircle2,
  ImageOff,
  GripVertical,
  Gift,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MassageService, StepProps } from "./types";

const SERVICE_ICONS = [Leaf, Wind, Droplets, Flower, Sparkles];
const SERVICE_META: Record<string, { description: string; duration: number }> = {
  "นวดไทยต้นตำรับ": { description: "ศาสตร์การนวดแผนโบราณที่ผสานการยืดเหยียดและการกดจุด", duration: 60 },
  "นวดสวีดิชผ่อนคลาย": { description: "เทคนิคการนวดแบบยุโรปคลาสสิกที่เน้นความนุ่มนวลและลื่นไหล", duration: 90 },
  "นวดอโรมาเธอราพี": { description: "ผสานท่านวดที่ผ่อนคลายกับน้ำมันหอมระเหยสูตรพิเศษ", duration: 90 },
  "นวดหินร้อน": { description: "สัมผัสความอบอุ่นจากหินภูเขาไฟ ช่วยคลายกล้ามเนื้อในเชิงลึก", duration: 120 },
  "นวดฝ่าเท้า": { description: "กระตุ้นจุดรีเฟล็กซ์บนฝ่าเท้าเพื่อฟื้นฟูพลังงาน", duration: 45 },
  "ทรีทเมนท์สปาหรู": { description: "ประสบการณ์สปาผสานการนวดและสครับสมุนไพร", duration: 150 },
};
const DEFAULT_DURATION = 60;

type SortKey = "default" | "price_asc" | "price_desc" | "time_asc" | "time_desc";

// ─── Service Card inside the Picker Modal ─────────────────────────────────────
function PickerCard({
  service,
  isSelected,
  index,
  onToggle,
}: {
  service: MassageService;
  isSelected: boolean;
  index: number;
  onToggle: () => void;
}) {
  const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
  return (
    <button
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col rounded-2xl border overflow-hidden text-left transition-all duration-200",
        isSelected
          ? "border-primary/50 ring-2 ring-primary/20 shadow-md shadow-primary/10"
          : "border-border/40 hover:border-border/70 hover:shadow-md"
      )}
    >
      {/* Image */}
      <div className="relative h-36 w-full bg-muted/40 overflow-hidden">
        {service.image_src ? (
          <Image
            src={service.image_src}
            alt={service.massage_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
              isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary/70"
            )}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        )}
        {!service.image_src && (
          <ImageOff className="absolute top-2 right-2 h-3.5 w-3.5 text-muted-foreground/30" />
        )}
        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-primary drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col gap-2 p-3 transition-colors",
        isSelected ? "bg-primary/5" : "bg-card/60"
      )}>
        <p className={cn(
          "font-medium font-mitr text-sm leading-snug line-clamp-2",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {service.massage_name}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs font-medium border-primary/30 text-primary bg-primary/5">
            ฿{Number(service.massage_price).toLocaleString()}
          </Badge>
          {(service.duration ?? DEFAULT_DURATION) > 0 && (
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs border-border/40 text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {service.duration ?? DEFAULT_DURATION} นาที
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Service Picker Modal ─────────────────────────────────────────────────────
interface ServicePickerProps {
  open: boolean;
  onClose: () => void;
  allServices: MassageService[];
  selectedIds: Set<string | number>;
  onToggle: (service: MassageService) => void;
  customerId?: number;
  unusedPackages?: any[];
  onPackageToggle?: (pkg: any) => void;
}

function ServicePickerModal({ open, onClose, allServices, selectedIds, onToggle, customerId, unusedPackages = [], onPackageToggle }: ServicePickerProps) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [activeTab, setActiveTab] = useState<"all" | "packages">("all");

  // Group packages by parent package
  const groupedPackages = useMemo(() => {
    const groups: Record<number, { package: any; services: any[] }> = {};
    unusedPackages.forEach((pkg) => {
      const packageId = pkg.package?.package_id;
      if (!packageId) return;
      if (!groups[packageId]) {
        groups[packageId] = { package: pkg.package, services: [] };
      }
      groups[packageId].services.push(pkg);
    });
    return Object.values(groups);
  }, [unusedPackages]);

  const bounds = useMemo(() => {
    if (!allServices.length) return { minPrice: 0, maxPrice: 9999, minTime: 0, maxTime: 999 };
    const prices = allServices.map(s => s.massage_price);
    const times = allServices.filter(s => s.duration != null).map(s => s.duration as number);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
      minTime: times.length ? Math.min(...times) : 0,
      maxTime: times.length ? Math.max(...times) : 999,
    };
  }, [allServices]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 999]);

  useEffect(() => {
    if (allServices.length) {
      setPriceRange([bounds.minPrice, bounds.maxPrice]);
      setTimeRange([bounds.minTime, bounds.maxTime]);
    }
  }, [allServices.length, bounds.minPrice, bounds.maxPrice, bounds.minTime, bounds.maxTime]);

  const filtered = useMemo(() => {
    let result = allServices.filter(s => {
      const nameMatch = s.massage_name.toLowerCase().includes(search.toLowerCase());
      const priceMatch = s.massage_price >= priceRange[0] && s.massage_price <= priceRange[1];
      const timeMatch = s.duration == null || (s.duration >= timeRange[0] && s.duration <= timeRange[1]);
      return nameMatch && priceMatch && timeMatch;
    });
    switch (sortKey) {
      case "price_asc": result = [...result].sort((a, b) => a.massage_price - b.massage_price); break;
      case "price_desc": result = [...result].sort((a, b) => b.massage_price - a.massage_price); break;
      case "time_asc": result = [...result].sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0)); break;
      case "time_desc": result = [...result].sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0)); break;
    }
    return result;
  }, [allServices, search, priceRange, timeRange, sortKey]);

  // Filter packages by search
  const filteredPackages = useMemo(() => {
    return groupedPackages.map(group => ({
      ...group,
      services: group.services.filter(pkg => {
        const massage = pkg.massage;
        const nameMatch = massage?.massage_name?.toLowerCase().includes(search.toLowerCase()) ?? true;
        const priceMatch = true; // Packages are free
        const timeMatch = pkg.duration == null || (pkg.duration >= timeRange[0] && pkg.duration <= timeRange[1]);
        return nameMatch && priceMatch && timeMatch;
      })
    })).filter(group => group.services.length > 0);
  }, [groupedPackages, search, timeRange]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="font-mitr text-xl text-foreground">เพิ่มบริการ</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "packages")} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2 bg-muted/40 p-1 rounded-lg shrink-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-background rounded-md">
              บริการทั้งหมด
            </TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:bg-background rounded-md gap-2">
              <Package className="h-4 w-4" />
              แพ็กเกจของฉัน
              {unusedPackages.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-5">
                  {unusedPackages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Controls - shown only on "All Services" tab */}
          {activeTab === "all" && (
            <div className="px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-border/30 shrink-0">
              {/* Row 1: Search + Sort + Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ค้นหาบริการ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-full border border-border/50 bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
                  <SelectTrigger className="w-40 rounded-full border-border/50 bg-muted/30 text-sm h-9">
                    <SelectValue placeholder="เรียงตาม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">ค่าเริ่มต้น</SelectItem>
                    <SelectItem value="price_asc">ราคา: น้อย → มาก</SelectItem>
                    <SelectItem value="price_desc">ราคา: มาก → น้อย</SelectItem>
                    <SelectItem value="time_asc">เวลา: สั้น → ยาว</SelectItem>
                    <SelectItem value="time_desc">เวลา: ยาว → สั้น</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all h-9",
                    showFilters ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  กรอง
                </button>
              </div>

              {/* Row 2: Filter sliders */}
              {showFilters && (
                <div className="flex flex-col gap-3 pb-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">ช่วงราคา</span>
                      <span className="text-primary">฿{priceRange[0].toLocaleString()} – ฿{priceRange[1].toLocaleString()}</span>
                    </div>
                    <Slider min={bounds.minPrice} max={bounds.maxPrice} step={50} value={priceRange} onValueChange={v => setPriceRange(v as [number, number])} />
                  </div>
                  {bounds.maxTime > bounds.minTime && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">ระยะเวลา</span>
                        <span className="text-primary">{timeRange[0]}–{timeRange[1]} นาที</span>
                      </div>
                      <Slider min={bounds.minTime} max={bounds.maxTime} step={15} value={timeRange} onValueChange={v => setTimeRange(v as [number, number])} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Controls for packages tab - search and time filter only */}
          {activeTab === "packages" && (
            <div className="px-6 pt-4 pb-3 flex flex-col gap-3 border-b border-border/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ค้นหาบริการ..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-full border border-border/50 bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter toggle for packages */}
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all h-9",
                    showFilters ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  กรอง
                </button>
              </div>

              {/* Filter sliders for packages - time only */}
              {showFilters && (
                <div className="flex flex-col gap-3 pb-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {bounds.maxTime > bounds.minTime && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">ระยะเวลา</span>
                        <span className="text-primary">{timeRange[0]}–{timeRange[1]} นาที</span>
                      </div>
                      <Slider min={bounds.minTime} max={bounds.maxTime} step={15} value={timeRange} onValueChange={v => setTimeRange(v as [number, number])} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Content Tabs */}
          <TabsContent value="all" className="overflow-y-auto flex-1 min-h-0 p-4 mt-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p>ไม่พบบริการที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((service, index) => (
                  <PickerCard
                    key={service.massage_id}
                    service={service}
                    isSelected={selectedIds.has(service.massage_id)}
                    index={index}
                    onToggle={() => onToggle(service)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="packages" className="overflow-y-auto flex-1 min-h-0 p-4 mt-0">
            {!customerId || unusedPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                <Gift className="h-8 w-8 opacity-20" />
                <p>คุณยังไม่มีแพ็กเกจ</p>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                <Search className="h-8 w-8 opacity-20" />
                <p>ไม่พบแพ็กเกจที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPackages.map((group: any) => (
                  <div key={group.package.package_id} className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                          <Gift className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium font-mitr text-sm text-foreground">
                            {group.package.package_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans">
                            {group.services.length} บริการในแพ็กเกจ
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.services.map((pkg: any) => (
                          <PackageServiceCard
                            key={pkg.member_package_id}
                            packageData={pkg}
                            isSelected={selectedIds.has(`pkg_${pkg.member_package_id}`)}
                            onSelect={() => onPackageToggle?.(pkg)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/30 flex items-center justify-between shrink-0">
          <span className="text-sm text-muted-foreground">
            เลือกแล้ว <span className="text-foreground font-medium">{selectedIds.size}</span> บริการ
          </span>
          <DialogClose asChild>
            <Button className="rounded-full px-6 font-mitr" onClick={onClose}>เสร็จสิ้น</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sortable Item ──────────────────────────────────────────────────────────────
function SortableServiceItem({
  service,
  index,
  totalItems,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  service: MassageService;
  index: number;
  totalItems: number;
  onRemove: (id: string | number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.massage_id });
  const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center justify-between p-4 px-5 bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl group transition-all duration-200",
        isDragging && "opacity-90 shadow-xl border-primary scale-[1.02]"
      )}
    >
      {/* Package Badge */}
      {service.fromPackage && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0.5">
            แพ็กเกจ
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-4 cursor-default">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/50 hover:text-foreground touch-none mr-1 -ml-2 p-1 focus:outline-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <span className="font-mitr font-medium text-lg text-primary min-w-[1.2rem] text-center">{index + 1}.</span>
        <div className="h-10 w-10 shrink-0 rounded-[14px] bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
          {service.fromPackage ? (
            <Gift className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-medium font-mitr text-foreground">{service.massage_name}</p>
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{service.duration ?? DEFAULT_DURATION} นาที</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
        <span className="text-sm font-semibold text-primary pt-1 sm:pt-0">
          {service.fromPackage ? (
            <span className="text-green-600">ฟรี</span>
          ) : (
            `฿${Number(service.massage_price).toLocaleString()}`
          )}
        </span>

        <div className="flex items-center gap-1 border border-border/60 rounded-full py-0.5 px-1 bg-background/50">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center transition-all",
              index === 0 ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label="เลื่อนขึ้น"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalItems - 1}
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center transition-all",
              index === totalItems - 1 ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            aria-label="เลื่อนลง"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="w-px h-4 bg-border/60 mx-1" />

          <button
            onClick={() => onRemove(service.massage_id)}
            className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            aria-label="ลบบริการ"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Service Card ─────────────────────────────────────────────────────
function PackageServiceCard({
  packageData,
  isSelected,
  onSelect,
}: {
  packageData: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const massage = packageData.massage;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border/50 hover:border-primary/30 bg-card/40 hover:bg-card/60 hover:shadow-sm"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/10">
        {massage?.image_src ? (
          <Image
            src={massage.image_src}
            alt={massage.massage_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary/5 text-primary/40">
            <Gift className="h-6 w-6" />
          </div>
        )}
        
        {/* Selected Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
            <CheckCircle2 className="h-8 w-8 text-primary fill-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="font-medium font-mitr text-sm truncate text-foreground/90">
            {massage?.massage_name || "บริการ"}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0 rounded-md font-normal",
              isSelected 
                ? "bg-primary text-white border-transparent" 
                : "bg-green-500/10 text-green-600 border-green-500/20"
            )}
          >
            {isSelected ? "เลือกแล้ว" : "ใช้สิทธิ์ฟรี"}
          </Badge>
          <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 font-sans">
            <Clock className="h-3 w-3" />
            {massage?.massage_time || 60} นาที
          </span>
        </div>
      </div>
    </button>
  );
}


// ─── Main Step Component ──────────────────────────────────────────────────────
export function StepServiceSelection({ data, onUpdate, onNext, autoOpenPicker = true }: StepProps) {
  const [allServices, setAllServices] = useState<MassageService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [unusedPackages, setUnusedPackages] = useState<any[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState<Record<number, boolean>>({});

  const togglePackageExpand = (packageId: number) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  // Group packages by parent package
  const groupedPackages = useMemo(() => {
    const groups: Record<number, { package: any; services: any[] }> = {};
    unusedPackages.forEach((pkg) => {
      const packageId = pkg.package?.package_id;
      if (!packageId) return;
      if (!groups[packageId]) {
        groups[packageId] = { package: pkg.package, services: [] };
      }
      groups[packageId].services.push(pkg);
    });
    return Object.values(groups);
  }, [unusedPackages]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/massage");
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to load services");
        const enriched: MassageService[] = (json.data as MassageService[]).map(s => ({
          ...s,
          description: SERVICE_META[s.massage_name]?.description,
          duration: SERVICE_META[s.massage_name]?.duration ?? (s.duration ?? DEFAULT_DURATION),
        }));
        setAllServices(enriched);
        if (autoOpenPicker && data.selectedServices.length === 0) {
          setPickerOpen(true);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user's unused packages
  useEffect(() => {
    if (data.customerId) {
      const fetchPackages = async () => {
        try {
          setPackagesLoading(true);
          const res = await fetch(`/api/member_package/unused?customer_id=${data.customerId}`);
          const json = await res.json();
          if (json.success && json.data) {
            setUnusedPackages(json.data);
          }
        } catch (err) {
          console.error("Failed to fetch packages:", err);
        } finally {
          setPackagesLoading(false);
        }
      };
      fetchPackages();
    }
  }, [data.customerId]);

  const selectedIds = useMemo(
    () => new Set(data.selectedServices.map(s => s.massage_id)),
    [data.selectedServices]
  );

  const handleToggle = (service: MassageService) => {
    const isSelected = selectedIds.has(service.massage_id);
    if (isSelected) {
      onUpdate({ selectedServices: data.selectedServices.filter(s => s.massage_id !== service.massage_id) });
    } else {
      onUpdate({ selectedServices: [...data.selectedServices, service] });
    }
  };

  const handlePackageToggle = (pkg: any) => {
    const massage = pkg.massage;
    const packageInfo = pkg.package;
    
    // Create a unique ID for package services
    const uniqueId = `pkg_${pkg.member_package_id}`;
    
    if (selectedIds.has(uniqueId)) {
      // Remove from selection
      onUpdate({
        selectedServices: data.selectedServices.filter(
          s => s.massage_id !== uniqueId
        )
      });
    } else {
      // Add to selection as a service with package metadata
      const packageService: MassageService = {
        massage_id: uniqueId,
        massage_name: massage?.massage_name || "บริการจากแพ็กเกจ",
        massage_price: 0, // FREE - using package
        image_src: packageInfo?.image_src || null,
        duration: massage?.massage_time || 60,
        // Package metadata
        fromPackage: true,
        member_package_id: pkg.member_package_id,
        package_name: packageInfo?.package_name,
      };
      
      onUpdate({
        selectedServices: [...data.selectedServices, packageService]
      });
    }
  };

  const handleRemove = (id: string | number) => {
    onUpdate({ selectedServices: data.selectedServices.filter(s => s.massage_id !== id) });
  };

  const handleClearAll = () => {
    onUpdate({ selectedServices: [] });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newServices = [...data.selectedServices];
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    onUpdate({ selectedServices: newServices });
  };

  const handleMoveDown = (index: number) => {
    if (index === data.selectedServices.length - 1) return;
    const newServices = [...data.selectedServices];
    [newServices[index + 1], newServices[index]] = [newServices[index], newServices[index + 1]];
    onUpdate({ selectedServices: newServices });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.selectedServices.findIndex(s => s.massage_id === active.id);
      const newIndex = data.selectedServices.findIndex(s => s.massage_id === over.id);
      onUpdate({ selectedServices: arrayMove(data.selectedServices, oldIndex, newIndex) });
    }
  };

  const totalPrice = data.selectedServices.reduce((sum, s) => sum + (s.fromPackage ? 0 : Number(s.massage_price)), 0);
  const totalTime = data.selectedServices.reduce((sum, s) => sum + (s.duration ?? DEFAULT_DURATION), 0);
  const paidServices = data.selectedServices.filter(s => !s.fromPackage);
  const packageServices = data.selectedServices.filter(s => s.fromPackage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground font-sans text-sm">
        <Loader2 className="h-6 w-6 animate-spin mb-4" />
        กำลังโหลดบริการ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground font-sans text-sm">
        <AlertCircle className="h-8 w-8 text-destructive/60" />
        <p>โหลดบริการไม่สำเร็จ: {error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>ลองอีกครั้ง</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-medium font-mitr text-foreground">เลือกบริการที่ต้องการ</h2>
        <p className="text-muted-foreground mt-2 font-sans text-sm">เลือกทรีทเมนท์ที่เหมาะกับความต้องการของคุณ</p>
      </div>

      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* My Packages Section - Only for authenticated users with packages */}
        {data.customerId && !packagesLoading && groupedPackages.length > 0 && (
          <div className="flex flex-col gap-6 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold font-mitr text-lg text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                แพ็กเกจของฉัน
              </h3>
              <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                {unusedPackages.length} บริการพร้อมใช้
              </Badge>
            </div>

            <div className="space-y-4">
              {groupedPackages.map((group: any) => {
                const isExpanded = !!expandedPackages[group.package.package_id];
                const selectedCount = group.services.filter((s: any) => 
                  selectedIds.has(`pkg_${s.member_package_id}`)
                ).length;

                return (
                  <div key={group.package.package_id} className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => togglePackageExpand(group.package.package_id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group/row"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          isExpanded || selectedCount > 0 ? "bg-primary text-white" : "bg-primary/10 text-primary"
                        )}>
                          <Gift className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium font-mitr text-sm text-foreground">
                            {group.package.package_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-sans mt-0.5">
                            {group.services.length} บริการในแพ็กเกจ
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {selectedCount > 0 && (
                          <Badge className="bg-primary text-white border-transparent text-[10px] h-5 px-1.5">
                            เลือกแล้ว {selectedCount}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover/row:text-primary transition-colors" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover/row:text-primary transition-colors" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/40">
                          {group.services.map((pkg: any) => (
                            <PackageServiceCard
                              key={pkg.member_package_id}
                              packageData={pkg}
                              isSelected={selectedIds.has(`pkg_${pkg.member_package_id}`)}
                              onSelect={() => handlePackageToggle(pkg)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        {data.customerId && !packagesLoading && groupedPackages.length > 0 && (
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
              หรือเลือกบริการเพิ่มเติม
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>
        )}

        {/* Empty Placeholder */}
        {data.selectedServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-border/50 bg-card/20 text-muted-foreground text-sm gap-2">
            <Leaf className="h-8 w-8 opacity-20" />
            <p>ยังไม่ได้เลือกบริการ</p>
            <p className="text-xs opacity-70">กด "เพิ่มบริการ" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={data.selectedServices.map(s => s.massage_id)}
                strategy={verticalListSortingStrategy}
              >
                {data.selectedServices.map((service, index) => (
                  <SortableServiceItem
                    key={service.massage_id}
                    service={service}
                    index={index}
                    totalItems={data.selectedServices.length}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Summary */}
            <div className="flex flex-col gap-2 px-5 py-3 rounded-2xl bg-primary/5 border border-primary/20 text-sm font-medium">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  รวมเวลา {totalTime} นาที
                </div>
                <span className="text-primary font-semibold text-base">รวม ฿{totalPrice.toLocaleString()}</span>
              </div>
              {packageServices.length > 0 && (
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    ใช้แพ็กเกจ {packageServices.length} รายการ
                  </span>
                  <span>ฟรี</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Service */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPickerOpen(true)}
            className="w-full rounded-full border-dashed border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 gap-2 font-sans transition-all"
          >
            <Plus className="h-4 w-4" />
            เพิ่มบริการ
          </Button>
          {data.selectedServices.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="shrink-0 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-all font-sans"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              ล้างทั้งหมด
            </Button>
          )}
        </div>
      </div>

      <ServicePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allServices={allServices}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        customerId={data.customerId}
        unusedPackages={unusedPackages}
        onPackageToggle={handlePackageToggle}
      />

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
