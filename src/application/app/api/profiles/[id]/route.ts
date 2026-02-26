import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        let { id } = await params;

        // Defensively strip "id=" or "profile_id=" if the user mistakenly includes it in the path
        if (id.startsWith("id=")) id = id.replace("id=", "");
        if (id.startsWith("profile_id=")) id = id.replace("profile_id=", "");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID parameter is required" }, { status: 400 });
        }

        const supabase = await createAdminClient();

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("profile_id", id)
            .maybeSingle();

        if (error) {
            console.error("Profiles API Error:", error.message);
            return NextResponse.json({
                success: false,
                error: error.message,
                hint: "Ensure the ID is a valid UUID format."
            }, { status: 400 });
        }

        if (!data) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (err: any) {
        console.error("Profiles API Exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
