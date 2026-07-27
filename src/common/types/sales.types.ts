import type { Customer } from './customer.types';
import type { Employee } from './employee.types';
import type { InventoryItem } from './inventory.types';

export interface InvoiceItemDto {
  inventoryItem: string;
  soldGrossWeight: number;
  hasTag: boolean;
  tagWeight?: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
}

export interface CreateInvoiceDto {
  customer: string;
  items: InvoiceItemDto[];
}

export interface UpdateInvoiceDto {
  customer?: string;
  items?: InvoiceItemDto[];
}

export interface InvoiceItemDetails {
  inventoryItem: InventoryItem | string;
  soldGrossWeight: number;
  soldNetWeight: number;
  hasTag: boolean;
  goldPriceToday: number;
  makingChargesPerGram: number;
  itemTotalPrice: number;
}

export interface Invoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  customer: Customer | string;
  soldBy: Employee | string;
  items: InvoiceItemDetails[];
  totalGrossWeight: number;
  totalNetWeight: number;
  totalPrice: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  status?: 'COMPLETED' | 'CANCELLED';
  invoiceNumber?: string;
}
