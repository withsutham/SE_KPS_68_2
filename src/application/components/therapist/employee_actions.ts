/*
 * This file was moved from src/application/lib/user-actions.ts
 * It contains server actions for fetching and mutating data, using the admin client.
 */
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

/**
 * Fetches the leave records for a given employee ID.
 * Bypasses RLS using the admin client.
 */
export async function getLeaveRecordsByEmployeeId(employeeId: number) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leave_record")
    .select("*")
    .eq("employee_id", employeeId)
    .order("leave_record_id", { ascending: false });

  if (error) {
    console.error("Error fetching leave records:", error.message);
    return [];
  }

  return data;
}

/**
 * Creates a new leave record for an employee.
 * Bypasses RLS using the admin client.
 */
export async function createLeaveRecord(params: {
  employee_id: number;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leave_record")
    .insert([
      {
        ...params,
        approval_status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating leave record:", error.message);
    throw new Error(error.message);
  }

  return { success: true, data };
}

/**
 * Updates an existing leave record.
 * Bypasses RLS using the admin client.
 */
export async function updateLeaveRecord(
  leaveRecordId: number,
  params: {
    start_datetime?: string;
    end_datetime?: string;
    reason?: string;
  }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leave_record")
    .update(params)
    .eq("leave_record_id", leaveRecordId)
    .select()
    .single();

  if (error) {
    console.error("Error updating leave record:", error.message);
    throw new Error(error.message);
  }

  return { success: true, data };
}

/**
 * Deletes an existing leave record.
 * Bypasses RLS using the admin client.
 */
export async function deleteLeaveRecord(leaveRecordId: number) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("leave_record")
    .delete()
    .eq("leave_record_id", leaveRecordId);

  if (error) {
    console.error("Error deleting leave record:", error.message);
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Updates an employee's profile information.
 * Bypasses RLS using the admin client.
 */
export async function updateEmployeeProfile(employeeId: number, params: {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  image_src?: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employee")
    .update(params)
    .eq("employee_id", employeeId)
    .select()
    .single();

  if (error) {
    console.error("Error updating employee profile:", error.message);
    throw new Error(error.message);
  }

  return { success: true, data };
}

/**
 * Uploads an employee's profile photo to Supabase Storage.
 * Bypasses RLS using the admin client.
 */
export async function uploadEmployeePhoto(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const supabase = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileExt = file.name.split('.').pop();
  const fileName = `therapist_${Date.now()}.${fileExt}`;
  const filePath = `employee_photo/${fileName}`;

  const { data, error } = await supabase.storage
    .from('employee-photos')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    console.error("Storage upload error:", error);
    throw new Error(error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('employee-photos')
    .getPublicUrl(filePath);

  return { success: true, publicUrl };
}
