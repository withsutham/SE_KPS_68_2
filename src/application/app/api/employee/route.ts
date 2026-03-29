import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("employee").select("*");

    if (error) {
        console.error("employee GET error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, first_name, last_name, phone_number, work_since, skills } = body;

        const supabase = createAdminClient();
        
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'employee' }
        });

        if (authError || !authData.user) {
            console.error("Auth User Creation error:", authError?.message);
            return NextResponse.json({ success: false, error: authError?.message || "Failed to create user" }, { status: 500 });
        }

        const profile_id = authData.user.id;

        // 2. Insert Employee row
        const { data: empData, error: empError } = await supabase
            .from("employee")
            .insert([{
                profile_id,
                first_name,
                last_name,
                phone_number,
                work_since
            }])
            .select()
            .single();

        if (empError) {
            // Rollback Auth user if employee insertion fails
            await supabase.auth.admin.deleteUser(profile_id);
            console.error("employee POST error:", empError.message);
            return NextResponse.json({ success: false, error: empError.message }, { status: 500 });
        }

        // 3. Insert Skills if provided
        if (skills && Array.isArray(skills) && skills.length > 0) {
            const skillInserts = skills.map(massage_id => ({
                employee_id: empData.employee_id,
                massage_id
            }));
            
            const { error: skillError } = await supabase
                .from("therapist_massage_skill")
                .insert(skillInserts);
                
            if (skillError) {
                console.error("Skills insert error:", skillError.message);
            }
        }

        return NextResponse.json({ success: true, data: empData }, { status: 201 });
    } catch (err: any) {
        console.error("employee POST exception:", err.message);
        return NextResponse.json({ success: false, error: "Invalid JSON body or internal error" }, { status: 400 });
    }
}
