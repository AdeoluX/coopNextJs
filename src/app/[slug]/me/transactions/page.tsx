"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import MemberSidebar from "@/components/MemberSidebar";

export default function MemberTransactionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [transactions, setTransactions] = useState<
    Array<{
      _id: string;
      amount: number;
      type: string;
      status: string;
      description: string;
      createdAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchTransactions();
  }, [token, isClient, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(
        `${apiBase}/api/v1/member/my-transactions?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.data || data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Please sign in to view your transactions.
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
          <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
          <p className="text-gray-600">
            View your transaction history and activity
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[--color-lemon-500]"
          />
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="text-gray-700">Loading transactions...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="border-t text-sm text-gray-900"
                  >
                    <td className="px-4 py-3">
                      <span className="capitalize">
                        {transaction.type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        ₦{transaction.amount?.toLocaleString() || "0"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : transaction.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={5}>
                      {searchTerm
                        ? "No transactions match your search"
                        : "No transactions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={filteredTransactions.length < 10}
            className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
