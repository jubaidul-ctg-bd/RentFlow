"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  _id: string;
  month: string;
  amount: number;
  serviceFee: number;
  status: string;
  stripePaymentIntentId: string;
  paidAt: string;
  flatId: { name: string; address: string };
}

export default function PaymentHistoryPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get("success") !== "1") return;

    const sessionId = searchParams.get("session_id");
    const month = searchParams.get("month");

    const verify = async () => {
      if (sessionId) {
        try {
          await api.get(`/payments/verify-session?session_id=${sessionId}`);
        } catch {
          // best-effort — payment may already be marked paid
        }
      }
      toast.success(
        month ? `Rent for ${month} paid successfully!` : "Payment successful!",
      );
      queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      window.history.replaceState({}, "", "/renter/payments");
    };

    void verify();
  }, [searchParams, queryClient]);
  const { data, isLoading } = useQuery<{ data: Payment[]; total: number }>({
    queryKey: ["payment-history"],
    queryFn: () =>
      api
        .get("/payments/history")
        .then((r) => {
          const d = r.data;
          return d && Array.isArray(d.data)
            ? (d as { data: Payment[]; total: number })
            : { data: [] as Payment[], total: 0 };
        })
        .catch(() => ({ data: [] as Payment[], total: 0 })),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment History</h1>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : !data?.data.length ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            No payments yet. Pay your first rent to see history here.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Month</th>
                  <th className="pb-3 font-medium">Flat</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((payment) => (
                  <tr key={payment._id}>
                    <td className="py-3 font-medium">{payment.month}</td>
                    <td className="py-3 text-gray-600">
                      {payment.flatId?.name ?? "—"}
                    </td>
                    <td className="py-3 font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : payment.status === "failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </td>
                    <td className="py-3">
                      <code className="text-xs text-gray-400 truncate max-w-[120px] block">
                        {payment.stripePaymentIntentId.slice(0, 16)}…
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Total: {data.total} payments
          </p>
        </div>
      )}
    </div>
  );
}
