"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LogoUploader } from "../logo-uploader"

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

interface BasicInfoStepProps {
  formData: CompanyFormData
  updateFormData: (updates: Partial<CompanyFormData>) => void
  errors?: { [key: string]: string }
}

export function BasicInfoStep({ formData, updateFormData, errors = {} }: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="mb-2 block">
          Company Name *
        </Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Your Company Name"
          required
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="description" className="mb-2 block">
          Company Description *
        </Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe what your company does, your expertise, and what makes you unique..."
          rows={4}
          required
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <Label htmlFor="website_url" className="mb-2 block">
          Website URL *
        </Label>
        <Input
          id="website_url"
          type="url"
          value={formData.website_url || ""}
          onChange={(e) => updateFormData({ website_url: e.target.value })}
          placeholder="https://yourcompany.com"
          required
          className={errors.website_url ? "border-red-500" : ""}
        />
        {errors.website_url && <p className="text-red-500 text-sm mt-1">{errors.website_url}</p>}
      </div>

      <div>
        <Label className="mb-2 block">Company Logo</Label>
        <LogoUploader onUpload={(url) => updateFormData({ logo_url: url })} currentLogo={formData.logo_url} />
        <p className="text-sm text-gray-500 mt-1">Upload your company logo to make your listing stand out</p>
      </div>
    </div>
  )
}
