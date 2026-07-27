import apiClient from '../core/apiClient';
import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilters,
} from '../common/types/sales.types';

export const SalesService = {
  createSale: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.post<any>('/sales/invoice', data);
    return response.data?.data || response.data;
  },

  getInvoices: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const params: any = { ...filters, limit: 1000000 };
    const response = await apiClient.get<any>('/sales/invoices', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateInvoice: async (id: string, data: UpdateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.put<any>(`/sales/invoice/${id}`, data);
    return response.data?.data || response.data;
  },

  cancelInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.put<any>(`/sales/invoice/${id}/cancel`);
    return response.data?.data || response.data;
  },
};
