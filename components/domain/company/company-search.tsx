"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, X, MapPin, ChevronDown, Award, Loader2 } from "lucide-react"

interface CompanySearchProps {
  filterOptions: {
    services: Array<{ service: string }>
    locations: Array<{ hqState: string | null }>
    sizes: Array<{ sizeBucket: string | null }>
    certifications: Array<{ certification: string }>
  }
}

const SERVICE_LABELS: Record<string, string> = {
  CONTROL_PANEL_ASSEMBLY: "Control Panel Assembly",
  SYSTEM_INTEGRATION: "System Integration", 
  CALIBRATION_SERVICES: "Calibration Services"
}

const SIZE_LABELS: Record<string, string> = {
  SIZE_1_10: "1-10 employees",
  SIZE_11_50: "11-50 employees",
  SIZE_51_200: "51-200 employees",
  SIZE_201_500: "201-500 employees",
  SIZE_501_1000: "501-1,000 employees",
  SIZE_1001_5000: "1,001-5,000 employees",
  SIZE_5001_10000: "5,001-10,000 employees",
  SIZE_10000_PLUS: "10,000+ employees",
}

const CERTIFICATION_LABELS: Record<string, string> = {
  UL_508A: "UL 508A",
  ISO_9001: "ISO 9001",
  ISO_14001: "ISO 14001",
  OHSAS_18001: "OHSAS 18001",
  IEC_61511: "IEC 61511",
  ISA_84: "ISA 84",
  NFPA_70E: "NFPA 70E",
  OSHA_10: "OSHA 10",
  OSHA_30: "OSHA 30",
  SIL_CERTIFIED: "SIL Certified",
}

const ALL_US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
]

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut",
  DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
}

const FILTER_LABELS: Record<string, string> = {
  service: "Service",
  areasServed: "Service Areas",
  certifications: "Certifications",
  location: "HQ Location",
  size: "Company Size",
}

