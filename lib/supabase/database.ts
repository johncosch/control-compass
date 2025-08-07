import { createClient } from "@/lib/supabase/server";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  phone: string | null;
  salesEmail: string | null;
  hqAddress: string | null;
  hqCity: string | null;
  hqState: string | null;
  hqZip: string | null;
  hqCountry: string;
  yearFounded: number | null;
  sizeBucket: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface CompanyService {
  service: string;
}

export interface CompanyCertification {
  certification: string;
}

export interface CompanyLocationServed {
  country: string;
  state: string | null;
  region: string | null;
}

export interface CompanyWithRelations extends Company {
  services: CompanyService[];
  certifications: CompanyCertification[];
  locationsServed: CompanyLocationServed[];
}

export async function getApprovedCompanies(params: {
  search?: string;
  service?: string;
  location?: string;
  size?: string;
  areasServed?: string;
  certifications?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const page = params.page || 1;
  const limit = params.limit || 30;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("companies")
    .select(
      `
      id,
      name,
      slug,
      description,
      websiteUrl,
      logoUrl,
      phone,
      salesEmail,
      hqAddress,
      hqCity,
      hqState,
      hqZip,
      hqCountry,
      yearFounded,
      sizeBucket,
      status,
      createdAt,
      updatedAt,
      services:company_services(service),
      certifications:company_certifications(certification),
      locationsServed:company_locations_served(country, state, region)
    `
    )
    .eq("status", "APPROVED")
    .order("createdAt", { ascending: true })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    );
  }

  // Apply location filter
  if (params.location) {
    query = query.eq("hqState", params.location);
  }

  // Apply size filter
  if (params.size) {
    query = query.eq("sizeBucket", params.size);
  }

  const { data: companies, error } = await query;

  if (error) {
    console.error("Error fetching companies:", error);
    return { companies: [], totalCount: 0, totalPages: 0, currentPage: page };
  }

  // Get total count for pagination
  let countQuery = supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("status", "APPROVED");

  if (params.search) {
    countQuery = countQuery.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    );
  }
  if (params.location) {
    countQuery = countQuery.eq("hqState", params.location);
  }
  if (params.size) {
    countQuery = countQuery.eq("sizeBucket", params.size);
  }

  const { count } = await countQuery;
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    companies: companies || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
}

