import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const supabase = await createAdminClient();
    let query = supabase.from("profiles").select("*");

    if (id) {
        query = query.eq("profile_id", id);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Supabase query failed:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, profile_id, user_type } = body;

        // Handle both 'profile_id' and 'id' keys for flexibility
        const targetUuid = profile_id || id;

        if (!targetUuid || !user_type) {
            return NextResponse.json({
                success: false,
                error: "Missing required fields: profile_id (or id) and user_type are required."
            }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from("profiles")
            .insert([{ profile_id: targetUuid, user_type }])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert failed:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });

    } catch (err: any) {
        console.error("Profiles POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
