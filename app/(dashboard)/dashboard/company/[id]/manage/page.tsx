import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompanyManagementForm } from "@/src/components/domain/company/company-management-form"

interface ManageCompanyPageProps {
  params: {
    id: string
  }
}

export default async function ManageCompanyPage({ params }: ManageCompanyPageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has permission to manage this company
  const { data: userCompany } = await supabase
    .from("user_companies")
    .select(`
      relation,
      company:companies(
        id,
        name,
        slug,
        description,
        websiteUrl,
        logoUrl,
        phone,
        salesEmail,
        hqCity,
        hqState,
        hqCountry,
        yearFounded,
        sizeBucket,
        status,
        services:company_services(service),
        industries:company_industries(industry),
        certifications:company_certifications(certification),
        locationsServed:company_locations_served(country, state, region)
      )
    `)
    .eq("userId", user.id)
    .eq("companyId", params.id)
    .single()

  if (!userCompany?.company) {
    redirect("/dashboard")
  }

  // Only owners and members can manage companies
  if (!["OWNER", "MEMBER"].includes(userCompany.relation)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CompanyManagementForm company={userCompany.company} userRole={userCompany.relation} />
      </div>
    </div>
  )
}
