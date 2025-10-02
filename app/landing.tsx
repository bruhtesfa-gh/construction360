"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Building2,
  Home,
  Users,
  HardHat,
  BarChart3,
  Shield,
  CheckCircle,
  Grid3X3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo_house.png"
              alt="My Construction App Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Construction App
              </h1>
              <p className="text-sm text-slate-600">
                Complete Builder Management Platform
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Build Smarter.
            <br />
            <span className="text-blue-600">Manage Better.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete construction management platform designed specifically
            for home builders. Track projects, manage customers, and grow your
            business with AG Grid enterprise data tables, PostgreSQL Row Level
            Security, and bulletproof multi-tenant architecture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Construction Projects
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From initial planning to final walkthrough, My Construction App
              provides enterprise-grade data management with AG Grid tables and
              the tools your team needs to deliver projects efficiently.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Grid3X3 className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-xl">
                  Enterprise Data Tables
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Powered by AG Grid - the world&apos;s leading data grid.
                  Advanced filtering, sorting, pagination, and data export
                  capabilities for managing thousands of records efficiently.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <HardHat className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle className="text-xl">Project Management</CardTitle>
                <CardDescription className="text-slate-600">
                  Track construction stages, schedules, and progress across all
                  your building projects with real-time updates and interactive
                  data views.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle className="text-xl">Customer Management</CardTitle>
                <CardDescription className="text-slate-600">
                  Manage leads, prospects, and buyers with enterprise-grade data
                  tables, advanced search, and integrated communication tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Home className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-xl">Inventory Management</CardTitle>
                <CardDescription className="text-slate-600">
                  Track homes, floor plans, communities, and available lots with
                  powerful data grids featuring inline editing and bulk
                  operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle className="text-xl">
                  Enterprise Security with RLS
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Multi-tenant architecture with PostgreSQL Row Level Security
                  (RLS) ensures your data is completely isolated and protected
                  at the database level.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle className="text-xl">Analytics & Reporting</CardTitle>
                <CardDescription className="text-slate-600">
                  Get insights into your business performance with comprehensive
                  dashboards, data export capabilities, and custom reports from
                  AG Grid.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Built for Modern Home Builders
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                My Construction App combines the power of enterprise-grade
                technology with the simplicity your team needs to get work done
                efficiently.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Multi-Tenant Architecture
                    </h3>
                    <p className="text-slate-600">
                      Complete data isolation between builders ensures security
                      and compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      PostgreSQL with Row Level Security (RLS)
                    </h3>
                    <p className="text-slate-600">
                      Built on enterprise-grade PostgreSQL with Row Level
                      Security policies that automatically enforce data
                      isolation at the database level - no application bugs can
                      bypass security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Enterprise Data Grid Technology
                    </h3>
                    <p className="text-slate-600">
                      Built with AG Grid Community Edition - the same data grid
                      technology used by Fortune 500 companies for handling
                      large datasets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Modern Technology Stack
                    </h3>
                    <p className="text-slate-600">
                      Next.js, TypeScript, tRPC, and AG Grid provide a fast,
                      type-safe, and enterprise-grade platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <Image
                  src="/logo_house.png"
                  alt="My Construction App Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-slate-900">
                  Ready to Get Started?
                </h3>
                <p className="text-slate-600">
                  Join hundreds of builders already using My Construction App
                </p>
              </div>

              <div className="space-y-4">
                <Link href="/signup">
                  <Button className="w-full" size="lg">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="w-full mt-2" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-slate-500 text-center mt-4">
                No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo_house.png"
                  alt="My Construction App Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="font-bold text-slate-900">
                  My Construction App
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                The complete construction management platform for modern home
                builders with enterprise-grade Row Level Security.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <div className="space-y-2">
                <Link
                  href="/features"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Pricing
                </Link>
                <Link
                  href="/signin"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <div className="space-y-2">
                <Link
                  href="/about"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Contact
                </Link>
                <Link
                  href="/support"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <div className="space-y-2">
                <Link
                  href="/privacy"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Terms
                </Link>
                <Link
                  href="/security"
                  className="block text-sm text-slate-600 hover:text-slate-900"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600">
            © {new Date().getFullYear()} My Construction App. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
