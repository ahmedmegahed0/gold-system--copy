export interface Employee {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'OWNER' | 'Employee';
  nationalId?: string;
  address?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'Employee';
  nationalId?: string;
  address?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  phoneNumber?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  address?: string;
  password?: string;
}

export type EmployeeStatusFilter = 'ACTIVE' | 'ARCHIVED';
