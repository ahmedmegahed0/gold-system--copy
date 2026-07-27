import apiClient from '../core/apiClient';
import type { LedgerQueryDto, LedgerReportResponse } from '../common/types/ledger.types';

export class LedgerService {
  /**
   * Retrieves the General Ledger & Audit Report based on the provided query filters.
   * Requires OWNER permissions.
   * 
   * @param query LedgerQueryDto containing startDate, endDate, or preset
   * @returns Promise<LedgerReportResponse>
   */
  static async getLedgerReport(query: LedgerQueryDto = {}): Promise<LedgerReportResponse> {
    const params = new URLSearchParams();
    
    if (query.preset) {
      params.append('preset', query.preset);
    }
    if (query.startDate) {
      params.append('startDate', query.startDate);
    }
    if (query.endDate) {
      params.append('endDate', query.endDate);
    }

    const queryString = params.toString();
    const endpoint = `/daily-ledger/report${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<LedgerReportResponse>(endpoint);
    return response.data;
  }
}
