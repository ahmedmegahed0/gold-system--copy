import apiClient from '../core/apiClient';
import type { PurchasesQueryDto, OutflowsReportResponse } from '../common/types/purchases-ledger.types';

export class PurchasesLedgerService {
  /**
   * Retrieves the Purchases & Outflows Ledger Report based on the provided query filters.
   * Requires OWNER permissions.
   * 
   * @param query PurchasesQueryDto containing startDate, endDate, or preset
   * @returns Promise<OutflowsReportResponse>
   */
  static async getOutflowsReport(query: PurchasesQueryDto = {}): Promise<OutflowsReportResponse> {
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
    const endpoint = `/purchases-ledger/report${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<OutflowsReportResponse>(endpoint);
    return response.data;
  }
}
