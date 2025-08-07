import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CompanyCardProps {
  company: {
    id: string
    name: string
    slug: string
    description: string | null
    hqCity: string | null
    hqState: string | null
    websiteUrl: string | null
    logoUrl: string | null
    sizeBucket: string | null
    services?: Array<{ service: string }>
    certifications?: Array<{ certification: string }>
  }
}

const sizeLabels = {
  SIZE_1_10: "1-10 employees",
  SIZE_11_50: "11-50 employees",
  SIZE_51_200: "51-200 employees",
  SIZE_201_500: "201-500 employees",
  SIZE_501_1000: "501-1,000 employees",
  SIZE_1001_5000: "1,001-5,000 employees",
  SIZE_5001_10000: "5,001-10,000 employees",
  SIZE_10000_PLUS: "10,000+ employees",
}

const serviceLabels = {
  CONTROL_PANEL_ASSEMBLY: "Control Panel Assembly",
  SYSTEM_INTEGRATION: "System Integration", 
  CALIBRATION_SERVICES: "Calibration Services"
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl || "/placeholder.svg"}
              alt={`${company.name} logo`}
              width={60}
              height={60}
              className="rounded-lg object-contain bg-gray-50 p-2 flex-shrink-0"
            />
          ) : (
            <div className="w-15 h-15 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-lg">{company.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1">{company.name}</h3>
            {company.hqCity && company.hqState && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                {company.hqCity}, {company.hqState}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {company.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{company.description}</p>}

        {/* Services */}
        {company.services && company.services.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {company.services.slice(0, 3).map((service) => (
                <Badge key={service.service} variant="secondary" className="text-xs">
                  {serviceLabels[service.service as keyof typeof serviceLabels] ||
                    service.service.replace(/_/g, " ").toLowerCase()}
                </Badge>
              ))}
              {company.services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{company.services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Company Size */}
        {company.sizeBucket && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Users className="w-4 h-4 mr-1 flex-shrink-0" />
            {sizeLabels[company.sizeBucket as keyof typeof sizeLabels]}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/companies/${company.slug}`}>View Details</Link>
          </Button>
          {company.websiteUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
