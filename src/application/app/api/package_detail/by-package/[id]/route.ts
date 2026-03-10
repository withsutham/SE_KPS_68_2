import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: "Package ID parameter is required" }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Delete all package details associated with this package_id
        const { error } = await supabase
            .from("package_detail")
            .delete()
            .eq("package_id", id);

        if (error) {
            console.error("package_detail bulk DELETE error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "package details cleared successfully" }, { status: 200 });
    } catch (err: any) {
        console.error("package_detail bulk DELETE exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
