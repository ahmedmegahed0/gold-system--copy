export type StockMovementType = 'INVENTORY_IN' | 'SALE_OUT' | 'INVOICE_UPDATE_RETURN' | 'INVOICE_UPDATE_OUT' | 'BULLION_IN' | 'BULLION_UPDATE_RETURN' | 'BULLION_SALE_OUT' | 'BULLION_UPDATE_OUT' | 'BULLION_CANCEL_RETURN';

export interface StockMovementLog {
  _id?: string;
  id?: string;
  inventoryItem: {
    _id?: string;
    id?: string;
    title: string;
    karat: 18 | 21;
  };
  type: StockMovementType;
  countChange: number;
  grossWeightChange: number;
  netWeightChange: number;
  actionBy: {
    _id?: string;
    id?: string;
    fullName: string;
    role: string;
  };
  reason?: string;
  createdAt: string;
}
