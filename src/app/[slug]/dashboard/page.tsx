"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

async function fetchSummary(apiBase: string, token: string) {
  const res = await fetch(`${apiBase}/api/v1/reports/dashboard/summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load dashboard summary");
  const json = await res.json();
  return json?.data || json;
}

export default function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [summary, setSummary] = useState<{
    totalMembers: number;
    totalAssets: number;
    totalLoans: number;
    totalTransactions: number;
    memberCount?: number;
    members?: { active: number };
    walletBalance?: number;
    wallet?: { balance: number };
    loansOutstanding?: number;
    loans?: { outstanding: number };
    assetValue?: number;
    assets?: { value: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client flag and get token from localStorage
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
    if (!token || !isClient) return;
    fetchSummary(apiBase, token)
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, [token, isClient]);

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <p className="text-gray-700">Loading dashboard...</p>
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
            Please sign in to view your dashboard.
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
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your cooperative performance
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Active Members</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary?.memberCount ?? summary?.members?.active ?? "--"}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Wallet Balance</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary?.walletBalance ?? summary?.wallet?.balance ?? "--"}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Loans Outstanding</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary?.loansOutstanding ?? summary?.loans?.outstanding ?? "--"}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Assets Value</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary?.assetValue ?? summary?.assets?.value ?? "--"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contribution Trends</h2>
            <div className="text-sm text-gray-500">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
