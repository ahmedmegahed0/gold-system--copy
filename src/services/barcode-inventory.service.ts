import apiClient from '../core/apiClient';
import type { 
  CreateBarcodeItemDto,
  UpdateBarcodeItemDto,
  BarcodeItem 
} from '../common/types/barcode-inventory.types';

export const BarcodeInventoryService = {
  createBarcodeItem: async (data: CreateBarcodeItemDto): Promise<BarcodeItem> => {
    const response = await apiClient.post<any>('/barcode-inventory', data);
    return response.data?.data || response.data;
  },

  getBarcodeItems: async (karat?: 18 | 21 | 24): Promise<BarcodeItem[]> => {
    const params = karat ? { karat } : {};
    const response = await apiClient.get<any>('/barcode-inventory', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  scanBarcodeItem: async (barcode: string): Promise<BarcodeItem> => {
    const response = await apiClient.get<any>(`/barcode-inventory/scan/${barcode}`);
    return response.data?.data || response.data;
  },

  getArchivedBarcodeItems: async (): Promise<BarcodeItem[]> => {
    const response = await apiClient.get<any>('/barcode-inventory/archived');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateBarcodeItem: async (id: string, data: UpdateBarcodeItemDto): Promise<BarcodeItem> => {
    const response = await apiClient.put<any>(`/barcode-inventory/${id}`, data);
    return response.data?.data || response.data;
  },

  archiveBarcodeItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/barcode-inventory/${id}`);
  },

  getPrintTag: async (barcode: string): Promise<{ barcode: string; imageBase64: string }> => {
    const response = await apiClient.get<any>(`/barcode-inventory/print-tag/${barcode}`);
    return response.data?.data || response.data;
  }
};
