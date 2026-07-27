export interface CreateCustomerDto {
  fullName: string;
  phoneNumber?: string;
  nationalId?: string;
  address?: string;
}

export interface UpdateCustomerDto {
  fullName?: string;
  phoneNumber?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  address?: string;
}

export interface Customer {
  _id?: string;
  id?: string;
  fullName: string;
  phoneNumber?: string;
  nationalId?: string;
  address?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface CustomerFilters {
  status?: 'ACTIVE' | 'ARCHIVED';
  search?: string;
}
