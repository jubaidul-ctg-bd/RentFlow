import { useState } from "react";
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

const RANGE_OPTIONS = [
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
];

export default function ReportsPage() {
  const [months, setMonths] = useState(6);

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api.get("/admin/reports").then((r) => r.data),
  });

  const { data: chartData = [], isLoading: chartLoading } = useQuery<
    { month: string; gross: number; fees: number; net: number }[]
  >({
    queryKey: ["admin-reports-chart", months],
    queryFn: () =>
      api
        .get(`/admin/reports/chart?months=${months}`)
        .then((r) => (Array.isArray(r.data) ? r.data : [])),
  });

  if (reportsLoading)
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
      label: "Platform Fees Collected",
      value: formatCurrency(reports?.revenue.allTime.fees ?? 0),
    },
    {
      label: "This Month Payments",
      value: reports?.revenue.monthly.count ?? 0,
    },
  ];

  const allZero = chartData.every((d) => d.gross === 0 && d.fees === 0);

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
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMonths(opt.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  months === opt.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Loading chart…
          </div>
        ) : allZero ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
            <p className="font-medium text-gray-500 mb-1">
              No payment data yet
            </p>
            <p className="text-sm">
              Revenue will appear here once payments are processed.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                }
                width={60}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name,
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend iconType="circle" iconSize={8} />
              <Line
                type="monotone"
                dataKey="gross"
                name="Gross Revenue"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net to Owners"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="fees"
                name="Platform Fees"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
