"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Package2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageUploader, type ImageUploaderItem } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMassageImage } from "@/lib/upload-massage-image";

type Massage = {
  massage_id: string;
  massage_name: string;
  massage_price: number;
  massage_time: number;
};

type SelectedMassage = Massage & {
  uniqueId: string;
};

function createUniqueId() {
  return Math.random().toString(36).slice(2, 9);
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function getNowLocalDateTime() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function CreatePackagePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [availableMassages, setAvailableMassages] = useState<Massage[]>([]);
  const [selectedMassages, setSelectedMassages] = useState<SelectedMassage[]>([]);
  const [massageSearchTerm, setMassageSearchTerm] = useState("");
  const [images, setImages] = useState<ImageUploaderItem[]>([]);
  const minDateTime = getNowLocalDateTime();

  useEffect(() => {
    void fetchMassages();
  }, []);

  async function fetchMassages() {
    setLoading(true);
    try {
      const res = await fetch("/api/massage", { cache: "no-store" });
      const json = await res.json();

      if (json.success) {
        setAvailableMassages(json.data || []);
      } else {
        console.error("Failed to fetch massages:", json.error);
      }
    } catch (error) {
      console.error("Error fetching massages:", error);
    } finally {
      setLoading(false);
    }
  }

  function addMassageToPackage(massage: Massage) {
    const newSelection: SelectedMassage = {
      ...massage,
      uniqueId: createUniqueId(),
    };
    setSelectedMassages((current) => [...current, newSelection]);
  }

  function removeMassageFromPackage(uniqueId: string) {
    setSelectedMassages((current) => current.filter((massage) => massage.uniqueId !== uniqueId));
  }

  async function handleFilesSelected(files: File[]) {
    const file = files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const temporaryId = `local-${Date.now()}`;
    setUploadError(null);
    setImages([{ id: temporaryId, name: file.name, url: previewUrl, isUploading: true }]);

    try {
      const publicUrl = await uploadMassageImage(file);
      URL.revokeObjectURL(previewUrl);
      setImages([{ id: publicUrl, name: file.name, url: publicUrl }]);
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      setImages([]);
      setUploadError(error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  }

  function handleRemoveImage(imageId: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return current.filter((image) => image.id !== imageId);
    });
    setUploadError(null);
  }

  async function handleSavePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (images.some((image) => image.isUploading)) {
      setUploadError("กรุณารอให้อัปโหลดรูปภาพเสร็จก่อน");
      return;
    }

    setSubmitting(true);

    try {
      const now = new Date();
      const startDateValue = startDateTime ? new Date(startDateTime) : null;
      const endDateValue = endDateTime ? new Date(endDateTime) : null;

      if (startDateValue && startDateValue.getTime() < now.getTime()) {
        alert("วันเริ่มแคมเปญต้องเป็นวันนี้หรือวันถัดไป");
        return;
      }

      if (endDateValue && endDateValue.getTime() < now.getTime()) {
        alert("วันสิ้นสุดแคมเปญต้องเป็นวันนี้หรือวันถัดไป");
        return;
      }

      if (startDateValue && endDateValue && endDateValue.getTime() < startDateValue.getTime()) {
        alert("วันสิ้นสุดแคมเปญต้องไม่น้อยกว่าวันเริ่มแคมเปญ");
        return;
      }

      const packagePayload = {
        package_name: packageName.trim(),
        package_price: Number(packagePrice),
        image_src: images[0]?.url || null,
        campaign_start_datetime: toIsoOrNull(startDateTime),
        campaign_end_datetime: toIsoOrNull(endDateTime),
      };

      const packageRes = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packagePayload),
      });
      const packageJson = await packageRes.json();

      if (!packageRes.ok || !packageJson.success) {
        alert(`สร้างแพ็กเกจไม่สำเร็จ: ${packageJson.error ?? "ไม่ทราบสาเหตุ"}`);
        return;
      }

      const newPackageId = packageJson.data.package_id;

      if (selectedMassages.length > 0) {
        const detailsPayload = selectedMassages.map((massage) => ({
          package_id: newPackageId,
          massage_id: massage.massage_id,
        }));

        const detailsRes = await fetch("/api/package_detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsPayload),
        });

        if (!detailsRes.ok) {
          const detailsJson = await detailsRes.json().catch(() => ({}));
          alert(`สร้างแพ็กเกจแล้ว แต่เพิ่มบริการนวดไม่สำเร็จ: ${detailsJson.error ?? "ไม่ทราบสาเหตุ"}`);
          return;
        }
      }

      router.push("/manager/package");
    } catch (error) {
      console.error("Error saving package:", error);
      alert("เกิดข้อผิดพลาดระหว่างบันทึกแพ็กเกจ");
    } finally {
      setSubmitting(false);
    }
  }

  const totalTime = selectedMassages.reduce((sum, massage) => sum + massage.massage_time, 0);
  const totalPriceOfMassages = selectedMassages.reduce((sum, massage) => sum + massage.massage_price, 0);
  const normalizedMassageSearchTerm = massageSearchTerm.trim().toLowerCase();
  const filteredAvailableMassages = availableMassages.filter((massage) =>
    massage.massage_name.toLowerCase().includes(normalizedMassageSearchTerm),
  );

  return (
    <main className="relative flex-1 w-full font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">
            ผู้จัดการ · Manager
          </p>
          <h1 className="text-3xl text-foreground md:text-4xl">สร้างแพ็กเกจ</h1>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <ImagePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">รายละเอียดแพ็กเกจ</h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    กรอกข้อมูลแพ็กเกจ ช่วงเวลาแคมเปญ และอัปโหลดรูปภาพหน้าปก 1 รูป
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full font-sans"
                onClick={() => router.push("/manager/package")}
              >
                กลับไปหน้ารายการ
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <form onSubmit={handleSavePackage} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="packageName">ชื่อแพ็กเกจ</Label>
                <Input
                  id="packageName"
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  placeholder="แพ็กเกจนวดพรีเมียม"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="packagePrice">ราคา (บาท)</Label>
                  <Input
                    id="packagePrice"
                    type="number"
                    min="0"
                    value={packagePrice}
                    onChange={(event) => setPackagePrice(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">วันเริ่มแคมเปญ</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={startDateTime}
                    min={minDateTime}
                    onChange={(event) => setStartDateTime(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDateTime">วันสิ้นสุดแคมเปญ</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={endDateTime}
                    min={startDateTime || minDateTime}
                    onChange={(event) => setEndDateTime(event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-muted/20 px-4 py-3 font-sans text-sm text-muted-foreground">
                มูลค่าบริการรวม: ฿{totalPriceOfMassages.toLocaleString("th-TH")} | ระยะเวลารวม:{" "}
                {totalTime} นาที
              </div>

              <div className="space-y-3">
                <Label>รูปภาพ</Label>
                <ImageUploader
                  images={images}
                  maxFiles={1}
                  disabled={submitting}
                  onFilesSelected={handleFilesSelected}
                  onRemove={handleRemoveImage}
                />
                {uploadError && (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full font-sans"
                  onClick={() => router.push("/manager/package")}
                  disabled={submitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="rounded-full px-5 font-sans"
                  disabled={submitting || selectedMassages.length === 0}
                >
                  {submitting ? "กำลังบันทึก..." : "สร้างแพ็กเกจ"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
          <section className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/10 shadow-[0_20px_60px_-24px_rgba(16,185,129,0.35)]">
            <div className="border-b border-emerald-500/15 px-5 py-4 md:px-6">
              <h2 className="text-xl text-emerald-950">บริการนวดที่เลือก</h2>
              <p className="font-sans text-sm text-emerald-800/80">
                ตรวจสอบรายการบริการที่รวมในแพ็กเกจก่อนบันทึก
              </p>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              {selectedMassages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-white/60 px-4 py-10 text-center font-sans text-sm text-emerald-900/70">
                  ยังไม่ได้เลือกบริการนวด
                </div>
              ) : (
                <>
                  <ul className="space-y-2">
                    {selectedMassages.map((massage, index) => (
                      <li
                        key={massage.uniqueId}
                        className="flex items-center justify-between rounded-2xl border border-emerald-500/10 bg-white/80 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-emerald-950">
                              {massage.massage_name}
                            </p>
                            <p className="font-sans text-xs text-emerald-800/70">
                              {massage.massage_time} นาที | ฿{massage.massage_price.toLocaleString("th-TH")}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeMassageFromPackage(massage.uniqueId)}
                        >
                          นำออก
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4 border-t border-emerald-500/15 pt-4">
                    <div>
                      <p className="font-sans text-sm text-emerald-800/70">ระยะเวลารวม</p>
                      <p className="text-2xl text-emerald-950">{totalTime} นาที</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm text-emerald-800/70">มูลค่าบริการรวม</p>
                      <p className="text-2xl text-emerald-950">
                        ฿{totalPriceOfMassages.toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
            <div className="border-b border-border/40 px-5 py-4 md:px-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <Package2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">บริการนวดที่มีอยู่</h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    ค้นหาและเลือกบริการนวดเพื่อจัดแพ็กเกจ
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <Input
                value={massageSearchTerm}
                onChange={(event) => setMassageSearchTerm(event.target.value)}
                placeholder="ค้นหาชื่อบริการนวด"
                className="font-sans"
              />

              {loading ? (
                <p className="py-6 text-center font-sans text-sm text-muted-foreground">
                  กำลังโหลดบริการนวด...
                </p>
              ) : filteredAvailableMassages.length === 0 ? (
                <p className="py-6 text-center font-sans text-sm text-muted-foreground">
                  ไม่พบบริการนวดที่ตรงกับการค้นหา
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredAvailableMassages.map((massage) => (
                    <div
                      key={massage.massage_id}
                      className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/75 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {massage.massage_name}
                        </p>
                        <p className="font-sans text-xs text-muted-foreground">
                          {massage.massage_time} นาที | ฿{massage.massage_price.toLocaleString("th-TH")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="rounded-full font-sans"
                        onClick={() => addMassageToPackage(massage)}
                      >
                        เพิ่ม
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
