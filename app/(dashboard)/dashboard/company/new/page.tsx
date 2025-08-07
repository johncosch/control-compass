import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompanyCreationForm } from "@/src/components/domain/company/company-creation-form"

export default async function NewCompanyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8">
      <CompanyCreationForm />
    </div>
  )
}
