export interface BarcodeInventoryItem {
  _id: string;
  barcode: string;
  title: string;
  karat: number;
  grossWeight: number;
  tagWeight: number;
  netWeight: number;
  makingChargePerGram: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  category?: any; 
  inventoryRef?: any;
  companyName: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarcodeItemDto {
  barcode?: string;
  title: string;
  karat: number;
  grossWeight: number;
  tagWeight?: number;
  makingChargePerGram: number;
  category?: string;
  inventoryId?: string;
  companyName?: string;
}

export interface BarcodeSaleItemDto {
  barcode: string;
  goldPricePerGram: number;
  makingChargePerGram?: number;
}

export interface CreateBarcodeInvoiceDto {
  items: BarcodeSaleItemDto[];
  customerId?: string;
}

export interface BarcodeInvoiceItem {
  _id?: string;
  item: any;
  barcode: string;
  title: string;
  karat: number;
  netWeight: number;
  goldPricePerGram: number;
  goldTotalPrice: number;
  makingChargePerGram: number;
  totalMakingCharge: number;
  finalPrice: number;
}

export interface BarcodeInvoice {
  _id: string;
  invoiceNumber: string;
  items: BarcodeInvoiceItem[];
  totalNetWeight: number;
  finalPaidAmount: number;
  customer?: any; 
  createdBy: any;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}
