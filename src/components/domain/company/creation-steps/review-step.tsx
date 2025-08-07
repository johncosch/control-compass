import { Badge } from "@/components/ui/badge"
import type { CompanyFormData } from "../company-creation-form"

interface ReviewStepProps {
  formData: CompanyFormData
}

const SERVICES = [
  { value: "CONTROL_PANEL_ASSEMBLY", label: "Control Panel Assembly" },
  { value: "SYSTEM_INTEGRATION", label: "System Integration" },
  { value: "CALIBRATION_SERVICES", label: "Calibration Services" },
]

const CERTIFICATIONS = [
  { value: "UL_508A", label: "UL 508A" },
  { value: "ISO_9001", label: "ISO 9001" },
  { value: "ISO_14001", label: "ISO 14001" },
  { value: "OHSAS_18001", label: "OHSAS 18001" },
  { value: "IEC_61511", label: "IEC 61511" },
  { value: "ISA_84", label: "ISA 84" },
  { value: "NFPA_70E", label: "NFPA 70E" },
  { value: "OSHA_10", label: "OSHA 10" },
  { value: "OSHA_30", label: "OSHA 30" },
  { value: "SIL_CERTIFIED", label: "SIL Certified" },
]

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

export function ReviewStep({ formData }: ReviewStepProps) {
  const getServiceLabel = (value: string) => {
    return SERVICES.find((service) => service.value === value)?.label || value
  }

  const getCertificationLabel = (value: string) => {
    return CERTIFICATIONS.find((cert) => cert.value === value)?.label || value
  }

  const getStateLabel = (code: string) => {
    return US_STATES.find((state) => state.code === code)?.name || code
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
        <p className="text-sm text-gray-600">
          Please review all information before submitting. Your company will be reviewed before being published.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Basic Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Company Name:</span> {formData.name}
            </div>
            <div>
              <span className="font-medium">Description:</span> {formData.description}
            </div>
            <div>
              <span className="font-medium">Website:</span> {formData.website_url}
            </div>
            {formData.logo_url && (
              <div>
                <span className="font-medium">Logo:</span> Uploaded
              </div>
            )}
          </div>
        </div>

        {/* Company Details */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Company Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Headquarters:</span> {formData.hq_city}, {formData.hq_state},{" "}
              {formData.hq_country}
            </div>
            {formData.year_founded && (
              <div>
                <span className="font-medium">Year Founded:</span> {formData.year_founded}
              </div>
            )}
            <div>
              <span className="font-medium">Company Size:</span> {formData.size_bucket?.replace(/_/g, " ") || "Not specified"}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Phone:</span> {formData.phone}
            </div>
            <div>
              <span className="font-medium">Sales Email:</span> {formData.sales_email}
            </div>
          </div>
        </div>

        {/* Services */}
        {formData.services?.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Services Offered</h3>
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service) => (
                <Badge key={service} variant="secondary">
                  {getServiceLabel(service)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {formData.certifications?.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((certification) => (
                <Badge key={certification} variant="default">
                  {getCertificationLabel(certification)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Areas Served */}
        {formData.locations_served?.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Areas Served</h3>
            <div className="flex flex-wrap gap-2">
              {formData.locations_served.map((location, index) => (
                <Badge key={index} variant="outline">
                  {location.state ? getStateLabel(location.state) : location.country}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}