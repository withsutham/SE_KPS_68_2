import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from("booking")
        .select(`
            *,
            customer:customer_id (*),
            booking_detail (*, massage (*), employee (*), room (*)),
            payment (*)
        `)
        .eq("booking_id", id)
        .single();

    if (error) {
        console.error("booking GET single error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const supabase = await createAdminClient();

        // Update booking table
        const { data, error } = await supabase
            .from("booking")
            .update(body)
            .eq("booking_id", id)
            .select()
            .single();

        if (error) {
            console.error("booking PUT error:", error.message);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // If payment_status is being updated, also update the payment table
        if (body.payment_status) {
            const { error: paymentError } = await supabase
                .from("payment")
                .update({ payment_status: body.payment_status })
                .eq("booking_id", id);

            if (paymentError) {
                console.error("payment status update error:", paymentError.message);
                // Don't fail the request, just log the error
            }
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("booking PUT exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from("booking")
        .delete()
        .eq("booking_id", id);

    if (error) {
        console.error("booking DELETE error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" }, { status: 200 });
}
