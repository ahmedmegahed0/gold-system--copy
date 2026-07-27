export type NotificationType = 'NEW_GOLD_SALE' | 'SCRAP_GOLD_SALE';

export interface NotificationLog {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: string;
}