export async function getFilterOptions() {
  const supabase = await createClient();

  try {
    // Get available services
    const { data: services } = await supabase
      .from("company_services")
      .select("service")
      .in("service", [
        "CONTROL_PANEL_ASSEMBLY",
        "SYSTEM_INTEGRATION",
        "CALIBRATION_SERVICES",
      ]);

    // Get available locations
    const { data: locations } = await supabase
      .from("companies")
      .select("hqState")
      .eq("status", "APPROVED")
      .not("hqState", "is", null);

    // Get available sizes
    const { data: sizes } = await supabase
      .from("companies")
      .select("sizeBucket")
      .eq("status", "APPROVED")
      .not("sizeBucket", "is", null);

    // Get available certifications
    const { data: certifications } = await supabase
      .from("company_certifications")
      .select("certification");

    // Remove duplicates and format
    const uniqueServices = [...new Set(services?.map((s) => s.service) || [])];
    const uniqueLocations = [
      ...new Set(locations?.map((l) => l.hqState) || []),
    ];
    const uniqueSizes = [...new Set(sizes?.map((s) => s.sizeBucket) || [])];
    const uniqueCertifications = [
      ...new Set(certifications?.map((c) => c.certification) || []),
    ];

    return {
      services: uniqueServices.map((service) => ({ service })),
      locations: uniqueLocations.map((hqState) => ({ hqState })),
      sizes: uniqueSizes.map((sizeBucket) => ({ sizeBucket })),
      certifications: uniqueCertifications.map((certification) => ({
        certification,
      })),
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    // Return fallback data
    return {
      services: [
        { service: "CONTROL_PANEL_ASSEMBLY" },
        { service: "SYSTEM_INTEGRATION" },
        { service: "CALIBRATION_SERVICES" },
      ],
      locations: [
        { hqState: "CA" },
        { hqState: "TX" },
        { hqState: "FL" },
        { hqState: "NY" },
        { hqState: "PA" },
      ],
      sizes: [
        { sizeBucket: "SIZE_1_10" },
        { sizeBucket: "SIZE_11_50" },
        { sizeBucket: "SIZE_51_200" },
        { sizeBucket: "SIZE_201_500" },
        { sizeBucket: "SIZE_501_PLUS" },
      ],
      certifications: [
        { certification: "UL_508A" },
        { certification: "ISO_9001" },
        { certification: "ISO_14001" },
      ],
    };
  }
}

export async function createCompany(
  companyData: {
    name: string;
    description: string | null;
    websiteUrl: string | null;
    logoUrl?: string | null;
    phone: string | null;
    salesEmail: string | null;
    hqAddress: string | null;
    hqCity: string | null;
    hqState: string | null;
    hqZip: string | null;
    hqCountry: string;
    yearFounded?: number | null;
    sizeBucket: string | null;
    services: string[];
    certifications: string[];
    locations_served: Array<{
      country: string;
      state?: string;
      region?: string;
    }>;
  },
  userId: string
) {
  const supabase = await createClient();

  try {
    // Create the company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyData.name,
        description: companyData.description,
        websiteUrl: companyData.websiteUrl,
        logoUrl: companyData.logoUrl,
        phone: companyData.phone,
        salesEmail: companyData.salesEmail,
        hqAddress: companyData.hqAddress,
        hqCity: companyData.hqCity,
        hqState: companyData.hqState,
        hqZip: companyData.hqZip,
        hqCountry: companyData.hqCountry,
        yearFounded: companyData.yearFounded,
        sizeBucket: companyData.sizeBucket,
        status: "PENDING",
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // Create user-company relationship
    const { error: relationError } = await supabase
      .from("user_companies")
      .insert({
        userId: userId,
        companyId: company.id,
        relation: "OWNER",
      });

    if (relationError) throw relationError;

    // Add services
    if (companyData.services.length > 0) {
      const servicesData = companyData.services.map((service) => ({
        companyId: company.id,
        service,
      }));

      const { error: servicesError } = await supabase
        .from("company_services")
        .insert(servicesData);

      if (servicesError) throw servicesError;
    }

    // Add certifications
    if (companyData.certifications.length > 0) {
      const certificationsData = companyData.certifications.map(
        (certification) => ({
          companyId: company.id,
          certification,
        })
      );

      const { error: certificationsError } = await supabase
        .from("company_certifications")
        .insert(certificationsData);

      if (certificationsError) throw certificationsError;
    }

    // Add locations served
    if (companyData.locations_served.length > 0) {
      const locationsData = companyData.locations_served.map((location) => ({
        companyId: company.id,
        country: location.country,
        state: location.state,
        region: location.region,
      }));

      const { error: locationsError } = await supabase
        .from("company_locations_served")
        .insert(locationsData);

      if (locationsError) throw locationsError;
    }

    return { success: true, company };
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
}

export async function updateCompany(
  companyId: string,
  companyData: {
    name: string;
    description: string | null;
    websiteUrl: string | null;
    logoUrl?: string | null;
    phone: string | null;
    salesEmail: string | null;
    hqAddress: string | null;
    hqCity: string | null;
    hqState: string | null;
    hqZip: string | null;
    hqCountry: string;
    yearFounded?: number | null;
    sizeBucket: string | null;
    services: string[];
    certifications: string[];
    locations_served: Array<{
      country: string;
      state?: string;
      region?: string;
    }>;
  }
) {
  const supabase = await createClient();

  try {
    // Update company basic info
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: companyData.name,
        description: companyData.description,
        websiteUrl: companyData.websiteUrl,
        logoUrl: companyData.logoUrl,
        phone: companyData.phone,
        salesEmail: companyData.salesEmail,
        hqAddress: companyData.hqAddress,
        hqCity: companyData.hqCity,
        hqState: companyData.hqState,
        hqZip: companyData.hqZip,
        hqCountry: companyData.hqCountry,
        yearFounded: companyData.yearFounded,
        sizeBucket: companyData.sizeBucket,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", companyId);

    if (companyError) throw companyError;

    // Update services - delete existing and insert new
    await supabase.from("company_services").delete().eq("companyId", companyId);

    if (companyData.services.length > 0) {
      const servicesData = companyData.services.map((service) => ({
        companyId: companyId,
        service,
      }));

      const { error: servicesError } = await supabase
        .from("company_services")
        .insert(servicesData);

      if (servicesError) throw servicesError;
    }

    // Update certifications
    await supabase
      .from("company_certifications")
      .delete()
      .eq("companyId", companyId);

    if (companyData.certifications.length > 0) {
      const certificationsData = companyData.certifications.map(
        (certification) => ({
          companyId: companyId,
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

    if (companyData.locations_served.length > 0) {
      const locationsData = companyData.locations_served.map((location) => ({
        companyId: companyId,
        country: location.country,
        state: location.state,
        region: location.region,
      }));

      const { error: locationsError } = await supabase
        .from("company_locations_served")
        .insert(locationsData);

      if (locationsError) throw locationsError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
}

export async function getUserCompanies(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_companies")
    .select(
      `
      id,
      relation,
      createdAt,
      company:companies(
        id,
        name,
        slug,
        description,
        websiteUrl,
        logoUrl,
        phone,
        salesEmail,
        hqAddress,
        hqCity,
        hqState,
        hqZip,
        hqCountry,
        yearFounded,
        sizeBucket,
        status,
        createdAt,
        updatedAt
      )
    `
    )
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching user companies:", error);
    return [];
  }

  return data || [];
}

export async function getCompanyBySlug(
  slug: string
): Promise<CompanyWithRelations | null> {
  const supabase = await createClient();

  try {
    // First, let's try a simple query to see if the company exists
    console.log("Searching for company with slug:", slug);

    const { data: basicCompany, error: basicError } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .eq("status", "APPROVED")
      .single();

    if (basicError) {
      console.error("Basic company query error:", basicError);
      return null;
    }

    if (!basicCompany) {
      console.log("No company found with slug:", slug);
      return null;
    }

    console.log("Found basic company:", basicCompany.name);
    console.log("Company data fields:", Object.keys(basicCompany));
    console.log("Sales email:", basicCompany.salesEmail);
    console.log("Logo URL:", basicCompany.logoUrl);
    console.log("Website URL:", basicCompany.websiteUrl);

    // Now get the related data separately using the correct column names
    const [servicesResult, certificationsResult, locationsResult] =
      await Promise.all([
        supabase
          .from("company_services")
          .select("service")
          .eq("companyId", basicCompany.id),

        supabase
          .from("company_certifications")
          .select("certification")
          .eq("companyId", basicCompany.id),

        supabase
          .from("company_locations_served")
          .select("country, state, region")
          .eq("companyId", basicCompany.id),
      ]);

    // Handle any errors in the related queries
    if (servicesResult.error) {
      console.error("Services query error:", servicesResult.error);
    }
    if (certificationsResult.error) {
      console.error("Certifications query error:", certificationsResult.error);
    }
    if (locationsResult.error) {
      console.error("Locations query error:", locationsResult.error);
    }

    console.log("Services data:", servicesResult.data);
    console.log("Certifications data:", certificationsResult.data);
    console.log("Locations data:", locationsResult.data);

    // Combine the results
    const company: CompanyWithRelations = {
      ...basicCompany,
      services: servicesResult.data || [],
      certifications: certificationsResult.data || [],
      locationsServed: locationsResult.data || [],
    };

    console.log("Final company object:", {
      name: company.name,
      salesEmail: company.salesEmail,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      servicesCount: company.services.length,
      certificationsCount: company.certifications.length,
      locationsCount: company.locationsServed.length,
    });

    return company;
  } catch (error) {
    console.error("Error in getCompanyBySlug:", error);
    return null;
  }
}
