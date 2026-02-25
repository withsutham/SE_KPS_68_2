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
        const primaryKey = "leave_record_id";
        
        const { data, error } = await supabase
            .from("leave_record")
            .select("*")
            .eq(primaryKey, id)
            .single();

        if (error) {
            console.error("leave_record GET by ID error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("leave_record GET by ID exception:", err.message);
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
        const primaryKey = "leave_record_id";

        const { data, error } = await supabase
            .from("leave_record")
            .update(body)
            .eq(primaryKey, id)
            .select()
            .single();

        if (error) {
            console.error("leave_record PUT error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("leave_record PUT exception:", err.message);
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
        const primaryKey = "leave_record_id";

        const { error } = await supabase
            .from("leave_record")
            .delete()
            .eq(primaryKey, id);

        if (error) {
            console.error("leave_record DELETE error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "leave_record deleted successfully" }, { status: 200 });
    } catch (err: any) {
        console.error("leave_record DELETE exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
