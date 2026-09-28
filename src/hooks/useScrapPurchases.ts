import { useState, useCallback } from 'react';
import { ScrapPurchasesService } from '../services/scrap-purchases.service';
import type { 
  CreateScrapPurchaseDto, 
  UpdateScrapPurchaseDto, 
  ScrapPurchase 
} from '../common/types/scrap-purchases.types';

interface UseScrapPurchasesReturn {
  purchases: ScrapPurchase[];
  todayTotalWeight: number;
  todayWeight18: number;
  todayWeight21: number;
  isLoading: boolean;
  error: string | null;
  fetchPurchases: (search?: string) => Promise<void>;
  createPurchase: (data: CreateScrapPurchaseDto) => Promise<ScrapPurchase>;
  updatePurchase: (id: string, data: UpdateScrapPurchaseDto) => Promise<ScrapPurchase>;
  deletePurchase: (id: string) => Promise<void>;
}

export const useScrapPurchases = (): UseScrapPurchasesReturn => {
  const [purchases, setPurchases] = useState<ScrapPurchase[]>([]);
  const [todayTotalWeight, setTodayTotalWeight] = useState<number>(0);
  const [todayWeight18, setTodayWeight18] = useState<number>(0);
  const [todayWeight21, setTodayWeight21] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ScrapPurchasesService.getAllPurchases(search);
      setPurchases(data);

      if (!search) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayPurchases = data.filter(p => new Date(p.createdAt) >= todayStart);
        
        const todayWeight = todayPurchases.reduce((sum, p) => sum + (p.weight || 0), 0);
        const weight18 = todayPurchases.filter(p => p.karat === 18).reduce((sum, p) => sum + (p.weight || 0), 0);
        const weight21 = todayPurchases.filter(p => p.karat === 21).reduce((sum, p) => sum + (p.weight || 0), 0);
        
        setTodayTotalWeight(todayWeight);
        setTodayWeight18(weight18);
        setTodayWeight21(weight21);
      }
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
    todayTotalWeight,
    todayWeight18,
    todayWeight21,
    isLoading,
    error,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
  };
};
