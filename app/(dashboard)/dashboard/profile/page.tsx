import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/domain/layout/dashboard-header"
import { ProfileForm } from "@/components/domain/profile/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const supabase =  await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile from database
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </CardHeader>
            <CardContent>
              <ProfileForm
                user={{
                  id: user.id,
                  email: user.email!,
                  name: userProfile?.name || user.user_metadata?.full_name || "",
                  role: userProfile?.role || "USER",
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
