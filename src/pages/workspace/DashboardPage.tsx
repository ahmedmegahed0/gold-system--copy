import React, { useEffect, useState } from 'react';
import { Scale, Box, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ColorTheme = 'gold' | 'sales' | 'inventory' | 'cashflow';

const themeStyles: Record<ColorTheme, { text: string; bg: string }> = {
  gold: { text: 'text-gold', bg: 'bg-gold/10' },
  sales: { text: 'text-theme-sales', bg: 'bg-theme-sales/10' },
  inventory: { text: 'text-theme-inventory', bg: 'bg-theme-inventory/10' },
  cashflow: { text: 'text-theme-cashflow', bg: 'bg-theme-cashflow/10' },
};

const MetricCard = ({ title, value, icon: Icon, unit = '', theme = 'gold' }: { title: string; value: string | number; icon: any; unit?: string; theme?: ColorTheme }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const styles = themeStyles[theme];
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className={`text-3xl font-bold flex items-baseline gap-1 ${styles.text}`}>
          {value}
          {unit && <span className={`text-sm font-normal text-gray-400 ${isRtl ? 'mr-1' : 'ml-1'}`}>{unit}</span>}
        </h3>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.bg} ${styles.text}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    grossWeight: 0,
    netWeight: 0,
    totalSales: 0,
  });

  useEffect(() => {
    // In a real app, we would fetch actual data here.
    setMetrics({
      totalItems: 1245,
      grossWeight: 8450.50,
      netWeight: 8375.80,
      totalSales: 2540000,
    });
  }, []);

  const formatNumber = (num: number, minFraction = 0) => {
    return num.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: minFraction });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-500">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t('dashboard.totalItems')} 
          value={formatNumber(metrics.totalItems)} 
          icon={Box} 
          theme="inventory"
        />
        <MetricCard 
          title={t('dashboard.grossWeight')} 
          value={formatNumber(metrics.grossWeight, 2)} 
          unit={t('dashboard.grams')}
          icon={Scale} 
        />
        <MetricCard 
          title={t('dashboard.netWeight')} 
          value={formatNumber(metrics.netWeight, 2)} 
          unit={t('dashboard.grams')}
          icon={Scale} 
        />
        <MetricCard 
          title={t('dashboard.totalSales')} 
          value={formatNumber(metrics.totalSales)} 
          unit={t('dashboard.currency')}
          icon={TrendingUp} 
          theme="sales"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">{t('dashboard.chartPlaceholder')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-400">{t('dashboard.activityPlaceholder')}</p>
        </div>
      </div>
    </div>
  );
};
