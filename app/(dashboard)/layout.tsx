import type React from "react"
import { DashboardHeader } from "@/components/domain/layout/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {children}
    </div>
  )
}
