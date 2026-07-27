import { create } from 'zustand';
import type { NotificationLog } from '../common/types/notification.types';

interface NotificationsState {
  liveNotifications: NotificationLog[];
  unreadCount: number;
  isConnected: boolean;
  
  addNotification: (notification: NotificationLog) => void;
  markAllAsRead: () => void;
  setConnectionStatus: (status: boolean) => void;
  setInitialHistory: (notifications: NotificationLog[]) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  liveNotifications: [],
  unreadCount: 0,
  isConnected: false,
  
  addNotification: (notification) => set((state) => ({
    liveNotifications: [notification, ...state.liveNotifications].slice(0, 50), // keep last 50 live
    unreadCount: state.unreadCount + 1
  })),
  
  markAllAsRead: () => set({ unreadCount: 0 }),
  
  setConnectionStatus: (status) => set({ isConnected: status }),
  
  setInitialHistory: (notifications) => set({ 
    liveNotifications: notifications.slice(0, 50) 
  })
}));
