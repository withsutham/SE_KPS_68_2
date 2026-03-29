import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 });
    }

    const extension = file.name.split(".").pop() || "jpg";
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "massage";
    const fileName = `${baseName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const storagePath = `public/${fileName}`;

    const supabase = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("massage-images")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("massage image upload error:", uploadError.message);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from("massage-images")
      .getPublicUrl(storagePath);

    return NextResponse.json({ success: true, url: data.publicUrl }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    console.error("massage image upload exception:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
