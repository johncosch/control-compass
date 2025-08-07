"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { updateCompany } from "@/app/(dashboard)/dashboard/company/[id]/manage/actions"
import { LogoUploader } from "@/src/components/domain/company/logo-uploader"
import { ArrowLeft, Save, ExternalLink, X, Loader2, ChevronDown, MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"

interface Company {
  id: string
  name: string
  slug: string
  description: string
  websiteUrl: string
  logoUrl?: string
  phone: string
  salesEmail: string
  hqCity: string
  hqState: string
  hqCountry: string
  yearFounded: number | null
  sizeBucket: string
  status: string
  services: Array<{ service: string }>
  industries: Array<{ industry: string }>
  certifications: Array<{ certification: string }>
  locationsServed: Array<{ country: string; state?: string; region?: string }>
}

interface CompanyManagementFormProps {
  company: Company
  userRole: string
}

// Using exact database enum values
const PREDEFINED_SERVICES = ["CONTROL_PANEL_ASSEMBLY", "SYSTEM_INTEGRATION", "CALIBRATION_SERVICES"]

const PREDEFINED_CERTIFICATIONS = [
  "UL_508A",
  "ISO_9001",
  "ISO_14001",
  "OHSAS_18001",
  "IEC_61511",
  "ISA_84",
  "NFPA_70E",
  "OSHA_10",
  "OSHA_30",
  "SIL_CERTIFIED",
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

export function CompanyManagementForm({ company, userRole }: CompanyManagementFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || "")
  const [areasOpen, setAreasOpen] = useState(false)

  // Helper function to get service labels
  const getServiceLabel = (service: string) => {
    const serviceLabels: { [key: string]: string } = {
      CONTROL_PANEL_ASSEMBLY: "Control Panel Assembly",
      SYSTEM_INTEGRATION: "System Integration", 
      CALIBRATION_SERVICES: "Calibration Services"
    }
    return serviceLabels[service] || service.replace(/_/g, " ")
  }

  // State for managing services and certifications (removed industries)
  const [selectedServices, setSelectedServices] = useState<string[]>(company.services.map((s) => s.service))
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(
    company.certifications.map((c) => c.certification),
  )

  // State for locations served
  const [selectedLocations, setSelectedLocations] = useState<
    Array<{ country: string; state?: string; region?: string }>
  >(company.locationsServed || [])

  // Form field states to persist after save - ensure all values are strings, never undefined
  const [formData, setFormData] = useState({
    name: company.name || "",
    description: company.description || "",
    websiteUrl: company.websiteUrl || "",
    phone: company.phone || "",
    salesEmail: company.salesEmail || "",
    hqCity: company.hqCity || "",
    hqState: company.hqState || "",
    hqCountry: company.hqCountry || "",
    yearFounded: company.yearFounded || "",
    sizeBucket: company.sizeBucket || "SIZE_1_10",
  })

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) => {
      const newServices = prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
      console.log("Service toggled:", service, "New services:", newServices)
      return newServices
    })
  }

  const handleCertificationToggle = (certification: string) => {
    setSelectedCertifications((prev) => {
      const newCertifications = prev.includes(certification)
        ? prev.filter((c) => c !== certification)
        : [...prev, certification]
      console.log("Certification toggled:", certification, "New certifications:", newCertifications)
      return newCertifications
    })
  }

  const handleAreaChange = (stateCode: string, checked: boolean) => {
    if (checked) {
      const newLocation = { country: "US", state: stateCode }
      const locationExists = selectedLocations.some((loc) => loc.state === stateCode)

      if (!locationExists) {
        setSelectedLocations((prev) => [...prev, newLocation])
      }
    } else {
      setSelectedLocations((prev) => prev.filter((loc) => loc.state !== stateCode))
    }
  }

  const selectAllStates = () => {
    const allLocations = US_STATES.map((state) => ({ country: "US", state: state.code }))
    setSelectedLocations(allLocations)
  }

  const clearAllAreas = () => {
    setSelectedLocations([])
  }

  const getAreasDisplayText = () => {
    if (selectedLocations.length === 0) return "Select states where you provide services..."
    if (selectedLocations.length === 1) {
      const state = US_STATES.find((s) => s.code === selectedLocations[0].state)
      return state ? state.name : selectedLocations[0].state
    }
    if (selectedLocations.length === US_STATES.length) return "All states selected"
    return `${selectedLocations.length} states selected`
  }

  const selectedStateCodes = selectedLocations.map((loc) => loc.state).filter(Boolean)
  const allStatesSelected = selectedStateCodes.length === US_STATES.length

  const removeService = (service: string) => {
    setSelectedServices((prev) => prev.filter((s) => s !== service))
  }

  const removeCertification = (certification: string) => {
    setSelectedCertifications((prev) => prev.filter((c) => c !== certification))
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle submit without using FormData - use current state directly
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      setMessage("")

      try {
        console.log("=== SUBMITTING ===")
        console.log("Current selectedServices:", selectedServices)
        console.log("Current selectedCertifications:", selectedCertifications)
        console.log("Current selectedLocations:", selectedLocations)

        const updateData = {
          name: formData.name,
          description: formData.description,
          websiteUrl: formData.websiteUrl,
          logoUrl: logoUrl,
          phone: formData.phone,
          salesEmail: formData.salesEmail,
          hqCity: formData.hqCity,
          hqState: formData.hqState,
          hqCountry: formData.hqCountry,
          yearFounded: formData.yearFounded ? Number(formData.yearFounded) : null,
          sizeBucket: formData.sizeBucket,
          services: selectedServices,
          industries: [], // Empty array since we removed industries
          certifications: selectedCertifications,
          locationsServed: selectedLocations,
        }

        console.log("About to call updateCompany with:", updateData)

        await updateCompany(company.id, updateData)

        console.log("=== SAVE SUCCESSFUL ===")
        console.log("Services should remain:", selectedServices)
        console.log("Certifications should remain:", selectedCertifications)
        console.log("Locations should remain:", selectedLocations)

        setMessage("Company updated successfully!")
      } catch (error) {
        setMessage("Failed to update company. Please try again.")
        console.error("Update error:", error)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage {formData.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  company.status === "APPROVED" ? "default" : company.status === "PENDING" ? "secondary" : "destructive"
                }
              >
                {company.status}
              </Badge>
              <span className="text-sm text-gray-600">Role: {userRole}</span>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/companies/${company.slug}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Public Page
          </Link>
        </Button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Company Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="websiteUrl" className="mb-2 block">
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Company Logo</Label>
              <LogoUploader onUpload={(url) => setLogoUrl(url)} currentLogo={logoUrl} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salesEmail" className="mb-2 block">
                Sales Email
              </Label>
              <Input
                id="salesEmail"
                name="salesEmail"
                type="email"
                value={formData.salesEmail}
                onChange={(e) => handleInputChange("salesEmail", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hqCity" className="mb-2 block">
                  City
                </Label>
                <Input
                  id="hqCity"
                  name="hqCity"
                  value={formData.hqCity}
                  onChange={(e) => handleInputChange("hqCity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hqState" className="mb-2 block">
                  State
                </Label>
                <Input
                  id="hqState"
                  name="hqState"
                  value={formData.hqState}
                  onChange={(e) => handleInputChange("hqState", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hqCountry" className="mb-2 block">
                  Country
                </Label>
                <Input
                  id="hqCountry"
                  name="hqCountry"
                  value={formData.hqCountry}
                  onChange={(e) => handleInputChange("hqCountry", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="yearFounded" className="mb-2 block">
                Year Founded
              </Label>
              <Input
                id="yearFounded"
                name="yearFounded"
                type="number"
                value={formData.yearFounded}
                onChange={(e) => handleInputChange("yearFounded", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sizeBucket" className="mb-2 block">
                Company Size
              </Label>
              <select
                id="sizeBucket"
                name="sizeBucket"
                value={formData.sizeBucket}
                onChange={(e) => handleInputChange("sizeBucket", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 cursor-pointer"
              >
                <option value="SIZE_1_10">1-10 employees</option>
                <option value="SIZE_11_50">11-50 employees</option>
                <option value="SIZE_51_200">51-200 employees</option>
                <option value="SIZE_201_500">201-500 employees</option>
                <option value="SIZE_501_PLUS">500+ employees</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {PREDEFINED_SERVICES.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={`service-${service}`} className="text-sm cursor-pointer">
                    {getServiceLabel(service)}
                  </Label>
                </div>
              ))}
            </div>

            {selectedServices.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Services:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service) => (
                    <Badge key={service} variant="secondary" className="cursor-pointer">
                      {getServiceLabel(service)}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeService(service)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PREDEFINED_CERTIFICATIONS.map((certification) => (
                <div key={certification} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cert-${certification}`}
                    checked={selectedCertifications.includes(certification)}
                    onCheckedChange={() => handleCertificationToggle(certification)}
                  />
                  <Label htmlFor={`cert-${certification}`} className="text-sm cursor-pointer">
                    {certification.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>

            {selectedCertifications.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected Certifications:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCertifications.map((certification) => (
                    <Badge key={certification} variant="secondary" className="cursor-pointer">
                      {certification.replace(/_/g, " ")}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeCertification(certification)} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Areas Served */}
        <Card>
          <CardHeader>
            <CardTitle>Areas Served</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Areas Served</Label>
              <p className="text-sm text-gray-600 mb-4">Select the states where your company provides services</p>

              <Popover open={areasOpen} onOpenChange={setAreasOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{getAreasDisplayText()}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="font-medium text-sm">Select states where you provide services</div>

                    {/* Select All / Clear All buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllStates}
                        className="flex-1 bg-transparent cursor-pointer"
                        disabled={allStatesSelected}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllAreas}
                        className="flex-1 bg-transparent cursor-pointer"
                        disabled={selectedStateCodes.length === 0}
                      >
                        Clear All
                      </Button>
                    </div>

                    {/* US States */}
                    <div>
                      <div className="font-medium text-xs text-gray-500 mb-2">US STATES</div>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {US_STATES.map((state) => (
                          <div key={state.code} className="flex items-center space-x-2">
                            <Checkbox
                              id={`manage-${state.code}`}
                              checked={selectedStateCodes.includes(state.code)}
                              onCheckedChange={(checked) => handleAreaChange(state.code, checked as boolean)}
                              className="cursor-pointer"
                            />
                            <label htmlFor={`manage-${state.code}`} className="text-sm cursor-pointer">
                              {state.code}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Selected Areas Display */}
              {selectedStateCodes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocations.map((location, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {US_STATES.find((state) => state.code === location.state)?.name || location.state}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent cursor-pointer"
                          onClick={() => handleAreaChange(location.state!, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-950 text-white cursor-pointer disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}