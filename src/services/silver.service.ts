import apiClient from '../core/apiClient';
import type {
  SilverItem,
  CreateSilverItemDto,
  SilverSale,
  QuickSilverSaleDto,
  SilverScrapPurchase,
  BuySilverScrapDto,
  SilverSafeTransaction,
  AdjustSilverSafeDto,
  SilverReportQueryDto,
  SilverReportData,
} from '../common/types/silver.types';

export const SilverService = {
  addSilverItem: async (data: CreateSilverItemDto): Promise<SilverItem> => {
    const response = await apiClient.post<any>('/silver/items', data);
    return response.data?.data || response.data;
  },

  getAvailableItems: async (karat?: number, categoryId?: string, search?: string): Promise<SilverItem[]> => {
    const params = new URLSearchParams();
    if (karat) params.append('karat', karat.toString());
    else params.append('karat', 'all'); // 'all' bypasses backend filter but creates a unique URL
    
    if (categoryId) params.append('categoryId', categoryId);
    else params.append('categoryId', 'all'); // 'all' bypasses backend filter but creates a unique URL
    
    if (search) params.append('search', search);

    const queryString = params.toString();
    const url = `/silver/items?${queryString}`;
    
    const response = await apiClient.get<any>(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    return response.data?.data || response.data;
  },

  quickSale: async (data: QuickSilverSaleDto): Promise<SilverSale> => {
    const response = await apiClient.post<any>('/silver/sale/quick', data);
    return response.data?.data || response.data;
  },

  buyScrap: async (data: BuySilverScrapDto): Promise<SilverScrapPurchase> => {
    const response = await apiClient.post<any>('/silver/scrap/buy', data);
    return response.data?.data || response.data;
  },

  getSilverSafeBalance: async (): Promise<{ currentCashBalance: number }> => {
    const response = await apiClient.get<any>('/silver/safe/balance');
    return response.data?.data || response.data;
  },

  resetSafe: async (data: AdjustSilverSafeDto): Promise<SilverSafeTransaction> => {
    const response = await apiClient.patch<any>('/silver/safe/reset', data);
    return response.data?.data || response.data;
  },

  adjustSafeBalance: async (data: AdjustSilverSafeDto): Promise<SilverSafeTransaction> => {
    const response = await apiClient.patch<any>('/silver/safe/adjust', data);
    return response.data?.data || response.data;
  },

  getSilverReport: async (query: SilverReportQueryDto): Promise<SilverReportData> => {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get<any>(`/silver/reports?${params.toString()}`);
    return response.data?.data || response.data;
  },
};
