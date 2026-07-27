export interface CreateScrapInvoiceDto {
  customer: string;
  category: string;
  karat: 18 | 21;
  count: number;
  weight: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
}

export type UpdateScrapInvoiceDto = Partial<CreateScrapInvoiceDto>;

export interface ScrapInvoice {
  _id?: string;
  id?: string;
  invoiceNumber: string;
  customer: string | { _id?: string; id?: string; fullName: string; phoneNumber?: string };
  category: string | { _id?: string; id?: string; name: string };
  karat: 18 | 21;
  count: number;
  weight: number;
  goldPriceToday: number;
  makingChargesPerGram: number;
  totalPrice: number;
  status?: 'COMPLETED' | 'CANCELLED';
  actionBy: string | { _id?: string; id?: string; fullName: string; role?: string };
  createdAt: string;
}
