"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

interface CompanyUpdateData {
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  phone: string;
  salesEmail: string;
  hqCity: string;
  hqState: string;
  hqCountry: string;
  yearFounded: number | null;
  sizeBucket: string;
  services: string[];
  industries: string[];
  certifications: string[];
  locationsServed: Array<{ country: string; state?: string; region?: string }>;
}

export async function updateCompany(
  companyId: string,
  formData: CompanyUpdateData
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Authentication required");
  }

  // Verify user owns this company or is a member
  const { data: userCompany } = await supabase
    .from("user_companies")
    .select("relation")
    .eq("userId", user.id)
    .eq("companyId", companyId)
    .single();

  if (!userCompany || !["OWNER", "MEMBER"].includes(userCompany.relation)) {
    throw new Error("You don't have permission to edit this company");
  }

  try {
    // Update company basic info
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: formData.name,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        logoUrl: formData.logoUrl,
        phone: formData.phone,
        salesEmail: formData.salesEmail,
        hqCity: formData.hqCity,
        hqState: formData.hqState,
        hqCountry: formData.hqCountry,
        yearFounded: formData.yearFounded,
        sizeBucket: formData.sizeBucket,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", companyId);

    if (companyError) throw companyError;

    // Update services
    await supabase.from("company_services").delete().eq("companyId", companyId);
    if (formData.services.length > 0) {
      const servicesData = formData.services.map((service) => ({
        id: uuidv4(),
        companyId,
        service,
      }));
      const { error: servicesError } = await supabase
        .from("company_services")
        .insert(servicesData);
      if (servicesError) throw servicesError;
    }

    // Update industries
    await supabase
      .from("company_industries")
      .delete()
      .eq("companyId", companyId);
    if (formData.industries.length > 0) {
      const industriesData = formData.industries.map((industry) => ({
        id: uuidv4(),
        companyId,
        industry,
      }));
      const { error: industriesError } = await supabase
        .from("company_industries")
        .insert(industriesData);
      if (industriesError) throw industriesError;
    }

    // Update certifications
    await supabase
      .from("company_certifications")
      .delete()
      .eq("companyId", companyId);
    if (formData.certifications.length > 0) {
      const certificationsData = formData.certifications.map(
        (certification) => ({
          id: uuidv4(),
          companyId,
          certification,
        })
      );
      const { error: certificationsError } = await supabase
        .from("company_certifications")
        .insert(certificationsData);
      if (certificationsError) throw certificationsError;
    }

    // Update locations served
    await supabase
      .from("company_locations_served")
      .delete()
      .eq("companyId", companyId);
    if (formData.locationsServed.length > 0) {
      const locationsData = formData.locationsServed.map((location) => ({
        id: uuidv4(),
        companyId,
        country: location.country,
        state: location.state,
        region: location.region,
      }));
      const { error: locationsError } = await supabase
        .from("company_locations_served")
        .insert(locationsData);
      if (locationsError) throw locationsError;
    }

    // Get updated company data for slug
    const { data: updatedCompany } = await supabase
      .from("companies")
      .select("slug")
      .eq("id", companyId)
      .single();

    revalidatePath("/dashboard");
    if (updatedCompany?.slug) {
      revalidatePath(`/companies/${updatedCompany.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Company update error:", error);
    throw error;
  }
}
