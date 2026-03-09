import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const profile_id = searchParams.get("profile_id");

    const supabase = await createAdminClient();
    let query = supabase.from("customer").select("*");

    if (profile_id) {
        query = query.eq("profile_id", profile_id);
    }

    const { data, error } = await query;

    if (error) {
        console.error("customer GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from("customer")
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error("customer POST error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        console.error("customer POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
