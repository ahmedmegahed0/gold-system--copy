export interface CreateIncomeDto {
  amount: number;
  reason: string;
}

export interface Income {
  id: string; // or _id depending on backend response, but typically mongoose id returned as id or _id
  _id?: string;
  amount: number;
  reason: string;
  actionBy: {
    _id?: string;
    id?: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}
