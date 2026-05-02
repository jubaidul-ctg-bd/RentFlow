"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Building2, Wallet, Users, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Flat {
  _id: string;
  name: string;
  address: string;
  monthlyRent: number;
  status: string;
  inviteCode?: string;
}

export default function OwnerDashboard() {
  const { user } = useAuth();

  const { data: flats = [] } = useQuery<Flat[]>({
    queryKey: ["owner-flats"],
    queryFn: () =>
      api
        .get("/flats")
        .then((r) => (Array.isArray(r.data) ? (r.data as Flat[]) : []))
        .catch(() => []),
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
  });

  const safeFlats = Array.isArray(flats) ? flats : [];
  const approvedFlats = safeFlats.filter(
    (f: { status: string }) => f.status === "approved",
  );
  const pendingFlats = safeFlats.filter(
    (f: { status: string }) => f.status === "pending",
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your property overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending Approval</span>
            <Users className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {pendingFlats.length}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/owner/flats/new"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Flat
          </Link>
          <Link
            href="/owner/wallet"
            className="btn-secondary flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            View Wallet
          </Link>
        </div>
      </div>

      {/* Flats list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Your Flats</h2>
        {safeFlats.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No flats yet. Add your first flat to get started.
            </p>
            <Link
              href="/owner/flats/new"
              className="btn-primary inline-block mt-4"
            >
              Add Flat
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {safeFlats.map(
              (flat: {
                _id: string;
                name: string;
                address: string;
                monthlyRent: number;
                status: string;
                inviteCode?: string;
              }) => (
                <div
                  key={flat._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{flat.name}</p>
                    <p className="text-sm text-gray-500">{flat.address}</p>
                    <p className="text-sm font-medium text-primary-600">
                      {formatCurrency(flat.monthlyRent)}/mo
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                        flat.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : flat.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : flat.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {flat.status.charAt(0).toUpperCase() +
                        flat.status.slice(1)}
                    </span>
                    {flat.inviteCode && (
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {flat.inviteCode}
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
