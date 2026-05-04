"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Building2,
  CreditCard,
  Home,
  KeyRound,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Flat {
  status: string;
  name: string;
  address: string;
  monthlyRent: number;
}

interface FlatLink {
  _id: string;
  isActive: boolean;
  flatId: Flat & { _id: string };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  const { data: flats = [] } = useQuery<Flat[]>({
    queryKey: ["owner-flats"],
    queryFn: () =>
      api
        .get("/flats")
        .then((r) => (Array.isArray(r.data) ? (r.data as Flat[]) : []))
        .catch(() => []),
    enabled: !!user,
  });

  const { data: wallet } = useQuery<{ balance: number } | null>({
    queryKey: ["wallet"],
    queryFn: () =>
      api
        .get("/wallet")
        .then((r) =>
          r.data && typeof r.data === "object" && "balance" in r.data
            ? (r.data as { balance: number })
            : null,
        )
        .catch(() => null),
    enabled: !!user,
  });

  const { data: flatLinks = [] } = useQuery<FlatLink[]>({
    queryKey: ["renter-flats"],
    queryFn: () =>
      api
        .get("/renters/my-flats")
        .then((r) => {
          const d = r.data;
          return Array.isArray(d) ? (d as FlatLink[]) : [];
        })
        .catch(() => []),
    enabled: !!user,
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  const approvedFlats = flats.filter((f) => f.status === "approved");
  const pendingFlats = flats.filter((f) => f.status === "pending");
  const linkedFlats = flatLinks.filter((l) => !!l.flatId?._id);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-500 mt-1">{user.email}</p>
      </div>

      {/* ── Owner Section ── */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          Owner
        </h2>
        {flats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Wallet Balance</span>
                  <Wallet className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {wallet ? formatCurrency(wallet.balance) : "—"}
                </p>
                <Link
                  href="/owner/wallet"
                  className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                >
                  View wallet →
                </Link>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Active Flats</span>
                  <Building2 className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedFlats.length}
                </p>
                <Link
                  href="/owner/flats"
                  className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                >
                  Manage flats →
                </Link>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Pending Approval
                  </span>
                  <Users className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingFlats.length}
                </p>
              </div>
            </div>
            <Link
              href="/owner/flats/new"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Flat
            </Link>
          </>
        ) : (
          <div className="card flex items-center gap-5 py-6">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">List your first flat</p>
              <p className="text-sm text-gray-500">
                Register a property and start collecting rent online.
              </p>
            </div>
            <Link
              href="/owner/flats/new"
              className="btn-primary inline-flex items-center gap-2 text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Flat
            </Link>
          </div>
        )}
      </section>

      {/* ── Renter Section ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Home className="w-5 h-5 text-primary-600" />
            Renter
            {linkedFlats.length > 0 && (
              <span className="ml-1 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {linkedFlats.length} linked
              </span>
            )}
          </h2>
          <Link
            href="/renter/dashboard"
            className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Link a Flat
          </Link>
        </div>

        {linkedFlats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {linkedFlats.map((link) => (
                <div
                  key={link._id}
                  className="card flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1">
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {link.flatId?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {link.flatId?.address}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(link.flatId?.monthlyRent ?? 0)}
                    <span className="text-xs font-normal text-gray-400 ml-1">
                      / month
                    </span>
                  </p>
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <Link
                      href={`/renter/dashboard?flatId=${link.flatId._id}`}
                      className="btn-primary text-xs inline-flex items-center gap-1.5 flex-1 justify-center"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay Rent
                    </Link>
                    <Link
                      href="/renter/payments"
                      className="btn-secondary text-xs flex-1 text-center"
                    >
                      History
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card flex items-center gap-5 py-6">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">No flats linked yet</p>
              <p className="text-sm text-gray-500">
                Enter an invite code from your landlord to link a flat and pay
                rent online.
              </p>
            </div>
            <Link
              href="/renter/dashboard"
              className="btn-primary text-sm shrink-0 inline-flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Link Flat
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
