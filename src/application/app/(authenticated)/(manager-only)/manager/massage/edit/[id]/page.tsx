"use client";

import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    const [massageName, setMassageName] = useState("");
    const [massagePrice, setMassagePrice] = useState("");
    const [massageTime, setMassageTime] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [previewError, setPreviewError] = useState(false);
    const normalizedImageSrc = imageSrc.trim();

    useEffect(() => {
        const fetchMassage = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/massage/${id}`);
                const json = await res.json();

                if (!res.ok || !json.success || !json.data) {
                    alert(`โหลดข้อมูลไม่สำเร็จ: ${json.error ?? "ไม่พบข้อมูล"}`);
                    router.push("/manager/massage");
                    return;
                }

                const massage: Massage = json.data;
                setMassageName(massage.massage_name ?? "");
                setMassagePrice(String(massage.massage_price ?? ""));
                setMassageTime(String(massage.massage_time ?? ""));
                setImageSrc(massage.image_src ?? "");
            } catch (error) {
                console.error("Error fetching massage:", error);
                alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
                router.push("/manager/massage");
            } finally {
                setLoading(false);
            }
        };

        void fetchMassage();
    }, [id, router]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                massage_name: massageName.trim(),
                massage_price: Number(massagePrice),
                massage_time: Number(massageTime),
                image_src: imageSrc.trim() || null,
            };

            const res = await fetch(`/api/massage/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                alert(`แก้ไขบริการนวดไม่สำเร็จ: ${json.error ?? "เกิดข้อผิดพลาด"}`);
                return;
            }

            router.push("/manager/massage");
        } catch (error) {
            console.error("Error updating massage:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center font-mitr text-muted-foreground">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 p-8 font-mitr">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">แก้ไขบริการนวด</h1>
                <Button variant="outline" onClick={() => router.push("/manager/massage")}>
                    กลับหน้ารายการ
                </Button>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="massageName">ชื่อบริการนวด</Label>
                        <Input
                            id="massageName"
                            value={massageName}
                            onChange={(e) => setMassageName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="massagePrice">ราคา (บาท)</Label>
                            <Input
                                id="massagePrice"
                                type="number"
                                min="0"
                                value={massagePrice}
                                onChange={(e) => setMassagePrice(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="massageTime">เวลา (นาที)</Label>
                            <Input
                                id="massageTime"
                                type="number"
                                min="1"
                                value={massageTime}
                                onChange={(e) => setMassageTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="imageSrc">ลิงก์รูปภาพ</Label>
                        <Input
                            id="imageSrc"
                            type="url"
                            value={imageSrc}
                            onChange={(e) => {
                                setImageSrc(e.target.value);
                                setPreviewError(false);
                            }}
                            placeholder="https://..."
                        />
                    </div>

                    {normalizedImageSrc && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">พรีวิวรูปภาพ</p>
                            {previewError ? (
                                <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                                    ไม่สามารถโหลดรูปจากลิงก์นี้ได้
                                </p>
                            ) : (
                                <img
                                    src={normalizedImageSrc}
                                    alt="Preview"
                                    className="h-48 w-full rounded-md border border-border object-cover"
                                    onLoad={() => setPreviewError(false)}
                                    onError={() => setPreviewError(true)}
                                />
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/manager/massage")}
                            disabled={submitting}
                        >
                            ยกเลิก
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
