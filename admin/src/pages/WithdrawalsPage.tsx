import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";

const PAGE_SIZE = 10;

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  requestedAt: string;
  createdAt: string;
  ownerId: { firstName: string; lastName: string; email: string } | null;
  bankDetails: { accountName: string; bankName: string };
}

export default function WithdrawalsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ data: Withdrawal[]; total: number }>({
    queryKey: ["admin-withdrawals", page],
    queryFn: () =>
      api
        .get(`/admin/withdrawals?page=${page}&limit=${PAGE_SIZE}`)
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  const processMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.post(`/admin/withdrawals/${id}/process`, { approve }),
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      toast.success(approve ? "Withdrawal approved!" : "Withdrawal rejected");
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Withdrawal Requests
      </h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : !data?.data.length ? (
        <div className="card text-center py-12 text-gray-500">
          No pending withdrawal requests.
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((wr) => (
            <div key={wr._id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(wr.amount)}
                  </p>
                  {wr.ownerId && (
                    <p className="text-sm text-gray-600">
                      {wr.ownerId.firstName} {wr.ownerId.lastName} —{" "}
                      {wr.ownerId.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Bank: {wr.bankDetails.bankName} ·{" "}
                    {wr.bankDetails.accountName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Requested: {formatDate(wr.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      processMutation.mutate({ id: wr._id, approve: true })
                    }
                    disabled={processMutation.isPending}
                    className="flex items-center gap-1 btn-primary text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      processMutation.mutate({ id: wr._id, approve: false })
                    }
                    disabled={processMutation.isPending}
                    className="flex items-center gap-1 btn-danger text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} &middot; {data?.total ?? 0} total
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                    acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 py-1 text-xs text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`min-w-[28px] h-7 rounded border text-xs font-medium transition-colors ${
                        page === p
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
