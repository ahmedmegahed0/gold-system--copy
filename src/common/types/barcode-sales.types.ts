export interface BarcodeSaleItemDto {
  barcode: string;
  goldPricePerGram: number;
  makingChargePerGram: number;
}

export interface BarcodeCheckoutDto {
  items: BarcodeSaleItemDto[];
  customerId?: string;
  customerName?: string;
  phoneNumber?: string;
}

export type UpdateBarcodeInvoiceDto = Partial<BarcodeCheckoutDto>;

export interface BarcodeInvoice {
  _id: string;
  invoiceNumber: string;
  customer: { _id: string; fullName: string; phone?: string } | string;
  items: Array<{
    barcode: string;
    title: string;
    karat: number;
    weight: number;
    goldPricePerGram: number;
    makingChargePerGram: number;
    itemTotal: number;
  }>;
  totalAmount: number;
  status: 'ACTIVE' | 'CANCELLED';
  cashier: { _id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}
