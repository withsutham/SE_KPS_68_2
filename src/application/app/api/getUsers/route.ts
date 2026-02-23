import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
        console.error("Supabase query failed:", error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, users: data }), { status: 200 });
}
