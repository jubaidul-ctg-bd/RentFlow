"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  CreditCard,
  KeyRound,
  Lock,
  MapPin,
  Plus,
} from "lucide-react";
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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [linkCode, setLinkCode] = useState("");
  const [selectedFlatId, setSelectedFlatId] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);

  const { data: flatLinks = [], isLoading } = useQuery<FlatLink[]>({
    queryKey: ["renter-flats"],
    queryFn: () =>
      api
        .get("/renters/my-flats")
        .then((r) => {
          const d = r.data;
          return Array.isArray(d) ? (d as FlatLink[]) : [];
        })
        .catch(() => []),
  });

  const activeFlat =
    flatLinks.find((link) => link.flatId?._id === selectedFlatId)?.flatId ??
    flatLinks[0]?.flatId ??
    null;
  const hasLinkedFlats = flatLinks.length > 0;

  const linkMutation = useMutation({
    mutationFn: () => api.post("/renters/link", { inviteCode: linkCode }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["renter-flats"] });
      const linkedFlatId =
        typeof res?.data?.flatId === "string"
          ? res.data.flatId
          : typeof res?.data?.flatId?._id === "string"
            ? res.data.flatId._id
            : "";
      if (linkedFlatId) setSelectedFlatId(linkedFlatId);
      toast.success("Flat linked successfully!");
      setLinkCode("");
      setShowLinkForm(false);
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Invalid invite code"));
    },
  });

  const payMutation = useMutation({
    mutationFn: () => {
      if (!activeFlat?._id) throw new Error("Please select a flat first");
      return api.post("/payments/initiate", {
        flatId: activeFlat._id,
        month: selectedMonth,
      });
    },
    onSuccess: (res) => {
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

  useEffect(() => {
    const flatIdFromUrl = searchParams.get("flatId");
    if (flatIdFromUrl) {
      setSelectedFlatId(flatIdFromUrl);
      return;
    }

    if (!selectedFlatId && flatLinks.length > 0 && flatLinks[0].flatId?._id) {
      setSelectedFlatId(flatLinks[0].flatId._id);
    }
  }, [flatLinks, searchParams, selectedFlatId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Rented Flats</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, {user?.email}
          </p>
        </div>
        <button
          onClick={() => setShowLinkForm((v) => !v)}
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Link a Flat
        </button>
      </div>

      {/* Link flat form — shown when button toggled or no flats yet */}
      {(!hasLinkedFlats || showLinkForm) && (
        <div className="card mb-6 border border-primary-100 bg-primary-50/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {hasLinkedFlats ? "Link Another Flat" : "Link Your First Flat"}
              </p>
              <p className="text-xs text-gray-500">
                Enter the invite code provided by your landlord
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
              placeholder="FLAT-XXXXXXXX"
              className="input-field flex-1 font-mono tracking-widest uppercase"
              maxLength={13}
              onKeyDown={(e) => {
                if (e.key === "Enter" && linkCode && !linkMutation.isPending)
                  linkMutation.mutate();
              }}
            />
            <button
              onClick={() => linkMutation.mutate()}
              disabled={!linkCode || linkMutation.isPending}
              className="btn-primary min-w-[80px]"
            >
              {linkMutation.isPending ? "Linking…" : "Link"}
            </button>
            {hasLinkedFlats && (
              <button
                onClick={() => {
                  setShowLinkForm(false);
                  setLinkCode("");
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* No flats state */}
      {!hasLinkedFlats && (
        <div className="card text-center py-14 border-2 border-dashed border-gray-200">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 mb-1">
            No flats linked yet
          </p>
          <p className="text-sm text-gray-400">
            Ask your landlord for an invite code and enter it above to get
            started.
          </p>
        </div>
      )}

      {/* Linked flat cards */}
      {hasLinkedFlats && (
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Linked Flats — {flatLinks.length}
          </h2>
          {flatLinks.map((link) => {
            const flat = link.flatId;
            const isActive = flat._id === activeFlat?._id;
            return (
              <button
                key={link._id}
                onClick={() => setSelectedFlatId(flat._id)}
                className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all focus:outline-none ${
                  isActive
                    ? "border-primary-500 bg-primary-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-primary-100" : "bg-gray-100"
                      }`}
                    >
                      <Building2
                        className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-400"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`font-semibold truncate ${isActive ? "text-primary-700" : "text-gray-800"}`}
                      >
                        {flat.name}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {flat.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`font-bold text-base ${isActive ? "text-primary-600" : "text-gray-700"}`}
                    >
                      {formatCurrency(flat.monthlyRent)}
                    </p>
                    <p className="text-xs text-gray-400">/ month</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pay rent panel — shown only when a flat is selected */}
      {activeFlat && (
        <div className="card border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-500" />
            Pay Rent
            <span className="ml-auto text-xs font-normal text-gray-400">
              {activeFlat.name}
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-field w-full"
                max={currentMonth}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="input-field bg-gray-50 text-gray-600 cursor-default select-none">
                {formatCurrency(activeFlat.monthlyRent)}
              </div>
            </div>
            <button
              onClick={() => payMutation.mutate()}
              disabled={payMutation.isPending}
              className="btn-primary px-8 sm:mb-0 shrink-0"
            >
              {payMutation.isPending ? "Processing…" : "Pay Now →"}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs text-gray-400">
              Secured by Stripe. Your card details are never stored on our
              servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
