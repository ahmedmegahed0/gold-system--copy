import { useState, useEffect, useCallback } from 'react';
import { CategoryService } from '../services/category.service';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryStatusFilter,
} from '../common/types/category.types';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  activeFilter: CategoryStatusFilter;
  setActiveFilter: (filter: CategoryStatusFilter) => void;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<void>;
  softDeleteCategory: (id: string) => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CategoryStatusFilter>('ACTIVE');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await CategoryService.getCategories(activeFilter);
      setCategories(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تحميل التصنيفات';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (data: CreateCategoryDto) => {
    setError(null);
    try {
      await CategoryService.createCategory(data);
      await fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة التصنيف';
      setError(msg);
      throw err;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDto) => {
    setError(null);
    try {
      await CategoryService.updateCategory(id, data);
      await fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل التصنيف';
      setError(msg);
      throw err;
    }
  };

  const softDeleteCategory = async (id: string) => {
    setError(null);
    try {
      await CategoryService.removeCategory(id);
      await fetchCategories();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الأرشفة';
      setError(msg);
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    fetchCategories,
    createCategory,
    updateCategory,
    softDeleteCategory,
  };
};
