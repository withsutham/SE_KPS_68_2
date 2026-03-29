"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarRange,
  Edit3,
  FilterX,
  ImageIcon,
  Loader2,
  Package2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTablePagination,
  DEFAULT_TABLE_PAGE_OPTIONS,
  type TablePageOption,
} from "@/components/ui/data-table-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PackageStatus = "Active" | "Upcoming" | "Expired";
type StatusFilter = "all" | "active" | "upcoming" | "expired";
type RowsPerPage = TablePageOption;

interface Package {
  package_id: string;
  package_name: string;
  package_price: number;
  image_src?: string | null;
  campaign_start_datetime: string | null;
  campaign_end_datetime: string | null;
  package_detail?: {
    massage: {
      massage_name: string;
      massage_id: string;
      massage_price: number;
      massage_time: number;
    } | null;
  }[];
}

type ViewPackage = Package & {
  startsAt: Date | null;
  endsAt: Date | null;
  status: PackageStatus;
};

const PAGE_OPTIONS: RowsPerPage[] = [...DEFAULT_TABLE_PAGE_OPTIONS];
const STATUS_STYLE: Record<PackageStatus, string> = {
  Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Upcoming: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Expired: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
const STATUS_ORDER: Record<PackageStatus, number> = { Active: 0, Upcoming: 1, Expired: 2 };

function pickDate(value?: string | null) {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPackageStatus(pkg: Package, now = new Date()): PackageStatus {
  const startsAt = pickDate(pkg.campaign_start_datetime);
  const endsAt = pickDate(pkg.campaign_end_datetime);

  if (startsAt && startsAt.getTime() > now.getTime()) return "Upcoming";
  if (endsAt && endsAt.getTime() < now.getTime()) return "Expired";
  return "Active";
}

function formatCampaignDateTime(date: Date | null) {
  if (!date) return null;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() + 543;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

function formatCampaignPeriod(startsAt: Date | null, endsAt: Date | null) {
  if (startsAt && endsAt) {
    return `${formatCampaignDateTime(startsAt)} - ${formatCampaignDateTime(endsAt)}`;
  }
  if (startsAt) return `${formatCampaignDateTime(startsAt)} - ไม่กำหนดวันสิ้นสุด`;
  if (endsAt) return `เริ่มทันที - ${formatCampaignDateTime(endsAt)}`;
  return "ไม่กำหนดช่วงเวลา";
}

function matchesDateRange(pkg: ViewPackage, dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return true;

  const start = pkg.startsAt?.getTime() ?? pkg.endsAt?.getTime();
  const end = pkg.endsAt?.getTime() ?? pkg.startsAt?.getTime();

  if (start == null || end == null) return false;

  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

  if (from !== null && end < from) return false;
  if (to !== null && start > to) return false;
  return true;
}

function StatusBadge({ status }: { status: PackageStatus }) {
  const label =
    status === "Active" ? "Active" : status === "Upcoming" ? "Upcoming" : "Expired";
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]",
        STATUS_STYLE[status],
      )}
    >
      {label}
    </Badge>
  );
}

