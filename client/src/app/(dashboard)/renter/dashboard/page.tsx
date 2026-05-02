"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Home } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatCurrency, parseApiError } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface FlatLink {
  _id: string;
  isActive: boolean;
  flatId: {
    _id: string;
    name: string;
    address: string;
    monthlyRent: number;
    ownerId: string;
  };
}

export default function RenterDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [linkCode, setLinkCode] = useState("");

  const { data: flatLink, isLoading } = useQuery<FlatLink | null>({
    queryKey: ["renter-flat"],
    queryFn: () =>
      api
        .get("/renters/my-flat")
        .then((r) => {
          const d = r.data;
          // Guard against NestJS error bodies (e.g. {message, error, statusCode})
          // that Axios would not throw on if somehow returned with 2xx status
          return d && typeof d === "object" && "flatId" in d
            ? (d as FlatLink)
            : null;
        })
        .catch(() => null),
  });

  const linkMutation = useMutation({
    mutationFn: () => api.post("/renters/link", { inviteCode: linkCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renter-flat"] });
      toast.success("Successfully linked to flat!");
      setLinkCode("");
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Invalid invite code"));
    },
  });

  const payMutation = useMutation({
    mutationFn: () => api.post("/payments/initiate", { month: selectedMonth }),
    onSuccess: (res) => {
      // Redirect to Stripe Checkout — Stripe hosts the card form
      const url = typeof res?.data?.url === "string" ? res.data.url : null;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Payment setup failed — please try again");
      }
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Payment failed"));
    },
  });

  // Only treat as a valid link if it has a populated flatId object
  const validLink =
    flatLink && typeof flatLink === "object" && "flatId" in flatLink
      ? (flatLink as FlatLink)
      : null;

  if (isLoading)
    return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Renter Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
      </div>

      {!validLink?.flatId?._id ? (
        <div className="card max-w-md">
          <Home className="w-10 h-10 text-primary-500 mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Link Your Flat
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Enter the invite code provided by your landlord to link your flat.
          </p>
          <div className="flex gap-3">
            <input
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
              placeholder="FLAT-XXXXXXXX"
              className="input-field flex-1 font-mono tracking-widest"
              maxLength={13}
            />
            <button
              onClick={() => linkMutation.mutate()}
              disabled={!linkCode || linkMutation.isPending}
              className="btn-primary"
            >
              {linkMutation.isPending ? "…" : "Link"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Flat info */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {validLink.flatId?.name}
                </h2>
                <p className="text-gray-500 text-sm">
                  {validLink.flatId?.address}
                </p>
                <p className="text-primary-600 font-semibold mt-1">
                  {formatCurrency(validLink.flatId?.monthlyRent ?? 0)}/month
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Pay rent */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-500" />
              Pay Rent
            </h2>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input-field"
                  max={currentMonth}
                />
              </div>
              <div className="pt-5">
                <button
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                  className="btn-primary px-8"
                >
                  {payMutation.isPending
                    ? "Processing…"
                    : `Pay ${formatCurrency(validLink.flatId?.monthlyRent ?? 0)}`}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Secured by Stripe. Your card details are never stored on our
              servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
