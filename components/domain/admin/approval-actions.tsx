"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ApprovalActionsProps {
  companyId: string
}

export function ApprovalActions({ companyId }: ApprovalActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/companies/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to approve company")
      }
    } catch (error) {
      console.error("Error approving company:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this company? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/companies/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to reject company")
      }
    } catch (error) {
      console.error("Error rejecting company:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleReject}
        variant="outline"
        size="sm"
        disabled={isLoading}
        className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
      >
        {isLoading ? "Processing..." : "Reject"}
      </Button>
      <Button
        onClick={handleApprove}
        size="sm"
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? "Processing..." : "Approve"}
      </Button>
    </div>
  )
}
