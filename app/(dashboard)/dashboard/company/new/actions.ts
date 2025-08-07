"use server";

import { createClient } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

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

export async function createCompany(formData: CompanyFormData) {
  try {
    const supabase = await createClient();

    // Get the current user (still using Supabase for auth)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    console.log("Creating company with data:", formData);

    // Generate a slug from the company name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();
    };

    let slug = generateSlug(formData.name);

    // Ensure slug is unique by checking if it exists and appending a number if needed
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existingCompany = await prisma.company.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingCompany) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create the company using Prisma
    const company = await prisma.company.create({
      data: {
        name: formData.name,
        slug: uniqueSlug,
        description: formData.description,
        websiteUrl: formData.website_url,
        logoUrl: formData.logo_url,
        phone: formData.phone,
        salesEmail: formData.sales_email,
        hqCity: formData.hq_city,
        hqState: formData.hq_state,
        hqCountry: formData.hq_country,
        yearFounded: formData.year_founded,
        sizeBucket: formData.size_bucket as any, // Cast to enum type
        status: "PENDING",
        // Create related records in the same transaction
        services: {
          create: formData.services.map((service) => ({
            service: service as any, // Cast to enum type
          })),
        },
        certifications: {
          create: formData.certifications.map((certification) => ({
            certification: certification as any, // Cast to enum type
          })),
        },
        locationsServed: {
          create: formData.locations_served
            .filter(
              (location) =>
                location.region !== undefined || location.state !== undefined
            ) // Filter out locations with both state and region undefined
            .map((location) => ({
              country: location.country,
              state: location.state,
              region: location.region,
            })),
        },
        userCompanies: {
          create: {
            userId: user.id,
            relation: "OWNER",
          },
        },
      },
      include: {
        services: true,
        certifications: true,
        locationsServed: true,
        userCompanies: true,
      },
    });

    console.log("Company created:", company);

    // Send notification email to admin
    try {
      const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/companies/${company.id}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notify-new-company`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: company.name,
            companyId: company.id,
            userEmail: user.email,
            adminUrl: adminUrl,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send admin notification email");
      }
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError);
      // Don't throw here - company creation should still succeed
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/companies");

    return { success: true, company };
  } catch (error) {
    console.error("Error in createCompany:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
