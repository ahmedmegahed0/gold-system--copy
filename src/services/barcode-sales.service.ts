import apiClient from '../core/apiClient';
import type { 
  BarcodeCheckoutDto,
  UpdateBarcodeInvoiceDto,
  BarcodeInvoice
} from '../common/types/barcode-sales.types';

export const BarcodeSalesService = {
  checkoutBarcodeSale: async (data: BarcodeCheckoutDto): Promise<BarcodeInvoice> => {
    const response = await apiClient.post<any>('/barcode-sales/checkout', data);
    return response.data?.data || response.data;
  },

  getBarcodeInvoices: async (): Promise<BarcodeInvoice[]> => {
    const response = await apiClient.get<any>('/barcode-sales/invoices');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getBarcodeInvoiceById: async (id: string): Promise<BarcodeInvoice> => {
    const response = await apiClient.get<any>(`/barcode-sales/invoices/${id}`);
    return response.data?.data || response.data;
  },

  updateBarcodeInvoice: async (id: string, data: UpdateBarcodeInvoiceDto): Promise<BarcodeInvoice> => {
    const response = await apiClient.patch<any>(`/barcode-sales/invoices/${id}`, data);
    return response.data?.data || response.data;
  },

  cancelBarcodeInvoice: async (id: string): Promise<void> => {
    await apiClient.patch(`/barcode-sales/invoices/${id}/cancel`);
  },
};
