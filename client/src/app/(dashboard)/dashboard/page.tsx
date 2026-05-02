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

  const { data: flatLink } = useQuery<FlatLink | null>({
    queryKey: ["renter-flat"],
    queryFn: () =>
      api
        .get("/renters/my-flat")
        .then((r) => {
          const d = r.data;
          return d && typeof d === "object" && "flatId" in d
            ? (d as FlatLink)
            : null;
        })
        .catch(() => null),
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
  // Only truthy if the link has a real populated flatId
  const linkedFlat = flatLink?.flatId?._id ? flatLink : null;

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
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-primary-600" />
          Renter
        </h2>
        {linkedFlat ? (
          <div className="card">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900">
                {linkedFlat.flatId?.name}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Linked
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {linkedFlat.flatId?.address}
            </p>
            <p className="text-xl font-bold text-gray-900 mb-4">
              {formatCurrency(linkedFlat.flatId?.monthlyRent ?? 0)}
              <span className="text-sm font-normal text-gray-500">
                {" "}
                / month
              </span>
            </p>
            <div className="flex gap-3">
              <Link
                href="/renter/dashboard"
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay Rent
              </Link>
              <Link href="/renter/payments" className="btn-secondary text-sm">
                Payment History
              </Link>
            </div>
          </div>
        ) : (
          <div className="card flex items-center gap-5 py-6">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <KeyRound className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Link your flat</p>
              <p className="text-sm text-gray-500">
                Enter the invite code from your landlord to pay rent online.
              </p>
            </div>
            <Link
              href="/renter/dashboard"
              className="btn-primary text-sm shrink-0"
            >
              Enter Code
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
