import Image from "next/image"
import Link from "next/link"
import { LogoutButton } from "@/components/domain/auth/logout-button"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { User } from "lucide-react"

export async function DashboardHeader() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/control-compass-logo.svg"
              alt="Control Compass"
              width={180}
              height={72}
              className="h-12 w-auto"
            />
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.user_metadata?.full_name || user?.email}</span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
