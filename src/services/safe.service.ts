import apiClient from '../core/apiClient';
import type {
  Safe,
  UpdateSafeBalanceDto,
  ResetSafeDto,
  SetupSafePasswordDto,
} from '../common/types/safe.types';

export const SafeService = {
  getSafeStatus: async (): Promise<Safe> => {
    const response = await apiClient.get<any>('/safe/status');
    return response.data?.data || response.data;
  },

  setupSafePassword: async (data: SetupSafePasswordDto): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<any>('/safe/setup-password', data);
    return response.data;
  },

  adjustBalance: async (data: UpdateSafeBalanceDto): Promise<{ success: boolean; message: string; data: Safe }> => {
    const response = await apiClient.put<any>('/safe/adjust-balance', data);
    return response.data;
  },

  resetSafe: async (data: ResetSafeDto): Promise<{ success: boolean; message: string; data: Safe }> => {
    const response = await apiClient.post<any>('/safe/reset', data);
    return response.data;
  },
};
