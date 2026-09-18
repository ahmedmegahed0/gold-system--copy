import { useState, useEffect, useCallback } from 'react';
import { SuppliersService } from '../services/suppliers.service';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../common/types/supplier.types';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await SuppliersService.getAllSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في جلب قائمة الموردين');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (data: CreateSupplierDto) => {
    const newSupplier = await SuppliersService.createSupplier(data);
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = async (id: string, data: UpdateSupplierDto) => {
    const updated = await SuppliersService.updateSupplier(id, data);
    setSuppliers(prev => prev.map(s => (s._id === id || s.id === id) ? updated : s));
    return updated;
  };

  const deleteSupplier = async (id: string) => {
    await SuppliersService.deleteSupplier(id);
    setSuppliers(prev => prev.filter(s => s._id !== id && s.id !== id));
  };

  return {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
