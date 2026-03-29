"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImageUploaderItem = {
  id: string;
  name: string;
  url: string;
  isUploading?: boolean;
};

type ImageUploaderProps = {
  images: ImageUploaderItem[];
  disabled?: boolean;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
};

export function ImageUploader({
  images,
  disabled = false,
  maxFiles = 1,
  onFilesSelected,
  onRemove,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  function submitFiles(fileList: FileList | null) {
    if (!fileList || disabled) return;
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, maxFiles);
    if (files.length > 0) onFilesSelected(files);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(event) => {
          submitFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={disabled}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-all",
          "border-border/60 bg-card/40 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm",
          "hover:border-primary/40 hover:bg-primary/5",
          isDragActive && "border-primary/50 bg-primary/10",
          disabled && "cursor-not-allowed opacity-60",
        )}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragActive(false);
          submitFiles(event.dataTransfer.files);
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-mitr text-lg text-foreground">Drag & drop image here</p>
          <p className="font-sans text-sm text-muted-foreground">
            or click to browse. Upload {maxFiles} image at a time.
          </p>
        </div>
      </button>

      {images.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card/60"
            >
              <div className="relative aspect-[4/3]">
                <Image src={image.url} alt={image.name} fill unoptimized className="object-cover" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                  <div className="rounded-full bg-background/85 px-3 py-1 font-sans text-xs text-foreground shadow-sm">
                    {image.isUploading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <ImagePlus className="h-3.5 w-3.5" />
                        Ready
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-background/85"
                    onClick={() => onRemove(image.id)}
                    disabled={disabled || image.isUploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="truncate font-sans text-sm text-foreground">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
