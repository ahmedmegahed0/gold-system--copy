import apiClient from '../core/apiClient';
import type { CreateScrapInvoiceDto, UpdateScrapInvoiceDto, ScrapInvoice, ScrapInvoiceFilters } from '../common/types/scrap-invoice.types';

export const ScrapInvoiceService = {
  createScrapInvoice: async (data: CreateScrapInvoiceDto): Promise<ScrapInvoice> => {
    const response = await apiClient.post<any>('/scrap-invoices', data);
    return response.data?.data || response.data;
  },

  getScrapInvoices: async (filters?: ScrapInvoiceFilters): Promise<ScrapInvoice[]> => {
    const params: any = { ...filters, limit: 1000000 };
    const response = await apiClient.get<any>('/scrap-invoices', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateScrapInvoice: async (id: string, data: UpdateScrapInvoiceDto): Promise<ScrapInvoice> => {
    const response = await apiClient.put<any>(`/scrap-invoices/${id}`, data);
    return response.data?.data || response.data;
  },

  cancelScrapInvoice: async (id: string): Promise<ScrapInvoice> => {
    const response = await apiClient.put<any>(`/scrap-invoices/${id}/cancel`);
    return response.data?.data || response.data;
  }
};
