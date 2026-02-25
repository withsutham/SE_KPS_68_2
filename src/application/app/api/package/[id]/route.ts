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
        const primaryKey = "package_id";
        
        const { data, error } = await supabase
            .from("package")
            .select("*")
            .eq(primaryKey, id)
            .single();

        if (error) {
            console.error("package GET by ID error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("package GET by ID exception:", err.message);
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
        const primaryKey = "package_id";

        const { data, error } = await supabase
            .from("package")
            .update(body)
            .eq(primaryKey, id)
            .select()
            .single();

        if (error) {
            console.error("package PUT error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("package PUT exception:", err.message);
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
        const primaryKey = "package_id";

        const { error } = await supabase
            .from("package")
            .delete()
            .eq(primaryKey, id);

        if (error) {
            console.error("package DELETE error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "package deleted successfully" }, { status: 200 });
    } catch (err: any) {
        console.error("package DELETE exception:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
