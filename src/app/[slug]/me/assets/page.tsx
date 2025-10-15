"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSidebar from "@/components/MemberSidebar";

interface Asset {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  currency?: string;
  walletBalance?: number;
  settings?: {
    pricePerUnit?: number;
    minUnit?: number;
    minAmount?: number;
  };
  createdAt?: string;
}

interface PaginatedAssets {
  data: Asset[];
  pagination?: {
    page: number;
    limit: number;
    totalPages?: number;
    total?: number;
  };
}

export default function MemberAssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const [assets, setAssets] = useState<PaginatedAssets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1);

  // Asset purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetQuantity, setAssetQuantity] = useState("");
  const [assetEmail, setAssetEmail] = useState("");
  const [purchasing, setPurchasing] = useState(false);

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
    fetchMemberData();
  }, [token, isClient]);

  const fetchMemberData = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch member profile");
      }

      const data = await response.json();
      if (data.data?.email) {
        setAssetEmail(data.data.email);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAssets = async () => {
    if (!isClient || !token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/api/v1/member/assets/available?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to load assets: ${response.status} ${errorText}`
        );
      }
      const data = await response.json();
      console.log("Available assets response:", data);

      // Handle the response structure: data is an array directly
      if (Array.isArray(data.data)) {
        setAssets({ data: data.data, pagination: data.pagination || {} });
      } else if (Array.isArray(data)) {
        setAssets({ data: data, pagination: {} });
      } else {
        setAssets({ data: [], pagination: {} });
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load assets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [isClient, token, page]);

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
      console.log("Asset purchase response:", data);

      // Redirect to payment URL if provided
      if (data.data?.payment?.authorization_url) {
        window.location.href = data.data.payment.authorization_url;
      } else if (data.payment?.authorization_url) {
        window.location.href = data.payment.authorization_url;
      } else if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError("Payment URL not received. Response: " + JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(false);
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
            Please sign in to view available assets.
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
          <h1 className="text-3xl font-bold text-gray-900">Available Assets</h1>
          <p className="text-gray-600">
            Browse and purchase available cooperative assets
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading assets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(assets?.data || []).map((asset) => (
              <div
                key={asset._id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {asset.name}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      asset.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {asset.description || "No description available"}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="text-gray-900 capitalize">
                      {asset.type?.replace("_", " ") || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price per unit:</span>
                    <span className="text-gray-900 font-semibold">
                      ₦{asset.settings?.pricePerUnit?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum units:</span>
                    <span className="text-gray-900">
                      {asset.settings?.minUnit || "1"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum amount:</span>
                    <span className="text-gray-900">
                      ₦{asset.settings?.minAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowPurchaseModal(true);
                  }}
                  className="w-full px-4 py-2 bg-[--color-lemon-600] text-white rounded-lg hover:bg-[--color-lemon-700] transition-colors"
                >
                  Purchase Asset
                </button>
              </div>
            ))}

            {assets?.data?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No assets available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  There are currently no assets available for purchase.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {assets?.pagination && assets.pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {assets.pagination.totalPages}
            </span>
            <button
              className="px-3 py-2 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= (assets.pagination.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Asset Purchase Modal */}
      {showPurchaseModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Purchase {selectedAsset.name}
            </h2>
            <form onSubmit={handleAssetPurchase}>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">
                    Asset Details:
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      Price per unit: ₦
                      {selectedAsset.settings?.pricePerUnit?.toLocaleString() ||
                        "0"}
                    </div>
                    <div>
                      Minimum units: {selectedAsset.settings?.minUnit || "1"}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={selectedAsset.settings?.minUnit || 1}
                    value={assetQuantity}
                    onChange={(e) => setAssetQuantity(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter quantity to purchase"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: {selectedAsset.settings?.minUnit || 1} units
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={assetEmail}
                    onChange={(e) => setAssetEmail(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter your email"
                  />
                </div>

                {assetQuantity && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Total Amount: ₦
                      {(
                        parseFloat(assetQuantity) *
                        (selectedAsset.settings?.pricePerUnit || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedAsset(null);
                    setAssetQuantity("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchasing || !assetQuantity}
                  className="flex-1 px-4 py-2 bg-[--color-lemon-600] text-white rounded-lg hover:bg-[--color-lemon-700] disabled:opacity-50"
                >
                  {purchasing ? "Processing..." : "Purchase Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
