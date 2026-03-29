import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createAdminClient();
    const url = new URL(request.url);
    const dateStr = url.searchParams.get("date");
    const weekStart = url.searchParams.get("week_start");

    let query = supabase.from("booking_detail").select("*");

    if (weekStart) {
        const start = `${weekStart}T00:00:00+07:00`;
        const endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 7);
        const end = `${endDate.toISOString().split("T")[0]}T00:00:00+07:00`;
        query = query.gte("massage_start_dateTime", start).lt("massage_start_dateTime", end);
    } else if (dateStr) {
        const startOfDay = `${dateStr}T00:00:00+07:00`;
        const endOfDay = `${dateStr}T23:59:59+07:00`;
        query = query.gte("massage_start_dateTime", startOfDay).lt("massage_start_dateTime", endOfDay);
    } else {
        const startDate = url.searchParams.get("start_date");
        const endDate = url.searchParams.get("end_date");
        if (startDate && endDate) {
            query = query.gte("massage_start_dateTime", startDate).lte("massage_start_dateTime", endDate);
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error("booking_detail GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from("booking_detail")
            .insert([body])
            .select()
            .single();

        if (error) {
            console.error("booking_detail POST error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        console.error("booking_detail POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
