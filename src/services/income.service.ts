import apiClient from '../core/apiClient';
import type { CreateIncomeDto, Income } from '../common/types/income.types';

export class IncomeService {
  /**
   * Logs a new income/extra cash to the drawer.
   * Accessible to OWNER and EMPLOYEE.
   * 
   * @param data CreateIncomeDto
   * @returns Promise<{ success: boolean; message: string; data: Income }>
   */
  static async createIncome(data: CreateIncomeDto): Promise<{ success: boolean; message: string; data: Income }> {
    const response = await apiClient.post<{ success: boolean; message: string; data: Income }>('/incomes', data);
    return response.data;
  }

  /**
   * Fetches the chronological log of all extra incomes.
   * Requires OWNER permissions. (Or both if specified by backend)
   * 
   * @returns Promise<{ success: boolean; data: Income[] }>
   */
  static async getIncomes(): Promise<{ success: boolean; data: Income[] }> {
    const response = await apiClient.get<{ success: boolean; data: Income[] }>('/incomes');
    return response.data;
  }
}
