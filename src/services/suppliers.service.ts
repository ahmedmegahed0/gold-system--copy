import apiClient from '../core/apiClient';
import type { 
  Supplier, 
  CreateSupplierDto, 
  UpdateSupplierDto, 
  RecordSupplierTransactionDto, 
  SupplierTransaction 
} from '../common/types/supplier.types';

export const SuppliersService = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<any>('/suppliers');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  createSupplier: async (data: CreateSupplierDto): Promise<Supplier> => {
    const response = await apiClient.post<any>('/suppliers', data);
    return response.data?.data || response.data;
  },

  updateSupplier: async (id: string, data: UpdateSupplierDto): Promise<Supplier> => {
    const response = await apiClient.patch<any>(`/suppliers/${id}`, data);
    return response.data?.data || response.data;
  },

  deleteSupplier: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/suppliers/${id}`);
    return response.data;
  },

  getSupplierStatement: async (id: string): Promise<{
    supplier: Supplier;
    currentOpenBalance: {
      cashBalance: number;
      goldBalances: { karat24: number; karat21: number; karat18: number; };
    };
    statementHistory: SupplierTransaction[];
  }> => {
    const response = await apiClient.get<any>(`/suppliers/${id}/statement`);
    return response.data?.data || response.data;
  },

  recordTransaction: async (data: RecordSupplierTransactionDto): Promise<SupplierTransaction> => {
    const response = await apiClient.post<any>('/suppliers/transaction', data);
    return response.data?.data || response.data;
  },
};
