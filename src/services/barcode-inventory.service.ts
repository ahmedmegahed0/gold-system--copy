import apiClient from '../core/apiClient';
import type { 
  CreateBarcodeItemDto,
  UpdateBarcodeItemDto,
  BarcodeItem 
} from '../common/types/barcode-inventory.types';

export const BarcodeInventoryService = {
  createBarcodeItem: async (data: CreateBarcodeItemDto): Promise<BarcodeItem> => {
    let payload: any = data;
    let headers: any = {};
    if (data.file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if ((data as any)[key] !== undefined && (data as any)[key] !== null) {
          formData.append(key, (data as any)[key]);
        }
      });
      payload = formData;
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.post<any>('/barcode-inventory', payload, { headers });
    return response.data?.data || response.data;
  },

  getBarcodeItems: async (karat?: 18 | 21 | 24, category?: string): Promise<BarcodeItem[]> => {
    const params: any = {};
    if (karat) params.karat = karat;
    if (category) params.category = category;
    
    const response = await apiClient.get<any>('/barcode-inventory', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  scanBarcodeItem: async (barcode: string): Promise<BarcodeItem> => {
    const response = await apiClient.get<any>(`/barcode-inventory/scan/${barcode}`, {
      params: { _t: new Date().getTime() }
    });
    return response.data?.data || response.data;
  },

  getArchivedBarcodeItems: async (): Promise<BarcodeItem[]> => {
    const response = await apiClient.get<any>('/barcode-inventory/archived');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateBarcodeItem: async (id: string, data: UpdateBarcodeItemDto): Promise<BarcodeItem> => {
    let payload: any = data;
    let headers: any = {};
    if (data.file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if ((data as any)[key] !== undefined && (data as any)[key] !== null) {
          formData.append(key, (data as any)[key]);
        }
      });
      payload = formData;
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.put<any>(`/barcode-inventory/${id}`, payload, { headers });
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
