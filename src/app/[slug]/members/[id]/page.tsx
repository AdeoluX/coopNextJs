"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Types
interface Member {
  _id: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  dob?: string;
}

interface MemberStats {
  totalBalance: number;
  contributionBalance: number;
  assetBalance: number;
  totalContributions: number;
  contributionCount: number;
  lastContributionDate?: string;
  totalTransactions: number;
}

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchMemberData();
  }, [token, isClient, resolvedParams.id]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      // Fetch member details
      const memberRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/admin/members/${resolvedParams.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!memberRes.ok) throw new Error("Failed to fetch member");
      const memberData: { data: Member } = await memberRes.json();
      setMember(memberData.data);

      // Fetch member stats
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/admin/members/${resolvedParams.id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsRes.ok) {
        const statsData: { data: MemberStats } = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
            Please sign in to view member details.
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <p className="text-gray-700">Loading member details...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member not found</h1>
          <p className="text-gray-600 mt-2">
            {error || "The requested member could not be found."}
          </p>
          <Link
            href={`/${resolvedParams.slug}/members`}
            className="inline-block mt-4 px-4 py-2 bg-[--color-lemon-600] text-gray-900 rounded-lg"
          >
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-10 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">ValidCoop</h2>
          <p className="text-sm text-gray-500">Cooperative Management</p>
        </div>

        <nav className="mt-6">
          <div className="px-4 space-y-2">
            <Link
              href={`/${resolvedParams.slug}/dashboard`}
              className={
                pathname === `/${resolvedParams.slug}/dashboard`
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                />
              </svg>
              Dashboard
            </Link>

            <Link
              href={`/${resolvedParams.slug}/members`}
              className={
                pathname?.startsWith(`/${resolvedParams.slug}/members`)
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Members
            </Link>

            <Link
              href={`/${resolvedParams.slug}/loans`}
              className={
                pathname?.startsWith(`/${resolvedParams.slug}/loans`)
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Loans
            </Link>

            <Link
              href={`/${resolvedParams.slug}/assets`}
              className={
                pathname?.startsWith(`/${resolvedParams.slug}/assets`)
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Assets
            </Link>

            <Link
              href={`/${resolvedParams.slug}/transactions`}
              className={
                pathname?.startsWith(`/${resolvedParams.slug}/transactions`)
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Transactions
            </Link>

            <Link
              href={`/${resolvedParams.slug}/reports`}
              className={
                pathname?.startsWith(`/${resolvedParams.slug}/reports`)
                  ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                  : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              }
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Reports
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("vc_access_token");
              localStorage.removeItem("vc_refresh_token");
              localStorage.removeItem("vc_org_id");
              window.location.href = `/${resolvedParams.slug}`;
            }}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <Link
            href={`/${resolvedParams.slug}/members`}
            className="inline-flex items-center text-[--color-lemon-600] hover:text-[--color-lemon-700] mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Members
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {member.firstname} {member.middlename} {member.lastname}
          </h1>
          <p className="text-gray-600">Member Details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {member.firstname}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {member.lastname}
                  </p>
                </div>
                {member.middlename && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Middle Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {member.middlename}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{member.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{member.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {member.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Stats */}
          <div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Financial Summary
              </h2>
              {stats ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Balance
                    </label>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      ₦{stats.totalBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Contribution Balance
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ₦{stats.contributionBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Asset Balance
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ₦{stats.assetBalance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Contributions
                    </label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      ₦{stats.totalContributions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Contribution Count
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {stats.contributionCount}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Transactions
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {stats.totalTransactions}
                    </p>
                  </div>
                  {stats.lastContributionDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Last Contribution
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(
                          stats.lastContributionDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No financial data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex space-x-4">
          <button className="px-4 py-2 bg-[--color-lemon-600] text-gray-900 rounded-lg hover:bg-[--color-lemon-700] transition-colors">
            Edit Member
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            View Transactions
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View Loans
          </button>
        </div>
      </div>
    </div>
  );
}
