import apiClient from '../core/apiClient';
import type { CreateMeltingDto, MeltingLog } from '../common/types/melting.types';

export const MeltingService = {
  processMelting: async (dto: CreateMeltingDto) => {
    const response = await apiClient.post('/melting/process', dto);
    return response.data;
  },

  getMeltingHistory: async (): Promise<MeltingLog[]> => {
    const response = await apiClient.get('/melting/history');
    return response.data;
  }
};
