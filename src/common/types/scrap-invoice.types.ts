export interface CreateScrapInvoiceDto {
  customer: string;
  karat: 18 | 21;
  weight: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
  totalPrice?: number; // optional override for manual total
}

export type UpdateScrapInvoiceDto = Partial<CreateScrapInvoiceDto>;

export interface ScrapInvoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  customer: string | { _id?: string; id?: string; fullName: string; phoneNumber?: string };
  karat: 18 | 21;
  weight: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
  totalPrice: number;
  status?: 'COMPLETED' | 'CANCELLED';
  actionBy: string | { _id?: string; id?: string; fullName: string; role?: string };
  createdAt: string;
}
