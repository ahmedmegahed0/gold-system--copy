import apiClient from '../core/apiClient';
import type { BuyScrapDto, ScrapGold } from '../common/types/scrap-gold.types';

export const ScrapGoldService = {
  getScrapBalance: async (): Promise<ScrapGold[]> => {
    const response = await apiClient.get<any>('/scrap-gold/balance');
    return response.data?.data || response.data;
  },

  buyScrap: async (data: BuyScrapDto): Promise<ScrapGold> => {
    const response = await apiClient.post<any>('/scrap-gold/buy', data);
    return response.data?.data || response.data;
  }
};
