/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '../core/apiClient';
import type { ScrapTransaction } from '../common/gold';

export const ScrapService = {
  getBalance: async () => {
    const response = await apiClient.get('/scrap/balance');
    return response.data;
  },
  recordBuy: async (data: any) => {
    const response = await apiClient.post<ScrapTransaction>('/scrap/buy', data);
    return response.data;
  },
  recordSell: async (data: any) => {
    const response = await apiClient.post<ScrapTransaction>('/scrap/sell', data);
    return response.data;
  },
};

