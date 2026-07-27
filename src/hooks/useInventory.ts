import { useState, useEffect, useCallback } from 'react';
import { InventoryService } from '../services/inventory.service';
import type {
  InventoryItem,
  CreateInventoryDto,
  UpdateInventoryDto,
  InventoryFilters,
} from '../common/types/inventory.types';

interface UseInventoryReturn {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  filters: InventoryFilters;
  setFilters: (filters: InventoryFilters) => void;
  fetchInventory: () => Promise<void>;
  createInventory: (data: CreateInventoryDto) => Promise<void>;
  updateInventory: (id: string, data: UpdateInventoryDto) => Promise<void>;
  restockInventory: (id: string, data: any) => Promise<void>;
  softDeleteInventory: (id: string) => Promise<void>;
}

export const useInventory = (initialFilters: InventoryFilters = { status: 'ACTIVE' }): UseInventoryReturn => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await InventoryService.getInventory(filters);
      setInventory(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تحميل المخزون';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const createInventory = async (data: CreateInventoryDto) => {
    setError(null);
    try {
      await InventoryService.createInventory(data);
      await fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة البضاعة';
      setError(msg);
      throw err;
    }
  };

  const updateInventory = async (id: string, data: UpdateInventoryDto) => {
    setError(null);
    try {
      await InventoryService.updateInventory(id, data);
      await fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل البضاعة';
      setError(msg);
      throw err;
    }
  };

  const softDeleteInventory = async (id: string) => {
    setError(null);
    try {
      await InventoryService.removeInventory(id);
      await fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الأرشفة';
      setError(msg);
      throw err;
    }
  };

  const restockInventory = async (id: string, data: any) => {
    setError(null);
    try {
      await InventoryService.restockInventory(id, data);
      await fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء التزويد';
      setError(msg);
      throw err;
    }
  };

  return {
    inventory,
    isLoading,
    error,
    filters,
    setFilters,
    fetchInventory,
    createInventory,
    updateInventory,
    restockInventory,
    softDeleteInventory,
  };
};
