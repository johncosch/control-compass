"use client"

import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SuccessBanner() {
  const searchParams = useSearchParams()
  const [dismissed, setDismissed] = useState(false)

  const success = searchParams.get("success")

  if (!success || dismissed) return null

  const getMessage = () => {
    switch (success) {
      case "company-created":
        return "Company created successfully! It's now pending review and will be live once approved."
      default:
        return "Success!"
    }
  }

  return (
    <Alert className="border-green-200 bg-green-50 mb-6">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800 flex items-center justify-between">
        <span>🎉 {getMessage()}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-auto p-1 text-green-600 hover:text-green-800 hover:bg-green-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
