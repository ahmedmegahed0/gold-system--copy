import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { 
  Printer, 
  Calendar, 
  Activity, 
  Filter, 
  ShieldAlert,
  Wallet,
  TrendingUp,
  Scale
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { LedgerService } from '../../services/ledger.service';
import type { LedgerQueryDto, LedgerReportResponse } from '../../common/types/ledger.types';

export const LedgerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  // Strict Owner Guard
  if (user?.role !== 'OWNER') {
    return <Navigate to="/workspace/dashboard" replace />;
  }

  const [query, setQuery] = useState<LedgerQueryDto>({ preset: 'TODAY' });
  const [report, setReport] = useState<LedgerReportResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (currentQuery: LedgerQueryDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await LedgerService.getLedgerReport(currentQuery);
      if (res.success) {
        setReport(res.data);
      } else {
        setError(res.message || 'حدث خطأ أثناء تحميل التقرير.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'فشل الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(query);
  }, [query]);

  const handlePresetChange = (preset: LedgerQueryDto['preset']) => {
    setQuery({ preset, startDate: '', endDate: '' });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setQuery((prev) => ({ ...prev, preset: undefined, [field]: value }));
  };

  return (
    <div className="h-full flex flex-col gap-6 p-2 lg:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Header & Print Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
              <Activity size={24} />
            </div>
            دفتر اليومية وجرد الأرصدة العام
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            شاشة مالية إدارية خاصة بمراقبة الخزنة وحركة المبيعات (صلاحية المالك فقط)
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white border-2 border-gray-200 text-charcoal hover:border-gold hover:text-gold px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Printer size={18} />
          طباعة التقرير
        </button>
      </div>

      {/* ─── Filters Bar (Print Hidden) ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal font-bold">
            <Filter size={18} className="text-gold" />
            <span>نطاق التقرير:</span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {(['TODAY', 'LAST_3_DAYS', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((presetKey) => {
              const labels: Record<string, string> = {
                TODAY: 'اليوم',
                LAST_3_DAYS: 'آخر 3 أيام',
                WEEKLY: 'أسبوعي',
                MONTHLY: 'شهري',
                YEARLY: 'سنوي',
              };
              const isActive = query.preset === presetKey;
              return (
                <button
                  key={presetKey}
                  onClick={() => handlePresetChange(presetKey)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-gold text-white shadow-md' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {labels[presetKey]}
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

          {/* Custom Dates */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={query.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-charcoal"
              />
            </div>
            <span className="text-gray-400 font-medium">إلى</span>
            <div className="relative">
              <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={query.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-charcoal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Report Content ─── */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 font-bold print:hidden">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">جاري تحميل البيانات المالية...</p>
        </div>
      )}

      {!isLoading && report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Print Header Visible only on Print */}
          <div className="hidden print:block text-center border-b-2 border-charcoal pb-4 mb-6">
            <h2 className="text-3xl font-black text-charcoal mb-2">دفتر اليومية وجرد الأرصدة</h2>
            <p className="text-gray-500 font-bold" dir="ltr">
              {new Date(report.reportPeriod.startDate).toLocaleDateString('en-GB')} - {new Date(report.reportPeriod.endDate).toLocaleDateString('en-GB')}
            </p>
          </div>

          {/* 1. Central Grand Cashflow Card */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-gold/20 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-tr-[120px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-4">
                <Wallet size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">الخزنة الكبرى (إجمالي النقدية)</h2>
              <div className="flex items-baseline justify-center gap-2" dir="ltr">
                <span className="text-5xl sm:text-6xl font-black text-charcoal tracking-tight">
                  {report.totalDailyCashflow.toLocaleString()}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gold">ج.م</span>
              </div>
              <div className="mt-6 px-6 py-2.5 bg-gray-100/80 border border-gray-200 rounded-full text-sm font-black text-charcoal shadow-sm flex items-center gap-2" dir="ltr">
                <Calendar size={16} className="text-gold" />
                <span>Period: {report.reportPeriod.startDate.split('T')[0]}</span>
                <span className="text-gray-400 font-bold mx-1">-</span>
                <span>{report.reportPeriod.endDate.split('T')[0]}</span>
              </div>
            </div>
          </div>

          {/* 2. Dual Reporting Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column A: New Gold Sales */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-black text-charcoal">مبيعات الذهب الجديد</h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <span className="block text-sm font-bold text-gray-400 mb-1">إجمالي المتحصلات النقدية</span>
                  <div className="text-3xl font-black text-charcoal" dir="ltr">
                    {report.newGoldSales.totalCash.toLocaleString()} <span className="text-base text-blue-600">ج.م</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-50"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Scale size={12} />
                      جرامات مباعة (عيار 21)
                    </span>
                    <span className="text-xl font-black text-charcoal" dir="ltr">
                      {report.newGoldSales.karat21_Gram.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Scale size={12} />
                      جرامات مباعة (عيار 18)
                    </span>
                    <span className="text-xl font-black text-charcoal" dir="ltr">
                      {report.newGoldSales.karat18_Gram.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column B: Scrap Gold Sales */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-black text-charcoal">بيع الذهب الكسر</h3>
              </div>
              
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <span className="block text-sm font-bold text-gray-400 mb-1">إجمالي المدفوعات النقدية</span>
                  <div className="text-3xl font-black text-charcoal" dir="ltr">
                    {report.scrapGoldSales.totalCash.toLocaleString()} <span className="text-base text-emerald-600">ج.م</span>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-50"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Scale size={12} />
                      جرامات مشتراة (عيار 21)
                    </span>
                    <span className="text-xl font-black text-charcoal" dir="ltr">
                      {report.scrapGoldSales.karat21_Gram.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <Scale size={12} />
                      جرامات مشتراة (عيار 18)
                    </span>
                    <span className="text-xl font-black text-charcoal" dir="ltr">
                      {report.scrapGoldSales.karat18_Gram.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Print Footer */}
          <div className="hidden print:block text-center mt-12 text-sm text-gray-400 border-t border-gray-200 pt-4">
            نظام إدارة الذهب GMS - تم استخراج التقرير في {new Date().toLocaleString('ar-EG')}
          </div>
        </div>
      )}
    </div>
  );
};
