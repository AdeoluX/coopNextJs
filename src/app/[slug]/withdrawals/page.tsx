"use client";

import { useEffect, useState, use } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Toast from "@/components/Toast";

export default function WithdrawalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [withdrawals, setWithdrawals] = useState<
    {
      _id: string;
      amount: number;
      currency: string;
      status: string;
      reason: string;
      withdrawalType?: string;
      requestedAt?: string;
      approvedAt?: string;
      member: {
        firstname: string;
        lastname: string;
        email: string;
      };
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info" | "warning";
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchWithdrawals();
  }, [token, isClient, page]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(
        `${apiBase}/api/v1/admin/withdrawals?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals");
      }

      const data = await response.json();
      setWithdrawals(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch withdrawals";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!token) return;

    try {
      setProcessingWithdrawal(withdrawalId);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(
        `${apiBase}/api/v1/admin/withdrawals/${withdrawalId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve withdrawal");
      }

      // Refresh the withdrawals list
      await fetchWithdrawals();
      setToast({
        message: "Withdrawal approved successfully!",
        type: "success",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to approve withdrawal";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!token) return;

    const reason = prompt(
      "Please provide a reason for rejecting this withdrawal:"
    );
    if (!reason) return;

    try {
      setProcessingWithdrawal(withdrawalId);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(
        `${apiBase}/api/v1/admin/withdrawals/${withdrawalId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionReason: reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject withdrawal");
      }

      // Refresh the withdrawals list
      await fetchWithdrawals();
      setToast({
        message: "Withdrawal rejected successfully!",
        type: "success",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reject withdrawal";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
            Please sign in to view withdrawal requests.
          </p>
        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Withdrawal Requests
          </h1>
          <p className="text-gray-600">
            Review and manage member withdrawal requests
          </p>
        </header>

        {/* Inline error removed; toasts will handle messaging */}

        {/* Withdrawals Table */}
        {loading ? (
          <div className="text-gray-700">Loading withdrawal requests...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal._id}
                    className="border-t text-sm text-gray-900"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {withdrawal.member?.firstname}{" "}
                          {withdrawal.member?.lastname}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {withdrawal.member?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-red-600">
                        ₦{withdrawal.amount?.toLocaleString() || "0"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize">
                        {withdrawal.withdrawalType || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-xs truncate">
                        {withdrawal.reason || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-4 py-3">
                      {withdrawal.requestedAt
                        ? new Date(withdrawal.requestedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {withdrawal.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproveWithdrawal(withdrawal._id)
                            }
                            disabled={processingWithdrawal === withdrawal._id}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {processingWithdrawal === withdrawal._id
                              ? "Processing..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleRejectWithdrawal(withdrawal._id)
                            }
                            disabled={processingWithdrawal === withdrawal._id}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {processingWithdrawal === withdrawal._id
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          {withdrawal.approvedAt
                            ? `Processed ${new Date(
                                withdrawal.approvedAt
                              ).toLocaleDateString()}`
                            : "No actions available"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={7}>
                      No withdrawal requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

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
