import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/utils";

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api.get("/admin/reports").then((r) => r.data),
  });

  if (isLoading)
    return <div className="text-center py-12 text-gray-400">Loading…</div>;

  const summaryCards = [
    {
      label: "All-Time Gross Revenue",
      value: formatCurrency(reports?.revenue.allTime.gross ?? 0),
    },
    {
      label: "Net to Owners",
      value: formatCurrency(reports?.revenue.allTime.net ?? 0),
    },
    {
      label: "Platform Fees",
      value: formatCurrency(reports?.revenue.allTime.fees ?? 0),
    },
    { label: "Monthly Payments", value: reports?.revenue.monthly.count ?? 0 },
  ];

  // Placeholder chart data — in production this would come from a dedicated /admin/reports/chart endpoint
  const chartData = [
    { month: "Jan", gross: 4200, fees: 105 },
    { month: "Feb", gross: 5800, fees: 145 },
    { month: "Mar", gross: 7200, fees: 180 },
    { month: "Apr", gross: 6100, fees: 152 },
    { month: "May", gross: 8400, fees: 210 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Reports & Analytics
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value }) => (
          <div key={label} className="stat-card">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">
          Revenue Trend (Monthly)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="gross"
              name="Gross Revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fees"
              name="Platform Fees"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
