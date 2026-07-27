import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationsStore } from '../store/notifications.store';
import { useAuth } from '../core/context/AuthContext';
import { NotificationService } from '../services/notification.service';
import type { NotificationLog } from '../common/types/notification.types';

// The audio sound for new notifications
const chime = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3'); // Lightweight generic success chime

let socket: Socket | null = null;

export const useLiveNotifications = () => {
  const { user } = useAuth();
  const { addNotification, setConnectionStatus, setInitialHistory, liveNotifications } = useNotificationsStore();

  // Global fetch for historical notifications on app load
  useEffect(() => {
    if (user?.role === 'OWNER' && liveNotifications.length === 0) {
      NotificationService.getNotificationHistory()
        .then((res) => {
          if (res.success) {
            setInitialHistory(res.data);
          }
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Socket connection
  useEffect(() => {
    // Only connect if user is OWNER
    if (user?.role !== 'OWNER') return;

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return;

    // Use environment URL or fallback to same domain
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || window.location.origin;

    socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnectionStatus(true);
    });

    socket.on('disconnect', () => {
      setConnectionStatus(false);
    });

    socket.on('notification', (data: NotificationLog) => {
      addNotification(data);
      // Attempt to play chime sound
      chime.play().catch(() => {
        // Browser policy might block autoplay without interaction, safely ignore
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, addNotification, setConnectionStatus]);
};
