import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            customer_id,
            package_id,
            total_price,
            payment_method,
            payment_slip_url,
        } = body;

        // Use standard service role client to bypass RLS for server-side operations
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Create the package_order
        const { data: orderData, error: orderError } = await supabase
            .from("package_order")
            .insert([{
                customer_id,
                package_id,
                total_price,
                payment_status: 'pending'
            }])
            .select("package_order_id")
            .single();

        if (orderError) {
            console.error("package_order insert error:", orderError);
            return NextResponse.json({ success: false, error: orderError.message }, { status: 500 });
        }

        const packageOrderId = orderData.package_order_id;

        // 2. Create the payment record
        const { error: paymentError } = await supabase
            .from("payment")
            .insert([{
                payment_method,
                payment_status: 'pending',
                amount: total_price,
                payment_slip_url,
                payment_type: 'full',
                package_order_id: packageOrderId
            }]);

        if (paymentError) {
            console.error("payment insert error:", paymentError);
            return NextResponse.json({ success: false, error: paymentError.message }, { status: 500 });
        }

        // 3. Get the package_detail items to generate member_package entries
        const { data: packageDetails, error: detailError } = await supabase
            .from("package_detail")
            .select("package_detail_id")
            .eq("package_id", package_id);

        if (detailError) {
            console.error("package_detail select error:", detailError);
            return NextResponse.json({ success: false, error: detailError.message }, { status: 500 });
        }

        if (packageDetails && packageDetails.length > 0) {
            const memberPackages = packageDetails.map((detail: any) => ({
                is_used: false,
                member_id: customer_id,
                package_detail_id: detail.package_detail_id,
                package_order_id: packageOrderId
            }));

            const { error: memberPackageError } = await supabase
                .from("member_package")
                .insert(memberPackages);

            if (memberPackageError) {
                console.error("member_package insert error:", memberPackageError);
                return NextResponse.json({ success: false, error: memberPackageError.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, data: { package_order_id: packageOrderId } }, { status: 201 });

    } catch (err: any) {
        console.error("package checkout error:", err);
        return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
    }
}
