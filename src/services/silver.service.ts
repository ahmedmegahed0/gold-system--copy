import apiClient from '../core/apiClient';
import type {
  SilverItem,
  CreateSilverItemDto,
  UpdateSilverItemDto,
  SilverKaratSummary,
  SilverSale,
  QuickSilverSaleDto,
  SilverScrapPurchase,
  BuySilverScrapDto,
  SilverSafeTransaction,
  AdjustSilverSafeDto,
  SilverReportQueryDto,
  SilverReportData,
  AddStockDto,
  CancelSilverInvoiceDto,
  UpdateSilverSafePasswordDto,
  GetSilverSafeBalanceDto,
} from '../common/types/silver.types';

export const SilverService = {
  addSilverItem: async (data: CreateSilverItemDto): Promise<SilverItem> => {
    const response = await apiClient.post<any>('/silver/items', data);
    return response.data?.data || response.data;
  },

  updateSilverItem: async (id: string, data: UpdateSilverItemDto): Promise<SilverItem> => {
    const response = await apiClient.patch<any>(`/silver/items/${id}`, data);
    return response.data?.data || response.data;
  },

  addStockToExistingItem: async (id: string, data: AddStockDto): Promise<SilverItem> => {
    const response = await apiClient.patch<any>(`/silver/items/${id}/add-stock`, data);
    return response.data?.data || response.data;
  },

  deleteSilverItem: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await apiClient.delete<any>(`/silver/items/${id}`);
    return response.data?.data || response.data;
  },

  getKaratSummary: async (): Promise<SilverKaratSummary[]> => {
    const response = await apiClient.get<any>('/silver/items/summary/karats');
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

  getSalesInvoices: async (): Promise<SilverSale[]> => {
    const response = await apiClient.get<any>('/silver/sales/invoices');
    return response.data?.data || response.data;
  },

  cancelSaleInvoice: async (id: string, data: CancelSilverInvoiceDto): Promise<{ message: string; sale: SilverSale }> => {
    const response = await apiClient.patch<any>(`/silver/sales/invoices/${id}/cancel`, data);
    return response.data?.data || response.data;
  },

  getScrapInvoices: async (): Promise<SilverScrapPurchase[]> => {
    const response = await apiClient.get<any>('/silver/scrap/invoices');
    return response.data?.data || response.data;
  },

  getScrapInventorySummary: async (): Promise<any> => {
    const response = await apiClient.get<any>('/silver/scrap/inventory');
    return response.data?.data || response.data;
  },

  updateSafePassword: async (data: UpdateSilverSafePasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.patch<any>('/silver/safe/password', data);
    return response.data?.data || response.data;
  },

  getSilverSafeBalance: async (data: GetSilverSafeBalanceDto): Promise<{ currentCashBalance: number }> => {
    const response = await apiClient.post<any>('/silver/safe/balance', data);
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
    if (query.rangeType) params.append('rangeType', query.rangeType.toLowerCase());
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get<any>(`/silver/reports?${params.toString()}`);
    return response.data?.data || response.data;
  },

};
