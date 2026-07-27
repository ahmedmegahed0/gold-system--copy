import { useState, useEffect, useCallback } from 'react';
import { EmployeeService } from '../services/employee.service';
import type {
  Employee,
  CreateUserDto,
  UpdateUserDto,
  EmployeeStatusFilter,
} from '../common/types/employee.types';

interface UseEmployeesReturn {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  activeFilter: EmployeeStatusFilter;
  setActiveFilter: (filter: EmployeeStatusFilter) => void;
  fetchEmployees: () => Promise<void>;
  createEmployee: (data: CreateUserDto) => Promise<void>;
  updateEmployee: (id: string, data: UpdateUserDto) => Promise<void>;
  softDeleteEmployee: (id: string) => Promise<void>;
}

export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EmployeeStatusFilter>('ACTIVE');

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await EmployeeService.getEmployees(activeFilter);
      setEmployees(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (data: CreateUserDto) => {
    setError(null);
    try {
      await EmployeeService.createEmployee(data);
      await fetchEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف';
      setError(msg);
      throw err;
    }
  };

  const updateEmployee = async (id: string, data: UpdateUserDto) => {
    setError(null);
    try {
      await EmployeeService.updateEmployee(id, data);
      await fetchEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء تعديل البيانات';
      setError(msg);
      throw err;
    }
  };

  const softDeleteEmployee = async (id: string) => {
    setError(null);
    try {
      await EmployeeService.removeEmployee(id);
      await fetchEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الأرشفة';
      setError(msg);
      throw err;
    }
  };

  return {
    employees,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
  };
};
