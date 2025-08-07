import { createClient } from "@/lib/supabase/server";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  phone?: string;
  salesEmail?: string;
  hqCity?: string;
  hqState?: string;
  hqCountry?: string;
  yearFounded?: number;
  sizeBucket?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  services?: { service: string }[];
  certifications?: { certification: string }[];
  locationsServed?: { country?: string; state?: string; region?: string }[];
  userCompanies?: { user: { name?: string; email: string } }[];
}

export interface CompanyFilters {
  search?: string;
  service?: string;
  location?: string;
  size?: string;
  areasServed?: string;
  certifications?: string;
  page: number;
  limit: number;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    console.log("🔍 Fetching company by slug:", slug);

    const supabase = await createClient();

    // First get the basic company data (use camelCase column names)
    const { data: company, error } = await supabase
      .from("companies")
      .select(
        `
      id,
      name,
      slug,
      description,
      logoUrl,
      websiteUrl,
      phone,
      salesEmail,
      hqCity,
      hqState,
      hqCountry,
      yearFounded,
      sizeBucket,
      status,
      createdAt,
      updatedAt
    `
      )
      .eq("slug", slug)
      .eq("status", "APPROVED")
      .single();

    if (error) {
      console.error(
        "Error fetching company by slug:",
        JSON.stringify(error, null, 2)
      );
      return null;
    }

    if (!company) {
      console.log("❌ Company not found");
      return null;
    }

    console.log("✅ Found basic company:", company.name);

    // Get services
    const { data: services, error: servicesError } = await supabase
      .from("company_services")
      .select("service")
      .eq("companyId", company.id);

    if (servicesError) {
      console.error(
        "Services query error:",
        JSON.stringify(servicesError, null, 2)
      );
    }

    // Get certifications
    const { data: certifications, error: certificationsError } = await supabase
      .from("company_certifications")
      .select("certification")
      .eq("companyId", company.id);

    if (certificationsError) {
      console.error(
        "Certifications query error:",
        JSON.stringify(certificationsError, null, 2)
      );
    }

    // Get locations served
    const { data: locationsServed, error: locationsError } = await supabase
      .from("company_locations_served")
      .select("country, state, region")
      .eq("companyId", company.id);

    if (locationsError) {
      console.error(
        "Locations query error:",
        JSON.stringify(locationsError, null, 2)
      );
    }

    // Get user companies (owners)
    const { data: userCompanies, error: userCompaniesError } = await supabase
      .from("user_companies")
      .select(
        `
      users (
        name,
        email
      )
    `
      )
      .eq("companyId", company.id)
      .eq("relation", "OWNER")
      .limit(1);

    if (userCompaniesError) {
      console.error(
        "User companies query error:",
        JSON.stringify(userCompaniesError, null, 2)
      );
    }

    // Transform the data to match the expected interface (already camelCase)
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      phone: company.phone,
      salesEmail: company.salesEmail,
      hqCity: company.hqCity,
      hqState: company.hqState,
      hqCountry: company.hqCountry,
      yearFounded: company.yearFounded,
      sizeBucket: company.sizeBucket,
      status: company.status,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      services: services || [],
      certifications: certifications || [],
      locationsServed: locationsServed || [],
      userCompanies:
        userCompanies?.map((uc: any) => ({ user: uc.users })) || [],
    };
  } catch (error) {
    console.error("Error in getCompanyBySlug:", error);
    return null;
  }
}

