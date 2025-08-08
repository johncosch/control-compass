import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

async function getUserCompanies(userId: string) {
  const supabase = await createClient()

  // 1) Fetch user-company relations (try camelCase then snake_case)
  const tables = ["userCompanies", "user_companies"] as const

  let userCompaniesRes:
    | Array<{
        id: string
        userId?: string
        companyId: string
        relation: "OWNER" | "MEMBER" | string
        createdAt: string
      }>
    | null = null
  let lastError: unknown = null

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("id, companyId, relation, createdAt")
      .eq("userId", userId)
      .order("createdAt", { ascending: false })

    if (!error) {
      userCompaniesRes = data ?? []
      break
    } else {
      lastError = error
    }
  }

  if (!userCompaniesRes) {
    console.error("Error fetching user companies:", lastError)
    return []
  }

  if (userCompaniesRes.length === 0) {
    return []
  }

  // 2) Fetch companies in a single query
  const companyIds = Array.from(
    new Set(userCompaniesRes.map((uc) => uc.companyId).filter(Boolean))
  )

  if (companyIds.length === 0) {
    return []
  }

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name, slug, logoUrl, hqCity, hqState, status")
    .in("id", companyIds)

  if (companiesError) {
    console.error(
      "Error fetching companies for user companies:",
      JSON.stringify(companiesError, null, 2)
    )
    return []
  }

  const companyById = new Map((companies ?? []).map((c) => [c.id, c]))

  // 3) Join into the UI shape your component expects
  const joined = userCompaniesRes
    .map((uc) => ({
      id: uc.id,
      relation: uc.relation,
      createdAt: uc.createdAt,
      company: companyById.get(uc.companyId),
    }))
    .filter((uc) => uc.company)

  return joined as Array<{
    id: string
    relation: "OWNER" | "MEMBER" | string
    createdAt: string
    company: {
      id: string
      name: string
      slug: string | null
      logoUrl: string | null
      hqCity: string | null
      hqState: string | null
      status: "APPROVED" | "PENDING" | "REJECTED" | string
    }
  }>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const userCompanies = await getUserCompanies(user.id)
  const ownedCompanies = userCompanies.filter((uc) => uc.relation === "OWNER")
  const memberCompanies = userCompanies.filter((uc) => uc.relation === "MEMBER")

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600">Manage your company listings and profile</p>
          </div>

          {/* My Companies Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">My Companies</h2>
              <Link href="/dashboard/company/new">
                <Button className="bg-slate-900 hover:bg-slate-950 text-white">Add Company</Button>
              </Link>
            </div>

            {ownedCompanies.length === 0 && memberCompanies.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600 mb-4">You haven't added any companies yet.</p>
                  <Link href="/dashboard/company/new">
                    <Button className="bg-slate-900 hover:bg-slate-950 text-white">Add Your First Company</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ownedCompanies.map((uc) => (
                  <Card key={uc.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {uc.company?.logoUrl ? (
                            <Image
                              src={uc.company.logoUrl || "/placeholder.svg"}
                              alt={`${uc.company?.name} logo`}
                              width={60}
                              height={60}
                              className="rounded-lg object-contain bg-stone-100 p-2"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-slate-100 rounded-lg flex items-center justify-center">
                              <span className="text-slate-700 font-semibold text-lg">
                                {uc.company?.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-xl text-slate-900">{uc.company?.name}</CardTitle>
                            <p className="text-slate-600 mt-1">
                              {uc.company?.hqCity && uc.company?.hqState
                                ? `${uc.company?.hqCity}, ${uc.company?.hqState}`
                                : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={uc.company?.status === "APPROVED" ? "default" : "secondary"}>
                                {uc.company?.status}
                              </Badge>
                              <Badge variant="outline">OWNER</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {uc.company?.status === "PENDING" && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-yellow-800 text-sm">
                            Your company is pending review. We'll notify you once it's approved.
                          </p>
                        </div>
                      )}
                      {uc.company?.status === "REJECTED" && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-red-800 text-sm">
                            Your company submission was rejected. Please contact support for more information.
                          </p>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Link href={`/dashboard/company/${uc.company?.id}/manage`}>
                          <Button variant="outline" size="sm">
                            Manage Company
                          </Button>
                        </Link>
                        {uc.company?.status === "APPROVED" && (
                          <Link href={`/companies/${uc.company?.slug}`}>
                            <Button variant="outline" size="sm">
                              View Public Page
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {memberCompanies.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Companies I Manage</h3>
                    {memberCompanies.map((uc) => (
                      <Card key={uc.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {uc.company?.logoUrl ? (
                                <Image
                                  src={uc.company.logoUrl || "/placeholder.svg"}
                                  alt={`${uc.company?.name} logo`}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-contain bg-stone-100 p-2"
                                />
                              ) : (
                                <div className="w-15 h-15 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <span className="text-slate-700 font-semibold text-lg">
                                    {uc.company?.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-xl text-slate-900">{uc.company?.name}</CardTitle>
                                <p className="text-slate-600 mt-1">
                                  {uc.company?.hqCity && uc.company?.hqState
                                    ? `${uc.company?.hqCity}, ${uc.company?.hqState}`
                                    : ""}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={uc.company?.status === "APPROVED" ? "default" : "secondary"}>
                                    {uc.company?.status}
                                  </Badge>
                                  <Badge variant="outline">MEMBER</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-3">
                            <Link href={`/dashboard/company/${uc.company?.id}/manage`}>
                              <Button variant="outline" size="sm">
                                Manage Company
                              </Button>
                            </Link>
                            {uc.company?.status === "APPROVED" && (
                              <Link href={`/companies/${uc.company?.slug}`}>
                                <Button variant="outline" size="sm">
                                  View Public Page
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Update your personal information and preferences.</p>
                <Link href="/dashboard/profile">
                  <Button variant="outline">Edit Profile</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900">Browse Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Explore other control panel builders and manufacturers.</p>
                <Link href="/companies">
                  <Button variant="outline">Browse Companies</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
