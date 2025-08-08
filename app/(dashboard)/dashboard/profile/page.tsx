import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/domain/layout/dashboard-header"
import { ProfileForm } from "@/components/domain/profile/profile-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type UserProfileRow = {
  name: string | null
  role: string | null
}

async function getUserProfile(userId: string) {
  const supabase = await createClient()

  // Try common profile table names in order: profiles -> users -> user
  const tables = ["profiles", "users", "user"] as const

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("name, role")
      .eq("id", userId)
      .maybeSingle<UserProfileRow>()

    // Table does not exist -> try next
    if (error?.code === "42P01") continue

    // Any other error -> stop trying further tables
    if (error) {
      console.error(`Failed fetching profile from "${table}":`, error)
      break
    }

    // Found a row (or null if none) -> return it (null will trigger fallbacks)
    return data
  }

  return null
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const userProfile = await getUserProfile(user.id)

  return (
    <div className="min-h-screen bg-gray-50">

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
                  name: userProfile?.name || (user.user_metadata?.full_name as string) || "",
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
