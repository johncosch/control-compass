import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Upsert user profile in your application database via Supabase
    // Assumes a "users" table with columns: id (uuid, PK), email (text), name (text), role (text)
    // If your table name or columns differ (e.g., "profiles"), tell me and I’ll align this.
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: user.id,
        email,
        name,
        role: "USER",
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error(
        "Supabase upsert error (users):",
        JSON.stringify(upsertError, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // If email changed, update in Supabase Auth too (non-blocking failure)
    if (email !== user.email) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email,
      });
      if (authUpdateError) {
        console.error(
          "Failed to update email in Supabase Auth:",
          JSON.stringify(authUpdateError, null, 2)
        );
        // Do not fail the request; just log it.
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
