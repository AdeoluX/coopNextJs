"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

interface LoanItem {
  _id: string;
  member?: { firstname: string; lastname: string; email: string };
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  purpose?: string;
  interestRate?: number;
  term?: number;
}

interface LoanResponse {
  data: LoanItem[];
  pagination?: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
}

export default function LoansPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [loans, setLoans] = useState<LoanResponse | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem("vc_access_token"));
  }, []);

  useEffect(() => {
    if (!isClient || !token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
    setLoading(true);
    const url = new URL(`${apiBase}/api/v1/admin/loans`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "10");
    if (status) url.searchParams.set("status", status);
    fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load loans");
        const j = await r.json();
        return j?.data || j;
      })
      .then(setLoans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isClient, token, page, status]);

  const approveLoan = async (loanId: string) => {
    if (!token) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const res = await fetch(
        `${apiBase}/api/v1/admin/loans/${loanId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error("Failed to approve loan");
      // Refresh loans list
      const loansRes = await fetch(
        `${apiBase}/api/v1/admin/loans?page=${page}&limit=10&status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (loansRes.ok) {
        const j = await loansRes.json();
        setLoans(j?.data || j);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const rejectLoan = async (loanId: string) => {
    if (!token) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const res = await fetch(
        `${apiBase}/api/v1/admin/loans/${loanId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rejectionReason: "Rejected by admin" }),
        }
      );
      if (!res.ok) throw new Error("Failed to reject loan");
      // Refresh loans list
      const loansRes = await fetch(
        `${apiBase}/api/v1/admin/loans?page=${page}&limit=10&status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (loansRes.ok) {
        const j = await loansRes.json();
        setLoans(j?.data || j);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Loan Requests</h1>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading loans...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loans?.data || []).map((loan) => (
                  <tr key={loan._id} className="border-t text-sm text-gray-900">
                    <td className="px-4 py-3">
                      {loan.member
                        ? `${loan.member.firstname} ${loan.member.lastname}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {loan.amount ?? 0} {loan.currency || "NGN"}
                    </td>
                    <td className="px-4 py-3">{loan.purpose || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          loan.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : loan.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : loan.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {loan.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {loan.createdAt
                        ? new Date(loan.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {loan.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveLoan(loan._id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectLoan(loan._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loans?.data?.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={6}>
                      No loans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            className="px-3 py-2 rounded border border-gray-300 text-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            className="px-3 py-2 rounded border border-gray-300 text-sm"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
