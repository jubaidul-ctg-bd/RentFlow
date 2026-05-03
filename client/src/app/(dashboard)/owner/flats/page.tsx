"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  Users,
  Trash2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface Flat {
  _id: string;
  name: string;
  address: string;
  monthlyRent: number;
  status: string;
  inviteCode?: string;
}

export default function FlatsPage() {
  const queryClient = useQueryClient();
  const [flatToRemove, setFlatToRemove] = useState<Flat | null>(null);

  const { data: flats = [], isLoading } = useQuery<Flat[]>({
    queryKey: ["owner-flats"],
    queryFn: () =>
      api
        .get("/flats")
        .then((r) => (Array.isArray(r.data) ? (r.data as Flat[]) : []))
        .catch(() => []),
  });

  const generateCodeMutation = useMutation({
    mutationFn: (flatId: string) => api.post(`/flats/${flatId}/invite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-flats"] });
      toast.success("New invite code generated!");
    },
    onError: () => toast.error("Failed to generate code"),
  });

  const removeMutation = useMutation({
    mutationFn: (flatId: string) => api.delete(`/flats/${flatId}`),
    onSuccess: (_, flatId) => {
      queryClient.setQueryData<Flat[]>(["owner-flats"], (prev = []) =>
        prev.filter((f) => f._id !== flatId),
      );
      setFlatToRemove(null);
      toast.success("Flat deleted.");
    },
    onError: () => toast.error("Failed to remove flat"),
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyCode(flatId: string, code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(flatId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Flats</h1>
        <Link
          href="/owner/flats/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Flat
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : flats.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No flats registered yet.</p>
          <Link href="/owner/flats/new" className="btn-primary inline-block">
            Add your first flat
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {flats.map((flat) => (
            <div key={flat._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {flat.name}
                  </h2>
                  <p className="text-gray-500 text-sm">{flat.address}</p>
                  <p className="text-primary-600 font-medium mt-1">
                    {formatCurrency(flat.monthlyRent)}/month
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      flat.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : flat.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : flat.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {flat.status.charAt(0).toUpperCase() + flat.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setFlatToRemove(flat)}
                    disabled={removeMutation.isPending}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Remove flat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {flat.status === "approved" && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
                  {flat.inviteCode ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        Invite Code:
                      </span>
                      <code className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-sm font-bold tracking-widest text-primary-700">
                        {flat.inviteCode}
                      </code>
                      <button
                        onClick={() => copyCode(flat._id, flat.inviteCode!)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        title="Copy invite code"
                      >
                        {copiedId === flat._id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">
                      No invite code yet
                    </span>
                  )}
                  <button
                    onClick={() => generateCodeMutation.mutate(flat._id)}
                    disabled={generateCodeMutation.isPending}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {flat.inviteCode ? "Regenerate" : "Generate Code"}
                  </button>
                  <Link
                    href={`/owner/flats/${flat._id}/renters`}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Users className="w-4 h-4" />
                    View Renters
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Remove confirmation modal */}
      {flatToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Delete Flat
              </h2>
            </div>
            <p className="text-gray-600 mb-1">
              Are you sure you want to remove{" "}
              <span className="font-medium text-gray-900">
                {flatToRemove.name}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              This will permanently delete the flat. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setFlatToRemove(null)}
                disabled={removeMutation.isPending}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => removeMutation.mutate(flatToRemove._id)}
                disabled={removeMutation.isPending}
                className="btn-danger"
              >
                {removeMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
