export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

export type CategoryStatusFilter = 'ACTIVE' | 'ARCHIVED';

export interface Category {
  _id: string; // the backend uses _id for mongo documents typically, but user prompt says 'id'. We will map both or use _id to match previous components.
  id?: string;
  name: string;
  status: string; // The backend usually relies on a status or isArchived field.
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}
