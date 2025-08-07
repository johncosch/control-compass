"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, ChevronDown, MapPin } from "lucide-react"
import type { CompanyFormData } from "../company-creation-form"

interface ServicesStepProps {
  formData: CompanyFormData
  updateFormData: (updates: Partial<CompanyFormData>) => void
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

export function ServicesStep({ formData, updateFormData }: ServicesStepProps) {
  const [areasOpen, setAreasOpen] = useState(false)

  const toggleService = (service: string) => {
    const services = formData.services.includes(service)
      ? formData.services.filter((s) => s !== service)
      : [...formData.services, service]
    updateFormData({ services })
  }

  const toggleCertification = (certification: string) => {
    const certifications = formData.certifications.includes(certification)
      ? formData.certifications.filter((c) => c !== certification)
      : [...formData.certifications, certification]
    updateFormData({ certifications })
  }

  const handleAreaChange = (stateCode: string, checked: boolean) => {
    const currentLocations = formData.locations_served || []

    if (checked) {
      const newLocation = { country: "US", state: stateCode }
      const locationExists = currentLocations.some((loc) => loc.state === stateCode)

      if (!locationExists) {
        updateFormData({ locations_served: [...currentLocations, newLocation] })
      }
    } else {
      const updatedLocations = currentLocations.filter((loc) => loc.state !== stateCode)
      updateFormData({ locations_served: updatedLocations })
    }
  }

  const selectAllStates = () => {
    const allLocations = US_STATES.map((state) => ({ country: "US", state: state.code }))
    updateFormData({ locations_served: allLocations })
  }

  const clearAllAreas = () => {
    updateFormData({ locations_served: [] })
  }

  const getAreasDisplayText = () => {
    const selectedAreas = formData.locations_served || []
    if (selectedAreas.length === 0) return "Select states where you provide services..."
    if (selectedAreas.length === 1) {
      const state = US_STATES.find((s) => s.code === selectedAreas[0].state)
      return state ? state.name : selectedAreas[0].state
    }
    if (selectedAreas.length === US_STATES.length) return "All states selected"
    return `${selectedAreas.length} states selected`
  }

  const selectedStateCodes = (formData.locations_served || []).map((loc) => loc.state)
  const allStatesSelected = selectedStateCodes.length === US_STATES.length

  return (
    <div className="space-y-8">
      {/* Services */}
      <div>
        <Label className="text-base font-semibold">Services Offered *</Label>
        <p className="text-sm text-gray-600 mb-4">Select all services your company provides</p>
        <div className="grid grid-cols-1 gap-3">
          {SERVICES.map((service) => (
            <div key={service.value} className="flex items-center space-x-2">
              <Checkbox
                id={service.value}
                checked={formData.services.includes(service.value)}
                onCheckedChange={() => toggleService(service.value)}
                className="cursor-pointer"
              />
              <Label htmlFor={service.value} className="text-sm font-normal cursor-pointer">
                {service.label}
              </Label>
            </div>
          ))}
        </div>
        {formData.services.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Selected Services:</p>
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service) => {
                const serviceLabel = SERVICES.find((s) => s.value === service)?.label
                return (
                  <Badge key={service} variant="secondary" className="flex items-center gap-1">
                    {serviceLabel}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent cursor-pointer"
                      onClick={() => toggleService(service)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <Label className="text-base font-semibold">Certifications</Label>
        <p className="text-sm text-gray-600 mb-4">Select any relevant certifications your company holds</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CERTIFICATIONS.map((certification) => (
            <div key={certification.value} className="flex items-center space-x-2">
              <Checkbox
                id={certification.value}
                checked={formData.certifications.includes(certification.value)}
                onCheckedChange={() => toggleCertification(certification.value)}
                className="cursor-pointer"
              />
              <Label htmlFor={certification.value} className="text-sm font-normal cursor-pointer">
                {certification.label}
              </Label>
            </div>
          ))}
        </div>
        {formData.certifications.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Selected Certifications:</p>
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((certification) => {
                const certLabel = CERTIFICATIONS.find((c) => c.value === certification)?.label
                return (
                  <Badge key={certification} variant="default" className="flex items-center gap-1">
                    {certLabel}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent text-white hover:text-white cursor-pointer"
                      onClick={() => toggleCertification(certification)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Areas Served */}
      <div>
        <Label className="text-base font-semibold">Areas Served *</Label>
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
                        id={`form-${state.code}`}
                        checked={selectedStateCodes.includes(state.code)}
                        onCheckedChange={(checked) => handleAreaChange(state.code, checked as boolean)}
                        className="cursor-pointer"
                      />
                      <label htmlFor={`form-${state.code}`} className="text-sm cursor-pointer">
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
              {formData.locations_served?.map((location, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {US_STATES.find((state) => state.code === location.state)?.name || location.state}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent cursor-pointer"
                    onClick={() => handleAreaChange(location.state, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}