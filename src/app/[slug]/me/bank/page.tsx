"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSidebar from "@/components/MemberSidebar";

interface Bank {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  nameOnAccount: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailableBank {
  id: number;
  name: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
}

export default function BankManagementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Bank data state
  const [myBank, setMyBank] = useState<Bank | null>(null);
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Modal states
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showEditBankModal, setShowEditBankModal] = useState(false);

  // Form states
  const [selectedBank, setSelectedBank] = useState<AvailableBank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchMyBank = useCallback(async () => {
    if (!token) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMyBank(data.data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch bank information");
      }
    } catch (err: any) {
      setError("Failed to fetch bank information");
    }
  }, [token]);

  const fetchAvailableBanks = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingBanks(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableBanks(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch available banks");
      }
    } catch (err: any) {
      setError("Failed to fetch available banks");
    } finally {
      setLoadingBanks(false);
    }
  }, [token]);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchMyBank();
    fetchAvailableBanks();
    setLoading(false);
  }, [token, isClient]);

  const resolveBankAccount = async (accountNum: string, bankCode: string) => {
    if (!accountNum || !bankCode) return null;

    try {
      setResolving(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber: accountNum,
          bankCode: bankCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResolvedAccountName(data.data.accountName);
        setAccountName(data.data.accountName);
        return data.data.accountName;
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to resolve bank account",
          "error"
        );
        return null;
      }
    } catch (err: any) {
      showToast("Failed to resolve bank account", "error");
      return null;
    } finally {
      setResolving(false);
    }
  };

  const addBankAccount = async () => {
    if (!selectedBank || !accountNumber || !accountName) return;

    try {
      setSubmitting(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          nameOnAccount: accountName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyBank(data.data);
        setShowAddBankModal(false);
        resetForm();
        showToast("Bank account added successfully", "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.message || "Failed to add bank account", "error");
      }
    } catch (err: any) {
      showToast("Failed to add bank account", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateBankAccount = async () => {
    if (!selectedBank || !accountNumber || !accountName) return;

    try {
      setSubmitting(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks/my`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          nameOnAccount: accountName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyBank(data.data);
        setShowEditBankModal(false);
        resetForm();
        showToast("Bank account updated successfully", "success");
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to update bank account",
          "error"
        );
      }
    } catch (err: any) {
      showToast("Failed to update bank account", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBankAccount = async () => {
    if (!confirm("Are you sure you want to delete your bank account?")) return;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;
      const response = await fetch(`${apiBase}/api/v1/member/banks/my`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMyBank(null);
        showToast("Bank account deleted successfully", "success");
      } else {
        const errorData = await response.json();
        showToast(
          errorData.message || "Failed to delete bank account",
          "error"
        );
      }
    } catch (err: any) {
      showToast("Failed to delete bank account", "error");
    }
  };

  const resetForm = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setResolvedAccountName("");
  };

  const handleAccountNumberChange = async (value: string) => {
    // Clean the input to only allow digits
    const cleanValue = value.replace(/\D/g, "");
    setAccountNumber(cleanValue);

    // If we have exactly 10 digits and a selected bank, resolve the account
    if (cleanValue.length === 10 && selectedBank) {
      const resolvedName = await resolveBankAccount(
        cleanValue,
        selectedBank.code
      );
      if (resolvedName) {
        setAccountName(resolvedName);
      }
    } else if (cleanValue.length !== 10) {
      // Clear resolved name if not exactly 10 digits
      setResolvedAccountName("");
      setAccountName("");
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddBankModal(true);
  };

  const openEditModal = () => {
    if (!myBank) return;

    // Find the bank in available banks
    const bank = availableBanks.find((b) => b.code === myBank.bankCode);
    setSelectedBank(bank || null);
    setAccountNumber(myBank.accountNumber || "");
    setAccountName(myBank.nameOnAccount || "");
    setShowEditBankModal(true);
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
            Please sign in to view your bank management.
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
        <p className="text-gray-700">Loading your bank management...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <MemberSidebar slug={resolvedParams.slug} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bank Management
              </h1>
              <p className="text-gray-600">
                Manage your bank account information
              </p>
            </div>
            <div className="flex space-x-3">
              {myBank ? (
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Bank
                </button>
              ) : (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Bank Account
                </button>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}
        {/* Current Bank Account */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Bank Account
          </h2>

          {myBank ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bank Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {myBank.bankName || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {myBank.accountNumber
                      ? myBank.accountNumber.replace(/(.{4})/g, "$1 ").trim()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {myBank.nameOnAccount || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      myBank.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {myBank.isVerified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={deleteBankAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Bank Account
              </h3>
              <p className="text-gray-600 mb-4">
                You haven&apos;t added a bank account yet. Add one to enable
                withdrawals.
              </p>
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Bank Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Bank Account
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bank
                </label>
                <select
                  value={selectedBank?.code || ""}
                  onChange={(e) => {
                    const bank = availableBanks.find(
                      (b) => b.code === e.target.value
                    );
                    setSelectedBank(bank || null);
                    // Clear resolved name when bank changes
                    setResolvedAccountName("");
                    setAccountName("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a bank</option>
                  {availableBanks.map((bank) => (
                    <option key={bank.id} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  required
                />
                {resolving && (
                  <p className="mt-1 text-sm text-blue-600">
                    Resolving account...
                  </p>
                )}
              </div>

              {resolvedAccountName && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Account Name:</strong> {resolvedAccountName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddBankModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addBankAccount}
                disabled={
                  submitting ||
                  !selectedBank ||
                  !accountNumber ||
                  !resolvedAccountName
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Bank Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Modal */}
      {showEditBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Bank Account
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Bank
                </label>
                <select
                  value={selectedBank?.code || ""}
                  onChange={(e) => {
                    const bank = availableBanks.find(
                      (b) => b.code === e.target.value
                    );
                    setSelectedBank(bank || null);
                    // Clear resolved name when bank changes
                    setResolvedAccountName("");
                    setAccountName("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Choose a bank</option>
                  {availableBanks.map((bank) => (
                    <option key={bank.id} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                  required
                />
                {resolving && (
                  <p className="mt-1 text-sm text-blue-600">
                    Resolving account...
                  </p>
                )}
              </div>

              {resolvedAccountName && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Resolved Account Name:</strong>{" "}
                    {resolvedAccountName}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditBankModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateBankAccount}
                disabled={
                  submitting ||
                  !selectedBank ||
                  !accountNumber ||
                  !resolvedAccountName
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Bank Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
