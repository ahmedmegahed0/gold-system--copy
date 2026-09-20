export interface GoldBalances {
  karat24: number;
  karat21: number;
  karat18: number;
}

export interface Supplier {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  address?: string;
  cashBalance: number;
  goldBalances: GoldBalances;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierDto {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  phone?: string;
  address?: string;
}

export interface ReceivedItemDto {
  karat: number;
  weight: number;
  pricePerGram?: number;
  manufacturingFeePerGram?: number;
  totalPrice?: number;
}

export interface ScrapPaidDto {
  karat: number;
  weight: number;
  pricePerGram?: number;
  totalValue?: number;
}

export interface PaymentDetailsDto {
  manufacturingFeePaid?: number;
  cashPaidForGold?: number;
  goldPriceForCashDeduction?: number;
  scrapPaid?: ScrapPaidDto[];
}

export interface RecordSupplierTransactionDto {
  supplierId: string;
  type: 'GOODS_RECEIVE' | 'PAYMENT' | 'ADJUSTMENT';
  receivedItems?: ReceivedItemDto[];
  paymentDetails?: PaymentDetailsDto;
  notes?: string;
}

export interface SupplierTransaction {
  _id?: string;
  id?: string;
  supplierId: string | Supplier;
  type: string;
  receivedItems: ReceivedItemDto[];
  paymentDetails: PaymentDetailsDto;
  notes?: string;
  actionBy: any;
  createdAt: string;
  updatedAt: string;
}
