import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("show_all") === "true";

    const supabase = await createAdminClient();
    let query = supabase.from("coupon").select("*");

    if (!showAll) {
        const now = new Date().toISOString();
        query = query.or(`collect_deadline.is.null,collect_deadline.gte.${now}`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("coupon GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from("coupon")
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error("coupon POST error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        console.error("coupon POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
