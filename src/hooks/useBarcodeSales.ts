import { useState, useCallback } from 'react';
import { BarcodeSalesService } from '../services/barcode-sales.service';
import type { 
  BarcodeInvoice, 
  BarcodeCheckoutDto,
  UpdateBarcodeInvoiceDto
} from '../common/types/barcode-sales.types';

export const useBarcodeSales = () => {
  const [invoices, setInvoices] = useState<BarcodeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await BarcodeSalesService.getBarcodeInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'فشل في جلب الفواتير');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkoutBarcodeSale = async (data: BarcodeCheckoutDto) => {
    const invoice = await BarcodeSalesService.checkoutBarcodeSale(data);
    // Add to top of list if we've already fetched invoices
    setInvoices(prev => [invoice, ...prev]);
    return invoice;
  };
  
  const cancelBarcodeInvoice = async (id: string) => {
    await BarcodeSalesService.cancelBarcodeInvoice(id);
    // Refresh to get correct statuses or manually update
    setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'CANCELLED' } : inv));
  };
  
  const updateBarcodeInvoice = async (id: string, data: UpdateBarcodeInvoiceDto) => {
    const updated = await BarcodeSalesService.updateBarcodeInvoice(id, data);
    setInvoices(prev => prev.map(inv => inv._id === id ? updated : inv));
    return updated;
  };

  const getBarcodeInvoiceById = async (id: string) => {
    return BarcodeSalesService.getBarcodeInvoiceById(id);
  };

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    checkoutBarcodeSale,
    cancelBarcodeInvoice,
    updateBarcodeInvoice,
    getBarcodeInvoiceById
  };
};
