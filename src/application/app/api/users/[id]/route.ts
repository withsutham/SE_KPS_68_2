import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        let { id } = await params;

        // Defensively strip "id=" or "uuid=" if the user mistakenly includes it in the path
        if (id.startsWith("id=")) id = id.replace("id=", "");
        if (id.startsWith("uuid=")) id = id.replace("uuid=", "");

        if (!id) {
            return NextResponse.json({ success: false, error: "ID parameter is required" }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const { data, error } = await supabase.auth.admin.getUserById(id);

        if (error) {
            console.error("Users API Error:", error.message);
            return NextResponse.json({
                success: false,
                error: error.message,
                hint: "Ensure the ID is a valid Auth User UUID."
            }, { status: 400 });
        }

        // The user object is nested inside data in Supabase v2
        const user = data?.user;

        if (!user) {
            return NextResponse.json({
                success: false,
                error: "User not found in Auth schema"
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, user }, { status: 200 });

    } catch (err: any) {
        console.error("Users API Exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
