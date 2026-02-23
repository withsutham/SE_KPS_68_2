import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) {
        console.error("DEBUG: SUPABASE_SERVICE_ROLE_KEY is missing from process.env");
    } else {
        console.log("DEBUG: SUPABASE_SERVICE_ROLE_KEY is present (length: " + key.length + ")");
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        key!
    );
}
