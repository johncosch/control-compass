"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// Hardcoded email settings (simple + reliable)
const ADMIN_REVIEW_URL = "https://www.controlcompass.io/admin/companies";
const EMAIL_TO = "johnj@iothrifty.com";
const EMAIL_FROM = "noreply@controlcompass.io"; // make sure this domain is verified in Resend

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

  // 3) Insert company with explicit id (avoid NOT NULL/default issues)
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

  // 8) Send admin notification email (hardcoded, direct via Resend)
  try {
    const { Resend } = await import("resend");
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[notify-new-company] RESEND_API_KEY not set; skipping email send"
      );
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>New Company Pending Approval</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Control Compass</h1>
      <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Company Directory</p>
    </div>

    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">New Company Pending Approval</h2>

      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057;">Company Details</h3>
        <p><strong>Company Name:</strong> ${company.name}</p>
        <p><strong>Company ID:</strong> ${companyId}</p>
        <p><strong>Submitted by:</strong> ${user.email || "Unknown"}</p>
        <p><strong>Status:</strong> <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 4px; font-size: 12px;">PENDING</span></p>
      </div>

      <p style="margin: 25px 0;">A new company has been submitted to the Control Compass directory and is awaiting your approval.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${ADMIN_REVIEW_URL}"
           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Review Companies →
        </a>
      </div>

      <div style="background: #e9ecef; padding: 15px; border-radius: 6px; margin-top: 25px;">
        <p style="margin: 0; font-size: 14px; color: #6c757d;">
          <strong>Next Steps:</strong><br />
          • Review the company information<br />
          • Verify the details are accurate<br />
          • Approve or reject the submission<br />
          • The company owner will be notified of your decision
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6c757d; font-size: 12px;">
      <p>This is an automated notification from Control Compass</p>
      <p>© ${new Date().getFullYear()} Control Compass. All rights reserved.</p>
    </div>
  </body>
</html>`;

      const { error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: [EMAIL_TO],
        subject: `New Company Pending Approval: ${company.name}`,
        html,
      });

      if (error) {
        console.error("Resend send error:", JSON.stringify(error, null, 2));
      } else {
        console.log("[notify-new-company] Email sent to", EMAIL_TO);
      }
    }
  } catch (emailError) {
    console.error("[notify-new-company] Unexpected error:", emailError);
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
