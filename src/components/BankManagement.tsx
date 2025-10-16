"use client";

import { useState, useEffect } from "react";
import BankService, { Bank, AvailableBank } from "../services/bankService";
import BankValidator, {
  BankFormData,
  ValidationError,
} from "../utils/bankValidation";

interface BankManagementProps {
  token: string;
  onBankUpdate?: (bank: Bank | null) => void;
  showQuickActions?: boolean;
}

export default function BankManagement({
  token,
  onBankUpdate,
  showQuickActions = true,
}: BankManagementProps) {
  const [myBank, setMyBank] = useState<Bank | null>(null);
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Form states
  const [selectedBank, setSelectedBank] = useState<AvailableBank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolvedAccountName, setResolvedAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bankData, banksData] = await Promise.all([
        BankService.getMyBank(token),
        BankService.getAvailableBanks(token),
      ]);

      setMyBank(bankData);
      setAvailableBanks(banksData);

      if (onBankUpdate) {
        onBankUpdate(bankData);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch bank data"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setResolvedAccountName("");
    setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const formData: BankFormData = {
      bankCode: selectedBank?.code || "",
      bankName: selectedBank?.name || "",
      accountNumber,
      nameOnAccount: accountName,
    };

    const errors = BankValidator.validateBankForm(formData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const resolveBankAccount = async () => {
    if (!selectedBank || !accountNumber) return;

    const errors = BankValidator.validateResolveForm(
      selectedBank.code,
      accountNumber
    );
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setResolving(true);
      setValidationErrors([]);

      const result = await BankService.resolveBankAccount(
        token,
        BankValidator.cleanAccountNumber(accountNumber),
        selectedBank.code
      );

      setResolvedAccountName(result.accountName);
      setAccountName(result.accountName);
      showToast("Bank account resolved successfully", "success");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to resolve bank account",
        "error"
      );
    } finally {
      setResolving(false);
    }
  };

  const addBankAccount = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setValidationErrors([]);

      const bankData = {
        bankCode: selectedBank!.code,
        bankName: selectedBank!.name,
        accountNumber: BankValidator.cleanAccountNumber(accountNumber),
        nameOnAccount: accountName,
      };

      const newBank = await BankService.addBankAccount(token, bankData);
      setMyBank(newBank);
      setShowAddModal(false);
      resetForm();
      showToast("Bank account added successfully", "success");

      if (onBankUpdate) {
        onBankUpdate(newBank);
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to add bank account",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateBankAccount = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setValidationErrors([]);

      const bankData = {
        bankCode: selectedBank!.code,
        bankName: selectedBank!.name,
        accountNumber: BankValidator.cleanAccountNumber(accountNumber),
        nameOnAccount: accountName,
      };

      const updatedBank = await BankService.updateBankAccount(token, bankData);
      setMyBank(updatedBank);
      setShowEditModal(false);
      resetForm();
      showToast("Bank account updated successfully", "success");

      if (onBankUpdate) {
        onBankUpdate(updatedBank);
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update bank account",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // const deleteBankAccount = async () => {
  //   if (!confirm("Are you sure you want to delete your bank account?")) return;

  //   try {
  //     await BankService.deleteBankAccount(token);
  //     setMyBank(null);
  //     showToast("Bank account deleted successfully", "success");

  //     if (onBankUpdate) {
  //       onBankUpdate(null);
  //     }
  //   } catch (err: any) {
  //     showToast(err.message || "Failed to delete bank account", "error");
  //   }
  // };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = () => {
    if (!myBank) return;

    const bank = availableBanks.find((b) => b.code === myBank.bankCode);
    setSelectedBank(bank || null);
    setAccountNumber(myBank.accountNumber);
    setAccountName(myBank.nameOnAccount);
    setShowEditModal(true);
  };

  const openResolveModal = () => {
    resetForm();
    setShowResolveModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading bank information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-xl mb-4">Error</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
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

      {/* Bank Account Display */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bank Account</h2>
          {showQuickActions && (
            <div className="flex space-x-2">
              <button
                onClick={openResolveModal}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Resolve
              </button>
              {myBank ? (
                <button
                  onClick={openEditModal}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              ) : (
                <button
                  onClick={openAddModal}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Bank
                </button>
              )}
            </div>
          )}
        </div>

        {myBank ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{myBank.bankName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {BankValidator.formatAccountNumber(myBank.accountNumber)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Name
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {myBank.nameOnAccount}
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
              Add a bank account to enable withdrawals and other banking
              features.
            </p>
            {showQuickActions && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Bank Account
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <BankModal
          title="Add Bank Account"
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          accountName={accountName}
          setAccountName={setAccountName}
          resolvedAccountName={resolvedAccountName}
          availableBanks={availableBanks}
          validationErrors={validationErrors}
          onSubmit={addBankAccount}
          onResolve={resolveBankAccount}
          onClose={() => setShowAddModal(false)}
          submitting={submitting}
          resolving={resolving}
        />
      )}

      {showEditModal && (
        <BankModal
          title="Update Bank Account"
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          accountName={accountName}
          setAccountName={setAccountName}
          resolvedAccountName={resolvedAccountName}
          availableBanks={availableBanks}
          validationErrors={validationErrors}
          onSubmit={updateBankAccount}
          onResolve={resolveBankAccount}
          onClose={() => setShowEditModal(false)}
          submitting={submitting}
          resolving={resolving}
        />
      )}

      {showResolveModal && (
        <ResolveModal
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          resolvedAccountName={resolvedAccountName}
          availableBanks={availableBanks}
          validationErrors={validationErrors}
          onResolve={resolveBankAccount}
          onClose={() => setShowResolveModal(false)}
          resolving={resolving}
        />
      )}
    </div>
  );
}

// Bank Modal Component
interface BankModalProps {
  title: string;
  selectedBank: AvailableBank | null;
  setSelectedBank: (bank: AvailableBank | null) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  accountName: string;
  setAccountName: (value: string) => void;
  resolvedAccountName: string;
  availableBanks: AvailableBank[];
  validationErrors: ValidationError[];
  onSubmit: () => void;
  onResolve: () => void;
  onClose: () => void;
  submitting: boolean;
  resolving: boolean;
}

function BankModal({
  title,
  selectedBank,
  setSelectedBank,
  accountNumber,
  setAccountNumber,
  accountName,
  setAccountName,
  resolvedAccountName,
  availableBanks,
  validationErrors,
  onSubmit,
  onResolve,
  onClose,
  submitting,
  resolving,
}: BankModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

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
            {BankValidator.getFieldError(validationErrors, "bankCode") && (
              <p className="mt-1 text-sm text-red-600">
                {BankValidator.getFieldError(validationErrors, "bankCode")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account number"
              required
            />
            {BankValidator.getFieldError(validationErrors, "accountNumber") && (
              <p className="mt-1 text-sm text-red-600">
                {BankValidator.getFieldError(validationErrors, "accountNumber")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account name"
              required
            />
            {BankValidator.getFieldError(validationErrors, "nameOnAccount") && (
              <p className="mt-1 text-sm text-red-600">
                {BankValidator.getFieldError(validationErrors, "nameOnAccount")}
              </p>
            )}
          </div>

          {resolvedAccountName && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Resolved Account Name:</strong> {resolvedAccountName}
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onResolve}
            disabled={resolving || !selectedBank || !accountNumber}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resolving ? "Resolving..." : "Resolve"}
          </button>
          <button
            onClick={onSubmit}
            disabled={
              submitting || !selectedBank || !accountNumber || !accountName
            }
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Resolve Modal Component
interface ResolveModalProps {
  selectedBank: AvailableBank | null;
  setSelectedBank: (bank: AvailableBank | null) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  resolvedAccountName: string;
  availableBanks: AvailableBank[];
  validationErrors: ValidationError[];
  onResolve: () => void;
  onClose: () => void;
  resolving: boolean;
}

function ResolveModal({
  selectedBank,
  setSelectedBank,
  accountNumber,
  setAccountNumber,
  resolvedAccountName,
  availableBanks,
  validationErrors,
  onResolve,
  onClose,
  resolving,
}: ResolveModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resolve Bank Account
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
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account number"
              required
            />
            {BankValidator.getFieldError(validationErrors, "accountNumber") && (
              <p className="mt-1 text-sm text-red-600">
                {BankValidator.getFieldError(validationErrors, "accountNumber")}
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
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onResolve}
            disabled={resolving || !selectedBank || !accountNumber}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resolving ? "Resolving..." : "Resolve Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
