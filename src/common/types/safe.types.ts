export interface SafeAction {
  actionType: 'INFLOW' | 'OUTFLOW' | 'MANUAL_ADJUSTMENT' | 'RESET' | 'BULLION_SALE' | 'BULLION_SALE_EDIT' | 'BULLION_SALE_CANCEL';
  amount: number;
  reason: string;
  timestamp: string;
  actionBy: string | any;
}

export interface Safe {
  _id?: string;
  id?: string;
  balance: number;
  safePassword?: string | null;
  lastUpdatedAction?: SafeAction;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSafeBalanceDto {
  newBalance: number;
  safePassword: string;
  reason: string;
}

export interface ResetSafeDto {
  safePassword: string;
}

export interface SetupSafePasswordDto {
  currentSafePassword?: string;
  newSafePassword: string;
}
