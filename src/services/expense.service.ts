import apiClient from '../core/apiClient';
import type { CreateExpenseDto, Expense } from '../common/types/expense.types';

export class ExpenseService {
  /**
   * Logs a new petty expense or asset purchase.
   * Accessible to OWNER and EMPLOYEE.
   * 
   * @param data CreateExpenseDto
   * @returns Promise<{ success: boolean; message: string; expense: Expense }>
   */
  static async createExpense(data: CreateExpenseDto): Promise<{ success: boolean; message: string; expense: Expense }> {
    const response = await apiClient.post<{ success: boolean; message: string; expense: Expense }>('/expenses', data);
    return response.data;
  }

  /**
   * Fetches the entire chronological paper log registry of store expenditures.
   * Requires OWNER permissions.
   * 
   * @returns Promise<{ success: boolean; data: Expense[] }>
   */
  static async getExpenses(category?: string): Promise<{ success: boolean; data: Expense[] }> {
    const params: any = {};
    if (category && category !== 'ALL') params.category = category;
    const response = await apiClient.get<{ success: boolean; data: Expense[] }>('/expenses', { params });
    return response.data;
  }

  /**
   * Updates an existing expense.
   * Requires OWNER permissions.
   */
  static async updateExpense(id: string, data: Partial<CreateExpenseDto>): Promise<{ success: boolean; message: string; data: Expense }> {
    const response = await apiClient.patch<{ success: boolean; message: string; data: Expense }>(`/expenses/${id}`, data);
    return response.data;
  }

  /**
   * Deletes an expense.
   * Requires OWNER permissions.
   */
  static async deleteExpense(id: string): Promise<{ success: boolean; message: string; id: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string; id: string }>(`/expenses/${id}`);
    return response.data;
  }
}
