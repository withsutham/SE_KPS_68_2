import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch customer profile using profile_id
        const adminSupabase = await createAdminClient();
        const { data, error } = await adminSupabase
            .from("customer")
            .select("*")
            .eq("profile_id", user.id)
            .single();

        if (error) {
            console.error("profile GET error:", error.message);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("profile GET exception:", err.message);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        if (!body.first_name || !body.first_name.trim()) {
            return NextResponse.json(
                { success: false, error: "กรุณากรอกชื่อ" },
                { status: 400 }
            );
        }

        if (!body.last_name || !body.last_name.trim()) {
            return NextResponse.json(
                { success: false, error: "กรุณากรอกนามสกุล" },
                { status: 400 }
            );
        }

        // Validate phone number format if provided
        if (body.phone_number) {
            const cleanedPhone = body.phone_number.replace(/[-\s]/g, "");
            if (!/^[0-9]{9,10}$/.test(cleanedPhone)) {
                return NextResponse.json(
                    { success: false, error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 9-10 หลัก)" },
                    { status: 400 }
                );
            }
            // Store cleaned phone number
            body.phone_number = cleanedPhone;
        }

        // Only allow updating specific fields
        const allowedFields = {
            first_name: body.first_name.trim(),
            last_name: body.last_name.trim(),
            phone_number: body.phone_number || null,
        };

        // Update customer profile
        const adminSupabase = await createAdminClient();
        const { data, error } = await adminSupabase
            .from("customer")
            .update(allowedFields)
            .eq("profile_id", user.id)
            .select()
            .single();

        if (error) {
            console.error("profile PUT error:", error.message);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: any) {
        console.error("profile PUT exception:", err.message);
        return NextResponse.json(
            { success: false, error: "Invalid JSON body or internal error" },
            { status: 400 }
        );
    }
}
