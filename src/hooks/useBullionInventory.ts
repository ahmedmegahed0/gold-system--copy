import { useState, useEffect, useCallback } from 'react';
import { BullionService } from '../services/bullion.service';
import type { BullionFilters } from '../services/bullion.service';
import type {
  BullionInventory,
  CreateBullionDto,
  UpdateBullionDto,
  AddQuantityDto,
} from '../common/types/bullion.types';

interface UseBullionInventoryReturn {
  bullions: BullionInventory[];
  isLoading: boolean;
  error: string | null;
  filters: BullionFilters;
  setFilters: (filters: BullionFilters) => void;
  fetchBullions: () => Promise<void>;
  createBullion: (data: CreateBullionDto) => Promise<void>;
  updateBullion: (id: string, data: UpdateBullionDto) => Promise<void>;
  addQuantity: (id: string, data: AddQuantityDto) => Promise<void>;
  archiveBullion: (id: string) => Promise<void>;
}

export const useBullionInventory = (initialFilters: BullionFilters = { isArchived: false }): UseBullionInventoryReturn => {
  const [bullions, setBullions] = useState<BullionInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BullionFilters>(initialFilters);

  const fetchBullions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BullionService.getAllBullions(filters);
      setBullions(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تحميل مخزن السبايك';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBullions();
  }, [fetchBullions]);

  const createBullion = async (data: CreateBullionDto) => {
    setError(null);
    try {
      await BullionService.createBullion(data);
      await fetchBullions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة السبيكة/الجنيه';
      setError(msg);
      throw err;
    }
  };

  const updateBullion = async (id: string, data: UpdateBullionDto) => {
    setError(null);
    try {
      await BullionService.updateBullion(id, data);
      await fetchBullions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل بيانات القطعة';
      setError(msg);
      throw err;
    }
  };

  const addQuantity = async (id: string, data: AddQuantityDto) => {
    setError(null);
    try {
      await BullionService.addQuantity(id, data);
      await fetchBullions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تزويد الكمية';
      setError(msg);
      throw err;
    }
  };

  const archiveBullion = async (id: string) => {
    setError(null);
    try {
      await BullionService.archiveBullion(id);
      await fetchBullions();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الأرشفة';
      setError(msg);
      throw err;
    }
  };

  return {
    bullions,
    isLoading,
    error,
    filters,
    setFilters,
    fetchBullions,
    createBullion,
    updateBullion,
    addQuantity,
    archiveBullion,
  };
};