export default function PackagePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    void fetchPackages();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo, rowsPerPage]);

  async function fetchPackages() {
    setLoading(true);
    try {
      const res = await fetch("/api/package", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setPackages(json.data || []);
      } else {
        console.error("Failed to fetch packages:", json.error);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePackage(id: string) {
    if (!confirm("ต้องการลบแพ็กเกจนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/package/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchPackages();
      } else {
        const errorJson = await res.json();
        alert(`ลบแพ็กเกจไม่สำเร็จ: ${errorJson.error}`);
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  }

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  const viewPackages = useMemo<ViewPackage[]>(() => {
    const now = new Date();

    return [...packages]
      .map((pkg) => ({
        ...pkg,
        startsAt: pickDate(pkg.campaign_start_datetime),
        endsAt: pickDate(pkg.campaign_end_datetime),
        status: getPackageStatus(pkg, now),
      }))
      .sort((left, right) => {
        const statusDiff = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
        if (statusDiff !== 0) return statusDiff;

        const leftTime =
          left.status === "Expired"
            ? left.endsAt?.getTime() ?? 0
            : left.startsAt?.getTime() ?? left.endsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const rightTime =
          right.status === "Expired"
            ? right.endsAt?.getTime() ?? 0
            : right.startsAt?.getTime() ?? right.endsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;

        if (leftTime !== rightTime) {
          return left.status === "Expired" ? rightTime - leftTime : leftTime - rightTime;
        }

        return left.package_name.localeCompare(right.package_name);
      });
  }, [packages]);

  const filteredPackages = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return viewPackages.filter((pkg) => {
      const matchesSearch =
        !normalizedSearchTerm ||
        pkg.package_name.toLowerCase().includes(normalizedSearchTerm) ||
        (pkg.package_detail || []).some((detail) =>
          detail.massage?.massage_name?.toLowerCase().includes(normalizedSearchTerm),
        );

      const matchesStatus =
        statusFilter === "all" || pkg.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus && matchesDateRange(pkg, dateFrom, dateTo);
    });
  }, [dateFrom, dateTo, searchTerm, statusFilter, viewPackages]);

  const pageSize =
    rowsPerPage === "all" ? Math.max(filteredPackages.length, 1) : Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const startIndex = rowsPerPage === "all" ? 0 : (page - 1) * pageSize;
  const rows =
    rowsPerPage === "all"
      ? filteredPackages
      : filteredPackages.slice(startIndex, startIndex + pageSize);
  const showingFrom = rows.length === 0 ? 0 : startIndex + 1;
  const showingTo = rows.length === 0 ? 0 : startIndex + rows.length;

  const activeCount = viewPackages.filter((pkg) => pkg.status === "Active").length;
  const upcomingCount = viewPackages.filter((pkg) => pkg.status === "Upcoming").length;
  const expiredCount = viewPackages.filter((pkg) => pkg.status === "Expired").length;

  return (
    <main className="relative flex-1 font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
              <Package2 className="h-7 w-7 text-primary" />
            </div>
            <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">
              ผู้จัดการ · Manager
            </p>
            <h1 className="font-mitr text-3xl text-foreground md:text-4xl">
              จัดการแพ็กเกจ
            </h1>
            <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
              จัดการแคมเปญแพ็กเกจ ดูภาพตัวอย่าง และตรวจสอบสถานะการใช้งานทั้งหมด
            </p>
          </div>

          <div className="flex justify-end">
            <Link href="/manager/package/create">
              <Button className="rounded-full px-5 font-sans">+ สร้างแพ็กเกจ</Button>
            </Link>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4 md:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-mitr text-xl text-foreground">ตัวกรองแพ็กเกจ</h2>
                <p className="font-sans text-sm text-muted-foreground">
                  ค้นหาด้วยชื่อแพ็กเกจหรือบริการนวด กรองตามสถานะแคมเปญ และจำกัดผลลัพธ์ด้วยช่วงวันที่
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_200px_180px_180px_auto] xl:items-end">
              <div className="space-y-2">
                <Label htmlFor="package-search">ค้นหาชื่อแพ็กเกจ</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="package-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="ค้นหาแพ็กเกจหรือบริการนวด"
                    className="h-11 bg-background/75 pl-10 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>สถานะ</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <SelectTrigger className="h-11 w-full bg-background/75 font-sans">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-date-from">วันที่เริ่มต้น</Label>
                <Input
                  id="package-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="h-11 bg-background/75 font-sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-date-to">วันที่สิ้นสุด</Label>
                <Input
                  id="package-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="h-11 bg-background/75 font-sans"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-4 font-sans"
                onClick={resetFilters}
              >
                <FilterX className="h-4 w-4" />
                รีเซ็ตตัวกรอง
              </Button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <Package2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-mitr text-xl text-foreground">ตารางแพ็กเกจ</h2>
                  {/* <p className="font-sans text-sm text-muted-foreground">
                    ดูรูปแพ็กเกจ ช่วงเวลาแคมเปญ รายการบริการที่รวมอยู่ และสถานะทั้งหมดในตารางเดียว
                  </p> */}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/60 px-3 py-1 font-sans text-xs text-muted-foreground"
                >
                  ทั้งหมด {viewPackages.length}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-sans text-xs text-emerald-700 dark:text-emerald-300"
                >
                  Active {activeCount}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-blue-500/20 bg-blue-500/10 px-3 py-1 font-sans text-xs text-blue-700 dark:text-blue-300"
                >
                  Upcoming {upcomingCount}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-slate-500/20 bg-slate-500/10 px-3 py-1 font-sans text-xs text-slate-700 dark:text-slate-300"
                >
                  Expired {expiredCount}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full font-sans"
                  onClick={() => void fetchPackages()}
                  disabled={loading}
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  รีเฟรช
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-b-2xl border-t border-border/30 bg-background/55">
            {loading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="font-sans text-sm text-muted-foreground">กำลังโหลดแพ็กเกจ...</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <Package2 className="h-10 w-10 text-primary/50" />
                  <div>
                    <p className="font-mitr text-base text-foreground">ไม่พบแพ็กเกจ</p>
                    <p className="font-sans text-sm text-muted-foreground">
                      ลองปรับตัวกรองหรือสร้างแพ็กเกจใหม่
                    </p>
                  </div>
                </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px] text-left">
                    <thead className="border-b border-border/40 bg-muted/25">
                      <tr className="font-sans text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        <th className="px-6 py-4 font-semibold">รูปภาพ</th>
                        <th className="px-6 py-4 font-semibold">แพ็กเกจ</th>
                        <th className="px-6 py-4 font-semibold">สถานะ</th>
                        <th className="px-6 py-4 font-semibold">ราคา</th>
                        <th className="px-6 py-4 font-semibold">บริการที่รวม</th>
                        <th className="px-6 py-4 font-semibold">ช่วงเวลาแคมเปญ</th>
                        <th className="px-6 py-4 text-right font-semibold">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/35">
                      {rows.map((pkg) => (
                        <tr
                          key={pkg.package_id}
                          className="transition-colors hover:bg-primary/5"
                        >
                          <td className="px-6 py-4 align-top">
                            {pkg.image_src ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImage({
                                    src: pkg.image_src!,
                                    name: pkg.package_name,
                                  })
                                }
                                className="group block rounded-2xl border border-border/50 bg-background/80 p-1 transition hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                aria-label={`ดูภาพ ${pkg.package_name}`}
                              >
                                <img
                                  src={pkg.image_src}
                                  alt={pkg.package_name}
                                  className="h-14 w-14 rounded-xl object-cover"
                                />
                              </button>
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-mitr text-base text-foreground">
                                  {pkg.package_name}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-border/60 bg-background/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                                >
                                  #{pkg.package_id}
                                </Badge>
                              </div>
                              <p className="font-sans text-xs text-muted-foreground">
                                {pkg.image_src ? "กดรูปเพื่อดูภาพขนาดใหญ่" : "ยังไม่มีรูปภาพ"}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <StatusBadge status={pkg.status} />
                          </td>

                          <td className="px-6 py-4 align-top">
                            <p className="font-mitr text-base font-semibold text-emerald-600">
                              ฿{Number(pkg.package_price).toLocaleString("th-TH")}
                            </p>
                            {/* <p className="font-sans text-xs text-muted-foreground">
                              ราคาแพ็กเกจ
                            </p> */}
                          </td>

                          <td className="px-6 py-4 align-top">
                            {pkg.package_detail && pkg.package_detail.length > 0 ? (
                              <ul className="space-y-1.5 font-sans text-sm text-muted-foreground">
                                {pkg.package_detail.map((detail, index) => (
                                  <li key={`${pkg.package_id}-${index}`} className="flex gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/50" />
                                    <span>
                                      {detail.massage?.massage_name ?? "ไม่ทราบชื่อบริการ"}
                                      <span className="ml-1 text-xs text-muted-foreground/80">
                                        ({detail.massage?.massage_time ?? 0} นาที)
                                      </span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="font-sans text-sm italic text-muted-foreground">
                                ยังไม่ได้เพิ่มบริการนวด
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <p className="flex items-start gap-2 font-sans text-sm text-foreground">
                              <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                              <span>{formatCampaignPeriod(pkg.startsAt, pkg.endsAt)}</span>
                            </p>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="flex justify-end gap-2">
                              <Link href={`/manager/package/edit/${pkg.package_id}`}>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full font-sans"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  แก้ไข
                                </Button>
                              </Link>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="rounded-full font-sans"
                                onClick={() => void deletePackage(pkg.package_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                ลบ
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <DataTablePagination
                  currentPage={page}
                  pageOptions={PAGE_OPTIONS}
                  rowsPerPage={rowsPerPage}
                  showingFrom={showingFrom}
                  showingTo={showingTo}
                  totalItems={filteredPackages.length}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => setCurrentPage(nextPage)}
                  onRowsPerPageChange={(value) => setRowsPerPage(value as RowsPerPage)}
                  labels={{
                    showing: "แสดง",
                    of: "จาก",
                    items: "รายการ",
                    rowsPerPage: "จำนวนต่อหน้า:",
                    all: "ทั้งหมด",
                  }}
                />
              </>
            )}
          </div>
        </section>
      </div>

      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl overflow-hidden p-4 sm:p-6">
          {previewImage && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-mitr text-xl">{previewImage.name}</DialogTitle>
              </DialogHeader>

              <div className="overflow-hidden rounded-2xl border border-border/40 bg-muted/20">
                <img
                  src={previewImage.src}
                  alt={previewImage.name}
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
