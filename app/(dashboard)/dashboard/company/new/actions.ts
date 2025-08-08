"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

interface CompanyFormData {
  name: string;
  description: string;
  website_url: string;
  logo_url?: string;
  phone: string;
  sales_email: string;
  hq_city: string;
  hq_state: string;
  hq_country: string;
  year_founded: number | null;
  size_bucket: string;
  services: string[];
  certifications: string[];
  locations_served: Array<{
    country: string;
    state?: string;
    region?: string;
  }>;
}

function generateSlug(name: string): string {
  const base =
    name
      ?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() || "company";
  return base;
}

export async function createCompanyAction(formData: CompanyFormData) {
  const supabase = await createClient();

  // 1) Auth check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // 2) Slug generation + uniqueness
  const baseSlug = generateSlug(formData.name);
  let uniqueSlug = baseSlug;
  for (let i = 0; i < 50; i++) {
    const { count, error: slugCheckError } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("slug", uniqueSlug);

    if (slugCheckError) {
      console.error("Slug check error:", slugCheckError);
      throw new Error("Failed to verify slug uniqueness");
    }

    if (!count || count === 0) break;
    uniqueSlug = `${baseSlug}-${i + 1}`;
  }

  // 3) Insert company with explicit id (avoid NOT NULL/uuid default issues)
  const companyId = randomUUID();
  const nowIso = new Date().toISOString();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      id: companyId,
      name: formData.name,
      slug: uniqueSlug,
      description: formData.description,
      websiteUrl: formData.website_url,
      logoUrl: formData.logo_url || null,
      phone: formData.phone,
      salesEmail: formData.sales_email,
      hqCity: formData.hq_city,
      hqState: formData.hq_state,
      hqCountry: formData.hq_country,
      yearFounded: formData.year_founded,
      sizeBucket: formData.size_bucket,
      status: "PENDING",
      updatedAt: nowIso,
    })
    .select("id, slug, name")
    .single();

  if (companyError || !company) {
    console.error("Company insert error:", companyError);
    throw new Error("Failed to create company");
  }

  // 4) Insert services
  if (Array.isArray(formData.services) && formData.services.length > 0) {
    const rows = formData.services.map((service) => ({
      id: randomUUID(),
      companyId,
      service,
    }));
    const { error } = await supabase.from("company_services").insert(rows);
    if (error) {
      console.error("Services insert error:", error);
      throw new Error("Failed to save services");
    }
  }

  // 5) Insert certifications
  if (
    Array.isArray(formData.certifications) &&
    formData.certifications.length > 0
  ) {
    const rows = formData.certifications.map((certification) => ({
      id: randomUUID(),
      companyId,
      certification,
    }));
    const { error } = await supabase
      .from("company_certifications")
      .insert(rows);
    if (error) {
      console.error("Certifications insert error:", error);
      throw new Error("Failed to save certifications");
    }
  }

  // 6) Insert locations served (only those with state or region)
  const locs = (formData.locations_served || []).filter(
    (loc) => loc.state !== undefined || loc.region !== undefined
  );
  if (locs.length > 0) {
    const rows = locs.map((loc) => ({
      id: randomUUID(),
      companyId,
      country: loc.country,
      state: loc.state ?? null,
      region: loc.region ?? null,
    }));
    const { error } = await supabase
      .from("company_locations_served")
      .insert(rows);
    if (error) {
      console.error("Locations insert error:", error);
      throw new Error("Failed to save locations");
    }
  }

  // 7) Link user to company as OWNER
  const { error: ownerError } = await supabase.from("user_companies").insert({
    id: randomUUID(),
    userId: user.id,
    companyId,
    relation: "OWNER",
  });
  if (ownerError) {
    console.error("User-company link insert error:", ownerError);
    throw new Error("Failed to link user to company");
  }

  // 8) Send admin notification email via Route Handler
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const adminUrl = `${baseUrl}/admin/companies/${companyId}`;
    const payload = {
      companyName: company.name,
      companyId,
      userEmail: user.email,
      adminUrl,
    };

    console.log(
      "[notify-new-company] Calling route with:",
      payload,
      "baseUrl:",
      baseUrl
    );

    const response = await fetch(`${baseUrl}/api/admin/notify-new-company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        "[notify-new-company] Failed:",
        response.status,
        response.statusText,
        text
      );
    } else {
      console.log("[notify-new-company] Sent successfully");
    }
  } catch (emailError) {
    console.error("[notify-new-company] Error calling route:", emailError);
    // Do not throw; company creation should still succeed
  }

  // 9) Revalidate pages after mutation
  revalidatePath("/dashboard");
  revalidatePath("/admin/companies");

  return { success: true };
}

// Backwards-compatible export for your form
export async function createCompany(formData: CompanyFormData) {
  return createCompanyAction(formData);
}
