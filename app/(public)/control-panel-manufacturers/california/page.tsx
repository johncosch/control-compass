import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { CompanyCard } from "@/components/domain/company/company-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Control Panel Manufacturers in California | Control Compass",
  description:
    "Find the best control panel manufacturers and electrical panel builders in California. Compare services, certifications, and get quotes from top-rated companies.",
  openGraph: {
    title: "Control Panel Manufacturers in California",
    description: "Find the best control panel manufacturers and electrical panel builders in California.",
  },
}

// This would be generated statically at build time
export async function generateStaticParams() {
  return [
    { category: "control-panel-manufacturers", location: "california" },
    // Add more combinations as needed
  ]
}

async function getCompanies() {
  const supabase = await createClient()

  const { data: companies } = await supabase
    .from("companies")
    .select(`
      *,
      services:company_services(service),
      industries:company_industries(industry),
      certifications:company_certifications(certification)
    `)
    .eq("status", "APPROVED")
    .eq("hq_state", "CA")
    .contains("services", [{ service: "SYSTEM_INTEGRATION" }]) // Approximate filter
    .limit(20)

  return companies || []
}

export default async function ControlPanelManufacturersCalifornia() {
  const companies = await getCompanies()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Control Panel Manufacturers in California",
    description: "Directory of control panel manufacturers and electrical panel builders in California",
    url: "https://controlcompass.com/control-panel-manufacturers/california",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: companies.length,
      itemListElement: companies.map((company, index) => ({
        "@type": "Organization",
        position: index + 1,
        name: company.name,
        description: company.description,
        url: company.website_url,
        address: {
          "@type": "PostalAddress",
          addressLocality: company.hq_city,
          addressRegion: company.hq_state,
          addressCountry: company.hq_country,
        },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Control Panel Manufacturers in California</h1>
              <p className="text-xl text-white/90 mb-8">
                Find experienced control panel manufacturers and electrical panel builders throughout California.
                Compare services, certifications, and get quotes from {companies.length} verified companies.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="secondary">
                  <Link href="/companies?service=control-panels&location=california">View All Companies</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/dashboard/company/new">List Your Company</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>

            {companies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No control panel manufacturers found in California yet.</p>
                <Button asChild>
                  <Link href="/dashboard/company/new">Be the first to list your company</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2>Control Panel Manufacturing in California</h2>
              <p>
                California is home to numerous experienced control panel manufacturers serving industries from aerospace
                to food processing. These companies specialize in custom electrical panels, motor control centers, and
                industrial automation solutions.
              </p>

              <h3>Services Offered</h3>
              <ul>
                <li>Custom control panel design and manufacturing</li>
                <li>UL 508A certified panel shops</li>
                <li>Motor control centers (MCCs)</li>
                <li>PLC integration and programming</li>
                <li>HMI development and installation</li>
                <li>Field service and maintenance</li>
              </ul>

              <h3>Key Industries Served</h3>
              <p>
                California control panel manufacturers serve diverse industries including manufacturing, water
                treatment, food & beverage, pharmaceutical, and renewable energy sectors.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
