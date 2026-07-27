import apiClient from '../core/apiClient';
import type {
  Employee,
  CreateUserDto,
  UpdateUserDto,
  EmployeeStatusFilter,
} from '../common/types/employee.types';

export const EmployeeService = {
  /**
   * إضافة موظف جديد في المحل (للمالك فقط - بحد أقصى موظفين اثنين)
   */
  createEmployee: async (data: CreateUserDto): Promise<Employee> => {
    const response = await apiClient.post<any>('/users/employee', data);
    return response.data?.data || response.data;
  },

  /**
   * عرض قائمة الموظفين (نشطين أو مؤرشفين بناءً على الفلتر)
   */
  getEmployees: async (status?: EmployeeStatusFilter): Promise<Employee[]> => {
    const params: any = { limit: 1000000 };
    if (status) params.status = status;
    const token = localStorage.getItem('accessToken');
    console.log('=== getEmployees DEBUG ===');
    console.log('Token in localStorage:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
    console.log('Request params:', params);
    
    try {
      const response = await apiClient.get<any>('/users/employees', { params });
      console.log('getEmployees Response status:', response.status);
      console.log('getEmployees Response data:', JSON.stringify(response.data, null, 2));
      const result = response.data?.data || response.data;
      return Array.isArray(result) ? result : [];
    } catch (err: any) {
      console.error('getEmployees ERROR status:', err.response?.status);
      console.error('getEmployees ERROR data:', JSON.stringify(err.response?.data, null, 2));
      throw err;
    }
  },

  /**
   * تعديل بيانات حساب أو تغيير كلمة المرور (للمالك فقط)
   */
  updateEmployee: async (id: string, data: UpdateUserDto): Promise<Employee> => {
    const response = await apiClient.put<any>(`/users/${id}`, data);
    return response.data?.data || response.data;
  },

  /**
   * حذف موظف ونقله للأرشيف (للمالك فقط - حذف ناعم)
   */
  removeEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/employee/${id}`);
  },
};
