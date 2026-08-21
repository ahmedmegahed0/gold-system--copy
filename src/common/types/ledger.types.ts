export interface GoldWeights {
  karat24: number;
  karat21: number;
  karat18: number;
}

export interface Financials {
  newGoldSalesCash: number;
  barcodeGoldSalesCash: number;
  bullionGoldSalesCash: number;
  scrapGoldSalesCash: number;
  extraIncomesCash: number;
  expensesOutflow: number;
  totalInflow: number;
  netCashflow: number;
}

export interface LedgerPeriodData {
  financials: Financials;
  goldWeights: {
    newGoldSalesGrams: GoldWeights;
    scrapGoldPurchasesGrams: GoldWeights;
  };
}

export interface LedgerReportResponse {
  success: boolean;
  message: string;
  data: {
    today: LedgerPeriodData;
    yesterday: LedgerPeriodData;
    lastWeek?: LedgerPeriodData;
    exactlyOneWeekAgo?: LedgerPeriodData;
  };
}
