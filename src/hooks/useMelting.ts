import { useState, useCallback } from 'react';
import { MeltingService } from '../services/melting.service';
import type { MeltingLog, CreateMeltingDto } from '../common/types/melting.types';

export const useMelting = () => {
  const [history, setHistory] = useState<MeltingLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await MeltingService.getMeltingHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب سجل التسييح');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processMelting = async (dto: CreateMeltingDto) => {
    try {
      await MeltingService.processMelting(dto);
      await fetchHistory();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'فشل في عملية التسييح');
    }
  };

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    processMelting
  };
};
