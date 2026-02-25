import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: "ID parameter is required" }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const primaryKey = "booking_detail_id";
        
        const { data, error } = await supabase
            .from("booking_detail")
            .select("*")
            .eq(primaryKey, id)
            .single();

        if (error) {
            console.error("booking_detail GET by ID error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("booking_detail GET by ID exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: "ID parameter is required" }, { status: 400 });
        }

        const body = await request.json();
        const supabase = await createAdminClient();
        const primaryKey = "booking_detail_id";

        const { data, error } = await supabase
            .from("booking_detail")
            .update(body)
            .eq(primaryKey, id)
            .select()
            .single();

        if (error) {
            console.error("booking_detail PUT error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("booking_detail PUT exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ success: false, error: "ID parameter is required" }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const primaryKey = "booking_detail_id";

        const { error } = await supabase
            .from("booking_detail")
            .delete()
            .eq(primaryKey, id);

        if (error) {
            console.error("booking_detail DELETE error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "booking_detail deleted successfully" }, { status: 200 });
    } catch (err: any) {
        console.error("booking_detail DELETE exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
