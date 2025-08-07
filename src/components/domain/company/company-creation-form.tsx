"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { BasicInfoStep } from "./creation-steps/basic-info-step"
import { CompanyDetailsStep } from "./creation-steps/company-details-step"
import { ServicesStep } from "./creation-steps/services-step"
import { ReviewStep } from "./creation-steps/review-step"
import { createCompany } from "@/app/(dashboard)/dashboard/company/new/actions"

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

const STEPS = [
  { id: 1, title: "Basic Info", description: "Company name and description" },
  { id: 2, title: "Details", description: "Location and contact information" },
  { id: 3, title: "Services", description: "Services and locations served" },
  { id: 4, title: "Review", description: "Review and submit" },
]

export function CompanyCreationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize with empty strings to avoid controlled/uncontrolled issues
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    description: "",
    website_url: "",
    logo_url: "",
    phone: "",
    sales_email: "",
    hq_city: "",
    hq_state: "",
    hq_country: "US",
    year_founded: null,
    size_bucket: "",
    services: [],
    certifications: [],
    locations_served: [],
  })

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Company name is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.website_url.trim()) newErrors.website_url = "Website URL is required"
        break
      case 2:
        if (!formData.hq_city.trim()) newErrors.hq_city = "City is required"
        if (!formData.hq_state.trim()) newErrors.hq_state = "State is required"
        if (!formData.phone.trim()) newErrors.phone = "Phone is required"
        if (!formData.sales_email.trim()) newErrors.sales_email = "Sales email is required"
        if (!formData.size_bucket) newErrors.size_bucket = "Company size is required"
        break
      case 3:
        if (formData.services.length === 0) newErrors.services = "At least one service is required"
        if (formData.locations_served.length === 0) newErrors.locations_served = "At least one location is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => {
        const nextStep = Math.min(prev + 1, STEPS.length)
        return nextStep
      })
    } else {
      console.log("Validation failed, errors:", errors)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      const result = await createCompany(formData)

      if (result.success) {
        toast({
          title: "Success!",
          description:
            "Your company has been submitted for review. You'll receive an email notification once it's approved.",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (updates: Partial<CompanyFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    // Clear related errors when data is updated
    const updatedFields = Object.keys(updates)
    setErrors((prev) => {
      const newErrors = { ...prev }
      updatedFields.forEach((field) => delete newErrors[field])
      return newErrors
    })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 2:
        return <CompanyDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <ServicesStep formData={formData} updateFormData={updateFormData} errors={errors} />
      case 4:
        return <ReviewStep formData={formData} />
      default:
        return null
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Company</CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${currentStep >= step.id ? "text-primary" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                      currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs hidden sm:block">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="cursor-pointer bg-transparent"
            >
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={handleNext} className="cursor-pointer">
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Creating..." : "Create Company"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
