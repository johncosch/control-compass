import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { revalidatePath } from "next/cache" // Optional: revalidate lists after mutation

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check (users table with role column)
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user role:", userError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Payload
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // Update company to REJECTED
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update({
        status: "REJECTED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", companyId)
      .select("*")
      .single();

    if (updateError || !updatedCompany) {
      console.error("Error updating company status to REJECTED:", updateError);
      return NextResponse.json(
        { error: "Failed to reject company" },
        { status: 500 }
      );
    }

    // Optional: revalidate admin list page
    // await revalidatePath("/admin/companies")

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error) {
    console.error("Error rejecting company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
