import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompanyManagementForm } from "@/src/components/domain/company/company-management-form"

export default async function ManageCompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's company
  const { data: userCompany } = await supabase
    .from("user_companies")
    .select(`
      company:companies(
        id,
        name,
        slug,
        description,
        website_url,
        logo_url,
        phone,
        sales_email,
        hq_city,
        hq_state,
        hq_country,
        year_founded,
        size_bucket,
        status,
        services:company_services(service),
        industries:company_industries(industry),
        certifications:company_certifications(certification),
        locations_served:company_locations_served(country, state, region)
      )
    `)
    .eq("user_id", user.id)
    .eq("relation", "OWNER")
    .single()

  if (!userCompany?.company) {
    redirect("/dashboard/company/new")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CompanyManagementForm company={userCompany.company} />
      </div>
    </div>
  )
}
