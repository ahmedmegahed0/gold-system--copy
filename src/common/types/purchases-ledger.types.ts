export interface PurchasesQueryDto {
  startDate?: string;
  endDate?: string;
  preset?: 'TODAY' | 'YESTERDAY' | 'WEEKLY' | 'MONTHLY';
}

export interface OutflowsBreakdown {
  pettyExpensesCash: number;
  goldPurchasesCash: number;
  scrapGoldPurchasesCash: number;
  supplierPaymentsCash: number;
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
    scrapPurchasedGrams?: {
      karat24: number;
      karat21: number;
      karat18: number;
    };
    totalOutflowsPrice: number;
  };
}
