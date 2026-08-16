import type { Customer } from './customer.types';
import type { UserSession as User } from './auth.types';
import type { BullionInventory } from './bullion.types';

export const BullionSaleStatus = {
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type BullionSaleStatus = typeof BullionSaleStatus[keyof typeof BullionSaleStatus];

export interface BullionSaleItem {
  _id?: string;
  bullionItem: string | BullionInventory;
  title: string;
  karat: number;
  weightPerUnit: number;
  quantity: number;
  goldPricePerGram: number;
  makingChargePerUnit: number;
  itemTotalPrice: number;
}

export interface BullionSale {
  _id: string;
  invoiceNumber: string;
  customer: string | Customer;
  items: BullionSaleItem[];
  totalGoldWeight: number;
  totalMakingCharges: number;
  grandTotal: number;
  paidAmount: number;
  status: BullionSaleStatus;
  seller: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBullionSaleItemDto {
  bullionItem: string;
  quantity: number;
  goldPricePerGram: number;
  makingChargePerUnit?: number;
}

export interface CreateBullionSaleDto {
  customerId: string;
  items: CreateBullionSaleItemDto[];
}

export interface UpdateBullionSaleDto {
  customerId?: string;
  items?: CreateBullionSaleItemDto[];
}
