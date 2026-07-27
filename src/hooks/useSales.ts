import { useState, useCallback } from 'react';
import { SalesService } from '../services/sales.service';
import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceFilters,
} from '../common/types/sales.types';

export const useSales = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (filters?: InvoiceFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await SalesService.getInvoices(filters);
      setInvoices(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء جلب الفواتير';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSale = async (data: CreateInvoiceDto) => {
    setError(null);
    try {
      const invoice = await SalesService.createSale(data);
      return invoice;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إصدار الفاتورة';
      setError(msg);
      throw err;
    }
  };

  const updateInvoice = async (id: string, data: UpdateInvoiceDto) => {
    setError(null);
    try {
      const updatedInvoice = await SalesService.updateInvoice(id, data);
      setInvoices((prev) => prev.map((inv) => (inv._id === id || inv.id === id ? updatedInvoice : inv)));
      return updatedInvoice;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل الفاتورة';
      setError(msg);
      throw err;
    }
  };

  const cancelInvoice = async (id: string) => {
    setError(null);
    try {
      const canceledInvoice = await SalesService.cancelInvoice(id);
      setInvoices((prev) => prev.map((inv) => (inv._id === id || inv.id === id ? canceledInvoice : inv)));
      return canceledInvoice;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إلغاء الفاتورة';
      setError(msg);
      throw err;
    }
  };

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    createSale,
    updateInvoice,
    cancelInvoice,
  };
};
