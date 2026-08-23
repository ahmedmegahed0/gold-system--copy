import apiClient from '../core/apiClient';
import type { 
  CreateScrapPurchaseDto, 
  UpdateScrapPurchaseDto, 
  ScrapPurchase 
} from '../common/types/scrap-purchases.types';

export const ScrapPurchasesService = {
  createPurchase: async (data: CreateScrapPurchaseDto): Promise<ScrapPurchase> => {
    const response = await apiClient.post<any>('/scrap-purchases', data);
    return response.data?.data || response.data;
  },

  getAllPurchases: async (): Promise<ScrapPurchase[]> => {
    const response = await apiClient.get<any>('/scrap-purchases');
    return response.data?.data || response.data;
  },

  getPurchaseById: async (id: string): Promise<ScrapPurchase> => {
    const response = await apiClient.get<any>(`/scrap-purchases/${id}`);
    return response.data?.data || response.data;
  },

  updatePurchase: async (id: string, data: UpdateScrapPurchaseDto): Promise<ScrapPurchase> => {
    const response = await apiClient.put<any>(`/scrap-purchases/${id}`, data);
    return response.data?.data || response.data;
  },

  deletePurchase: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<any>(`/scrap-purchases/${id}`);
    return response.data;
  }
};
