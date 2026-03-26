"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

export default function ListMassage() {
  const [massages, setMassages] = useState<Massage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);

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

  const filteredMassages = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return massages;
    return massages.filter((massage) => massage.massage_name.toLowerCase().includes(normalized));
  }, [massages, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this massage item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/massage/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(`Delete failed: ${json.error ?? "Unknown error"}`);
        return;
      }
      setMassages((prev) => prev.filter((massage) => massage.massage_id !== id));
    } catch (error) {
      console.error("Error deleting massage:", error);
      alert("Error while deleting massage");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-lg border border-border bg-card p-6 shadow-md">
      <div className="mb-4 flex min-w-0 flex-col gap-4">
        <h3 className="text-xl font-semibold">รายการบริการนวด</h3>
        <div className="relative w-full min-w-0 max-w-md">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาบริการนวด..."
            className="w-full min-w-0 pr-10 font-mitr"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading massages...</p>
      ) : massages.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No massages found</p>
      ) : filteredMassages.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No matching result</p>
      ) : (
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="rounded-tl-lg px-4 py-3">ภาพ</th>
                <th className="px-4 py-3">ชื่อบริการ</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3">ระยะเวลา (นาที)</th>
                <th className="rounded-tr-lg px-4 py-3 text-right">การแก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {filteredMassages.map((massage) => (
                <tr
                  key={massage.massage_id}
                  className="border-b border-border transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    {massage.image_src ? (
                      <button
                        type="button"
                        className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() =>
                          setPreviewImage({
                            src: massage.image_src as string,
                            name: massage.massage_name,
                          })
                        }
                        aria-label={`Open image for ${massage.massage_name}`}
                      >
                        <img
                          src={massage.image_src}
                          alt={massage.massage_name}
                          className="h-14 w-20 rounded-md border border-border object-cover transition-opacity hover:opacity-90"
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{massage.massage_name}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    ฿{Number(massage.massage_price).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3">{Number(massage.massage_time)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/manager/massage/edit/${massage.massage_id}`}>
                        <Button variant="outline" size="sm">
                          แก้ไข
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingId === massage.massage_id}
                        onClick={() => handleDelete(massage.massage_id)}
                      >
                        {deletingId === massage.massage_id ? "Deleting..." : "ลบ"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
