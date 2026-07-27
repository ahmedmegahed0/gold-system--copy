import { useState, useEffect, useCallback } from 'react';
import { CustomerService } from '../services/customer.service';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
} from '../common/types/customer.types';

export const useCustomers = (initialFilters: CustomerFilters = { status: 'ACTIVE' }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CustomerService.getCustomers(filters);
      setCustomers(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء جلب العملاء';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = async (data: CreateCustomerDto) => {
    setError(null);
    try {
      await CustomerService.createCustomer(data);
      await fetchCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة العميل';
      setError(msg);
      throw err;
    }
  };

  const updateCustomer = async (id: string, data: UpdateCustomerDto) => {
    setError(null);
    try {
      await CustomerService.updateCustomer(id, data);
      await fetchCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل العميل';
      setError(msg);
      throw err;
    }
  };

  const softDeleteCustomer = async (id: string) => {
    setError(null);
    try {
      await CustomerService.removeCustomer(id);
      await fetchCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الأرشفة';
      setError(msg);
      throw err;
    }
  };

  return {
    customers,
    isLoading,
    error,
    filters,
    setFilters,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    softDeleteCustomer,
  };
};
