import { useState, useEffect, useCallback } from 'react';
import { StockMovementService } from '../services/stock-movement.service';
import type { StockMovementLog } from '../common/types/stock-movement.types';

export const useStockMovements = (initialFilterId?: string) => {
  const [logs, setLogs] = useState<StockMovementLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItemId, setInventoryItemId] = useState<string>(initialFilterId || '');

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await StockMovementService.getStockMovements(inventoryItemId || undefined);
      setLogs(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء جلب سجل الحركات';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [inventoryItemId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    inventoryItemId,
    setInventoryItemId,
    fetchLogs,
  };
};
