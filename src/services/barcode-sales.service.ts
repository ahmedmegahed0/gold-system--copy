import apiClient from '../core/apiClient';
import type { 
  BarcodeInvoice, 
  CreateBarcodeInvoiceDto 
} from '../common/types/barcode.types';

export const BarcodeSalesService = {
  checkout: async (data: CreateBarcodeInvoiceDto): Promise<BarcodeInvoice> => {
    const response = await apiClient.post<any>('/barcode-sales/checkout', data);
    return response.data?.data || response.data;
  },

  getInvoices: async (): Promise<BarcodeInvoice[]> => {
    const response = await apiClient.get<any>('/barcode-sales/invoices');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateInvoice: async (id: string, data: CreateBarcodeInvoiceDto): Promise<BarcodeInvoice> => {
    const response = await apiClient.patch<any>(`/barcode-sales/invoices/${id}`, data);
    return response.data?.data || response.data;
  },

  getInvoiceById: async (id: string): Promise<BarcodeInvoice> => {
    const response = await apiClient.get<any>(`/barcode-sales/invoices/${id}`);
    return response.data?.data || response.data;
  },

  cancelInvoice: async (id: string): Promise<void> => {
    await apiClient.patch(`/barcode-sales/invoices/${id}/cancel`);
  },
};
