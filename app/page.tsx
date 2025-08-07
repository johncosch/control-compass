import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { HomeHeroSearch } from "@/src/components/domain/home/home-hero-search"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, Cog, FlaskConical, Search, Users, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Control Compass - Find Industrial Control System Experts",
  description:
    "Connect with verified control panel manufacturers, system integrators, and automation specialists. Browse UL 508A certified companies for your next project.",
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
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
                  <span className="text-sm text-slate-600">{user.user_metadata?.full_name || user.email}</span>
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">Find Your Automation Partners</h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed">
              Connect with verified control panel manufacturers, system integrators, and automation specialists for your
              next project
            </p>
            {/* Hero Search */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <HomeHeroSearch />
            </div>
            <p className="text-slate-500">
              Browse <strong>verified companies</strong> • Compare services • Get quotes
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Find Your Next Control Partner</h2>
            <p className="text-xl text-slate-600 mb-16">
              Whether you're a manufacturer, facility manager, or engineer, finding the right control systems partner
              shouldn't be complicated.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">1. Search & Filter</h3>
                <p className="text-slate-600">
                  Filter through our curated list of control specialists by services, location, and industry expertise.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">2. Compare & Shortlist</h3>
                <p className="text-slate-600">
                  Review company profiles, certifications, and past projects to create a shortlist that fits your needs.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">3. Connect & Hire</h3>
                <p className="text-slate-600">
                  Reach out directly to your chosen partners and get your control systems project started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IOThrifty Promotional Section */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-stone-100 border-t border-stone-200">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 items-center lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-slate-900">
                  Need Industrial Control Components?
                </h2>
                <p className="text-slate-600 md:text-lg">
                  Shop the latest industrial automation products, control panels, sensors, and more at IOThrifty. Your
                  one-stop shop for quality industrial components at competitive prices.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-[#18763c] hover:bg-[#145a30] text-white">
                  <a href="https://www.iothrifty.com/" target="_blank" rel="noopener noreferrer">
                    Shop Now at IOThrifty
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                >
                  <a href="https://www.iothrifty.com/pages/contact-us" target="_blank" rel="noopener noreferrer">
                    Contact Sales
                  </a>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#18763c]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Fast Shipping
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#18763c]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quality Products
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#18763c]" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Expert Support
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg border border-stone-200">
                <Image
                  src="/images/LogoRegisterSquare_1999px.png"
                  alt="IOThrifty - Industrial Components Store"
                  width={300}
                  height={200}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Partners Section */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Find Partners Across the Industry</h2>
              <p className="text-xl text-slate-600">
                From custom control panels to complete automation solutions, find the right specialist for your project.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Control Panel Builders</h3>
                  <p className="text-slate-600 mb-6">
                    UL 508A certified panel shops specializing in custom motor control centers, distribution panels, and
                    industrial control cabinets.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <Link href="/companies?service=CONTROL_PANEL_ASSEMBLY">Find Panel Builders</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Cog className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">System Integrators</h3>
                  <p className="text-slate-600 mb-6">
                    Complete automation solutions including PLC programming, HMI development, SCADA systems, and process
                    automation.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <Link href="/companies?service=SYSTEM_INTEGRATION">Find Integrators</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FlaskConical className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Calibration Labs</h3>
                  <p className="text-slate-600 mb-6">
                    Precision instrument calibration, testing services, and compliance verification for industrial
                    control systems.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  >
                    <Link href="/companies?service=CALIBRATION_SERVICES">Find Calibration Labs</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Provider CTA Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Are You a Control Systems Provider?</h2>
            <p className="text-xl text-slate-300 mb-12">
              Join Control Compass and connect with manufacturers and facilities looking for your expertise. Get found
              by customers actively searching for control panel builders, system integrators, and automation
              specialists.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create Your Profile</h3>
                <p className="text-slate-300 text-sm">Showcase your services, certifications, and project experience</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Get Verified</h3>
                <p className="text-slate-300 text-sm">Our team reviews your profile to ensure quality for customers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-stone-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connect with Customers</h3>
                <p className="text-slate-300 text-sm">
                  Receive inquiries from qualified prospects looking for your services
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-stone-400 hover:bg-stone-500 text-slate-950 font-semibold">
                <Link href="/auth/signup">List Your Company Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-slate-800 transition-colors"
              >
                <Link href="/companies">Browse Directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Image
                src="/images/control-compass-logo.svg"
                alt="Control Compass"
                width={200}
                height={80}
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 mb-4">
                The premier directory for industrial control systems professionals. Connecting manufacturers with
                verified control panel builders, system integrators, and automation specialists.
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>© 2024 Control Compass. All rights reserved.</span>
                <span>•</span>
                <span>Powered by</span>
                <a
                  href="https://www.iothrifty.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#18763c] hover:text-[#20a049] transition-colors"
                >
                  IOThrifty
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">For Customers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/companies" className="hover:text-white transition-colors">
                    Browse Directory
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=CONTROL_PANEL_ASSEMBLY" className="hover:text-white transition-colors">
                    Control Panel Builders
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=SYSTEM_INTEGRATION" className="hover:text-white transition-colors">
                    System Integrators
                  </Link>
                </li>
                <li>
                  <Link href="/companies?service=CALIBRATION_SERVICES" className="hover:text-white transition-colors">
                    Calibration Labs
                  </Link>
                </li>
                <li>
                  <a
                    href="https://www.iothrifty.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Shop Control Products
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">For Providers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    List Your Company
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <a
                    href="https://www.iothrifty.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Shop Control Products
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
