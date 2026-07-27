export type ExpenseCategory = 'GOLD_PURCHASE' | 'SHOP_EXPENSES' | 'SALARIES' | 'OTHERS';

export interface CreateExpenseDto {
  title: string;
  amount: number;
  category: ExpenseCategory;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  actionBy: {
    id: string;
    fullName: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}
