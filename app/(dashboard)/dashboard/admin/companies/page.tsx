import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ApprovalActions } from "@/components/domain/admin/approval-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/src/components/domain/layout/dashboard-header"
import Image from "next/image"
import Link from "next/link"

async function getPendingCompanies() {
  const companies = await prisma.company.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      userCompanies: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return companies
}

export default async function AdminCompaniesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Simple admin check - you can make this more sophisticated later
  if (!user || !user.email?.includes("@")) {
    redirect("/auth/login")
  }

  const companies = await getPendingCompanies()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin - Pending Companies</h1>
            <Link href="/dashboard" className="text-primary hover:underline">
              ← Back to Dashboard
            </Link>
          </div>

          {companies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No pending companies to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl || "/placeholder.svg"}
                            alt={`${company.name} logo`}
                            width={60}
                            height={60}
                            className="rounded-lg object-contain bg-gray-50 p-2"
                          />
                        ) : (
                          <div className="w-15 h-15 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-semibold text-lg">{company.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl">{company.name}</CardTitle>
                          <p className="text-gray-600 mt-1">
                            Submitted by: {company.userCompanies[0]?.user.name || company.userCompanies[0]?.user.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {company.hqCity && company.hqState && `${company.hqCity}, ${company.hqState}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">PENDING</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {company.description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-700">{company.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {company.websiteUrl && (
                        <div>
                          <h4 className="font-medium mb-1">Website</h4>
                          <a
                            href={company.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.websiteUrl}
                          </a>
                        </div>
                      )}

                      {company.salesEmail && (
                        <div>
                          <h4 className="font-medium mb-1">Sales Email</h4>
                          <p>{company.salesEmail}</p>
                        </div>
                      )}

                      {company.phone && (
                        <div>
                          <h4 className="font-medium mb-1">Phone</h4>
                          <p>{company.phone}</p>
                        </div>
                      )}

                      {company.yearFounded && (
                        <div>
                          <h4 className="font-medium mb-1">Founded</h4>
                          <p>{company.yearFounded}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <ApprovalActions companyId={company.id} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
