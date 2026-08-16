export interface PurchasesQueryDto {
  startDate?: string;
  endDate?: string;
  preset?: 'TODAY' | 'YESTERDAY' | 'WEEKLY' | 'MONTHLY';
}

export interface OutflowsBreakdown {
  pettyExpensesCash: number;
  goldPurchasesCash: number;
  salariesCash: number;
  othersCash: number;
}

export interface OutflowsReportResponse {
  success: boolean;
  message: string;
  data: {
    reportPeriod: {
      startDate: string;
      endDate: string;
    };
    outflowsBreakdown: OutflowsBreakdown;
    totalOutflowsPrice: number;
  };
}
