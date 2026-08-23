import { useState, useCallback } from 'react';
import { ScrapPurchasesService } from '../services/scrap-purchases.service';
import type { 
  CreateScrapPurchaseDto, 
  UpdateScrapPurchaseDto, 
  ScrapPurchase 
} from '../common/types/scrap-purchases.types';

interface UseScrapPurchasesReturn {
  purchases: ScrapPurchase[];
  isLoading: boolean;
  error: string | null;
  fetchPurchases: () => Promise<void>;
  createPurchase: (data: CreateScrapPurchaseDto) => Promise<ScrapPurchase>;
  updatePurchase: (id: string, data: UpdateScrapPurchaseDto) => Promise<ScrapPurchase>;
  deletePurchase: (id: string) => Promise<void>;
}

export const useScrapPurchases = (): UseScrapPurchasesReturn => {
  const [purchases, setPurchases] = useState<ScrapPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ScrapPurchasesService.getAllPurchases();
      setPurchases(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تحميل سجل المشتريات';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPurchase = async (data: CreateScrapPurchaseDto) => {
    setError(null);
    try {
      const purchase = await ScrapPurchasesService.createPurchase(data);
      await fetchPurchases();
      return purchase;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تسجيل الشراء';
      setError(msg);
      throw err;
    }
  };

  const updatePurchase = async (id: string, data: UpdateScrapPurchaseDto) => {
    setError(null);
    try {
      const purchase = await ScrapPurchasesService.updatePurchase(id, data);
      await fetchPurchases();
      return purchase;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء التعديل';
      setError(msg);
      throw err;
    }
  };

  const deletePurchase = async (id: string) => {
    setError(null);
    try {
      await ScrapPurchasesService.deletePurchase(id);
      await fetchPurchases();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الحذف';
      setError(msg);
      throw err;
    }
  };

  return {
    purchases,
    isLoading,
    error,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
};
