import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  LineChart,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden page-fade">
      <div className="orb bg-blue-300 w-72 h-72 -top-16 -left-20" />
      <div
        className="orb bg-amber-300 w-80 h-80 top-[22%] -right-28"
        style={{ animationDelay: "1.6s" }}
      />
      <div
        className="orb bg-cyan-200 w-64 h-64 bottom-8 left-[18%]"
        style={{ animationDelay: "0.8s" }}
      />
      <div className="grid-overlay absolute inset-0 z-0" />

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl brand-logo-icon flex items-center justify-center animate-pulse">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold brand-logo-text">RentFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-slate-600 hover:text-blue-700 font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="stagger-1 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-blue-100 text-sm text-blue-800 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Designed for modern rental communities
            </div>
            <h1 className="stagger-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] mt-6 mb-6">
              From Invite Code to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-500 to-cyan-500">
                {" "}
                Instant Rent
              </span>{" "}
              in One Smooth Flow.
            </h1>
            <p className="stagger-3 text-lg sm:text-xl text-slate-600 max-w-2xl mb-10">
              RentFlow unifies owner operations and renter payments in one
              clean workspace - onboard tenants, collect rent with Stripe, and
              keep every transaction visible and auditable.
            </p>

            <div className="stagger-3 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register?role=owner"
                className="btn-primary px-8 py-3 text-lg inline-flex items-center justify-center gap-2"
              >
                I&apos;m an Owner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/register?role=renter"
                className="btn-secondary px-8 py-3 text-lg inline-flex items-center justify-center"
              >
                I&apos;m a Renter
              </Link>
            </div>

            <div className="stagger-3 mt-10 grid grid-cols-3 gap-3 max-w-xl">
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-700">24/7</p>
                <p className="text-xs text-slate-600 mt-1">Owner visibility</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-700">1 Click</p>
                <p className="text-xs text-slate-600 mt-1">Rent payment</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-blue-700">100%</p>
                <p className="text-xs text-slate-600 mt-1">Traceability</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="stagger-3 card p-7 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-cyan-100/80 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-blue-100/80 blur-2xl" />
              <p className="text-sm font-semibold text-blue-800 mb-4">
                Inside RentFlow
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                    <span className="text-sm font-medium text-slate-700">
                      Monthly Rent
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Paid</span>
                </div>
                <div className="rounded-2xl bg-cyan-50 border border-cyan-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-cyan-700" />
                    <span className="text-sm font-medium text-slate-700">
                      Owner Wallet
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    +48,000 BDT
                  </span>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span className="text-sm font-medium text-slate-700">
                      Transaction
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    Verified
                  </span>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">
                  This month
                </p>
                <div className="flex items-end gap-2 h-16">
                  {[35, 48, 54, 62, 76, 70].map((h) => (
                    <div
                      key={h}
                      className="flex-1 rounded-md bg-gradient-to-t from-blue-600 to-cyan-400 bar-rise"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="w-3.5 h-3.5" />
                Settlement cycle healthy
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Story */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card p-3">
            <img
              src="https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
              alt="Modern apartment building"
              className="w-full h-44 object-cover rounded-xl"
              loading="lazy"
            />
            <p className="text-sm font-semibold text-slate-900 mt-3">
              Apartment-first operations
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Manage multiple flats with one clean owner workspace.
            </p>
          </div>
          <div className="card p-3">
            <img
              src="https://images.unsplash.com/photo-1603794067602-9feaa4f70e0c?auto=format&fit=crop&w=1200&q=80"
              alt="Digital payment using card"
              className="w-full h-44 object-cover rounded-xl"
              loading="lazy"
            />
            <p className="text-sm font-semibold text-slate-900 mt-3">
              Seamless digital payments
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Renters pay quickly while owners receive transparent records.
            </p>
          </div>
          <div className="card p-3">
            <img
              src="https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=1200&q=80"
              alt="Finance dashboard analytics"
              className="w-full h-44 object-cover rounded-xl"
              loading="lazy"
            />
            <p className="text-sm font-semibold text-slate-900 mt-3">
              Data-backed trust
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Monthly history and wallet insights stay audit-ready.
            </p>
          </div>
        </div>
      </section>

      {/* Concept Flow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 relative z-10">
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-blue-700 font-semibold">
                RentFlow Concept
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                One continuous journey for two roles
              </h3>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Built for apartment rentals where trust, speed, and transparent
              records matter every month.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <QrCode className="w-7 h-7 text-blue-700 mb-2" />
              <p className="font-semibold text-slate-900">Invite + Link</p>
              <p className="text-xs text-slate-600 mt-1">
                Owner shares code, renter links the exact flat.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <CreditCard className="w-7 h-7 text-cyan-700 mb-2" />
              <p className="font-semibold text-slate-900">Pay in Seconds</p>
              <p className="text-xs text-slate-600 mt-1">
                Stripe checkout keeps payments secure and fast.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <Wallet className="w-7 h-7 text-emerald-700 mb-2" />
              <p className="font-semibold text-slate-900">Instant Credit</p>
              <p className="text-xs text-slate-600 mt-1">
                Owner wallet updates with clear transaction logs.
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <LineChart className="w-7 h-7 text-violet-700 mb-2" />
              <p className="font-semibold text-slate-900">Audit Ready</p>
              <p className="text-xs text-slate-600 mt-1">
                Monthly history stays report-friendly for both sides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-[0.12em]">
            Built for both sides
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
            One platform, two perfect workflows
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card hover:-translate-y-1 transition-all duration-300">
            <Building2 className="w-12 h-12 text-blue-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              For Owners
            </h2>
            <p className="text-gray-600 mb-4">
              Register your flats, invite tenants with a unique code, and
              receive rent directly into your virtual wallet — withdraw anytime.
            </p>
            <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Add and manage flats
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Generate invite codes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Virtual wallet and withdrawals
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Full payment history
              </li>
            </ul>
            <Link
              href="/auth/register?role=owner"
              className="btn-primary block text-center"
            >
              Register as Owner
            </Link>
          </div>
          <div className="card hover:-translate-y-1 transition-all duration-300">
            <Users className="w-12 h-12 text-blue-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              For Renters
            </h2>
            <p className="text-gray-600 mb-4">
              Enter your invite code, link to your flat, and pay rent in
              seconds. Get receipts and view every payment you&apos;ve ever
              made.
            </p>
            <ul className="space-y-2.5 text-sm text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Link flat via invite code
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                One-click Stripe payment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Email receipts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Full payment history
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

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card hover:-translate-y-1 transition-all duration-300">
            <BadgeCheck className="w-8 h-8 text-blue-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              1. Create account
            </h3>
            <p className="text-sm text-slate-600">
              Owners and renters sign up in seconds with one shared auth flow.
            </p>
          </div>
          <div className="card hover:-translate-y-1 transition-all duration-300">
            <Landmark className="w-8 h-8 text-blue-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              2. Link your flat
            </h3>
            <p className="text-sm text-slate-600">
              Owners share invite codes and renters connect to the right unit.
            </p>
          </div>
          <div className="card hover:-translate-y-1 transition-all duration-300">
            <CreditCard className="w-8 h-8 text-blue-700 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              3. Pay and track
            </h3>
            <p className="text-sm text-slate-600">
              Every transaction is visible, verified, and ready for reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Human touch */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <MessageCircleMore className="w-8 h-8 text-blue-700 mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Built for real monthly conversations
            </h3>
            <p className="text-sm text-slate-600">
              Rent reminders, proof of payment, and settlement visibility reduce
              friction between owners and renters.
            </p>
          </div>
          <div className="card">
            <Landmark className="w-8 h-8 text-blue-700 mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Local-market ready by design
            </h3>
            <p className="text-sm text-slate-600">
              Built for apartment rental workflows common in urban Bangladesh:
              invite-code linking, monthly rent cycles, and transparent records.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl shadow-slate-900/20">
          <div className="text-center mb-8">
            <p className="text-xs sm:text-sm uppercase tracking-[0.15em] text-cyan-200">
              Why RentFlow
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold mt-3">
              Fast, secure, and built for scale
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Zap className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
              <h3 className="text-lg font-semibold mb-2">Instant Payments</h3>
              <p className="text-slate-300 text-sm">
                Stripe-powered checkout with receipts in seconds.
              </p>
            </div>
            <div>
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
              <h3 className="text-lg font-semibold mb-2">
                Secure and Transparent
              </h3>
              <p className="text-slate-300 text-sm">
                JWT auth, encrypted data, PCI-DSS via Stripe.
              </p>
            </div>
            <div>
              <Building2 className="w-10 h-10 mx-auto mb-3 text-cyan-300" />
              <h3 className="text-lg font-semibold mb-2">Multi-Flat Support</h3>
              <p className="text-slate-300 text-sm">
                Own multiple properties. Manage all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-10 text-center text-slate-500 text-sm relative z-10">
        © 2026 RentFlow. All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-blue-700">
          Privacy Policy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-blue-700">
          Terms of Service
        </Link>
      </footer>
    </div>
  );
}
