"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  Edit3,
  FilterX,
  Loader2,
  RefreshCw,
  Search,
  Tag,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTablePagination,
  DEFAULT_TABLE_PAGE_OPTIONS,
  type TablePageOption,
} from "@/components/ui/data-table-pagination";
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
import type { ElementType, ReactNode } from "react";

type Coupon = {
  coupon_id: number;
  coupon_name: string;
  discount_percent: number | string;
  description: string | null;
  collect_deadline?: string | null;
  start_dateTime?: string | null;
  start_datetime?: string | null;
  available_from?: string | null;
  campaign_start_dateTime?: string | null;
  end_dateTime?: string | null;
  end_datetime?: string | null;
  campaign_end_dateTime?: string | null;
};

//type CouponStatus = "Active" | "Upcoming" | "Expired";
type CouponStatus = "Active" | "Expired";
//type StatusFilter = "all" | "active" | "upcoming" | "expired";
type StatusFilter = "all" | "active" | "expired";
type RowsPerPage = TablePageOption;
type FormState = {
  coupon_name: string;
  discount_percent: string;
  collect_deadline: string;
  description: string;
};
type ViewCoupon = Coupon & { startsAt: Date | null; endsAt: Date | null; status: CouponStatus };

const INITIAL_FORM: FormState = {
  coupon_name: "",
  discount_percent: "",
  collect_deadline: "",
  description: "",
};

const PAGE_OPTIONS: RowsPerPage[] = [...DEFAULT_TABLE_PAGE_OPTIONS];
const STATUS_STYLE: Record<CouponStatus, string> = {
  Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  //Upcoming: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  Expired: "border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300",
};
//const STATUS_ORDER: Record<CouponStatus, number> = { Active: 0, Upcoming: 1, Expired: 2 };
const STATUS_ORDER: Record<CouponStatus, number> = { Active: 0, Expired: 2 };
function pickDate(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (!value || !value.trim()) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function getStart(coupon: Coupon) {
  return pickDate(coupon.start_dateTime, coupon.start_datetime, coupon.available_from, coupon.campaign_start_dateTime);
}

function getEnd(coupon: Coupon) {
  return pickDate(coupon.collect_deadline, coupon.end_dateTime, coupon.end_datetime, coupon.campaign_end_dateTime);
}

function getStatus(coupon: Coupon, now = new Date()): CouponStatus {
  const endsAt = getEnd(coupon);
  if (endsAt && endsAt.getTime() < now.getTime()) return "Expired";
  return "Active";
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function matchesRange(coupon: ViewCoupon, dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return true;
  const start = coupon.startsAt?.getTime() ?? coupon.endsAt?.getTime();
  const end = coupon.endsAt?.getTime() ?? coupon.startsAt?.getTime();
  if (start == null || end == null) return false;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;
  if (from !== null && end < from) return false;
  if (to !== null && start > to) return false;
  return true;
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ElementType;
  actions?: ReactNode;
  children: ReactNode;
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

function StatusChip({ status }: { status: CouponStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]",
        STATUS_STYLE[status],
      )}
    >
      {status}
    </Badge>
  );
}

