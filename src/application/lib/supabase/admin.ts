import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        global: {
            headers: {
                // Explicitly set the Authorization header so the new sb_secret_* key
                // format is correctly sent as a Bearer token and bypasses RLS.
                Authorization: `Bearer ${key}`,
            },
        },
    });
};
