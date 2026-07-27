export interface LedgerQueryDto {
  startDate?: string;
  endDate?: string;
  preset?: 'TODAY' | 'LAST_3_DAYS' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface GoldReportSummary {
  totalCash: number;
  karat21_Gram: number;
  karat18_Gram: number;
}

export interface LedgerReportResponse {
  success: boolean;
  message: string;
  data: {
    reportPeriod: {
      startDate: string;
      endDate: string;
    };
    newGoldSales: GoldReportSummary;
    scrapGoldSales: GoldReportSummary;
    totalDailyCashflow: number;
  };
}
