export interface CreateScrapPurchaseDto {
  customerName: string;
  customerPhone?: string;
  karat: 18 | 21;
  weight: number;
  totalPrice: number;
  notes?: string;
}

export interface UpdateScrapPurchaseDto extends Partial<CreateScrapPurchaseDto> {}

export interface ScrapPurchase {
  _id: string;
  purchaseNumber: string;
  customerName: string;
  customerPhone?: string;
  karat: 18 | 21;
  weight: number;
  totalPrice: number;
  notes: string;
  actionBy: { _id: string; fullName: string; role: string } | string;
  createdAt: string;
  updatedAt: string;
}
