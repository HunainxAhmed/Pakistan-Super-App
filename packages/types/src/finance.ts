export enum PaymentMethod {
  CASH = 'CASH',
  WALLET = 'WALLET',
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
  BANK_CARD = 'BANK_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum LedgerTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionReferenceType {
  RIDE_PAYMENT = 'RIDE_PAYMENT',
  RIDE_EARNING = 'RIDE_EARNING',
  MECHANIC_PAYMENT = 'MECHANIC_PAYMENT',
  MECHANIC_EARNING = 'MECHANIC_EARNING',
  HOME_SERVICE_PAYMENT = 'HOME_SERVICE_PAYMENT',
  HOME_SERVICE_EARNING = 'HOME_SERVICE_EARNING',
  COMMISSION_DEDUCTION = 'COMMISSION_DEDUCTION',
  WALLET_TOPUP = 'WALLET_TOPUP',
  WALLET_WITHDRAWAL = 'WALLET_WITHDRAWAL',
  PROMOTIONAL_CREDIT = 'PROMOTIONAL_CREDIT',
  REFUND = 'REFUND',
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // in PKR
  currency: 'PKR';
  lockedBalance: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: LedgerTransactionType;
  referenceType: TransactionReferenceType;
  referenceId: string;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}
