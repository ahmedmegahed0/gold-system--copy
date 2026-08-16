import apiClient from '../core/apiClient';
import type {
  BullionInventory,
  CreateBullionDto,
  UpdateBullionDto,
  AddQuantityDto,
  BullionType,
} from '../common/types/bullion.types';

export interface BullionFilters {
  type?: BullionType;
  companyName?: string;
  isArchived?: boolean;
}

export const BullionService = {
  createBullion: async (data: CreateBullionDto): Promise<BullionInventory> => {
    const response = await apiClient.post<any>('/bullion-inventory', data);
    return response.data?.data || response.data;
  },

  addQuantity: async (id: string, data: AddQuantityDto): Promise<BullionInventory> => {
    const response = await apiClient.patch<any>(`/bullion-inventory/${id}/add-quantity`, data);
    return response.data?.data || response.data;
  },

  updateBullion: async (id: string, data: UpdateBullionDto): Promise<BullionInventory> => {
    const response = await apiClient.patch<any>(`/bullion-inventory/${id}`, data);
    return response.data?.data || response.data;
  },

  getAllBullions: async (filters?: BullionFilters): Promise<BullionInventory[]> => {
    const response = await apiClient.get<any>('/bullion-inventory', { params: filters });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getBullionDetails: async (id: string): Promise<BullionInventory> => {
    const response = await apiClient.get<any>(`/bullion-inventory/${id}`);
    return response.data?.data || response.data;
  },

  archiveBullion: async (id: string): Promise<void> => {
    await apiClient.delete(`/bullion-inventory/${id}`);
  },
};
