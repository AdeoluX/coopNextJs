// Bank API Service
// Handles all bank-related API calls for the frontend

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

interface ResolveAccountResponse {
  accountName: string;
  accountNumber: string;
  bankId: string;
}

class BankService {
  private static getApiBase(): string {
    return process.env.NEXT_PUBLIC_API_BASE as string;
  }

  private static getAuthHeaders(token: string): HeadersInit {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Get list of available banks
  static async getAvailableBanks(token: string): Promise<AvailableBank[]> {
    try {
      const response = await fetch(`${this.getApiBase()}/api/v1/member/banks`, {
        headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch available banks");
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching available banks:", error);
      throw error;
    }
  }

  // Resolve bank account details
  static async resolveBankAccount(
    token: string,
    accountNumber: string,
    bankCode: string
  ): Promise<ResolveAccountResponse> {
    try {
      const response = await fetch(
        `${this.getApiBase()}/api/v1/member/banks/resolve`,
        {
          method: "POST",
          headers: this.getAuthHeaders(token),
          body: JSON.stringify({
            accountNumber,
            bankCode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resolve bank account");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error resolving bank account:", error);
      throw error;
    }
  }

  // Get member's bank account
  static async getMyBank(token: string): Promise<Bank | null> {
    try {
      const response = await fetch(
        `${this.getApiBase()}/api/v1/member/banks/my`,
        {
          headers: this.getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No bank account found
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bank account");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching bank account:", error);
      throw error;
    }
  }

  // Add bank account to member profile
  static async addBankAccount(
    token: string,
    bankData: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      nameOnAccount: string;
    }
  ): Promise<Bank> {
    try {
      const response = await fetch(`${this.getApiBase()}/api/v1/member/banks`, {
        method: "POST",
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(bankData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add bank account");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error adding bank account:", error);
      throw error;
    }
  }

  // Update member's bank account
  static async updateBankAccount(
    token: string,
    bankData: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      nameOnAccount: string;
    }
  ): Promise<Bank> {
    try {
      const response = await fetch(
        `${this.getApiBase()}/api/v1/member/banks/my`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(token),
          body: JSON.stringify(bankData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bank account");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error updating bank account:", error);
      throw error;
    }
  }

  // Delete member's bank account
  static async deleteBankAccount(token: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.getApiBase()}/api/v1/member/banks/my`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete bank account");
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      throw error;
    }
  }
}

export default BankService;
export type { Bank, AvailableBank, ResolveAccountResponse };

