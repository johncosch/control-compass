import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Mail, Phone } from "lucide-react"
import Image from "next/image"

interface CompanyDiffViewerProps {
  company: {
    name: string
    description: string | null
    website_url: string | null
    hq_city: string | null
    hq_state: string | null
    hq_country: string
    phone: string | null
    sales_email: string | null
    logo_url: string | null
    year_founded: number | null
    size_bucket: string | null
  }
}

export function CompanyDiffViewer({ company }: CompanyDiffViewerProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Company Name</h3>
          <p className="text-lg">{company.name}</p>
        </div>

        {company.logo_url && (
          <div>
            <h3 className="font-semibold mb-3">Logo</h3>
            <Image
              src={company.logo_url || "/placeholder.svg"}
              alt={`${company.name} logo`}
              width={120}
              height={120}
              className="rounded-lg object-contain bg-gray-50 p-2"
            />
          </div>
        )}
      </div>

      {/* Description */}
      {company.description && (
        <div>
          <h3 className="font-semibold mb-3">Description</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{company.description}</p>
          </div>
        </div>
      )}

      {/* Website */}
      {company.website_url && (
        <div>
          <h3 className="font-semibold mb-3">Website</h3>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {company.website_url}
            </a>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {company.phone && (
          <div>
            <h3 className="font-semibold mb-3">Phone</h3>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{company.phone}</span>
            </div>
          </div>
        )}

        {company.sales_email && (
          <div>
            <h3 className="font-semibold mb-3">Sales Email</h3>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{company.sales_email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <h3 className="font-semibold mb-3">Headquarters</h3>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>
            {company.hq_city && `${company.hq_city}, `}
            {company.hq_state && `${company.hq_state}, `}
            {company.hq_country}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {company.year_founded && (
          <div>
            <h3 className="font-semibold mb-3">Founded</h3>
            <span>{company.year_founded}</span>
          </div>
        )}

        {company.size_bucket && (
          <div>
            <h3 className="font-semibold mb-3">Company Size</h3>
            <Badge variant="outline">{company.size_bucket.replace(/_/g, " ").toLowerCase()}</Badge>
          </div>
        )}
      </div>
    </div>
  )
}
