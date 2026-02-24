import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        const supabase = await createAdminClient();

        // If an ID is provided, get a specific user
        if (id) {
            const { data, error } = await supabase.auth.admin.getUserById(id);

            if (error) {
                console.error("Supabase Auth Error:", error.message);
                return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
            }

            const user = data?.user || (data as any);

            if (!user || (!user.id && !data?.user)) {
                return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
            }

            return new Response(JSON.stringify({ success: true, user }), { status: 200 });
        }

        // Otherwise, list all users
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error("Supabase Auth Error:", error.message);
            return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, users: data.users }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
