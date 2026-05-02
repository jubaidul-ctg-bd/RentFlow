"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowDownToLine } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, parseApiError } from "@/lib/utils";

interface WalletData {
  balance: number;
  transactions: Array<{
    _id: string;
    type: "credit" | "withdrawal";
    amount: number;
    status: string;
    createdAt: string;
  }>;
  total: number;
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const { data: wallet, isLoading } = useQuery<WalletData | null>({
    queryKey: ["wallet"],
    queryFn: () =>
      api
        .get("/wallet")
        .then((r) =>
          r.data && typeof r.data === "object" && "balance" in r.data
            ? (r.data as WalletData)
            : null,
        )
        .catch(() => null),
  });

  const withdrawMutation = useMutation({
    mutationFn: () =>
      api.post("/wallet/withdraw", {
        amount: Number(withdrawForm.amount),
        bankDetails: {
          accountName: withdrawForm.accountName,
          accountNumber: withdrawForm.accountNumber,
          bankName: withdrawForm.bankName,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Withdrawal request submitted!");
      setShowWithdrawForm(false);
      setWithdrawForm({
        amount: "",
        accountName: "",
        accountNumber: "",
        bankName: "",
      });
    },
    onError: (err: unknown) => {
      toast.error(parseApiError(err, "Withdrawal failed"));
    },
  });

  if (isLoading)
    return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wallet</h1>

      {/* Balance card */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-6 h-6 opacity-80" />
          <span className="text-sm opacity-80">Available Balance</span>
        </div>
        <p className="text-4xl font-bold">
          {formatCurrency(wallet?.balance ?? 0)}
        </p>
        <button
          onClick={() => setShowWithdrawForm(true)}
          className="mt-4 bg-white text-primary-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-50 flex items-center gap-2"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Request Withdrawal
        </button>
      </div>

      {/* Withdrawal form */}
      {showWithdrawForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Withdrawal Request
          </h2>
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Amount (USD)"
              value={withdrawForm.amount}
              onChange={(e) =>
                setWithdrawForm((p) => ({ ...p, amount: e.target.value }))
              }
              className="input-field"
              min="1"
              max={wallet?.balance}
            />
            <input
              placeholder="Account holder name"
              value={withdrawForm.accountName}
              onChange={(e) =>
                setWithdrawForm((p) => ({ ...p, accountName: e.target.value }))
              }
              className="input-field"
            />
            <input
              placeholder="Bank name"
              value={withdrawForm.bankName}
              onChange={(e) =>
                setWithdrawForm((p) => ({ ...p, bankName: e.target.value }))
              }
              className="input-field"
            />
            <input
              placeholder="Account number"
              value={withdrawForm.accountNumber}
              onChange={(e) =>
                setWithdrawForm((p) => ({
                  ...p,
                  accountNumber: e.target.value,
                }))
              }
              className="input-field"
            />
            <div className="flex gap-3">
              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
                className="btn-primary flex-1"
              >
                {withdrawMutation.isPending ? "Submitting…" : "Submit Request"}
              </button>
              <button
                onClick={() => setShowWithdrawForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">
          Transaction History
        </h2>
        {!wallet?.transactions?.length ? (
          <p className="text-gray-500 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {wallet.transactions?.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between py-3 border-b border-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {tx.type}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <span
                  className={`font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}
                >
                  {tx.type === "credit" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
