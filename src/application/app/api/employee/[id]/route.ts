import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { first_name, last_name, phone_number, work_since, skills } = body;
        const employee_id = parseInt(params.id, 10);
        
        const supabase = createAdminClient();

        // 1. Update Employee
        const { data: empData, error: empError } = await supabase
            .from("employee")
            .update({ first_name, last_name, phone_number, work_since })
            .eq("employee_id", employee_id)
            .select()
            .single();

        if (empError) {
            return NextResponse.json({ success: false, error: empError.message }, { status: 500 });
        }

        // 2. Update Skills (Delete all, then Insert)
        if (skills && Array.isArray(skills)) {
            await supabase
                .from("therapist_massage_skill")
                .delete()
                .eq("employee_id", employee_id);
                
            if (skills.length > 0) {
                const skillInserts = skills.map((massage_id: number) => ({
                    employee_id,
                    massage_id
                }));
                await supabase
                    .from("therapist_massage_skill")
                    .insert(skillInserts);
            }
        }

        return NextResponse.json({ success: true, data: empData }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const employee_id = parseInt(params.id, 10);
        const supabase = createAdminClient();

        // 1. Get profile_id first
        const { data: empData, error: fetchError } = await supabase
            .from("employee")
            .select("profile_id")
            .eq("employee_id", employee_id)
            .single();

        if (fetchError || !empData) {
            return NextResponse.json({ success: false, error: "Employee not found or already deleted" }, { status: 404 });
        }

        const profile_id = empData.profile_id;

        // 2. Delete Employee row
        const { error: empError } = await supabase
            .from("employee")
            .delete()
            .eq("employee_id", employee_id);

        if (empError) {
            return NextResponse.json({ success: false, error: empError.message }, { status: 500 });
        }

        // 3. Delete Auth User if profile_id exists
        if (profile_id) {
            const { error: authError } = await supabase.auth.admin.deleteUser(profile_id);
            if (authError) {
                console.error("Failed to delete auth user:", authError.message);
                // Return success anyway since the employee row is successfully deleted.
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