export function CouponManagement() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPage>("10");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void loadCoupons();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFrom, dateTo, rowsPerPage]);

  async function loadCoupons() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/coupon?show_all=true", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to load coupons");
      setCoupons(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditingCoupon(null);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon);
    setForm({
      coupon_name: coupon.coupon_name,
      discount_percent: String(coupon.discount_percent),
      collect_deadline: toLocalInput(coupon.collect_deadline),
      description: coupon.description ?? "",
    });
    setErrorMessage(null);
    setSuccessMessage(null);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const coupon_name = form.coupon_name.trim();
      const discountText = form.discount_percent.trim();
      const discount_percent = Number(discountText);
      if (!coupon_name) throw new Error("Coupon name is required");
      if (!discountText) throw new Error("Discount percentage is required");
      if (Number.isNaN(discount_percent) || discount_percent < 0 || discount_percent > 100) {
        throw new Error("Discount percentage must be between 0 and 100");
      }
      const payload = {
        coupon_name,
        discount_percent,
        description: form.description.trim() || null,
        collect_deadline: toIsoOrNull(form.collect_deadline),
      };
      const response = await fetch(editingCoupon ? `/api/coupon/${editingCoupon.coupon_id}` : "/api/coupon", {
        method: editingCoupon ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to save coupon");
      setSuccessMessage(editingCoupon ? "Coupon updated successfully" : "Coupon created successfully");
      resetForm();
      await loadCoupons();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save coupon");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!window.confirm(`Delete coupon "${coupon.coupon_name}"?`)) return;
    setDeleteId(coupon.coupon_id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/coupon/${coupon.coupon_id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to delete coupon");
      if (editingCoupon?.coupon_id === coupon.coupon_id) resetForm();
      setSuccessMessage("Coupon deleted successfully");
      await loadCoupons();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete coupon");
    } finally {
      setDeleteId(null);
    }
  }

  const now = new Date();
  const viewCoupons: ViewCoupon[] = [...coupons]
    .map((coupon) => ({
      ...coupon,
      startsAt: getStart(coupon),
      endsAt: getEnd(coupon),
      status: getStatus(coupon, now),
    }))
    .sort((left, right) => {
      const diff = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
      if (diff !== 0) return diff;
      const leftTime =
        left.status === "Expired"
          ? left.endsAt?.getTime() ?? 0
          : left.startsAt?.getTime() ?? left.endsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTime =
        right.status === "Expired"
          ? right.endsAt?.getTime() ?? 0
          : right.startsAt?.getTime() ?? right.endsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (leftTime !== rightTime) return left.status === "Expired" ? rightTime - leftTime : leftTime - rightTime;
      return left.coupon_name.localeCompare(right.coupon_name);
    });

  const filtered = viewCoupons.filter((coupon) => {
    const search = searchQuery.trim().toLowerCase();
    const searchMatch =
      !search ||
      coupon.coupon_name.toLowerCase().includes(search) ||
      (coupon.description ?? "").toLowerCase().includes(search);
    const statusMatch = statusFilter === "all" || coupon.status.toLowerCase() === statusFilter;
    return searchMatch && statusMatch && matchesRange(coupon, dateFrom, dateTo);
  });

  const pageSize = rowsPerPage === "all" ? Math.max(filtered.length, 1) : Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const startIndex = rowsPerPage === "all" ? 0 : (page - 1) * pageSize;
  const rows = rowsPerPage === "all" ? filtered : filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = rows.length === 0 ? 0 : startIndex + 1;
  const showingTo = rows.length === 0 ? 0 : startIndex + rows.length;
  const activeCount = viewCoupons.filter((coupon) => coupon.status === "Active").length;
  //const upcomingCount = viewCoupons.filter((coupon) => coupon.status === "Upcoming").length;
  const expiredCount = viewCoupons.filter((coupon) => coupon.status === "Expired").length;

  return (
    <main className="relative flex-1 w-full font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
            <TicketPercent className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">Manager Console</p>
          <h1 className="font-mitr text-3xl text-foreground md:text-4xl">Coupon Management</h1>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-sm text-muted-foreground md:text-base">
            A manager-style dashboard for creating coupons, filtering records, and keeping expired items visible.
          </p>
        </header>

        {(errorMessage || successMessage) && (
          <div
            className={cn(
              "rounded-2xl border px-5 py-4 font-sans text-sm shadow-sm",
              errorMessage
                ? "border-destructive/25 bg-destructive/8 text-destructive"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            )}
          >
            {errorMessage ?? successMessage}
          </div>
        )}

        <div ref={formRef}>
          <Panel
            title="Create Coupon"
            subtitle="Insert coupon data immediately at the top of the page, or load a row here to edit it."
            icon={Tag}
            actions={
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]",
                  editingCoupon
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                )}
              >
                {editingCoupon ? `Editing #${editingCoupon.coupon_id}` : "Ready to publish"}
              </Badge>
            }
          >
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_220px_240px]">
                <div className="space-y-2">
                  <Label htmlFor="coupon_name">Coupon name</Label>
                  <Input
                    id="coupon_name"
                    value={form.coupon_name}
                    onChange={(event) => setForm((current) => ({ ...current, coupon_name: event.target.value }))}
                    placeholder="Summer Wellness 15%"
                    className="h-11 bg-background/75 font-sans"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_percent">Discount %</Label>
                  <Input
                    id="discount_percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.discount_percent}
                    onChange={(event) => setForm((current) => ({ ...current, discount_percent: event.target.value }))}
                    placeholder="15"
                    className="h-11 bg-background/75 font-sans"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collect_deadline">Collect deadline</Label>
                  <Input
                    id="collect_deadline"
                    type="datetime-local"
                    value={form.collect_deadline}
                    onChange={(event) => setForm((current) => ({ ...current, collect_deadline: event.target.value }))}
                    className="h-11 bg-background/75 font-sans"
                  />
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Add campaign details or coupon notes."
                    className="flex min-h-[120px] w-full rounded-xl border border-border/60 bg-background/75 px-3 py-2.5 font-sans text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {editingCoupon && (
                    <Button type="button" variant="outline" className="rounded-full font-sans" onClick={resetForm}>
                      Cancel edit
                    </Button>
                  )}
                  <Button type="button" variant="outline" className="rounded-full font-sans" onClick={resetForm}>
                    Clear form
                  </Button>
                  <Button type="submit" disabled={isSaving} className="rounded-full px-5 font-sans">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingCoupon ? "Update Coupon" : "Create Coupon"}
                  </Button>
                </div>
              </div>
            </form>
          </Panel>
        </div>
        <div>
          <Panel
            title="Coupon Filters"
            subtitle=""
            icon={Search}
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              {/* <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_200px_180px_180px]"> */}
              <div className="
  grid gap-4 items-end
  grid-cols-[1fr_1fr_1fr_auto]
