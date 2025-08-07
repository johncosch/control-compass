"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CompanyFormData } from "../company-creation-form"

interface ContactInfoStepProps {
  formData: CompanyFormData
  updateFormData: (updates: Partial<CompanyFormData>) => void
  validationErrors?: { [key: string]: string }
}

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

export function ContactInfoStep({ formData, updateFormData, validationErrors = {} }: ContactInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="mb-2 block">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            required
            className={validationErrors.phone ? "border-red-500" : ""}
          />
          {validationErrors.phone && <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="sales_email" className="mb-2 block">
            Sales Email *
          </Label>
          <Input
            id="sales_email"
            type="email"
            value={formData.salesEmail}
            onChange={(e) => updateFormData({ salesEmail: e.target.value })}
            placeholder="sales@yourcompany.com"
            required
            className={validationErrors.salesEmail ? "border-red-500" : ""}
          />
          {validationErrors.salesEmail && <p className="text-red-500 text-sm mt-1">{validationErrors.salesEmail}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Headquarters Location</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="hq_city" className="mb-2 block">
              City *
            </Label>
            <Input
              id="hq_city"
              value={formData.hqCity}
              onChange={(e) => updateFormData({ hqCity: e.target.value })}
              placeholder="Chicago"
              required
              className={validationErrors.hqCity ? "border-red-500" : ""}
            />
            {validationErrors.hqCity && <p className="text-red-500 text-sm mt-1">{validationErrors.hqCity}</p>}
          </div>

          <div>
            <Label htmlFor="hq_state" className="mb-2 block">
              State *
            </Label>
            <Select value={formData.hqState} onValueChange={(value) => updateFormData({ hqState: value })}>
              <SelectTrigger className={validationErrors.hqState ? "border-red-500" : ""}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.hqState && <p className="text-red-500 text-sm mt-1">{validationErrors.hqState}</p>}
          </div>

          <div>
            <Label htmlFor="hq_country" className="mb-2 block">
              Country *
            </Label>
            <Select value={formData.hqCountry} onValueChange={(value) => updateFormData({ hqCountry: value })}>
              <SelectTrigger className={validationErrors.hqCountry ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="MX">Mexico</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.hqCountry && <p className="text-red-500 text-sm mt-1">{validationErrors.hqCountry}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
