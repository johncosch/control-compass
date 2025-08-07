import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Globe, Calendar, Users, Building, ChevronLeft } from "lucide-react"

interface Props {
  params: {
    slug: string
  }
}

// Helper function to get service label
const getServiceLabel = (service: string) => {
  const serviceLabels: { [key: string]: string } = {
    CONTROL_PANEL_ASSEMBLY: "Control Panel Assembly",
    SYSTEM_INTEGRATION: "System Integration", 
    CALIBRATION_SERVICES: "Calibration Services"
  }
  return serviceLabels[service] || service.replace(/_/g, " ")
}

// Helper function to get certification label
const getCertificationLabel = (cert: string) => {
  const certLabels: { [key: string]: string } = {
    UL_508A: "UL 508A",
    ISO_9001: "ISO 9001",
    ISO_14001: "ISO 14001",
    OHSAS_18001: "OHSAS 18001",
    IEC_61511: "IEC 61511",
    ISA_84: "ISA 84",
    NFPA_70E: "NFPA 70E",
    OSHA_10: "OSHA 10",
    OSHA_30: "OSHA 30",
    SIL_CERTIFIED: "SIL Certified"
  }
  return certLabels[cert] || cert.replace(/_/g, " ")
}

// Helper function to get state name
const getStateName = (code: string) => {
  const states: { [key: string]: string } = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
    MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
    NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
    OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
    SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
    VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
  }
  return states[code] || code
}

// Helper function to format company size
const formatCompanySize = (sizeBucket: string) => {
  const sizeLabels: { [key: string]: string } = {
    SIZE_1_10: "1-10 employees",
    SIZE_11_50: "11-50 employees", 
    SIZE_51_200: "51-200 employees",
    SIZE_201_500: "201-500 employees",
    SIZE_501_1000: "501-1,000 employees",
    SIZE_1001_5000: "1,001-5,000 employees",
    SIZE_5001_10000: "5,001-10,000 employees",
    SIZE_10000_PLUS: "10,000+ employees"
  }
  return sizeLabels[sizeBucket] || sizeBucket.replace(/_/g, " ")
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const company = await prisma.company.findUnique({
      where: { 
        slug: slug,
        status: "APPROVED"
      },
      select: {
        name: true,
        description: true
      }
    })

    if (!company) {
      return {
        title: "Company Not Found",
      }
    }

    return {
      title: `${company.name} | Control Compass`,
      description: company.description || `Learn more about ${company.name} - industrial control systems specialist`,
    }
  } catch (error) {
    return {
      title: "Company Not Found",
    }
  }
}

export default async function CompanyPage({ params }: Props) {
  try {
    const { slug } = await params
    const company = await prisma.company.findUnique({
      where: {
        slug: slug,
        status: "APPROVED"
      },
      include: {
        services: {
          select: { service: true }
        },
        certifications: {
          select: { certification: true }
        },
        locationsServed: {
          select: { country: true, state: true, region: true }
        },
        userCompanies: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          where: {
            relation: "OWNER"
          },
          take: 1
        }
      }
    })

    if (!company) {
      notFound()
    }

    const owner = company.userCompanies?.[0]?.user

    return (
      <div className="min-h-screen bg-stone-50">
        {/* Hero Section */}
        <section className="bg-slate-800 text-white py-12 border-b">
          <div className="container mx-auto px-4">
            {/* Simple Back Link */}
            <div className="mb-6">
              <Link
                href="/companies"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Companies
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={120}
                    height={120}
                    className="rounded-lg border bg-white p-3"
                  />
                ) : (
                  <div className="w-30 h-30 bg-slate-700 rounded-lg flex items-center justify-center border border-slate-600">
                    <Building className="w-12 h-12 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{company.name}</h1>

                {/* Basic Info */}
                <div className="flex flex-wrap gap-6 text-slate-300 mb-6">
                  {company.hqCity && company.hqState && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">
                        {company.hqCity}, {company.hqState}
                      </span>
                    </div>
                  )}

                  {company.yearFounded && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">Founded {company.yearFounded}</span>
                    </div>
                  )}

                  {company.sizeBucket && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">{formatCompanySize(company.sizeBucket)}</span>
                    </div>
                  )}
                </div>

                {/* Services */}
                {company.services && company.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Services Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.services.map((serviceObj: any) => (
                        <Badge key={serviceObj.service} className="bg-stone-100 text-slate-800 hover:bg-stone-200">
                          {getServiceLabel(serviceObj.service)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About/Description */}
              {company.description && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">About {company.name}</h2>
                  <p className="text-slate-700 leading-relaxed text-lg">{company.description}</p>
                </div>
              )}

              {/* Locations Served */}
              {company.locationsServed && company.locationsServed.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Areas Served</h2>
                  <div className="flex flex-wrap gap-3">
                    {company.locationsServed.map((location: any, index: number) => (
                      <Badge key={index} variant="outline" className="border-stone-300 text-slate-700 bg-stone-50 hover:bg-stone-100">
                        {location.state ? getStateName(location.state) : location.country}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {company.certifications && company.certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Certifications</h2>
                  <div className="flex flex-wrap gap-3">
                    {company.certifications.map((certObj: any) => (
                      <Badge key={certObj.certification} className="bg-slate-800 text-white hover:bg-slate-900">
                        {getCertificationLabel(certObj.certification)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {company.websiteUrl && (
                    <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                      <Globe className="w-5 h-5 text-slate-600" />
                      <a
                        href={company.websiteUrl.startsWith("http") ? company.websiteUrl : `https://${company.websiteUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 hover:text-slate-700 font-medium"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {company.phone && (
                    <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                      <Phone className="w-5 h-5 text-slate-600" />
                      <a href={`tel:${company.phone}`} className="text-slate-900 hover:text-slate-700 font-medium">
                        {company.phone}
                      </a>
                    </div>
                  )}

                  {company.salesEmail && (
                    <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                      <Mail className="w-5 h-5 text-slate-600" />
                      <a href={`mailto:${company.salesEmail}`} className="text-slate-900 hover:text-slate-700 font-medium">
                        {company.salesEmail}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-slate-800 rounded-lg p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-3">Interested in their services?</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Contact {company.name} directly using the information above.
                </p>
                <Link
                  href="/companies"
                  className="inline-flex items-center justify-center px-6 py-3 bg-stone-100 text-slate-900 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                >
                  Browse More Companies
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-300 py-12 mt-16">
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
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    console.error("Error loading company:", error)
    notFound()
  }
}