">
                <div className="space-y-2">
                  <Label htmlFor="coupon-search">Search by coupon name</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="coupon-search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search coupons"
                      className="h-11 bg-background/75 pl-10 font-sans"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="h-11 w-full bg-background/75 font-sans">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      {/* <SelectItem value="upcoming">Upcoming</SelectItem> */}
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="date-from">Date from</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-11 bg-background/75 font-sans"
                  />
                </div> */}
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date to</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-11 bg-background/75 font-sans"
                  />
                </div>
              </div>
              <Button type="button" variant="outline" className="h-11 rounded-full px-4 font-sans" onClick={resetFilters}>
                <FilterX className="h-4 w-4" />
                Reset Filter
              </Button>
            </div>
          </Panel>
        </div>
        <div>
          <Panel
            title="Coupon Table"
            subtitle=""
            // subtitle="Active, upcoming, and expired coupons are shown together in one modern data table."
            icon={CalendarClock}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-border/60 bg-background/60 px-3 py-1 font-sans text-xs text-muted-foreground">
                  Total {viewCoupons.length}
                </Badge>
                <Badge variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-sans text-xs text-emerald-700 dark:text-emerald-300">
                  Active {activeCount}
                </Badge>
                {/* <Badge variant="outline" className="rounded-full border-blue-500/20 bg-blue-500/10 px-3 py-1 font-sans text-xs text-blue-700 dark:text-blue-300">
                  {/* Upcoming {upcomingCount} }
                </Badge> */}
                <Badge variant="outline" className="rounded-full border-slate-500/20 bg-slate-500/10 px-3 py-1 font-sans text-xs text-slate-700 dark:text-slate-300">
                  Expired {expiredCount}
                </Badge>
                <Button type="button" variant="outline" className="rounded-full font-sans" onClick={() => void loadCoupons()} disabled={isLoading}>
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            }
          >
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/55">
              {isLoading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="font-sans text-sm text-muted-foreground">Loading coupons...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <Tag className="h-10 w-10 text-primary/50" />
                  <div>
                    <p className="font-mitr text-base text-foreground">No coupons found</p>
                    <p className="font-sans text-sm text-muted-foreground">Try adjusting your filters or create a new coupon above.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                      <thead className="border-b border-border/40 bg-muted/25">
                        <tr className="font-sans text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          <th className="px-6 py-4 font-semibold">Coupon</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Discount</th>
                          <th className="px-6 py-4 font-semibold">Availability</th>
                          <th className="px-6 py-4 font-semibold">Description</th>
                          <th className="px-6 py-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/35">
                        {rows.map((coupon) => (
                          <tr key={coupon.coupon_id} className="transition-colors hover:bg-primary/5">
                            <td className="px-6 py-4 align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-mitr text-base text-foreground">{coupon.coupon_name}</p>
                                  <Badge variant="outline" className="rounded-full border-border/60 bg-background/60 px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    #{coupon.coupon_id}
                                  </Badge>
                                </div>
                                {/* <p className="font-sans text-xs text-muted-foreground">
                                  {coupon.status === "Active" ? "Currently available" : coupon.status === "Upcoming" ? "Scheduled for later" : "No longer available"}
                                </p> */}
                              </div>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <StatusChip status={coupon.status} />
                            </td>
                            <td className="px-6 py-4 align-top">
                              <p className="font-mitr text-base text-foreground">{Number(coupon.discount_percent).toFixed(2)}%</p>
                              <p className="font-sans text-xs text-muted-foreground">Percentage discount</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="space-y-1 font-sans text-sm">
                                <p>{coupon.startsAt ? `Starts ${formatDateTime(coupon.startsAt)}` : "Starts immediately"}</p>
                                <p className="text-muted-foreground">{coupon.endsAt ? `Ends ${formatDateTime(coupon.endsAt)}` : "No expiry date"}</p>
                              </div>
                            </td>
                            <td className="max-w-[320px] px-6 py-4 align-top">
                              <p className="font-sans text-sm leading-6 text-muted-foreground">{coupon.description?.trim() || "No description provided."}</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                              <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm" className="rounded-full font-sans" onClick={() => openEdit(coupon)}>
                                  <Edit3 className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-full font-sans"
                                  onClick={() => void handleDelete(coupon)}
                                  disabled={deleteId === coupon.coupon_id}
                                >
                                  {deleteId === coupon.coupon_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  {deleteId === coupon.coupon_id ? "Deleting..." : "Delete"}
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
                    totalItems={filtered.length}
                    totalPages={totalPages}
                    onPageChange={(nextPage) => setCurrentPage(nextPage)}
                    onRowsPerPageChange={(value) => setRowsPerPage(value as RowsPerPage)}
                  />
                </>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
