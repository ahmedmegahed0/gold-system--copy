export interface CreateBarcodeItemDto {
  barcode: string;
  title: string;
  karat: 18 | 21 | 24;
  grossWeight: number;
  netWeight: number;
  makingChargesPerGram?: number;
  category: string;
  invoiceRef?: string;
  companyName?: string;
}

export type UpdateBarcodeItemDto = Partial<CreateBarcodeItemDto>;

export type BarcodeItem = CreateBarcodeItemDto & {
  _id: string;
  status: 'IN_STOCK' | 'SOLD' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
};
