import { Category } from './category.types';
import { User } from './auth.types';

export enum SilverTransactionType {
  SALE_INCOME = 'بيع_فضة',
  SCRAP_PURCHASE_EXPENSE = 'شراء_كسر_فضة',
  MANUAL_DEPOSIT = 'إيداع_يدوي',
  MANUAL_WITHDRAWAL = 'سحب_يدوي',
  RESET = 'تصفير_الخزنة',
  ADJUSTMENT = 'تعديل_رصيد',
}

export interface SilverItem {
  _id?: string;
  id?: string;
  title: string;
  karat: number;
  category: Category | string;
  weight: number;
  quantity: number;
  status: 'AVAILABLE' | 'SOLD' | 'ARCHIVED';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSilverItemDto {
  title: string;
  karat: number;
  category: string;
  weight: number;
  notes?: string;
}

export interface SilverSale {
  _id?: string;
  id?: string;
  silverItem: SilverItem | string;
  karat: number;
  weight: number;
  pricePerGram: number;
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  soldBy: User | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuickSilverSaleDto {
  itemId: string;
  pricePerGram: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface SilverScrapPurchase {
  _id?: string;
  id?: string;
  karat: number;
  weight: number;
  pricePerGram: number;
  totalPaid: number;
  customerName?: string;
  customerPhone?: string;
  purchasedBy: User | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuySilverScrapDto {
  karat: number;
  weight: number;
  pricePerGram: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface SilverSafeTransaction {
  _id?: string;
  id?: string;
  type: SilverTransactionType | string;
  amount: number;
  weightChange: number;
  karat?: number;
  createdBy: User | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdjustSilverSafeDto {
  amount: number;
  securityPassword?: string; // Optional on frontend, required to send to backend
  reason?: string;
}

export interface SilverReportQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface SilverReportData {
  period: {
    startDate: string;
    endDate: string;
  };
  financialSummary: {
    totalSalesIncome: number;
    totalScrapExpenses: number;
    netCashFlow: number;
  };
  weightSummary: {
    totalSoldWeight: number;
    totalScrapBoughtWeight: number;
  };
  counts: {
    salesCount: number;
    scrapPurchasesCount: number;
  };
  safeTransactions: SilverSafeTransaction[];
}
