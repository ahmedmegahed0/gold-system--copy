import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Clock, 
  ShieldAlert, 
  Info,
  CircleDollarSign,
  ShoppingCart
} from 'lucide-react';
import { useNotificationsStore } from '../../store/notifications.store';
import { NotificationService } from '../../services/notification.service';
import type { NotificationType } from '../../common/types/notification.types';

const NOTIFICATION_ICONS: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  NEW_GOLD_SALE: { icon: ShoppingCart, color: 'text-theme-sales', bg: 'bg-theme-sales/10' },
  SCRAP_GOLD_SALE: { icon: CircleDollarSign, color: 'text-theme-scrap', bg: 'bg-theme-scrap/10' },
};

// Helper to format time relative (e.g. منذ دقيقتين)
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) {
    const min = Math.floor(diffInSeconds / 60);
    return `منذ ${min} ${min === 1 ? 'دقيقة' : min === 2 ? 'دقيقتين' : min <= 10 ? 'دقائق' : 'دقيقة'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : hours <= 10 ? 'ساعات' : 'ساعة'}`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `منذ ${days} يوم`;
};

export const NotificationsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { liveNotifications, isConnected, setInitialHistory, markAllAsRead } = useNotificationsStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // When visiting the page, mark all as read
    markAllAsRead();

    // Fetch initial history if our liveNotifications is empty or we want to ensure full history
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const res = await NotificationService.getNotificationHistory();
        if (res.success) {
          // Merge history with whatever live ones we have, avoiding duplicates by ID if necessary
          // For simplicity, if we fetch history, we can just set it as the base state
          setInitialHistory(res.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'تعذر جلب السجل التاريخي للإشعارات.');
      } finally {
        setIsLoading(false);
      }
    };

    if (liveNotifications.length === 0) {
      loadHistory();
    }
  }, [markAllAsRead, setInitialHistory, liveNotifications.length]);

  return (
    <div className="h-full flex flex-col gap-6 p-2 lg:p-6 relative max-w-5xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold relative">
              <Bell size={24} />
              {isConnected && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
              )}
            </div>
            مركز التنبيهات ومراقبة الحركة
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            سجل حي ومباشر لجميع الحركات المهمة والعمليات على النظام
          </p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${isConnected ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isConnected ? 'متصل بالبث المباشر (LIVE)' : 'غير متصل'}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-bold">
            <ShieldAlert size={20} />
            {error}
          </div>
        )}

        {isLoading && liveNotifications.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-gray-400">
            <span className="font-bold animate-pulse">جاري تحميل سجل الإشعارات...</span>
          </div>
        ) : liveNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Bell size={32} />
            </div>
            <p className="text-lg font-bold text-gray-500">لا توجد إشعارات مسجلة حتى الآن.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {liveNotifications.map((notification) => {
              const TypeConfig = NOTIFICATION_ICONS[notification.type] || { icon: Info, color: 'text-gold', bg: 'bg-gold/10' };
              const Icon = TypeConfig.icon;

              return (
                <div 
                  key={notification.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
                >
                  <div className={`p-3 rounded-xl shrink-0 ${TypeConfig.bg} ${TypeConfig.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-charcoal font-bold leading-relaxed whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-gray-400">
                      <Clock size={12} />
                      <span dir="ltr">{getRelativeTime(notification.createdAt)}</span>
                      <span className="mx-1">•</span>
                      <span dir="ltr">{new Date(notification.createdAt).toLocaleString('en-GB')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
