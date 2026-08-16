import { useState, useCallback } from 'react';
import { SafeService } from '../services/safe.service';
import type {
  Safe,
  UpdateSafeBalanceDto,
  ResetSafeDto,
  SetupSafePasswordDto,
} from '../common/types/safe.types';

export const useSafe = () => {
  const [safeStatus, setSafeStatus] = useState<Safe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSafeStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await SafeService.getSafeStatus();
      setSafeStatus(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء جلب حالة الخزنة';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupPassword = async (data: SetupSafePasswordDto) => {
    try {
      const result = await SafeService.setupSafePassword(data);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إعداد باسورد الخزنة';
      throw new Error(msg);
    }
  };

  const adjustBalance = async (data: UpdateSafeBalanceDto) => {
    try {
      const result = await SafeService.adjustBalance(data);
      setSafeStatus(result.data);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل رصيد الخزنة';
      throw new Error(msg);
    }
  };

  const resetSafe = async (data: ResetSafeDto) => {
    try {
      const result = await SafeService.resetSafe(data);
      setSafeStatus(result.data);
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تصفير الخزنة';
      throw new Error(msg);
    }
  };

  return {
    safeStatus,
    isLoading,
    error,
    fetchSafeStatus,
    setupPassword,
    adjustBalance,
    resetSafe,
  };
};
