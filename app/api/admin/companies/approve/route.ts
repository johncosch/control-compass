import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1) Auth: must be signed in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Admin check: read role from users table
    const { data: dbUser, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError) {
      console.error("Role check error:", roleError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3) Parse body
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    // 4) Update company status
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update({
        status: "APPROVED",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", companyId)
      .select("id, name, slug, status, updatedAt")
      .single();

    if (updateError) {
      console.error("Update company error:", updateError);
      return NextResponse.json(
        { error: "Failed to approve company" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, company: updatedCompany });
  } catch (error) {
    console.error("Error approving company:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
