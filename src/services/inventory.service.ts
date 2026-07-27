import apiClient from '../core/apiClient';
import type {
  InventoryItem,
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryFilters,
} from '../common/types/inventory.types';

export const InventoryService = {
  createInventory: async (data: CreateInventoryDto): Promise<InventoryItem> => {
    const response = await apiClient.post<any>('/inventory', data);
    return response.data?.data || response.data;
  },

  restockInventory: async (id: string, data: any): Promise<InventoryItem> => {
    const response = await apiClient.post<any>(`/inventory/${id}/restock`, data);
    return response.data?.data || response.data;
  },

  updateInventory: async (id: string, data: UpdateInventoryDto): Promise<InventoryItem> => {
    const response = await apiClient.put<any>(`/inventory/${id}`, data);
    return response.data?.data || response.data;
  },

  getInventory: async (filters?: InventoryFilters): Promise<InventoryItem[]> => {
    const params = { ...filters, limit: 1000000 };
    const response = await apiClient.get<any>('/inventory', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getInventoryDetails: async (id: string): Promise<InventoryItem> => {
    const response = await apiClient.get<any>(`/inventory/${id}`);
    return response.data?.data || response.data;
  },

  removeInventory: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/${id}`);
  },
};
