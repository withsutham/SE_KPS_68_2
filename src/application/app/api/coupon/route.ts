import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("coupon").select("*");

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
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Invalid JSON body or internal error";
        console.error("coupon POST exception:", message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
