import { prisma } from "@/lib/prisma";
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

    // Update user in database
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name,
        email,
      },
      create: {
        id: user.id,
        email,
        name,
        role: "USER",
      },
    });

    // If email changed, update in Supabase Auth too
    if (email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        console.error("Failed to update email in Supabase Auth:", error);
        // Don't fail the request, just log the error
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
