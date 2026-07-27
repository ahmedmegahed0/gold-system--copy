import apiClient from '../core/apiClient';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStatusFilter,
} from '../common/types/category.types';

export const CategoryService = {
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<any>('/categories', data);
    return response.data?.data || response.data;
  },

  getCategories: async (status?: CategoryStatusFilter): Promise<Category[]> => {
    const params: any = { limit: 1000000 };
    if (status) params.status = status;
    const response = await apiClient.get<any>('/categories', { params });
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.put<any>(`/categories/${id}`, data);
    return response.data?.data || response.data;
  },

  removeCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
