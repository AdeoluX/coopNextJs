"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSidebar from "@/components/MemberSidebar";

export default function MemberStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("vc_access_token");
    localStorage.removeItem("vc_refresh_token");
    localStorage.removeItem("vc_org_id");
    window.location.href = `/${resolvedParams.slug}`;
  };

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchStats();
  }, [token, isClient]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(`${apiBase}/api/v1/member/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStats(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            You are not signed in
          </h1>
          <p className="text-gray-600 mt-2">
            Please sign in to view your statistics.
          </p>
          <Link
            href={`/${resolvedParams.slug}`}
            className="inline-block mt-4 px-4 py-2 bg-[--color-lemon-600] text-gray-900 rounded-lg"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <MemberSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Statistics</h1>
          <p className="text-gray-600">
            View your performance metrics and activity statistics
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading statistics...</div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-sm text-gray-500">Total Transactions</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.totalTransactions || "0"}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-sm text-gray-500">Total Investment</div>
                <div className="text-3xl font-bold text-gray-900">
                  ₦{stats?.totalInvestment?.toLocaleString() || "0"}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-sm text-gray-500">Active Assets</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.activeAssets || "0"}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <div className="text-sm text-gray-500">Total Returns</div>
                <div className="text-3xl font-bold text-gray-900">
                  ₦{stats?.totalReturns?.toLocaleString() || "0"}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Investment Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return on Investment</span>
                    <span
                      className={`font-semibold ${
                        (stats?.roi || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(stats?.roi || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Transaction</span>
                    <span className="font-semibold text-gray-900">
                      ₦{stats?.averageTransaction?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Largest Investment</span>
                    <span className="font-semibold text-gray-900">
                      ₦{stats?.largestInvestment?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">
                      {stats?.thisMonthTransactions || "0"} transactions
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last 30 Days</span>
                    <span className="font-semibold text-gray-900">
                      ₦{stats?.last30DaysInvestment?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {stats?.memberSince
                        ? new Date(stats.memberSince).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Distribution */}
            {stats?.assetDistribution && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Asset Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.assetDistribution).map(
                    ([type, amount]: [string, any]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600 capitalize">
                          {type.replace("_", " ")}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[--color-lemon-600] h-2 rounded-full"
                              style={{
                                width: `${
                                  (amount / stats.totalInvestment) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900 w-20 text-right">
                            ₦{amount?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {stats?.recentActivity && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          activity.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {activity.amount >= 0 ? "+" : ""}₦
                        {activity.amount?.toLocaleString() || "0"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
