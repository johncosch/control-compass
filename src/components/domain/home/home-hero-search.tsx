"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, ChevronDown, Search } from "lucide-react"

const SERVICES = [
  { value: "CONTROL_PANEL_ASSEMBLY", label: "Control Panel Assembly" },
  { value: "SYSTEM_INTEGRATION", label: "System Integration" },
  { value: "CALIBRATION_SERVICES", label: "Calibration Services" },
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

export function HomeHeroSearch() {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState("")
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [areasOpen, setAreasOpen] = useState(false)

  const handleAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setSelectedAreas([...selectedAreas, area])
    } else {
      setSelectedAreas(selectedAreas.filter((a) => a !== area))
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (selectedService) {
      params.set("service", selectedService)
    }

    if (selectedAreas.length > 0) {
      params.set("areasServed", selectedAreas.join(","))
    }

    const url = params.toString() ? `/companies?${params.toString()}` : "/companies"
    router.push(url)
  }

  const getAreasDisplayText = () => {
    if (selectedAreas.length === 0) return "I need service in..."
    if (selectedAreas.length === 1) {
      const state = US_STATES.find((s) => s.code === selectedAreas[0])
      return state ? state.name : selectedAreas[0]
    }
    return `${selectedAreas.length} states selected`
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 text-center">Find the right partner for your project</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2">Service Needed</label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Areas Served Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-2">Service Location</label>
          <Popover open={areasOpen} onOpenChange={setAreasOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{getAreasDisplayText()}</span>
                </div>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="font-medium text-sm">I need a provider that services...</div>

                {/* US States */}
                <div>
                  <div className="font-medium text-xs text-gray-500 mb-2">US STATES</div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {US_STATES.map((state) => (
                      <div key={state.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`hero-${state.code}`}
                          checked={selectedAreas.includes(state.code)}
                          onCheckedChange={(checked) => handleAreaChange(state.code, checked as boolean)}
                        />
                        <label htmlFor={`hero-${state.code}`} className="text-sm">
                          {state.code}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedAreas.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => setSelectedAreas([])} className="w-full">
                      Clear All
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button onClick={handleSearch} size="lg" className="w-full bg-slate-900 hover:bg-slate-950 text-white">
        <Search className="w-5 h-5 mr-2" />
        Find Control Partners
      </Button>
    </div>
  )
}
