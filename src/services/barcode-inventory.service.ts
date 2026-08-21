import apiClient from '../core/apiClient';
import type { 
  BarcodeInventoryItem, 
  CreateBarcodeItemDto 
} from '../common/types/barcode.types';

export const BarcodeInventoryService = {
  createItem: async (data: CreateBarcodeItemDto): Promise<BarcodeInventoryItem> => {
    const response = await apiClient.post<any>('/barcode-inventory', data);
    return response.data?.data || response.data;
  },

  scanBarcode: async (barcode: string): Promise<BarcodeInventoryItem> => {
    const response = await apiClient.get<any>(`/barcode-inventory/scan/${barcode}`);
    return response.data?.data || response.data;
  },

  findAllArchived: async (): Promise<BarcodeInventoryItem[]> => {
    const response = await apiClient.get<any>('/barcode-inventory/archived');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  findAllAvailable: async (karat?: number): Promise<BarcodeInventoryItem[]> => {
    const params = karat ? { karat } : {};
    const response = await apiClient.get<any>('/barcode-inventory', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateItem: async (id: string, data: Partial<CreateBarcodeItemDto>): Promise<BarcodeInventoryItem> => {
    const response = await apiClient.put<any>(`/barcode-inventory/${id}`, data);
    return response.data?.data || response.data;
  },

  softDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/barcode-inventory/${id}`);
  },

  getPrintTag: async (barcode: string): Promise<{ barcode: string; imageBase64: string }> => {
    const response = await apiClient.get<any>(`/barcode-inventory/print-tag/${barcode}`);
    return response.data?.data || response.data;
  },
};
