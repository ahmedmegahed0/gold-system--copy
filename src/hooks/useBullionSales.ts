import { useState, useEffect, useCallback } from 'react';
import { BullionSalesService } from '../services/bullion-sales.service';
import type {
  BullionSale,
  CreateBullionSaleDto,
  UpdateBullionSaleDto,
  BullionSaleStatus,
} from '../common/types/bullion-sales.types';

interface UseBullionSalesReturn {
  invoices: BullionSale[];
  isLoading: boolean;
  error: string | null;
  filters: { status?: BullionSaleStatus; search?: string };
  setFilters: (filters: { status?: BullionSaleStatus; search?: string }) => void;
  fetchInvoices: () => Promise<void>;
  createSale: (data: CreateBullionSaleDto) => Promise<BullionSale>;
  updateSale: (id: string, data: UpdateBullionSaleDto) => Promise<BullionSale>;
  cancelSale: (id: string, reason?: string) => Promise<BullionSale>;
}

export const useBullionSales = (initialFilters = {}): UseBullionSalesReturn => {
  const [invoices, setInvoices] = useState<BullionSale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ status?: BullionSaleStatus; search?: string }>(initialFilters);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BullionSalesService.getAllInvoices(filters);
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تحميل فواتير السبايك');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createSale = async (data: CreateBullionSaleDto) => {
    setError(null);
    try {
      const invoice = await BullionSalesService.createSaleInvoice(data);
      await fetchInvoices();
      return invoice;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إصدار الفاتورة';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateSale = async (id: string, data: UpdateBullionSaleDto) => {
    setError(null);
    try {
      const updated = await BullionSalesService.updateSaleInvoice(id, data);
      await fetchInvoices();
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل الفاتورة';
      setError(msg);
      throw new Error(msg);
    }
  };

  const cancelSale = async (id: string, reason?: string) => {
    setError(null);
    try {
      const canceled = await BullionSalesService.cancelInvoice(id, reason);
      await fetchInvoices();
      return canceled;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إلغاء الفاتورة';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    invoices,
    isLoading,
    error,
    filters,
    setFilters,
    fetchInvoices,
    createSale,
    updateSale,
    cancelSale,
  };
};
