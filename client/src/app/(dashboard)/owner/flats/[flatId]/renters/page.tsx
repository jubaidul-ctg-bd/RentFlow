"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { parseApiError } from "@/lib/utils";

interface Renter {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface RenterLink {
  _id: string;
  renterId: Renter;
  isActive: boolean;
  createdAt: string;
}

export default function FlatRentersPage() {
  const { flatId } = useParams<{ flatId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: renters = [], isLoading } = useQuery<RenterLink[]>({
    queryKey: ["flat-renters", flatId],
    queryFn: () =>
      api
        .get(`/renters/flats/${flatId}/renters`)
        .then((r) => (Array.isArray(r.data) ? (r.data as RenterLink[]) : []))
        .catch(() => []),
    enabled: !!flatId,
  });

  const revokeMutation = useMutation({
    mutationFn: (renterId: string) =>
      api.delete(`/renters/flats/${flatId}/renters/${renterId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flat-renters", flatId] });
      toast.success("Renter removed successfully");
    },
    onError: (err) =>
      toast.error(parseApiError(err, "Failed to remove renter")),
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Renters</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : renters.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No active renters for this flat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {renters.map((link) => {
            const r = link.renterId;
            return (
              <div
                key={link._id}
                className="card flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.firstName} {r.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{r.email}</p>
                  {r.phone && (
                    <p className="text-sm text-gray-400">{r.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Linked since{" "}
                    {new Date(link.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => revokeMutation.mutate(r._id)}
                  disabled={revokeMutation.isPending}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
