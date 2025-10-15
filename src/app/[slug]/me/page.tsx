"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import MemberSidebar from "@/components/MemberSidebar";
import Toast from "@/components/Toast";

export default function MemberDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [memberData, setMemberData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info" | "warning";
  } | null>(null);

  // Contribution modal state
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeEmail, setContributeEmail] = useState("");
  const [contributing, setContributing] = useState(false);

  // Asset purchase modal state
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetEmail, setAssetEmail] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  // Withdrawal request modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [requestingWithdrawal, setRequestingWithdrawal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchMemberData();
  }, [token, isClient]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      // Get current member's profile
      const response = await fetch(`${apiBase}/api/v1/member/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch member profile");
      }

      const data = await response.json();
      setMemberData(data.data || data);

      // Set email for forms if available
      if (data.data?.member?.email) {
        setContributeEmail(data.data.member.email);
        setAssetEmail(data.data.member.email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    if (!token) return;

    try {
      setLoadingAssets(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(
        `${apiBase}/api/v1/member/assets/available`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available assets");
      }

      const data = await response.json();
      setAvailableAssets(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !contributeAmount) return;

    try {
      setContributing(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(`${apiBase}/api/v1/member/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(contributeAmount),
          currency: "NGN",
          email: contributeEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to initiate contribution");
      }

      const data = await response.json();

      // Redirect to payment URL if provided (support multiple response shapes)
      const authUrl =
        data?.data?.authorization_url ||
        data?.authorization_url ||
        data?.data?.payment?.authorization_url ||
        data?.payment?.authorization_url;

      if (authUrl) {
        window.location.href = authUrl as string;
      } else {
        setError("Payment URL not received");
        setToast({ message: "Payment URL not received", type: "error" });
      }
    } catch (err: any) {
      setError(err.message);
      setToast({
        message: err.message || "Failed to initiate contribution",
        type: "error",
      });
    } finally {
      setContributing(false);
    }
  };

  const handleAssetPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedAsset || !assetQuantity) return;

    try {
      setPurchasing(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const totalAmount =
        parseFloat(assetQuantity) * (selectedAsset.settings?.pricePerUnit || 0);

      const response = await fetch(`${apiBase}/api/v1/member/assets/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: selectedAsset._id,
          quantity: parseFloat(assetQuantity),
          amount: totalAmount,
          currency: "NGN",
          email: assetEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to initiate asset purchase"
        );
      }

      const data = await response.json();

      // Redirect to payment URL if provided
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        setError("Payment URL not received");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !withdrawalAmount || !withdrawalReason) return;

    try {
      setRequestingWithdrawal(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(`${apiBase}/api/v1/member/withdrawals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawalAmount),
          withdrawalType: "contribution", // Only contribution withdrawals allowed
          currency: "NGN",
          reason: withdrawalReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to submit withdrawal request"
        );
      }

      const data = await response.json();

      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      setWithdrawalReason("");
      setToast({
        message: "Withdrawal request submitted for approval",
        type: "success",
      });

      fetchMemberData();
    } catch (err: any) {
      setError(err.message);
      setToast({
        message: err.message || "Failed to submit withdrawal request",
        type: "error",
      });
    } finally {
      setRequestingWithdrawal(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <p className="text-gray-700">Loading your dashboard...</p>
      </div>
    );
  }

  // Remove full-screen error return; errors will be shown via toast

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <MemberSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {memberData?.member?.firstname || "Member"}!
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Welcome Message */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {memberData?.member?.firstname || "Member"}!
          </h2>
          {memberData?.member?.cooperativeId ? (
            <p className="text-gray-600">
              Welcome to your cooperative member portal. You can contribute to
              the cooperative and purchase available assets.
            </p>
          ) : (
            <p className="text-gray-600">
              You are currently not associated with any cooperative. Please
              contact your cooperative administrator to get access to
              cooperative features.
            </p>
          )}
        </div>

        {/* Member Information */}
        {memberData?.member && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Profile Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-gray-900">
                  {memberData.member.firstname} {memberData.member.lastname}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{memberData.member.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">
                  {memberData.member.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    memberData.member.status === "active"
                      ? "bg-green-100 text-green-800"
                      : memberData.member.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : memberData.member.status === "silver"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {memberData.member.status || "Unknown"}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Member Since
                </label>
                <p className="text-gray-900">
                  {new Date(memberData.member.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-gray-900 capitalize">
                  {memberData.member.role || "Member"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Information */}
        {memberData?.wallet && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Wallet Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Current Balance
                </label>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{memberData.wallet.balance?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Currency
                </label>
                <p className="text-gray-900">
                  {memberData.wallet.currency || "NGN"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Wallet ID
                </label>
                <p className="text-sm text-gray-600 font-mono">
                  {memberData.wallet.id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Information */}
        {memberData?.bank && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Bank Name
                </label>
                <p className="text-gray-900">
                  {memberData.bank.bankName || "Not provided"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Account Number
                </label>
                <p className="text-gray-900">
                  {memberData.bank.accountNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={`/${resolvedParams.slug}/me/transactions`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-[--color-lemon-600] mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">Transactions</h4>
                  <p className="text-sm text-gray-500">
                    View transaction history
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href={`/${resolvedParams.slug}/me/portfolio`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-[--color-lemon-600] mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">Portfolio</h4>
                  <p className="text-sm text-gray-500">View your investments</p>
                </div>
              </div>
            </Link>
            <Link
              href={`/${resolvedParams.slug}/me/stats`}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-[--color-lemon-600] mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">Statistics</h4>
                  <p className="text-sm text-gray-500">
                    View performance metrics
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => setShowContributeModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-[--color-lemon-600] mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">
                    Make Contribution
                  </h4>
                  <p className="text-sm text-gray-500">
                    Contribute to cooperative
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-[--color-lemon-600] mr-3"
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
                <div>
                  <h4 className="font-medium text-gray-900">
                    Request Withdrawal
                  </h4>
                  <p className="text-sm text-gray-500">
                    Withdraw from contribution wallet
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you believe you should have access to cooperative features,
            please contact your cooperative administrator or support team.
          </p>
        </div>
      </div>

      {/* Contribution Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Make a Contribution
            </h2>
            <form onSubmit={handleContribute}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-lemon-600]"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={contributeEmail}
                  onChange={(e) => setContributeEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-lemon-600]"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowContributeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contributing}
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors border-2 border-blue-800 font-semibold"
                >
                  {contributing ? "Processing..." : "Contribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request Withdrawal
            </h2>
            <form onSubmit={handleWithdrawalRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-lemon-600]"
                  placeholder="Enter amount to withdraw"
                  required
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available balance: ₦
                  {memberData?.wallet?.balance?.toLocaleString() || 0}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for withdrawal
                </label>
                <textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-lemon-600]"
                  placeholder="Please provide a reason for this withdrawal request"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Withdrawal requests are subject to
                  admin approval. You can only withdraw from your contribution
                  wallet.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestingWithdrawal}
                  className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors border-2 border-blue-800 font-semibold"
                >
                  {requestingWithdrawal ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
