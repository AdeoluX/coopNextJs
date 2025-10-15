"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";

interface AssetItem {
  _id: string;
  name: string;
  type?: string;
  status?: string;
  currency?: string;
  walletBalance?: number;
  createdAt?: string;
}

interface PaginatedAssets {
  data: AssetItem[];
  pagination?: {
    page: number;
    limit: number;
    totalPages?: number;
    total?: number;
  };
}

export default function AssetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [assets, setAssets] = useState<PaginatedAssets | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<any>(null);

  const createAsset = async (data: any) => {
    if (!token) return;
    try {
      setCreating(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const res = await fetch(`${apiBase}/api/v1/admin/assets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create asset");
      setShowCreateModal(false);
      // Refresh assets list
      const assetsRes = await fetch(
        `${apiBase}/api/v1/admin/assets?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (assetsRes.ok) {
        const j = await assetsRes.json();
        setAssets(j?.data || j);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setDropdownPosition(null);
    };

    if (activeDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeDropdown]);

  const loadAssets = async () => {
    if (!isClient || !token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
    setLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/api/v1/admin/assets?page=${page}&limit=10`,
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
      // Handle both paginated and direct array responses
      if (Array.isArray(data.data)) {
        setAssets({ data: data.data, pagination: data.pagination || {} });
      } else {
        setAssets(data?.data || data);
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

  const toggleDropdown = (assetId: string, event: React.MouseEvent) => {
    if (activeDropdown === assetId) {
      setActiveDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        x: rect.right - 192, // 192px is the width of the dropdown (w-48)
        y: rect.bottom + 8,
      });
      setActiveDropdown(assetId);
    }
  };

  const handleAction = async (action: string, assetId: string) => {
    setActiveDropdown(null);
    setDropdownPosition(null);

    if (!token) return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

    try {
      switch (action) {
        case "edit":
          // Get asset details and open edit modal
          const editResponse = await fetch(
            `${apiBase}/api/v1/admin/assets/${assetId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (editResponse.ok) {
            const assetData = await editResponse.json();
            if (assetData.data && assetData.data.asset) {
              setEditingAsset(assetData.data.asset);
              setShowEditModal(true);
            } else {
              setError("Invalid asset data received for editing");
            }
          } else {
            setError("Failed to load asset details for editing");
          }
          break;

        case "publish":
          const publishResponse = await fetch(
            `${apiBase}/api/v1/admin/assets/${assetId}/publish`,
            {
              method: "PUT",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (publishResponse.ok) {
            // Refresh assets list
            loadAssets();
            setError(null);
          } else {
            const errorData = await publishResponse.json();
            setError(errorData.message || "Failed to publish asset");
          }
          break;

        case "view":
          // Get asset details and open view modal
          const viewResponse = await fetch(
            `${apiBase}/api/v1/admin/assets/${assetId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (viewResponse.ok) {
            const assetData = await viewResponse.json();
            if (assetData.data && assetData.data.asset) {
              setViewingAsset(assetData.data.asset);
              setShowViewModal(true);
            } else {
              setError("Invalid asset data received");
            }
          } else {
            setError("Failed to load asset details");
          }
          break;

        case "delete":
          if (
            confirm(
              "Are you sure you want to delete this asset? This action cannot be undone."
            )
          ) {
            const deleteResponse = await fetch(
              `${apiBase}/api/v1/admin/assets/${assetId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (deleteResponse.ok) {
              // Refresh assets list
              loadAssets();
              setError(null);
            } else {
              const errorData = await deleteResponse.json();
              setError(errorData.message || "Failed to delete asset");
            }
          }
          break;
      }
    } catch (error) {
      setError(
        `Failed to ${action} asset: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <AdminSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Create Asset
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading assets...</div>
        ) : (
          <div className="bg-white rounded-xl shadow relative">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Wallet Balance</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(assets?.data || []).map((a) => (
                    <tr
                      key={a._id}
                      className="border-t text-sm text-gray-900 relative"
                    >
                      <td className="px-4 py-3">{a.name}</td>
                      <td className="px-4 py-3">{a.type || "-"}</td>
                      <td className="px-4 py-3">{a.status || "-"}</td>
                      <td className="px-4 py-3">{a.walletBalance ?? 0}</td>
                      <td className="px-4 py-3">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(a._id, e);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {assets?.data?.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-gray-500" colSpan={6}>
                        No assets yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

        {/* Create Asset Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Asset</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  createAsset({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    pricePerUnit: parseFloat(
                      formData.get("pricePerUnit") as string
                    ),
                    minUnit: parseInt(formData.get("minUnit") as string),
                    minAmount: parseFloat(formData.get("minAmount") as string),
                  });
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      name="name"
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Per Unit
                    </label>
                    <input
                      name="pricePerUnit"
                      type="number"
                      step="0.01"
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Units
                    </label>
                    <input
                      name="minUnit"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Amount
                    </label>
                    <input
                      name="minAmount"
                      type="number"
                      step="0.01"
                      defaultValue="0"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Asset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fixed positioned dropdown */}
        {activeDropdown && dropdownPosition && (
          <div
            className="fixed w-48 bg-white rounded-md shadow-lg z-50 border"
            style={{
              left: `${dropdownPosition.x}px`,
              top: `${dropdownPosition.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => handleAction("edit", activeDropdown)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Edit Asset
              </button>
              <button
                onClick={() => handleAction("publish", activeDropdown)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Publish Asset
              </button>
              <button
                onClick={() => handleAction("view", activeDropdown)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
              <button
                onClick={() => handleAction("delete", activeDropdown)}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Delete Asset
              </button>
            </div>
          </div>
        )}

        {/* Edit Asset Modal */}
        {showEditModal && editingAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Asset</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!token) return;

                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                    type: formData.get("type") as string,
                    pricePerUnit: parseFloat(
                      formData.get("pricePerUnit") as string
                    ),
                    minUnit: parseInt(formData.get("minUnit") as string),
                    minAmount: parseFloat(formData.get("minAmount") as string),
                  };

                  try {
                    setCreating(true);
                    const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
                    const response = await fetch(
                      `${apiBase}/api/v1/admin/assets/${editingAsset._id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                      }
                    );

                    if (response.ok) {
                      setShowEditModal(false);
                      setEditingAsset(null);
                      loadAssets();
                      setError(null);
                    } else {
                      const errorData = await response.json();
                      setError(errorData.message || "Failed to update asset");
                    }
                  } catch (error) {
                    setError(
                      `Failed to update asset: ${
                        error instanceof Error ? error.message : "Unknown error"
                      }`
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingAsset.name}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingAsset.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      name="type"
                      defaultValue={editingAsset.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="real_estate">Real Estate</option>
                      <option value="stocks">Stocks</option>
                      <option value="bonds">Bonds</option>
                      <option value="commodities">Commodities</option>
                      <option value="crypto">Cryptocurrency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Per Unit (NGN)
                    </label>
                    <input
                      type="number"
                      name="pricePerUnit"
                      defaultValue={editingAsset.settings?.pricePerUnit || 0}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Units
                    </label>
                    <input
                      type="number"
                      name="minUnit"
                      defaultValue={editingAsset.settings?.minUnit || 1}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Amount (NGN)
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      defaultValue={editingAsset.settings?.minAmount || 0}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAsset(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {creating ? "Updating..." : "Update Asset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Asset Modal */}
        {showViewModal && viewingAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900">{viewingAsset.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Type
                    </label>
                    <p className="text-gray-900 capitalize">
                      {viewingAsset.type?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewingAsset.status === "published"
                          ? "bg-green-100 text-green-800"
                          : viewingAsset.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {viewingAsset.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Currency
                    </label>
                    <p className="text-gray-900">{viewingAsset.currency}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-gray-900">
                    {viewingAsset.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Price Per Unit
                    </label>
                    <p className="text-gray-900">
                      ₦
                      {viewingAsset.settings?.pricePerUnit?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Minimum Units
                    </label>
                    <p className="text-gray-900">
                      {viewingAsset.settings?.minUnit || "1"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Minimum Amount
                    </label>
                    <p className="text-gray-900">
                      ₦
                      {viewingAsset.settings?.minAmount?.toLocaleString() ||
                        "0"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Created
                    </label>
                    <p className="text-gray-900">
                      {viewingAsset.createdAt
                        ? new Date(viewingAsset.createdAt).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <p className="text-gray-900">
                      {viewingAsset.updatedAt
                        ? new Date(viewingAsset.updatedAt).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingAsset(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
