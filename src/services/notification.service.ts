import apiClient from '../core/apiClient';
import type { NotificationLog } from '../common/types/notification.types';

export class NotificationService {
  /**
   * Fetches the entire historical log registry of saved alerts.
   * Requires OWNER permissions.
   * 
   * @returns Promise<{ success: boolean; data: NotificationLog[] }>
   */
  static async getNotificationHistory(): Promise<{ success: boolean; data: NotificationLog[] }> {
    const response = await apiClient.get<{ success: boolean; data: NotificationLog[] }>('/notifications/history');
    return response.data;
  }
}