export function CompanySearch({ filterOptions: _ }: CompanySearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [areasServedOpen, setAreasServedOpen] = useState(false)
  const [certificationsOpen, setCertificationsOpen] = useState(false)

  // Read current URL parameters safely
  const currentSearch = searchParams?.get("search") || ""
  const currentService = searchParams?.get("service") || ""
  const currentLocation = searchParams?.get("location") || ""
  const currentSize = searchParams?.get("size") || ""
  const currentAreasServed = searchParams?.get("areasServed") || ""
  const currentCertifications = searchParams?.get("certifications") || ""

  // Parse multi-select values from URL
  const parseMultiSelect = (valueString: string): string[] => {
    if (!valueString) return []
    return valueString.split(",").filter(Boolean)
  }

  const selectedAreasServed = parseMultiSelect(currentAreasServed)
  const selectedCertifications = parseMultiSelect(currentCertifications)

  // Sync search term with URL parameters
  useEffect(() => {
    setSearchTerm(currentSearch)
  }, [currentSearch])

  const updateURL = (updates: Record<string, string | undefined>) => {
    if (!searchParams) return

    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // reset pagination when any non-page filter changes
    if (Object.keys(updates).some((key) => key !== "page")) {
      params.delete("page")
    }

    const newURL = params.toString() ? `/companies?${params.toString()}` : "/companies"
    startTransition(() => {
      router.push(newURL)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ search: searchTerm })
  }

  const handleFilterChange = (key: string, value: string) => {
    updateURL({ [key]: value })
  }

  const handleMultiSelectChange = (filterKey: "areasServed" | "certifications", item: string, checked: boolean) => {
    let currentSelected: string[] = filterKey === "areasServed" ? [...selectedAreasServed] : [...selectedCertifications]

    if (checked) {
      if (!currentSelected.includes(item)) currentSelected.push(item)
    } else {
      currentSelected = currentSelected.filter((i) => i !== item)
    }

    const valueString = currentSelected.length > 0 ? currentSelected.join(",") : ""
    updateURL({ [filterKey]: valueString })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    startTransition(() => {
      router.push("/companies")
    })
  }

  // Active filters (industries removed)
  const activeFilters: Array<[string, string]> = [
    ...(currentService ? [["service", currentService] as [string, string]] : []),
    ...(selectedAreasServed.length > 0 ? [["areasServed", selectedAreasServed.join(",")] as [string, string]] : []),
    ...(selectedCertifications.length > 0
      ? [["certifications", selectedCertifications.join(",")] as [string, string]]
      : []),
    ...(currentLocation ? [["location", currentLocation] as [string, string]] : []),
    ...(currentSize ? [["size", currentSize] as [string, string]] : []),
  ]

  const getDisplayValue = (filterKey: string, filterValue: string): string => {
    switch (filterKey) {
      case "service":
        return SERVICE_LABELS[filterValue] || filterValue
      case "size":
        return SIZE_LABELS[filterValue] || filterValue
      case "certifications":
        const certs = filterValue.split(",")
        if (certs.length === 1) {
          return CERTIFICATION_LABELS[certs[0]] || certs[0]
        }
        return `${certs.length} certifications`
      case "location":
        return filterValue
      case "areasServed":
        const areas = filterValue.split(",")
        if (areas.length === 1) {
          const area = areas[0]
          if (area.length === 2 && ALL_US_STATES.includes(area)) {
            return STATE_NAMES[area] || area
          }
          return area
        }
        return `${areas.length} states`
      default:
        return filterValue
    }
  }

  const availableServices = Object.keys(SERVICE_LABELS)
  const allSizes = Object.keys(SIZE_LABELS)
  const allCertifications = Object.keys(CERTIFICATION_LABELS)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {/* Filters: Services, Areas Served, Certifications, HQ Location, Company Size */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
          {activeFilters.length > 0 && <Badge variant="secondary">{activeFilters.length} active</Badge>}
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* 1. Services */}
          <Select value={currentService || "all"} onValueChange={(value) => handleFilterChange("service", value)}>
            <SelectTrigger className="w-40 cursor-pointer">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Services
              </SelectItem>
              {availableServices.map((service) => (
                <SelectItem key={service} value={service} className="cursor-pointer">
                  {SERVICE_LABELS[service]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 2. Areas Served Multi-Select */}
          <Popover open={areasServedOpen} onOpenChange={setAreasServedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-between bg-transparent cursor-pointer">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {selectedAreasServed.length === 0
                      ? "Service Areas"
                      : selectedAreasServed.length === 1
                        ? getDisplayValue("areasServed", selectedAreasServed[0])
                        : `${selectedAreasServed.length} states`}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="font-medium text-sm">I need a provider that services...</div>
                <div>
                  <div className="font-medium text-xs text-gray-500 mb-2">US STATES</div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {ALL_US_STATES.map((state) => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={`state-${state}`}
                          checked={selectedAreasServed.includes(state)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange("areasServed", state, checked as boolean)
                          }
                          className="cursor-pointer"
                        />
                        <label htmlFor={`state-${state}`} className="text-sm cursor-pointer">
                          {state}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedAreasServed.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ areasServed: "" })}
                      className="w-full cursor-pointer"
                    >
                      Clear Service Areas
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* 3. Certifications Multi-Select */}
          <Popover open={certificationsOpen} onOpenChange={setCertificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40 justify-between bg-transparent cursor-pointer">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="truncate">
                    {selectedCertifications.length === 0
                      ? "Certifications"
                      : selectedCertifications.length === 1
                        ? getDisplayValue("certifications", selectedCertifications[0])
                        : `${selectedCertifications.length} certs`}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="font-medium text-sm">Select Certifications</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allCertifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={selectedCertifications.includes(cert)}
                        onCheckedChange={(checked) => {
                          handleMultiSelectChange("certifications", cert, checked as boolean)
                        }}
                        className="cursor-pointer"
                      />
                      <label htmlFor={`cert-${cert}`} className="text-sm cursor-pointer">
                        {CERTIFICATION_LABELS[cert]}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCertifications.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateURL({ certifications: "" })}
                      className="w-full cursor-pointer"
                    >
                      Clear Certifications
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* 4. HQ Location */}
          <Select value={currentLocation || "all"} onValueChange={(value) => handleFilterChange("location", value)}>
            <SelectTrigger className="w-32 cursor-pointer">
              <SelectValue placeholder="HQ Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All HQ States
              </SelectItem>
              {ALL_US_STATES.map((state) => (
                <SelectItem key={state} value={state} className="cursor-pointer">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 5. Company Size */}
          <Select value={currentSize || "all"} onValueChange={(value) => handleFilterChange("size", value)}>
            <SelectTrigger className="w-40 cursor-pointer">
              <SelectValue placeholder="Company Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                All Sizes
              </SelectItem>
              {allSizes.map((size) => (
                <SelectItem key={size} value={size} className="cursor-pointer">
                  {SIZE_LABELS[size]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(activeFilters.length > 0 || currentSearch) && (
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="cursor-pointer bg-transparent">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(activeFilters.length > 0 || currentSearch) && (
        <div className="flex flex-wrap gap-2">
          {currentSearch && (
            <Badge variant="default" className="flex items-center gap-1">
              Search: &quot;{currentSearch}&quot;
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent text-white cursor-pointer"
                onClick={() => {
                  setSearchTerm("")
                  updateURL({ search: undefined })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {FILTER_LABELS[key] || key}: {getDisplayValue(key, value)}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent cursor-pointer"
                onClick={() => updateURL({ [key]: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
