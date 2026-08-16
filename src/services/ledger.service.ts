import apiClient from '../core/apiClient';
import type { LedgerReportResponse } from '../common/types/ledger.types';

export class LedgerService {
  /**
   * Retrieves the General Ledger & Audit Report based on the provided query filters.
   * Requires OWNER permissions.
   * 
   * @returns Promise<LedgerReportResponse>
   */
  static async getLedgerReport(): Promise<LedgerReportResponse> {
    const response = await apiClient.get<LedgerReportResponse>('/daily-ledger/report');
    return response.data;
  }
}
