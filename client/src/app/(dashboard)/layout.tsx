"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Wallet,
  History,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const ownerLinks = [
  { href: "/owner/dashboard", label: "My Flats", icon: Home },
  { href: "/owner/wallet", label: "Wallet", icon: Wallet },
];

const renterLinks = [
  { href: "/renter/dashboard", label: "Pay Rent", icon: KeyRound },
  { href: "/renter/payments", label: "Payment History", icon: History },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-6 border-b border-primary-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary-300" />
            <span className="text-xl font-bold">RentFlow</span>
          </Link>
          <p className="text-xs text-primary-400 mt-1 truncate">
            {user?.email}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Overview */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-primary-700 text-white"
                : "text-primary-300 hover:bg-primary-800 hover:text-white",
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>

          {/* Owner section */}
          <div>
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider px-3 mb-1">
              Owner
            </p>
            {ownerLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary-700 text-white"
                    : "text-primary-300 hover:bg-primary-800 hover:text-white",
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>

          {/* Renter section */}
          <div>
            <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider px-3 mb-1">
              Renter
            </p>
            {renterLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary-700 text-white"
                    : "text-primary-300 hover:bg-primary-800 hover:text-white",
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-primary-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-primary-400 hover:text-white w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
