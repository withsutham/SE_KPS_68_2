import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. Verify user Auth
  const supabaseUser = await createClient();
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();

  // 2. Look up the customer record linked to this profile
  const { data: customerData, error: customerError } = await supabase
    .from("customer")
    .select("customer_id")
    .eq("profile_id", user.id)
    .single();

  if (customerError || !customerData) {
    return NextResponse.json({ success: true, data: [] }, { status: 200 });
  }

  const customerId = customerData.customer_id;

  // 3. Fetch all bookings for this customer with related data
  const { data: bookings, error: bookingsError } = await supabase
    .from("booking")
    .select(`
      booking_id,
      customer_name,
      customer_phone,
      customer_email,
      booking_dateTime,
      is_coupon_use,
      payment (
        payment_id,
        payment_method,
        payment_status,
        amount,
        payment_date
      ),
      booking_detail (
        booking_detail_id,
        massage_start_dateTime,
        massage_end_dateTime,
        price,
        massage_id,
        employee_id,
        room_id,
        massage (
          massage_name,
          massage_time,
          massage_price
        ),
        employee (
          first_name,
          last_name
        ),
        room (
          room_name
        )
      )
    `)
    .eq("customer_id", customerId)
    .order("booking_dateTime", { ascending: false });

  if (bookingsError) {
    console.error("booking history GET error:", bookingsError.message);
    return NextResponse.json({ success: false, error: bookingsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: bookings ?? [] }, { status: 200 });
}
