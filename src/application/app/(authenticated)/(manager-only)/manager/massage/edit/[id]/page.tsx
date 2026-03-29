"use client";

import type { FormEvent } from "react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageUploader, type ImageUploaderItem } from "@/components/ui/ImageUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMassageImage } from "@/lib/upload-massage-image";

type Massage = {
  massage_id: number;
  massage_name: string;
  massage_price: number;
  massage_time: number;
  image_src: string | null;
};

export default function EditMassagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [massageName, setMassageName] = useState("");
  const [massagePrice, setMassagePrice] = useState("");
  const [massageTime, setMassageTime] = useState("");
  const [images, setImages] = useState<ImageUploaderItem[]>([]);

  useEffect(() => {
    async function fetchMassage() {
      setLoading(true);
      try {
        const res = await fetch(`/api/massage/${id}`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          alert(`โหลดบริการนวดไม่สำเร็จ: ${json.error ?? "ไม่พบข้อมูล"}`);
          router.push("/manager/massage");
          return;
        }

        const massage: Massage = json.data;
        setMassageName(massage.massage_name ?? "");
        setMassagePrice(String(massage.massage_price ?? ""));
        setMassageTime(String(massage.massage_time ?? ""));
        setImages(
          massage.image_src
            ? [{ id: massage.image_src, name: massage.massage_name || "รูปบริการนวด", url: massage.image_src }]
            : [],
        );
      } catch (error) {
        console.error("Error fetching massage:", error);
        alert("เกิดข้อผิดพลาดระหว่างโหลดบริการนวด");
        router.push("/manager/massage");
      } finally {
        setLoading(false);
      }
    }

    void fetchMassage();
  }, [id, router]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (images.some((image) => image.isUploading)) {
      setUploadError("กรุณารอให้อัปโหลดรูปภาพเสร็จก่อน");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        massage_name: massageName.trim(),
        massage_price: Number(massagePrice),
        massage_time: Number(massageTime),
        image_src: images[0]?.url || null,
      };

      const res = await fetch(`/api/massage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(`อัปเดตบริการนวดไม่สำเร็จ: ${json.error ?? "ไม่ทราบสาเหตุ"}`);
        return;
      }

      router.push("/manager/massage");
    } catch (error) {
      console.error("Error updating massage:", error);
      alert("เกิดข้อผิดพลาดระหว่างอัปเดตบริการนวด");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center font-mitr text-muted-foreground">กำลังโหลดบริการนวด...</div>;
  }

  return (
    <main className="relative flex-1 w-full font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
            <PencilLine className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">ผู้จัดการ · Manager</p>
          <h1 className="text-3xl text-foreground md:text-4xl">แก้ไขบริการนวด</h1>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <ImagePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">รายละเอียดบริการนวด</h2>
                  <p className="font-sans text-sm text-muted-foreground">แก้ไขข้อมูลบริการและเปลี่ยนรูปภาพหน้าปกได้ตามต้องการ</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-full font-sans" onClick={() => router.push("/manager/massage")}>
                กลับไปหน้ารายการ
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="massageName">ชื่อบริการนวด</Label>
                <Input id="massageName" value={massageName} onChange={(e) => setMassageName(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="massagePrice">ราคา (บาท)</Label>
                  <Input id="massagePrice" type="number" min="0" value={massagePrice} onChange={(e) => setMassagePrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="massageTime">ระยะเวลา (นาที)</Label>
                  <Input id="massageTime" type="number" min="1" value={massageTime} onChange={(e) => setMassageTime(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-3">
                <Label>รูปภาพ</Label>
                <ImageUploader images={images} maxFiles={1} disabled={submitting} onFilesSelected={handleFilesSelected} onRemove={handleRemoveImage} />
                {uploadError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">{uploadError}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="rounded-full font-sans" onClick={() => router.push("/manager/massage")} disabled={submitting}>
                  ยกเลิก
                </Button>
                <Button type="submit" className="rounded-full px-5 font-sans" disabled={submitting}>
                  {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
