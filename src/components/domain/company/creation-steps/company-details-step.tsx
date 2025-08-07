"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

interface CompanyFormData {
  name: string
  description: string
  website_url: string
  logo_url?: string
  phone: string
  sales_email: string
  hq_city: string
  hq_state: string
  hq_country: string
  year_founded: number | null
  size_bucket: string
  services: string[]
  certifications: string[]
  locations_served: Array<{
    country: string
    state?: string
    region?: string
  }>
}

interface CompanyDetailsStepProps {
  formData: CompanyFormData
  updateFormData: (updates: Partial<CompanyFormData>) => void
  errors?: { [key: string]: string }
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

export function CompanyDetailsStep({ formData, updateFormData, errors = {} }: CompanyDetailsStepProps) {
  // Automatically set hq_country to "US" when component mounts or if it's not set
  useEffect(() => {
    if (!formData.hq_country || formData.hq_country !== "US") {
      updateFormData({ hq_country: "US" })
    }
  }, [formData.hq_country, updateFormData])

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
            value={formData.phone || ""}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="sales_email" className="mb-2 block">
            Sales Email *
          </Label>
          <Input
            id="sales_email"
            type="email"
            value={formData.sales_email || ""}
            onChange={(e) => updateFormData({ sales_email: e.target.value })}
            placeholder="sales@yourcompany.com"
            className={errors.sales_email ? "border-red-500" : ""}
          />
          {errors.sales_email && <p className="text-red-500 text-sm mt-1">{errors.sales_email}</p>}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Headquarters Location (United States)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hq_city" className="mb-2 block">
              City *
            </Label>
            <Input
              id="hq_city"
              value={formData.hq_city || ""}
              onChange={(e) => updateFormData({ hq_city: e.target.value })}
              placeholder="Chicago"
              required
              className={errors.hq_city ? "border-red-500" : ""}
            />
            {errors.hq_city && <p className="text-red-500 text-sm mt-1">{errors.hq_city}</p>}
          </div>

          <div>
            <Label htmlFor="hq_state" className="mb-2 block">
              State *
            </Label>
            <Select value={formData.hq_state || ""} onValueChange={(value) => updateFormData({ hq_state: value })}>
              <SelectTrigger className={`cursor-pointer ${errors.hq_state ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value} className="cursor-pointer">
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hq_state && <p className="text-red-500 text-sm mt-1">{errors.hq_state}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year_founded" className="mb-2 block">
            Year Founded
          </Label>
          <Input
            id="year_founded"
            type="number"
            value={formData.year_founded?.toString() || ""}
            onChange={(e) => updateFormData({ year_founded: e.target.value ? Number.parseInt(e.target.value) : null })}
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <Label htmlFor="size_bucket" className="mb-2 block">
            Company Size *
          </Label>
          <Select value={formData.size_bucket || ""} onValueChange={(value) => updateFormData({ size_bucket: value })}>
            <SelectTrigger className={`cursor-pointer ${errors.size_bucket ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SIZE_1_10" className="cursor-pointer">
                1-10 employees
              </SelectItem>
              <SelectItem value="SIZE_11_50" className="cursor-pointer">
                11-50 employees
              </SelectItem>
              <SelectItem value="SIZE_51_200" className="cursor-pointer">
                51-200 employees
              </SelectItem>
              <SelectItem value="SIZE_201_500" className="cursor-pointer">
                201-500 employees
              </SelectItem>
              <SelectItem value="SIZE_501_PLUS" className="cursor-pointer">
                500+ employees
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.size_bucket && <p className="text-red-500 text-sm mt-1">{errors.size_bucket}</p>}
        </div>
      </div>
    </div>
  )
}