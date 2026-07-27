export interface ProfitLedgerQueryDto {
  startDate?: string;
  endDate?: string;
  preset?: 'TODAY' | 'LAST_3_DAYS' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface ProfitLedgerReportResponse {
  success: boolean;
  message: string;
  data: {
    reportPeriod: {
      startDate: string;
      endDate: string;
    };
    cashflowHighlights: {
      totalCashInflow: number;
      totalCashOutflow: number;
    };
    outflowsDetailedBreakdown: {
      pettyExpensesCash: number;
      salariesCash: number;
      goldPurchasesCash: number;
      otherExpensesCash: number;
    };
    finalNetProfit: number;
    advancedAnalyticalBreakdown: {
      newGoldMakingChargesProfit: number;
      scrapGoldMakingChargesProfit: number;
      totalCombinedMakingProfit: number;
      performanceIndicator: string;
    };
  };
}
