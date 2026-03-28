import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get("customer_id");

    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: "customer_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Fetch unused member packages with nested package_detail and massage data
    const { data: memberPackages, error } = await supabase
      .from("member_package")
      .select("*, package_detail(*, package(*), massage(*))")
      .eq("member_id", customer_id)
      .eq("is_used", false)
      .or(`expire_datetime.is.null,expire_datetime.gt.${new Date().toISOString()}`);

    if (error) {
      console.error("member_package/unused GET error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform and group packages for easier consumption
    const transformedPackages = memberPackages
      ?.map((pkg) => ({
        ...pkg,
        massage: pkg.package_detail?.massage,
        package: pkg.package_detail?.package,
      }))
      .filter((pkg) => pkg.massage && pkg.package) // Ensure we have all required data
      || [];

    return NextResponse.json({ success: true, data: transformedPackages });
  } catch (err: any) {
    console.error("member_package/unused exception:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
