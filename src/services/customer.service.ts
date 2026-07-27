import apiClient from '../core/apiClient';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
} from '../common/types/customer.types';

export const CustomerService = {
  createCustomer: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await apiClient.post<any>('/customers', data);
    return response.data?.data || response.data;
  },

  getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
    const params: any = { ...filters, limit: 1000000 };
    const response = await apiClient.get<any>('/customers', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  getCustomerDetails: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<any>(`/customers/${id}`);
    return response.data?.data || response.data;
  },

  getCustomerStatement: async (id: string): Promise<any> => {
    const response = await apiClient.get<any>(`/customers/${id}/statement`);
    return response.data?.data || response.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await apiClient.put<any>(`/customers/${id}`, data);
    return response.data?.data || response.data;
  },

  removeCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
