import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("booking").select("*");

    if (error) {
        console.error("booking GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = await createAdminClient();

        // 1. Create booking
        const bookingPayload = {
            customer_name: body.customer_name,
            customer_phone: body.customer_phone,
            booking_dateTime: body.booking_dateTime,
        };

        const { data: bookingData, error: bookingError } = await supabase
            .from("booking")
            .insert([bookingPayload])
            .select("booking_id")
            .single();

        if (bookingError) {
            console.error("booking POST error (booking table):", bookingError.message);
            return NextResponse.json({ success: false, error: bookingError.message }, { status: 500 });
        }

        const bookingId = bookingData.booking_id;

        // 2. Create booking details
        if (body.services && Array.isArray(body.services)) {
            const startDateTime = new Date(body.booking_dateTime);
            const dateStr = startDateTime.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
            
            // Auto-assignment Prep: Fetch all relevant data for the day
            const [
                { data: existingBookings },
                { data: skills },
                { data: rooms }
            ] = await Promise.all([
                supabase.from("booking_detail")
                    .select("employee_id, room_id, massage_start_dateTime, massage_end_dateTime")
                    .gte("massage_start_dateTime", `${dateStr}T00:00:00+07:00`)
                    .lt("massage_start_dateTime", `${dateStr}T23:59:59+07:00`),
                supabase.from("therapist_massage_skill").select("employee_id, massage_id"),
                supabase.from("room_massage").select("room_id, massage_id, capacity")
            ]);

            let currentStartTime = new Date(startDateTime);
            const detailsPayload = [];
            const localBookings = existingBookings ? [...existingBookings] : [];

            for (const service of body.services) {
                const endDateTime = new Date(currentStartTime.getTime() + (service.duration || 60) * 60000);

                // Find available employee mapping
                const skilledEmployees = skills?.filter(s => s.massage_id === service.massage_id).map(s => s.employee_id) || [];
                let assignedEmployeeId = null;
                for (const empId of skilledEmployees) {
                    const isOverlapping = localBookings.some((b: any) => 
                        b.employee_id === empId && 
                        new Date(b.massage_start_dateTime) < endDateTime && 
                        new Date(b.massage_end_dateTime) > currentStartTime
                    );
                    if (!isOverlapping) {
                        assignedEmployeeId = empId;
                        break;
                    }
                }

                // Find available room mapping
                const validRooms = rooms?.filter(r => r.massage_id === service.massage_id) || [];
                let assignedRoomId = null;
                for (const rm of validRooms) {
                    const overlappingCount = localBookings.filter((b: any) => 
                        b.room_id === rm.room_id && 
                        new Date(b.massage_start_dateTime) < endDateTime && 
                        new Date(b.massage_end_dateTime) > currentStartTime
                    ).length;
                    
                    if (overlappingCount < rm.capacity) {
                        assignedRoomId = rm.room_id;
                        break;
                    }
                }

                const payload = {
                    booking_id: bookingId,
                    massage_id: service.massage_id,
                    price: service.price,
                    massage_start_dateTime: currentStartTime.toISOString(),
                    massage_end_dateTime: endDateTime.toISOString(),
                    employee_id: assignedEmployeeId,
                    room_id: assignedRoomId
                };
                detailsPayload.push(payload);
                
                // Track this new booking locally to prevent internal double booking for consecutive services
                localBookings.push({
                    employee_id: assignedEmployeeId,
                    room_id: assignedRoomId,
                    massage_start_dateTime: currentStartTime.toISOString(),
                    massage_end_dateTime: endDateTime.toISOString(),
                });

                currentStartTime = new Date(endDateTime);
            }

            const { error: detailsError } = await supabase
                .from("booking_detail")
                .insert(detailsPayload);

            if (detailsError) {
                console.error("booking POST error (booking_detail table):", detailsError.message);
                // Non-fatal, but we should log it
            }
        }

        // 3. Create payment
        const paymentPayload = {
            booking_id: bookingId,
            payment_method: body.payment_method,
            amount: body.total_price,
            payment_status: "pending",
        };

        const { error: paymentError } = await supabase
            .from("payment")
            .insert([paymentPayload]);

        if (paymentError) {
            console.error("booking POST error (payment table):", paymentError.message);
        }

        return NextResponse.json({ success: true, data: { id: bookingId } }, { status: 201 });
    } catch (err: any) {
        console.error("booking POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
