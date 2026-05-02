import { useQuery } from "@tanstack/react-query";
import { Users, Building2, DollarSign, Clock } from "lucide-react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";

interface ReportData {
  users: { total: number };
  revenue: {
    allTime: { gross: number; fees: number; net: number };
    monthly: { gross: number; count: number };
    daily: { gross: number; count: number };
  };
  payments: { total: number };
  pendingFlats: number;
  pendingWithdrawals: number;
}

export default function Dashboard() {
  const { data: reports, isLoading } = useQuery<ReportData>({
    queryKey: ["admin-reports"],
    queryFn: () => api.get("/admin/reports").then((r) => r.data),
  });

  if (isLoading)
    return <div className="text-center py-12 text-gray-400">Loading…</div>;

  const stats = [
    {
      label: "Total Users",
      value: reports?.users.total ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "All-Time Revenue (Gross)",
      value: formatCurrency(reports?.revenue.allTime.gross ?? 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Platform Fees Collected",
      value: formatCurrency(reports?.revenue.allTime.fees ?? 0),
      icon: DollarSign,
      color: "text-primary-600",
      bg: "bg-primary-50",
    },
    {
      label: "Pending Flat Approvals",
      value: reports?.pendingFlats ?? 0,
      icon: Building2,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(reports?.revenue.monthly.gross ?? 0),
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Pending Withdrawals",
      value: reports?.pendingWithdrawals ?? 0,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Platform Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">
            Today&apos;s Activity
          </h2>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(reports?.revenue.daily.gross ?? 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {reports?.revenue.daily.count ?? 0} payments
          </p>
        </div>
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">This Month</h2>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(reports?.revenue.monthly.gross ?? 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {reports?.revenue.monthly.count ?? 0} payments
          </p>
        </div>
      </div>
    </div>
  );
}
