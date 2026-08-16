import apiClient from '../core/apiClient';
import type {
  BullionSale,
  CreateBullionSaleDto,
  UpdateBullionSaleDto,
  BullionSaleStatus,
} from '../common/types/bullion-sales.types';

export const BullionSalesService = {
  createSaleInvoice: async (data: CreateBullionSaleDto): Promise<BullionSale> => {
    const response = await apiClient.post<any>('/bullion-sales', data);
    return response.data?.data || response.data;
  },

  updateSaleInvoice: async (id: string, data: UpdateBullionSaleDto): Promise<BullionSale> => {
    const response = await apiClient.put<any>(`/bullion-sales/${id}`, data);
    return response.data?.data || response.data;
  },

  getAllInvoices: async (params?: { status?: BullionSaleStatus; search?: string }): Promise<BullionSale[]> => {
    const response = await apiClient.get<any>('/bullion-sales', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getInvoiceDetails: async (id: string): Promise<BullionSale> => {
    const response = await apiClient.get<any>(`/bullion-sales/${id}`);
    return response.data?.data || response.data;
  },

  cancelInvoice: async (id: string, reason?: string): Promise<BullionSale> => {
    const response = await apiClient.post<any>(`/bullion-sales/${id}/cancel`, { reason });
    return response.data?.data || response.data;
  },
};
