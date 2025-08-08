import { createClient } from "@/lib/supabase/server"
import { ApprovalActions } from "@/components/domain/admin/approval-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

// Fetch all pending companies with related data using Supabase
async function getPendingCompanies() {
  const supabase = await createClient()

  const { data, error } = await supabase
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
      hqCity,
      hqState,
      hqCountry,
      yearFounded,
      sizeBucket,
      status,
      createdAt,
      services:company_services ( service ),
      industries:company_industries ( industry ),
      certifications:company_certifications ( certification ),
      locationsServed:company_locations_served ( country, state, region ),
      userCompanies:user_companies (
        relation,
        user:users (
          id,
          email,
          name
        )
      )
    `
    )
    .eq("status", "PENDING")
    .order("createdAt", { ascending: false })

  if (error) {
    console.error("Error fetching pending companies (Supabase):", JSON.stringify(error, null, 2))
    return []
  }

  return data ?? []
}

export default async function AdminCompaniesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check admin flag from a simple admin_flags table
  const { data: adminFlag, error: adminError } = await supabase
    .from("admin_flags")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle()

  if (adminError) {
    console.error("Error fetching admin flag:", JSON.stringify(adminError, null, 2))
  }

  if (!adminFlag?.is_admin) {
    redirect("/dashboard")
  }

  const companies = await getPendingCompanies()

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/control-compass-logo.svg"
                alt="Control Compass"
                width={200}
                height={80}
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex gap-3 items-center">
              <span className="text-sm text-slate-600">{user.user_metadata?.full_name || user.email}</span>
              <Button
                asChild
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Review</h1>
          <p className="text-slate-600">Review and approve pending company submissions</p>
        </div>

        {companies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Pending Companies</h2>
              <p className="text-slate-600">All company submissions have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {companies.map((company: any) => {
              const submitter = company.userCompanies?.[0]?.user

              return (
                <Card key={company.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-slate-900">{company.name}</CardTitle>
                        <p className="text-slate-600 mt-1">
                          Submitted by {submitter?.name || submitter?.email || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pending Review
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Details */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Company Details</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Location:</span>{" "}
                            <span className="text-slate-600">
                              {company.hqCity && `${company.hqCity}, `}
                              {company.hqState} {company.hqCountry}
                            </span>
                          </div>
                          {company.yearFounded && (
                            <div>
                              <span className="font-medium text-slate-700">Founded:</span>{" "}
                              <span className="text-slate-600">{company.yearFounded}</span>
                            </div>
                          )}
                          {company.sizeBucket && (
                            <div>
                              <span className="font-medium text-slate-700">Size:</span>{" "}
                              <span className="text-slate-600">
                                {company.sizeBucket.replace("SIZE_", "").replace("_", "-")} employees
                              </span>
                            </div>
                          )}
                          {company.websiteUrl && (
                            <div>
                              <span className="font-medium text-slate-700">Website:</span>{" "}
                              <a
                                href={company.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {company.websiteUrl}
                              </a>
                            </div>
                          )}
                        </div>

                        {company.description && (
                          <div className="mt-4">
                            <h4 className="font-medium text-slate-700 mb-2">Description</h4>
                            <p className="text-sm text-slate-600">{company.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Services & Industries */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Services & Industries</h3>

                        {company.services?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 mb-2">Services</h4>
                            <div className="flex flex-wrap gap-1">
                              {company.services.map((service: any) => (
                                <Badge key={service.service} variant="outline" className="text-xs">
                                  {service.service.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {company.industries?.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-slate-700 mb-2">Industries</h4>
                            <div className="flex flex-wrap gap-1">
                              {company.industries.map((industry: any) => (
                                <Badge key={industry.industry} variant="outline" className="text-xs">
                                  {industry.industry.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {company.certifications?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Certifications</h4>
                            <div className="flex flex-wrap gap-1">
                              {company.certifications.map((cert: any) => (
                                <Badge key={cert.certification} variant="outline" className="text-xs">
                                  {cert.certification.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/companies/${company.slug}`} target="_blank">
                              Preview Public Page
                            </Link>
                          </Button>
                        </div>
                        <ApprovalActions companyId={company.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
