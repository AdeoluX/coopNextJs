"use client";

import { useEffect, useState, use } from "react";
// import Link from "next/link"; // Unused for now
import AdminSidebar from "@/components/AdminSidebar";

interface TransactionItem {
  _id: string;
  reference?: string;
  descriptions?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
  status?: string;
}

interface TransactionResponse {
  transactions: TransactionItem[];
  pagination?: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
  };
}

export default function TransactionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [resp, setResp] = useState<TransactionResponse | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
    const url = new URL(`${apiBase}/api/v1/admin/transactions`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "10");
    if (search) url.searchParams.set("search", search);
    fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load transactions");
        const j = await r.json();
        return j?.data || j;
      })
      .then(setResp)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isClient, token, page, search]);

  if (!isClient) return null;

  const transactions = resp?.transactions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or description"
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading transactions...</div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-t text-sm text-gray-900">
                    <td className="px-4 py-3">{t.reference || "-"}</td>
                    <td className="px-4 py-3">{t.descriptions || "-"}</td>
                    <td className="px-4 py-3">
                      {t.amount ?? 0} {t.currency || ""}
                    </td>
                    <td className="px-4 py-3">{t.status || "-"}</td>
                    <td className="px-4 py-3">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={5}>
                      No transactions found
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