export async function getApprovedCompanies(filters: CompanyFilters) {
  try {
    console.log("🔍 Fetching companies with params:", filters);

    const supabase = await createClient();
    const { page, limit, ...searchFilters } = filters;
    const offset = (page - 1) * limit;

    // Base query with basic filters (use camelCase columns)
    let baseQuery = supabase
      .from("companies")
      .select("*")
      .eq("status", "APPROVED");

    if (searchFilters.search) {
      baseQuery = baseQuery.or(
        `name.ilike.%${searchFilters.search}%,description.ilike.%${searchFilters.search}%`
      );
    }

    if (searchFilters.location) {
      baseQuery = baseQuery.eq("hqState", searchFilters.location);
    }

    if (searchFilters.size) {
      baseQuery = baseQuery.eq("sizeBucket", searchFilters.size);
    }

    // Fetch companies
    const { data: allCompanies, error: companiesError } = await baseQuery;

    if (companiesError) {
      console.error(
        "Error fetching companies:",
        JSON.stringify(companiesError, null, 2)
      );
      return { companies: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    console.log(
      `✅ Found ${allCompanies?.length || 0} companies before service/cert filtering`
    );

    let filteredCompanies = allCompanies || [];

    // Service filter
    if (searchFilters.service) {
      const { data: serviceData, error: serviceError } = await supabase
        .from("company_services")
        .select("companyId")
        .eq("service", searchFilters.service);

      if (serviceError) {
        console.error(
          "Error fetching service filter:",
          JSON.stringify(serviceError, null, 2)
        );
      } else {
        const serviceCompanyIds = (serviceData || []).map((s) => s.companyId);
        filteredCompanies = filteredCompanies.filter((c) =>
          serviceCompanyIds.includes(c.id)
        );
      }
    }

    // Certifications filter
    if (searchFilters.certifications) {
      const selectedCertifications = searchFilters.certifications
        .split(",")
        .filter(Boolean);
      if (selectedCertifications.length > 0) {
        const { data: certData, error: certError } = await supabase
          .from("company_certifications")
          .select("companyId")
          .in("certification", selectedCertifications);

        if (certError) {
          console.error(
            "Error fetching certification filter:",
            JSON.stringify(certError, null, 2)
          );
        } else {
          const certCompanyIds = (certData || []).map((c) => c.companyId);
          filteredCompanies = filteredCompanies.filter((c) =>
            certCompanyIds.includes(c.id)
          );
        }
      }
    }

    // Areas served filter
    if (searchFilters.areasServed) {
      const areasServed = searchFilters.areasServed.split(",").filter(Boolean);
      if (areasServed.length > 0) {
        const stateConditions = areasServed.filter((a) => a.length === 2);
        if (stateConditions.length > 0) {
          const { data: locData, error: locError } = await supabase
            .from("company_locations_served")
            .select("companyId")
            .or(
              `state.in.(${stateConditions.join(",")}),and(country.eq.US,state.is.null)`
            );

          if (locError) {
            console.error(
              "Error fetching areas served filter:",
              JSON.stringify(locError, null, 2)
            );
          } else {
            const locCompanyIds = (locData || []).map((l) => l.companyId);
            filteredCompanies = filteredCompanies.filter((c) =>
              locCompanyIds.includes(c.id)
            );
          }
        }
      }
    }

    const totalCount = filteredCompanies.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Pagination and sorting by createdAt (camelCase)
    const paginatedCompanies = filteredCompanies
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt as string).getTime() -
          new Date(b.createdAt as string).getTime()
      )
      .slice(offset, offset + limit);

    // Fetch relations per company
    const companiesWithRelations = await Promise.all(
      paginatedCompanies.map(async (company: any) => {
        const [
          { data: services },
          { data: certifications },
          { data: locationsServed },
        ] = await Promise.all([
          supabase
            .from("company_services")
            .select("service")
            .eq("companyId", company.id),
          supabase
            .from("company_certifications")
            .select("certification")
            .eq("companyId", company.id),
          supabase
            .from("company_locations_served")
            .select("country, state, region")
            .eq("companyId", company.id),
        ]);

        return {
          id: company.id,
          name: company.name,
          slug: company.slug,
          description: company.description,
          logoUrl: company.logoUrl,
          websiteUrl: company.websiteUrl,
          phone: company.phone,
          salesEmail: company.salesEmail,
          hqCity: company.hqCity,
          hqState: company.hqState,
          hqCountry: company.hqCountry,
          yearFounded: company.yearFounded,
          sizeBucket: company.sizeBucket,
          status: company.status,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
          services: services || [],
          certifications: certifications || [],
          locationsServed: locationsServed || [],
        } as Company;
      })
    );

    console.log(
      "📊 Returning",
      companiesWithRelations.length,
      "companies, total:",
      totalCount
    );

    return {
      companies: companiesWithRelations,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in getApprovedCompanies:", error);
    return {
      companies: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: filters.page,
    };
  }
}

export async function getFilterOptions() {
  try {
    console.log("🔍 Fetching filter options...");

    const supabase = await createClient();

    // Services
    const { data: services, error: servicesError } = await supabase
      .from("company_services")
      .select("service");

    if (servicesError) {
      console.error(
        "Error fetching services:",
        JSON.stringify(servicesError, null, 2)
      );
    }

    const allServices = services?.map((s) => s.service) || [];
    const mainServices = [
      "CONTROL_PANEL_ASSEMBLY",
      "SYSTEM_INTEGRATION",
      "CALIBRATION_SERVICES",
    ];
    const uniqueServices = [
      ...new Set(allServices.filter((s) => mainServices.includes(s))),
    ];

    // Locations (hqState) — use camelCase column names
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("hqState")
      .eq("status", "APPROVED");

    if (companiesError) {
      console.error(
        "Error fetching companies for locations:",
        JSON.stringify(companiesError, null, 2)
      );
    }

    const uniqueStates = [
      ...new Set((companies || []).map((c: any) => c.hqState).filter(Boolean)),
    ];

    // Sizes (sizeBucket) — use camelCase column names
    const { data: sizesData, error: sizesError } = await supabase
      .from("companies")
      .select("sizeBucket")
      .eq("status", "APPROVED");

    if (sizesError) {
      console.error(
        "Error fetching sizes:",
        JSON.stringify(sizesError, null, 2)
      );
    }

    const uniqueSizes = [
      ...new Set(
        (sizesData || []).map((c: any) => c.sizeBucket).filter(Boolean)
      ),
    ];

    // Certifications
    const { data: certifications, error: certificationsError } = await supabase
      .from("company_certifications")
      .select("certification");

    if (certificationsError) {
      console.error(
        "Error fetching certifications:",
        JSON.stringify(certificationsError, null, 2)
      );
    }

    const uniqueCertifications = [
      ...new Set(certifications?.map((c) => c.certification) || []),
    ];

    console.log(
      `✅ Filter options - Services: ${uniqueServices.length}, Locations: ${uniqueStates.length}, Sizes: ${uniqueSizes.length}, Certifications: ${uniqueCertifications.length}`
    );

    return {
      services: uniqueServices.map((service) => ({ service })),
      locations: uniqueStates.map((hqState) => ({ hqState })),
      sizes: uniqueSizes.map((sizeBucket) => ({ sizeBucket })),
      certifications: uniqueCertifications.map((certification) => ({
        certification,
      })),
    };
  } catch (error) {
    console.error("Error in getFilterOptions:", error);
    // Fallbacks
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
        { hqState: "IL" },
        { hqState: "OH" },
        { hqState: "GA" },
        { hqState: "NC" },
        { hqState: "MI" },
      ],
      sizes: [
        { sizeBucket: "SIZE_1_10" },
        { sizeBucket: "SIZE_11_50" },
        { sizeBucket: "SIZE_51_200" },
        { sizeBucket: "SIZE_201_500" },
        { sizeBucket: "SIZE_501_1000" },
        { sizeBucket: "SIZE_1001_5000" },
        { sizeBucket: "SIZE_5001_10000" },
        { sizeBucket: "SIZE_10000_PLUS" },
      ],
      certifications: [
        { certification: "UL_508A" },
        { certification: "ISO_9001" },
        { certification: "ISO_14001" },
        { certification: "OHSAS_18001" },
        { certification: "IEC_61511" },
        { certification: "ISA_84" },
        { certification: "NFPA_70E" },
        { certification: "OSHA_10" },
        { certification: "OSHA_30" },
        { certification: "SIL_CERTIFIED" },
      ],
    };
  }
}

