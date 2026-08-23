export interface CreateBarcodeItemDto {
  barcode?: string;
  title: string;
  karat: 18 | 21 | 24;
  grossWeight: number;
  tagWeight?: number;
  makingChargePerGram: number;
  category?: string;
  inventoryId?: string;
  companyName?: string;
}

export type UpdateBarcodeItemDto = Partial<CreateBarcodeItemDto>;

export interface BarcodeItem extends Omit<CreateBarcodeItemDto, 'barcode'> {
  _id: string;
  barcode: string;
  netWeight: number;
  tagWeight: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  inventoryRef?: any;
  createdAt: string;
  updatedAt: string;
}
