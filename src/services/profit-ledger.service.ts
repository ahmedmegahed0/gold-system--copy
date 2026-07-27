import apiClient from '../core/apiClient';
import type { ProfitLedgerQueryDto, ProfitLedgerReportResponse } from '../common/types/profit-ledger.types';

export const ProfitLedgerService = {
  getProfitReport: async (query: ProfitLedgerQueryDto): Promise<ProfitLedgerReportResponse> => {
    const params = new URLSearchParams();
    if (query.preset) params.append('preset', query.preset);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get<ProfitLedgerReportResponse>(`/profits/report?${params.toString()}`);
    return response.data;
  }
};
