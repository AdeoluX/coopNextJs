// Bank Form Validation Utilities
// Provides validation functions for bank-related forms

export interface BankFormData {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  nameOnAccount: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class BankValidator {
  // Validate account number (10-11 digits)
  static validateAccountNumber(accountNumber: string): ValidationError | null {
    if (!accountNumber) {
      return { field: "accountNumber", message: "Account number is required" };
    }

    const cleanNumber = accountNumber.replace(/\s/g, "");
    if (!/^\d{10,11}$/.test(cleanNumber)) {
      return {
        field: "accountNumber",
        message: "Account number must be 10-11 digits",
      };
    }

    return null;
  }

  // Validate bank code (3-10 characters)
  static validateBankCode(bankCode: string): ValidationError | null {
    if (!bankCode) {
      return { field: "bankCode", message: "Bank code is required" };
    }

    if (bankCode.length < 3 || bankCode.length > 10) {
      return {
        field: "bankCode",
        message: "Bank code must be 3-10 characters",
      };
    }

    return null;
  }

  // Validate bank name (2-100 characters)
  static validateBankName(bankName: string): ValidationError | null {
    if (!bankName) {
      return { field: "bankName", message: "Bank name is required" };
    }

    if (bankName.length < 2 || bankName.length > 100) {
      return {
        field: "bankName",
        message: "Bank name must be 2-100 characters",
      };
    }

    return null;
  }

  // Validate account name (2-100 characters)
  static validateAccountName(accountName: string): ValidationError | null {
    if (!accountName) {
      return { field: "nameOnAccount", message: "Account name is required" };
    }

    if (accountName.length < 2 || accountName.length > 100) {
      return {
        field: "nameOnAccount",
        message: "Account name must be 2-100 characters",
      };
    }

    return null;
  }

  // Validate complete bank form
  static validateBankForm(formData: BankFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    const accountNumberError = this.validateAccountNumber(
      formData.accountNumber
    );
    if (accountNumberError) errors.push(accountNumberError);

    const bankCodeError = this.validateBankCode(formData.bankCode);
    if (bankCodeError) errors.push(bankCodeError);

    const bankNameError = this.validateBankName(formData.bankName);
    if (bankNameError) errors.push(bankNameError);

    const accountNameError = this.validateAccountName(formData.nameOnAccount);
    if (accountNameError) errors.push(accountNameError);

    return errors;
  }

  // Validate resolve account form (only bank code and account number)
  static validateResolveForm(
    bankCode: string,
    accountNumber: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const bankCodeError = this.validateBankCode(bankCode);
    if (bankCodeError) errors.push(bankCodeError);

    const accountNumberError = this.validateAccountNumber(accountNumber);
    if (accountNumberError) errors.push(accountNumberError);

    return errors;
  }

  // Format account number for display (add spaces every 4 digits)
  static formatAccountNumber(accountNumber: string): string {
    const cleanNumber = accountNumber.replace(/\s/g, "");
    return cleanNumber.replace(/(.{4})/g, "$1 ").trim();
  }

  // Clean account number (remove spaces and non-digits)
  static cleanAccountNumber(accountNumber: string): string {
    return accountNumber.replace(/\D/g, "");
  }

  // Check if account number is valid format
  static isValidAccountNumber(accountNumber: string): boolean {
    const cleanNumber = this.cleanAccountNumber(accountNumber);
    return /^\d{10,11}$/.test(cleanNumber);
  }

  // Get error message for a specific field
  static getFieldError(
    errors: ValidationError[],
    field: string
  ): string | null {
    const error = errors.find((err) => err.field === field);
    return error ? error.message : null;
  }

  // Check if form has any errors
  static hasErrors(errors: ValidationError[]): boolean {
    return errors.length > 0;
  }

  // Get all error messages as a single string
  static getErrorMessages(errors: ValidationError[]): string {
    return errors.map((error) => error.message).join(", ");
  }
}

export default BankValidator;

