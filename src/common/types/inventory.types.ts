export interface TagDetailDto {
  count: number;
  weight: number;
}

export interface CreateInventoryDto {
  title: string;
  companyName?: string;
  category: string; // The backend usually expects an ID string for refs
  karat: 18 | 21;
  initialCount: number;
  totalGrossWeight: number;
  tagDetails?: TagDetailDto[];
}

export interface AddStockDto {
  count: number;
  grossWeight: number;
  tagDetails?: TagDetailDto[];
}

export type UpdateInventoryDto = Partial<CreateInventoryDto>;

export interface InventoryItem {
  _id?: string;
  id?: string;
  title: string;
  companyName?: string;
  category: { _id?: string; id?: string; name: string } | string;
  karat: 18 | 21;
  initialCount: number;
  currentCount: number;
  initialGrossWeight: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  tagDetails?: TagDetailDto[];
  status?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface InventoryFilters {
  status?: 'ACTIVE' | 'ARCHIVED';
  karat?: 18 | 21;
  companyName?: string;
}
