import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";

type StatusFilter = "pending" | "approved" | "rejected" | "inactive";

interface Flat {
  _id: string;
  name: string;
  address: string;
  monthlyRent: number;
  status: string;
  createdAt: string;
  ownerId: { firstName: string; lastName: string; email: string } | null;
  rejectionReason?: string;
}

interface FlatsResponse {
  data: Flat[];
  total: number;
}

export default function FlatsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<FlatsResponse>({
    queryKey: ["admin-flats", filter],
    queryFn: () => api.get(`/admin/flats?status=${filter}`).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/admin/flats/${id}`, { approve: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flats"] });
      toast.success("Flat approved!");
    },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/admin/flats/${id}`, { approve: false, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flats"] });
      toast.success("Flat rejected");
      setRejectingId(null);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject"),
  });

  const tabs: StatusFilter[] = ["pending", "approved", "rejected", "inactive"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Flat Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === tab
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : !data?.data.length ? (
        <div className="card text-center py-12 text-gray-500">
          No {filter} flats.
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((flat) => (
            <div key={flat._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{flat.name}</h2>
                  <p className="text-sm text-gray-500">{flat.address}</p>
                  <p className="text-sm font-medium text-primary-600 mt-1">
                    {formatCurrency(flat.monthlyRent)}/mo
                  </p>
                  {flat.ownerId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Owner: {flat.ownerId.firstName} {flat.ownerId.lastName} (
                      {flat.ownerId.email})
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Submitted: {formatDate(flat.createdAt)}
                  </p>
                  {flat.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">
                      Reason: {flat.rejectionReason}
                    </p>
                  )}
                </div>

                {filter === "pending" && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => approveMutation.mutate(flat._id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1 btn-primary text-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(flat._id)}
                      className="flex items-center gap-1 btn-danger text-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Rejection form */}
              {rejectingId === flat._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <input
                    placeholder="Reason for rejection…"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="input-field mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        rejectMutation.mutate({
                          id: flat._id,
                          reason: rejectReason,
                        })
                      }
                      disabled={!rejectReason || rejectMutation.isPending}
                      className="btn-danger"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => setRejectingId(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
