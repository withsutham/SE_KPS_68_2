"use server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fetches the user_type from the profiles table for a given user ID.
 * Bypasses RLS using the admin client.
 */
export async function getUserType(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("profile_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user type:", error.message);
    return null;
  }

  return data?.user_type;
}

/**
 * Fetches the employee record for a given profile (user) ID.
 * Bypasses RLS using the admin client.
 */
export async function getEmployeeByUserId(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee")
    .select("*")
    .eq("profile_id", userId)
    .single();

  if (error) {
    console.error("Error fetching employee profile:", error.message);
    return null;
  }

  return data;
}
