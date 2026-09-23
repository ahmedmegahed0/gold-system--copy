import type { Category } from './category.types';
import type { UserSession } from './auth.types';

export type SilverTransactionType = 
  | 'بيع_فضة'
  | 'شراء_كسر_فضة'
  | 'إيداع_يدوي'
  | 'سحب_يدوي'
  | 'تصفير_الخزنة'
  | 'تعديل_رصيد';

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

export interface UpdateSilverItemDto {
  title?: string;
  karat?: number;
  category?: string;
  weight?: number;
  notes?: string;
}

export interface SilverKaratSummary {
  karat: number;
  totalWeight: number;
  totalItemsCount: number;
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
  soldBy: UserSession | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuickSilverSaleDto {
  itemId: string;
  pricePerGram: number;
  weight?: number;
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
  purchasedBy: UserSession | string;
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
  createdBy: UserSession | string;
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
