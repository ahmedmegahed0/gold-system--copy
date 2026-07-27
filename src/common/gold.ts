export interface InventoryItem {
  _id: string;
  title: string;
  category: string; // ObjectId as string
  karat: 18 | 21;
  initialCount: number;
  currentCount: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  _id: string;
  fullName: string;
  phoneNumber: string;
  nationalId?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  inventoryItem: string | InventoryItem;
  soldGrossWeight: number;
  soldNetWeight: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: string | Customer;
  soldBy: string; // ObjectId as string
  items: InvoiceItem[];
  totalInvoiceGrossWeight: number;
  totalInvoiceNetWeight: number;
  totalPrice: number;
  status: 'COMPLETED' | 'CANCELLED';
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScrapItem {
  category: string;
  count: number;
  weight: number;
}

export interface ScrapTransaction {
  _id: string;
  karat: 18 | 21;
  items: ScrapItem[];
  createdAt?: string;
  updatedAt?: string;
}
