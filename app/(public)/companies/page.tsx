import { Suspense } from "react"
import { getApprovedCompanies, getFilterOptions } from "@/lib/supabase/database"
import { CompanyCard } from "@/src/components/domain/company/company-card"
import { CompanySearch } from "@/components/domain/company/company-search"
import { CompanyPagination } from "@/components/domain/company/company-pagination"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Industrial Controls Companies Directory | Control Compass",
  description:
    "Find system integrators, automation specialists, and control system experts. Browse verified companies offering PLC programming, HMI development, SCADA systems, and more.",
  openGraph: {
    title: "Industrial Controls Companies Directory",
    description: "Find system integrators, automation specialists, and control system experts.",
  },
}

interface SearchParams {
  search?: string
  service?: string
  location?: string
  size?: string
  areasServed?: string
  certifications?: string
  page?: string
}

function CompaniesContent({
  companies,
  totalCount,
  totalPages,
  currentPage,
  filterOptions,
  searchParams,
  user,
}: {
  companies: any[]
  totalCount: number
  totalPages: number
  currentPage: number
  filterOptions: any
  searchParams: SearchParams
  user: any
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Automation Partners Directory</h1>
            <p className="text-xl text-slate-300 mb-6">
              Connect with UL 508A panel shops, proven integrators, and accredited calibration services.
              {totalCount > 0 && ` Browse ${totalCount} verified companies.`}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 border-b bg-white">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <CompanySearch filterOptions={filterOptions} />
          </Suspense>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {companies.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  {totalCount} {totalCount === 1 ? "Company" : "Companies"} Found
                  {currentPage > 1 && (
                    <span className="text-lg font-normal text-slate-600 ml-2">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </h2>
                <div className="text-sm text-slate-600">Showing verified companies only</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>

              {totalPages > 1 && (
                <CompanyPagination currentPage={currentPage} totalPages={totalPages} searchParams={searchParams} />
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">No Companies Found</h2>
              <p className="text-slate-600 mb-6">
                {Object.keys(searchParams).length > 0
                  ? "Try adjusting your search criteria or filters."
                  : "Be the first to list your company in our directory."}
              </p>
              <div className="flex gap-4 justify-center">
                {Object.keys(searchParams).length > 0 && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <Link href="/companies">Clear Filters</Link>
                  </Button>
                )}
                <Button asChild className="bg-slate-900 hover:bg-slate-950 text-white">
                  <Link href="/auth/signup">List Your Company</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Get Found?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join the Control Compass directory and connect with customers looking for your industrial controls
            expertise.
          </p>
          <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-950 text-white">
            <Link href="/auth/signup">List Your Company Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Image
                src="/images/control-compass-logo.svg"
                alt="Control Compass"
                width={200}
                height={80}
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 mb-4">
                The premier directory for industrial control systems professionals. Connecting manufacturers with
                verified control panel builders, system integrators, and automation specialists.
              </p>
              <p className="text-sm text-slate-500">© 2024 Control Compass by IOThrifty. All rights reserved.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Browse Directory
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=CONTROL_PANEL_ASSEMBLY" className="hover:text-white transition-colors">
                    Control Panel Builders
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=SYSTEM_INTEGRATION" className="hover:text-white transition-colors">
                    System Integrators
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=CALIBRATION_SERVICES" className="hover:text-white transition-colors">
                    Calibration Labs
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.iothrifty.com/"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Shop Control Products
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">For Providers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    List Your Company
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  try {
    console.log('🚀 Companies page loading with Supabase...')
    
    // Await searchParams first
    const resolvedSearchParams = await searchParams
    
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('👤 User:', user ? `${user.email} (${user.id})` : 'Not logged in')

    const page = Number(resolvedSearchParams.page) || 1
    const { companies, totalCount, totalPages, currentPage } = await getApprovedCompanies({
      search: resolvedSearchParams.search,
      service: resolvedSearchParams.service,
      location: resolvedSearchParams.location,
      size: resolvedSearchParams.size,
      areasServed: resolvedSearchParams.areasServed,
      certifications: resolvedSearchParams.certifications,
      page,
      limit: 30
    })

    const filterOptions = await getFilterOptions()

    console.log('📊 Final results:', { companiesCount: companies.length, totalCount, totalPages, currentPage })

    return (
      <CompaniesContent
        companies={companies}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        filterOptions={filterOptions}
        searchParams={resolvedSearchParams}
        user={user}
      />
    )
  } catch (error) {
    console.error("❌ Error rendering companies page:", error)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
          <p className="text-slate-600 mb-6">We&apos;re having trouble loading the companies directory.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }
}
