"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Edit3,
  FilterX,
  HandPlatter,
  ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  TimerReset,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTablePagination,
  DEFAULT_TABLE_PAGE_OPTIONS,
  type TablePageOption,
} from "@/components/ui/data-table-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Massage = {
  massage_id: number;
  massage_name: string;
  massage_price: number;
  massage_time: number;
  image_src: string | null;
};

type ApiResponse = {
  success: boolean;
  data?: Massage[];
  error?: string;
};

type SortField = "massage_price" | "massage_time";
type SortDirection = "asc" | "desc";
type RowsPerPage = TablePageOption;

const PAGE_OPTIONS: RowsPerPage[] = [...DEFAULT_TABLE_PAGE_OPTIONS];

function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
      <div className="border-b border-border/40 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-mitr text-xl text-foreground">{title}</h2>
              <p className="font-sans text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {actions}
        </div>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export default function ListMassage() {
  const [massages, setMassages] = useState<Massage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>("10");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMassages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/massage", { cache: "no-store" });
      const json: ApiResponse = await res.json();
      if (!res.ok || !json.success) {
        console.error("Failed to fetch massages:", json.error);
        return;
      }
      setMassages(json.data ?? []);
    } catch (error) {
      console.error("Error fetching massages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMassages();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, rowsPerPage]);

  const filteredMassages = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return massages;
    return massages.filter((massage) => massage.massage_name.toLowerCase().includes(normalized));
  }, [massages, searchTerm]);

  const sortedMassages = useMemo(() => {
    if (!sortField) return filteredMassages;
    return [...filteredMassages].sort((a, b) => {
      const diff = Number(a[sortField]) - Number(b[sortField]);
      return sortDirection === "asc" ? diff : -diff;
    });
  }, [filteredMassages, sortDirection, sortField]);

  const pageSize = rowsPerPage === "all" ? Math.max(sortedMassages.length, 1) : Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(sortedMassages.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const startIndex = rowsPerPage === "all" ? 0 : (page - 1) * pageSize;
  const paginatedMassages =
    rowsPerPage === "all" ? sortedMassages : sortedMassages.slice(startIndex, startIndex + pageSize);
  const showingFrom = paginatedMassages.length === 0 ? 0 : startIndex + 1;
  const showingTo = paginatedMassages.length === 0 ? 0 : startIndex + paginatedMassages.length;

  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
      return;
    }
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบบริการนวดนี้ใช่หรือไม่?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/massage/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(`ลบรายการไม่สำเร็จ: ${json.error ?? "ไม่ทราบสาเหตุ"}`);
        return;
      }
      setMassages((prev) => prev.filter((massage) => massage.massage_id !== id));
    } catch (error) {
      console.error("Error deleting massage:", error);
      alert("เกิดข้อผิดพลาดระหว่างลบบริการนวด");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="ตัวกรองบริการนวด"
        subtitle="ค้นหาบริการและจัดเรียงรายการเพื่อจัดการข้อมูลได้รวดเร็วขึ้น"
        icon={Search}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-full font-sans"
            onClick={() => {
              setSearchTerm("");
              setSortField(null);
              setSortDirection("asc");
            }}
          >
            <FilterX className="h-4 w-4" />
            ล้างตัวกรอง
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px_220px] xl:items-end">
          <div className="space-y-2">
            <label htmlFor="massage-search" className="font-sans text-sm text-foreground">
              ค้นหาชื่อบริการนวด
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="massage-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ค้นหาบริการนวด"
                className="h-11 bg-background/75 pl-10 font-sans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-sm text-foreground">เรียงตามราคา</p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start rounded-xl font-sans"
              onClick={() => toggleSort("massage_price")}
            >
              ราคา{sortIndicator("massage_price")}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="font-sans text-sm text-foreground">เรียงตามระยะเวลา</p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start rounded-xl font-sans"
              onClick={() => toggleSort("massage_time")}
            >
              ระยะเวลา{sortIndicator("massage_time")}
            </Button>
          </div>
        </div>
      </Panel>

      <Panel
        title="ตารางบริการนวด"
        subtitle="แสดงรายการบริการพร้อมรูปภาพ ราคา ระยะเวลา และปุ่มจัดการในมุมมองเดียว"
        icon={HandPlatter}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-border/60 bg-background/60 px-3 py-1 font-sans text-xs text-muted-foreground"
            >
              ทั้งหมด {massages.length}
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="rounded-full font-sans"
              onClick={() => void fetchMassages()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              รีเฟรช
            </Button>
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/55">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-sans text-sm text-muted-foreground">กำลังโหลดบริการนวด...</p>
            </div>
          ) : massages.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <HandPlatter className="h-10 w-10 text-primary/50" />
              <div>
                <p className="font-mitr text-base text-foreground">ยังไม่มีบริการนวด</p>
                <p className="font-sans text-sm text-muted-foreground">เริ่มต้นด้วยการสร้างรายการใหม่ด้านบน</p>
              </div>
            </div>
          ) : filteredMassages.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <TimerReset className="h-10 w-10 text-primary/50" />
              <div>
                <p className="font-mitr text-base text-foreground">ไม่พบบริการที่ตรงกับการค้นหา</p>
                <p className="font-sans text-sm text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left">
                  <thead className="border-b border-border/40 bg-muted/25">
                    <tr className="font-sans text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      <th className="px-6 py-4 font-semibold">ภาพ</th>
                      <th className="px-6 py-4 font-semibold">ชื่อบริการ</th>
                      <th className="px-6 py-4 font-semibold">ราคา</th>
                      <th className="px-6 py-4 font-semibold">ระยะเวลา</th>
                      <th className="px-6 py-4 text-right font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/35">
                    {paginatedMassages.map((massage) => (
                      <tr key={massage.massage_id} className="transition-colors hover:bg-primary/5">
                        <td className="px-6 py-4 align-top">
                          {massage.image_src ? (
                            <button
                              type="button"
                              className="block rounded-2xl border border-border/50 bg-background/80 p-1 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              onClick={() =>
                                setPreviewImage({
                                  src: massage.image_src as string,
                                  name: massage.massage_name,
                                })
                              }
                              aria-label={`เปิดภาพ ${massage.massage_name}`}
                            >
                              <img
                                src={massage.image_src}
                                alt={massage.massage_name}
                                className="h-14 w-20 rounded-xl object-cover"
                                loading="lazy"
                              />
                            </button>
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 text-muted-foreground">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-mitr text-base text-foreground">{massage.massage_name}</p>
                            <Badge
                              variant="outline"
                              className="rounded-full border-border/60 bg-background/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
                            >
                              #{massage.massage_id}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="font-mitr text-base font-semibold text-emerald-600">
                            ฿{Number(massage.massage_price).toLocaleString("th-TH")}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground">ราคาต่อบริการ</p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="font-sans text-sm text-foreground">
                            {Number(massage.massage_time)} นาที
                          </p>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <Link href={`/manager/massage/edit/${massage.massage_id}`}>
                              <Button variant="outline" size="sm" className="rounded-full font-sans">
                                <Edit3 className="h-4 w-4" />
                                แก้ไข
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full font-sans"
                              disabled={deletingId === massage.massage_id}
                              onClick={() => void handleDelete(massage.massage_id)}
                            >
                              {deletingId === massage.massage_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {deletingId === massage.massage_id ? "กำลังลบ..." : "ลบ"}
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
                totalItems={sortedMassages.length}
                totalPages={totalPages}
                onPageChange={(nextPage) => setCurrentPage(nextPage)}
                onRowsPerPageChange={(value) => setRowsPerPage(value as RowsPerPage)}
              />
            </>
          )}
        </div>
      </Panel>

      <Dialog
        open={Boolean(previewImage)}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <DialogContent className="max-w-4xl p-4">
          {previewImage && (
            <div className="space-y-3">
              <DialogHeader>
                <DialogTitle className="font-mitr text-xl">{previewImage.name}</DialogTitle>
              </DialogHeader>
              <img
                src={previewImage.src}
                alt={previewImage.name}
                className="max-h-[80vh] w-full rounded-md border border-border bg-muted/20 object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
