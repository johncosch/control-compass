import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/domain/auth/signup-form"
import Image from "next/image"
import Link from "next/link"

export default async function SignUpPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Link href="/">
            <Image
              src="/images/control-compass-logo.svg"
              alt="Control Compass"
              width={200}
              height={80}
              className="mx-auto mb-6 cursor-pointer"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Control Compass to list your company and connect with customers
          </p>
        </div>
        <SignupForm />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
