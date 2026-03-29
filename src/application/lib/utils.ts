import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getEmployeeImageUrl(employee: { image_url?: string | null; image_src?: string | null; profile_id?: string | null }) {
  if (employee.image_src) return employee.image_src;
  if (employee.image_url) return employee.image_url;
  if (!employee.profile_id) return null;
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) return null;
  // Fallback to employee-photos bucket if no image_src is provided
  return `${projectUrl}/storage/v1/object/public/employee-photos/employee_photo/${employee.profile_id}`;
}
