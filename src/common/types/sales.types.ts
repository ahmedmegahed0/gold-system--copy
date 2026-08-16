import type { Customer } from './customer.types';
import type { Employee } from './employee.types';
import type { InventoryItem } from './inventory.types';

export interface InvoiceItemDto {
  inventoryItem: string;
  soldCount: number;
  soldGrossWeight: number;
  hasTag: boolean;
  tagWeight?: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
  itemTotalPrice?: number;
}

export interface CreateInvoiceDto {
  customer: string;
  items: InvoiceItemDto[];
  totalPrice?: number;
}

export interface UpdateInvoiceDto {
  customer?: string;
  items?: InvoiceItemDto[];
  totalPrice?: number;
}

export interface InvoiceItemDetails {
  inventoryItem: InventoryItem | string;
  soldCount: number;
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
  totalInvoiceGrossWeight: number;
  totalInvoiceNetWeight: number;
  totalPrice: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  status?: 'COMPLETED' | 'CANCELLED';
  invoiceNumber?: string;
  customerName?: string;
  customerPhone?: string;
}