export async function createCompany(companyData: Partial<Company>) {
  try {
    const supabase = await createClient();

    // Use camelCase column names for insert
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          name: companyData.name,
          slug: companyData.slug,
          description: companyData.description,
          logoUrl: companyData.logoUrl,
          websiteUrl: companyData.websiteUrl,
          phone: companyData.phone,
          salesEmail: companyData.salesEmail,
          hqCity: companyData.hqCity,
          hqState: companyData.hqState,
          hqCountry: companyData.hqCountry,
          yearFounded: companyData.yearFounded,
          sizeBucket: companyData.sizeBucket,
          status: companyData.status || "PENDING",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", JSON.stringify(error, null, 2));
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in createCompany:", error);
    return null;
  }
}

export async function updateCompany(id: string, companyData: Partial<Company>) {
  try {
    const supabase = await createClient();

    // Use camelCase column names for update
    const { data, error } = await supabase
      .from("companies")
      .update({
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
        logoUrl: companyData.logoUrl,
        websiteUrl: companyData.websiteUrl,
        phone: companyData.phone,
        salesEmail: companyData.salesEmail,
        hqCity: companyData.hqCity,
        hqState: companyData.hqState,
        hqCountry: companyData.hqCountry,
        yearFounded: companyData.yearFounded,
        sizeBucket: companyData.sizeBucket,
        status: companyData.status,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", JSON.stringify(error, null, 2));
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateCompany:", error);
    return null;
  }
}
