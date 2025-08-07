import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

interface PublicLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

async function getUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export default async function PublicLayout({
  children,
  showHeader = true,
}: PublicLayoutProps) {
  const user = showHeader ? await getUser() : null

  return (
    <div className="min-h-screen bg-white">
      {showHeader && (
        <header className="bg-white border-b border-stone-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/control-compass-logo.svg"
                  alt="Control Compass"
                  width={200}
                  height={80}
                  className="h-12 w-auto"
                  priority
                />
              </Link>
              <div className="flex gap-3 items-center">
                <Button asChild className="bg-[#18763c] hover:bg-[#145a30] text-white">
                  <a href="https://www.iothrifty.com/" target="_blank" rel="noopener noreferrer">
                    Shop at IOThrifty
                  </a>
                </Button>
                {user ? (
                  <>
                    <span className="text-sm text-slate-600">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                    >
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-slate-900 hover:bg-slate-950 text-white">
                      <Link href="/auth/signup">List Your Company</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  )
}
