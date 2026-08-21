import { useState, useCallback } from 'react';
import { BarcodeSalesService } from '../services/barcode-sales.service';
import type { BarcodeInvoice, CreateBarcodeInvoiceDto } from '../common/types/barcode.types';

export const useBarcodeSales = () => {
  const [invoices, setInvoices] = useState<BarcodeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BarcodeSalesService.getInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'فشل في جلب الفواتير');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkout = async (data: CreateBarcodeInvoiceDto) => {
    const invoice = await BarcodeSalesService.checkout(data);
    return invoice;
  };
  
  const cancelInvoice = async (id: string) => {
    await BarcodeSalesService.cancelInvoice(id);
    setInvoices(prev => prev.filter(inv => inv._id !== id));
  };
  
  const updateInvoice = async (id: string, data: CreateBarcodeInvoiceDto) => {
    const updated = await BarcodeSalesService.updateInvoice(id, data);
    setInvoices(prev => prev.map(inv => inv._id === id ? updated : inv));
    return updated;
  };

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    checkout,
    cancelInvoice,
    updateInvoice
  };
};
