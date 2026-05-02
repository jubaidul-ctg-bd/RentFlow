import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/utils";

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

  const { data, isLoading } = useQuery<{ data: Withdrawal[]; total: number }>({
    queryKey: ["admin-withdrawals"],
    queryFn: () => api.get("/admin/withdrawals").then((r) => r.data),
  });

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
          {data.data.map((wr) => (
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
        </div>
      )}
    </div>
  );
}
