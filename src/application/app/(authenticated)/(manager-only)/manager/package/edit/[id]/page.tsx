"use client";

import type { FormEvent } from "react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Package2, PencilLine } from "lucide-react";

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

type PackageDetail = {
  massage: Massage | null;
};

type PackageRecord = {
  package_name: string;
  package_price: number;
  image_src: string | null;
  campaign_start_datetime: string | null;
  campaign_end_datetime: string | null;
  package_detail?: PackageDetail[];
};

type SelectedMassage = Massage & {
  uniqueId: string;
};

function createUniqueId() {
  return Math.random().toString(36).slice(2, 9);
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
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export default function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        const [massageRes, packageRes] = await Promise.all([
          fetch("/api/massage", { cache: "no-store" }),
          fetch(`/api/package/${id}`, { cache: "no-store" }),
        ]);

        const massageJson = await massageRes.json();
        const packageJson = await packageRes.json();

        if (massageJson.success) {
          setAvailableMassages(massageJson.data || []);
        }

        if (!packageRes.ok || !packageJson.success || !packageJson.data) {
          alert(`Load package failed: ${packageJson.error ?? "Not found"}`);
          router.push("/manager/package");
          return;
        }

        const pkg = packageJson.data as PackageRecord;
        setPackageName(pkg.package_name ?? "");
        setPackagePrice(String(pkg.package_price ?? ""));
        setStartDateTime(toLocalInput(pkg.campaign_start_datetime));
        setEndDateTime(toLocalInput(pkg.campaign_end_datetime));
        setImages(
          pkg.image_src
            ? [{ id: pkg.image_src, name: pkg.package_name || "Package image", url: pkg.image_src }]
            : [],
        );

        const loadedMassages = (pkg.package_detail || [])
          .map((detail) => detail.massage)
          .filter((massage): massage is Massage => Boolean(massage))
          .map((massage) => ({
            ...massage,
            uniqueId: createUniqueId(),
          }));

        setSelectedMassages(loadedMassages);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        alert("Error while loading package");
        router.push("/manager/package");
      } finally {
        setLoading(false);
      }
    }

    void fetchInitialData();
  }, [id, router]);

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
      setUploadError(error instanceof Error ? error.message : "Failed to upload image");
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
      setUploadError("Please wait for the image upload to finish.");
      return;
    }

    setSubmitting(true);

    try {
      const packagePayload = {
        package_name: packageName.trim(),
        package_price: Number(packagePrice),
        image_src: images[0]?.url || null,
        campaign_start_datetime: toIsoOrNull(startDateTime),
        campaign_end_datetime: toIsoOrNull(endDateTime),
      };

      const packageRes = await fetch(`/api/package/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packagePayload),
      });
      const packageJson = await packageRes.json().catch(() => ({}));

      if (!packageRes.ok) {
        alert(`Update package failed: ${packageJson.error ?? "Unknown error"}`);
        return;
      }

      const deleteDetailsRes = await fetch(`/api/package_detail/by-package/${id}`, {
        method: "DELETE",
      });
      const deleteDetailsJson = await deleteDetailsRes.json().catch(() => ({}));

      if (!deleteDetailsRes.ok) {
        alert(`Failed to refresh package services: ${deleteDetailsJson.error ?? "Unknown error"}`);
        return;
      }

      if (selectedMassages.length > 0) {
        const detailsPayload = selectedMassages.map((massage) => ({
          package_id: id,
          massage_id: massage.massage_id,
        }));

        const detailsRes = await fetch("/api/package_detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsPayload),
        });
        const detailsJson = await detailsRes.json().catch(() => ({}));

        if (!detailsRes.ok) {
          alert(`Failed to update package services: ${detailsJson.error ?? "Unknown error"}`);
          return;
        }
      }

      router.push("/manager/package");
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Error while updating package");
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

  if (loading) {
    return <div className="p-8 text-center font-mitr text-muted-foreground">Loading package...</div>;
  }

  return (
    <main className="relative flex-1 w-full font-mitr">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-28 h-[420px] w-[420px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute bottom-0 left-[-12rem] h-[360px] w-[360px] rounded-full bg-secondary/40 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
            <PencilLine className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 font-sans text-xs font-medium uppercase tracking-[0.32em] text-primary/60">
            Manager Console
          </p>
          <h1 className="text-3xl text-foreground md:text-4xl">Edit Package</h1>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border/40 bg-card/45 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="border-b border-border/40 px-5 py-4 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <ImagePlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl text-foreground">Package Details</h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    Update package information, campaign timing, and the cover image.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full font-sans"
                onClick={() => router.push("/manager/package")}
              >
                Back to list
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <form onSubmit={handleSavePackage} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="packageName">Package name</Label>
                <Input
                  id="packageName"
                  value={packageName}
                  onChange={(event) => setPackageName(event.target.value)}
                  placeholder="Premium Spa Package"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="packagePrice">Price (THB)</Label>
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
                  <Label htmlFor="startDateTime">Campaign start</Label>
                  <Input
                    id="startDateTime"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(event) => setStartDateTime(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDateTime">Campaign end</Label>
                  <Input
                    id="endDateTime"
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(event) => setEndDateTime(event.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-muted/20 px-4 py-3 font-sans text-sm text-muted-foreground">
                Individual service value: THB {totalPriceOfMassages.toLocaleString()} | Total duration:{" "}
                {totalTime} minutes
              </div>

              <div className="space-y-3">
                <Label>Image</Label>
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
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full px-5 font-sans" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
          <section className="overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/10 shadow-[0_20px_60px_-24px_rgba(16,185,129,0.35)]">
            <div className="border-b border-emerald-500/15 px-5 py-4 md:px-6">
              <h2 className="text-xl text-emerald-950">Selected Massages</h2>
              <p className="font-sans text-sm text-emerald-800/80">
                Review the services currently included in this package.
              </p>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              {selectedMassages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-white/60 px-4 py-10 text-center font-sans text-sm text-emerald-900/70">
                  No massages selected yet.
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
                              {massage.massage_time} min | THB {massage.massage_price.toLocaleString()}
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
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4 border-t border-emerald-500/15 pt-4">
                    <div>
                      <p className="font-sans text-sm text-emerald-800/70">Total duration</p>
                      <p className="text-2xl text-emerald-950">{totalTime} min</p>
                    </div>
                    <div className="text-right">
                      <p className="font-sans text-sm text-emerald-800/70">Service value</p>
                      <p className="text-2xl text-emerald-950">
                        THB {totalPriceOfMassages.toLocaleString()}
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
                  <h2 className="text-xl text-foreground">Available Massages</h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    Search and adjust the service list for this package.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 md:p-6">
              <Input
                value={massageSearchTerm}
                onChange={(event) => setMassageSearchTerm(event.target.value)}
                placeholder="Search massage name"
                className="font-sans"
              />

              {filteredAvailableMassages.length === 0 ? (
                <p className="py-6 text-center font-sans text-sm text-muted-foreground">
                  No matching massages found.
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
                          {massage.massage_time} min | THB {massage.massage_price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="rounded-full font-sans"
                        onClick={() => addMassageToPackage(massage)}
                      >
                        Add
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
