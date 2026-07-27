import apiClient from '../core/apiClient';
import type { StockMovementLog } from '../common/types/stock-movement.types';

export const StockMovementService = {
  getStockMovements: async (inventoryItem?: string): Promise<StockMovementLog[]> => {
    const params: any = { limit: 1000000 };
    if (inventoryItem) params.inventoryItem = inventoryItem;
    const response = await apiClient.get<any>('/stock-movements', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },
};
