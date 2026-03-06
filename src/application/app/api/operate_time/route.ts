import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createAdminClient();
    
    // Fetch the most recent operating hours record
    const { data, error } = await supabase
        .from("operate_time")
        .select("*")
        .order("create_date", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        // If no records found, that's okay, we'll handle fallback in the frontend
        if (error.code === "PGRST116") {
            return NextResponse.json({ success: true, data: null }, { status: 200 });
        }
        console.error("operate_time GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = await createAdminClient();
        
        const { data, error } = await supabase
            .from("operate_time")
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error("operate_time POST error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        console.error("operate_time POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
