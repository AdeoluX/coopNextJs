"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type DateRangeKey = "7d" | "30d" | "90d" | "1y";

export default function ReportsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [dateRange, setDateRange] = useState<DateRangeKey>("30d");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [cooperativeStats, setCooperativeStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem("vc_access_token"));
  }, []);

  useEffect(() => {
    if (token && isClient) {
      fetchAnalytics();
      fetchCooperativeStats();
    }
  }, [token, isClient, dateRange]);

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${apiBase}/api/v1/admin/analytics?dateRange=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data || data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCooperativeStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${apiBase}/api/v1/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCooperativeStats(data.data || data);
      }
    } catch (error) {
      console.error("Failed to fetch cooperative stats:", error);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

  // Chart data preparation using actual API response structure
  const getTransactionTrendData = () => {
    if (!analytics?.trends?.daily) return null;

    const dailyTrends = analytics.trends.daily;
    const dates = Object.keys(dailyTrends).sort();

    return {
      labels: dates.map((date) => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: "Transaction Count",
          data: dates.map((date) => dailyTrends[date].count),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
        },
        {
          label: "Transaction Amount",
          data: dates.map((date) => dailyTrends[date].amount),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
          yAxisID: "y1",
        },
      ],
    };
  };

  const getTransactionTypesData = () => {
    if (!analytics?.transactions?.types) return null;

    const types = analytics.transactions.types;
    return {
      labels: Object.keys(types).map(
        (type) => type.charAt(0).toUpperCase() + type.slice(1)
      ),
      datasets: [
        {
          data: Object.values(types),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const getWalletDistributionData = () => {
    if (!analytics?.wallets) return null;

    const wallets = analytics.wallets;
    const walletsWithBalance = wallets.walletsWithBalance || 0;
    const walletsWithoutBalance = wallets.total - walletsWithBalance;

    return {
      labels: ["With Balance", "Without Balance"],
      datasets: [
        {
          data: [walletsWithBalance, walletsWithoutBalance],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(156, 163, 175, 0.8)",
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const download = async (path: string, filename: string) => {
    if (!token) return;
    try {
      setDownloading(filename);
      const res = await fetch(`${apiBase}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            {analytics?.period && (
              <p className="text-sm text-gray-600 mt-1">
                Period:{" "}
                {new Date(analytics.period.startDate).toLocaleDateString()} -{" "}
                {new Date(analytics.period.endDate).toLocaleDateString()} (
                {analytics.period.range})
              </p>
            )}
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Analytics Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Analytics Dashboard
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading analytics...</span>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Members
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.overview?.totalMembers || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.overview?.totalTransactions || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Balance
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        ₦
                        {analytics?.overview?.totalBalance?.toLocaleString() ||
                          0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        Success Rate
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.overview?.successRate || "0.00"}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Transaction Trends Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Daily Transaction Trends
                  </h3>
                  {getTransactionTrendData() ? (
                    <Line
                      data={getTransactionTrendData()!}
                      options={chartOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No transaction trend data available
                    </div>
                  )}
                </div>

                {/* Transaction Types Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Transaction Types
                  </h3>
                  {getTransactionTypesData() ? (
                    <Doughnut
                      data={getTransactionTypesData()!}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No transaction type data available
                    </div>
                  )}
                </div>

                {/* Wallet Distribution Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Wallet Distribution
                  </h3>
                  {getWalletDistributionData() ? (
                    <Doughnut
                      data={getWalletDistributionData()!}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      No wallet data available
                    </div>
                  )}
                </div>

                {/* Detailed Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Detailed Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Members</span>
                      <span className="font-semibold">
                        {analytics?.members?.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New This Period</span>
                      <span className="font-semibold">
                        {analytics?.members?.newThisPeriod || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Successful Transactions
                      </span>
                      <span className="font-semibold text-green-600">
                        {analytics?.transactions?.successful || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Pending Transactions
                      </span>
                      <span className="font-semibold text-yellow-600">
                        {analytics?.transactions?.pending || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Failed Transactions</span>
                      <span className="font-semibold text-red-600">
                        {analytics?.transactions?.failed || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Transaction</span>
                      <span className="font-semibold">
                        ₦
                        {analytics?.transactions?.averageAmount?.toLocaleString() ||
                          0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Wallets</span>
                      <span className="font-semibold">
                        {analytics?.wallets?.total || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Export Reports Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Export Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              disabled={!!downloading}
              onClick={() =>
                download(
                  `/api/v1/reports/financial/profit-loss/export?dateRange=${dateRange}`,
                  `profit_loss_${dateRange}.csv`
                )
              }
              className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Profit & Loss (CSV)</div>
              <div className="text-sm text-gray-600">
                Download P&L for selected range.
              </div>
            </button>
            <button
              disabled={!!downloading}
              onClick={() =>
                download(
                  `/api/v1/reports/financial/balance-sheet/export?dateRange=${dateRange}`,
                  `balance_sheet_${dateRange}.csv`
                )
              }
              className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Balance Sheet (CSV)</div>
              <div className="text-sm text-gray-600">
                Assets, liabilities, equity.
              </div>
            </button>
            <button
              disabled={!!downloading}
              onClick={() =>
                download(
                  `/api/v1/reports/financial/cash-flow/export?dateRange=${dateRange}`,
                  `cash_flow_${dateRange}.csv`
                )
              }
              className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Cash Flow (CSV)</div>
              <div className="text-sm text-gray-600">Inflows and outflows.</div>
            </button>
            <button
              disabled={!!downloading}
              onClick={() =>
                download(
                  `/api/v1/reports/loan/portfolio/export?dateRange=${dateRange}`,
                  `loan_portfolio_${dateRange}.csv`
                )
              }
              className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">Loan Portfolio (CSV)</div>
              <div className="text-sm text-gray-600">
                Totals and outstanding.
              </div>
            </button>
            <button
              disabled={!!downloading}
              onClick={() =>
                download(
                  `/api/v1/reports/asset/performance/export?dateRange=${dateRange}`,
                  `asset_performance_${dateRange}.csv`
                )
              }
              className="bg-white rounded-xl shadow p-6 text-left hover:shadow-md transition"
            >
              <div className="text-lg font-semibold">
                Asset Performance (CSV)
              </div>
              <div className="text-sm text-gray-600">
                Investments and units.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
