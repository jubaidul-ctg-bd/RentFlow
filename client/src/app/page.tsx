import Link from "next/link";
import { Building2, Users, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary-600" />
          <span className="text-2xl font-bold text-primary-900">RentFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-gray-600 hover:text-primary-600 font-medium"
          >
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-primary-900 leading-tight mb-6">
          Rent Collection,{" "}
          <span className="text-primary-600">Effortlessly</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          RentFlow connects flat owners and tenants on a single platform —
          enabling one-click payments, instant wallet credits, and transparent
          history for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register?role=owner"
            className="btn-primary px-8 py-3 text-lg"
          >
            I&apos;m an Owner
          </Link>
          <Link
            href="/auth/register?role=renter"
            className="btn-secondary px-8 py-3 text-lg"
          >
            I&apos;m a Renter
          </Link>
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card hover:shadow-md transition-shadow">
            <Building2 className="w-12 h-12 text-primary-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              For Owners
            </h2>
            <p className="text-gray-600 mb-4">
              Register your flats, invite tenants with a unique code, and
              receive rent directly into your virtual wallet — withdraw anytime.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">✅ Add & manage flats</li>
              <li className="flex items-center gap-2">
                ✅ Generate invite codes
              </li>
              <li className="flex items-center gap-2">
                ✅ Virtual wallet & withdrawals
              </li>
              <li className="flex items-center gap-2">
                ✅ Full payment history
              </li>
            </ul>
            <Link
              href="/auth/register?role=owner"
              className="btn-primary block text-center"
            >
              Register as Owner
            </Link>
          </div>
          <div className="card hover:shadow-md transition-shadow">
            <Users className="w-12 h-12 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              For Renters
            </h2>
            <p className="text-gray-600 mb-4">
              Enter your invite code, link to your flat, and pay rent in
              seconds. Get receipts and view every payment you&apos;ve ever
              made.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                ✅ Link flat via invite code
              </li>
              <li className="flex items-center gap-2">
                ✅ One-click Stripe payment
              </li>
              <li className="flex items-center gap-2">✅ Email receipts</li>
              <li className="flex items-center gap-2">
                ✅ Full payment history
              </li>
            </ul>
            <Link
              href="/auth/register?role=renter"
              className="btn-primary block text-center"
            >
              Register as Renter
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Zap className="w-10 h-10 mx-auto mb-3 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">Instant Payments</h3>
            <p className="text-primary-200 text-sm">
              Stripe-powered checkout with receipts in seconds.
            </p>
          </div>
          <div>
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-primary-200 text-sm">
              JWT auth, encrypted data, PCI-DSS via Stripe.
            </p>
          </div>
          <div>
            <Building2 className="w-10 h-10 mx-auto mb-3 text-primary-300" />
            <h3 className="text-lg font-semibold mb-2">Multi-Flat Support</h3>
            <p className="text-primary-200 text-sm">
              Own multiple properties. Manage all from one dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        © 2026 RentFlow. All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-primary-600">
          Privacy Policy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-primary-600">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
