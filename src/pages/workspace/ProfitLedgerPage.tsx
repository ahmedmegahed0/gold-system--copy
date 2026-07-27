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
  TrendingDown,
  TrendingUp,
  LineChart,
  Target
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { ProfitLedgerService } from '../../services/profit-ledger.service';
import type { ProfitLedgerQueryDto, ProfitLedgerReportResponse } from '../../common/types/profit-ledger.types';

export const ProfitLedgerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  // Strict Owner Guard
  if (user?.role !== 'OWNER') {
    return <Navigate to="/workspace/dashboard" replace />;
  }

  const [query, setQuery] = useState<ProfitLedgerQueryDto>({ preset: 'TODAY' });
  const [report, setReport] = useState<ProfitLedgerReportResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (currentQuery: ProfitLedgerQueryDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await ProfitLedgerService.getProfitReport(currentQuery);
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

  const handlePresetChange = (preset: ProfitLedgerQueryDto['preset']) => {
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
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <LineChart size={24} />
            </div>
            صافي الأرباح الاستراتيجية
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            شاشة مالية متقدمة لمراقبة صافي أرباح المحل والمؤشرات الاقتصادية (صلاحية المالك فقط)
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white border-2 border-gray-200 text-charcoal hover:border-purple-600 hover:text-purple-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Printer size={18} />
          طباعة التقرير
        </button>
      </div>

      {/* ─── Filters Bar (Print Hidden) ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal font-bold">
            <Filter size={18} className="text-purple-600" />
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
                      ? 'bg-purple-600 text-white shadow-md' 
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
                className="pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-charcoal"
              />
            </div>
            <span className="text-gray-400 font-medium">إلى</span>
            <div className="relative">
              <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={query.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-charcoal"
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
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-bold">جاري تحليل الأرباح والمؤشرات...</p>
        </div>
      )}

      {!isLoading && report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Print Header Visible only on Print */}
          <div className="hidden print:block text-center border-b-2 border-charcoal pb-4 mb-6">
            <h2 className="text-3xl font-black text-charcoal mb-2">صافي الأرباح الاستراتيجية</h2>
            <p className="text-gray-500 font-bold" dir="ltr">
              {new Date(report.reportPeriod.startDate).toLocaleDateString('en-GB')} - {new Date(report.reportPeriod.endDate).toLocaleDateString('en-GB')}
            </p>
          </div>

          {/* 1. Central Net Profit Card */}
          <div className={`bg-white rounded-3xl shadow-sm border-2 ${report.finalNetProfit >= 0 ? 'border-purple-600/20' : 'border-red-500/20'} p-8 sm:p-12 text-center relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${report.finalNetProfit >= 0 ? 'bg-purple-600/5' : 'bg-red-500/5'} rounded-bl-[100px] pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-40 h-40 ${report.finalNetProfit >= 0 ? 'bg-purple-600/5' : 'bg-red-500/5'} rounded-tr-[120px] pointer-events-none`}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-16 h-16 ${report.finalNetProfit >= 0 ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-500'} rounded-2xl flex items-center justify-center mb-4`}>
                <Wallet size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">صافي النقدية المتبقي بالخزنة (الربح الفعلي)</h2>
              <div className="flex items-baseline justify-center gap-2" dir="ltr">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight ${report.finalNetProfit >= 0 ? 'text-charcoal' : 'text-red-600'}`}>
                  {report.finalNetProfit.toLocaleString()}
                </span>
                <span className={`text-xl sm:text-2xl font-bold ${report.finalNetProfit >= 0 ? 'text-purple-600' : 'text-red-500'}`}>ج.م</span>
              </div>
              
              <div className={`mt-6 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  report.finalNetProfit >= 0 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                <Target size={16} />
                {report.advancedAnalyticalBreakdown.performanceIndicator}
              </div>
            </div>
          </div>

          {/* 2. Advanced Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cash Inflow Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <span className="block text-sm font-bold text-gray-400 mb-1">إجمالي النقدية الداخلة (مبيعات + كسر)</span>
              <div className="text-3xl font-black text-charcoal" dir="ltr">
                {report.cashflowHighlights.totalCashInflow.toLocaleString()} <span className="text-base text-blue-600">ج.م</span>
              </div>
            </div>

            {/* Making Charges Profit */}
            <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl shadow-sm border border-gold/20 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white text-gold flex items-center justify-center mb-3 shadow-sm border border-gold/10">
                <Activity size={24} />
              </div>
              <span className="block text-sm font-bold text-gold/80 mb-1">صافي أرباح المصنعيات (الإجمالي)</span>
              <div className="text-3xl font-black text-charcoal mb-4" dir="ltr">
                {report.advancedAnalyticalBreakdown.totalCombinedMakingProfit?.toLocaleString()} <span className="text-base text-gold">ج.م</span>
              </div>
              <div className="w-full flex justify-between text-xs font-bold text-gold/70 border-t border-gold/10 pt-3">
                <div className="flex flex-col">
                  <span>جديد</span>
                  <span className="text-charcoal text-sm" dir="ltr">{report.advancedAnalyticalBreakdown.newGoldMakingChargesProfit?.toLocaleString()} ج</span>
                </div>
                <div className="flex flex-col text-left">
                  <span>كسر</span>
                  <span className="text-charcoal text-sm" dir="ltr">{report.advancedAnalyticalBreakdown.scrapGoldMakingChargesProfit?.toLocaleString()} ج</span>
                </div>
              </div>
            </div>

            {/* Cash Outflow Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <TrendingDown size={24} />
              </div>
              <span className="block text-sm font-bold text-gray-400 mb-1">إجمالي النقدية الخارجة (شراء + مصاريف)</span>
              <div className="text-3xl font-black text-charcoal" dir="ltr">
                {report.cashflowHighlights.totalCashOutflow.toLocaleString()} <span className="text-base text-red-500">ج.م</span>
              </div>
            </div>

          </div>

          {/* 3. Detailed Outflows Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
                <TrendingDown size={20} className="text-red-500" />
                تحليل النقدية الخارجة (المصروفات والمشتريات)
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500">مشتريات كسر الذهب</span>
                <span className="text-xl font-black text-charcoal" dir="ltr">
                  {report.outflowsDetailedBreakdown.goldPurchasesCash.toLocaleString()} <span className="text-sm text-gray-400">ج.م</span>
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500">رواتب وسلف عاملين</span>
                <span className="text-xl font-black text-charcoal" dir="ltr">
                  {report.outflowsDetailedBreakdown.salariesCash.toLocaleString()} <span className="text-sm text-gray-400">ج.م</span>
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500">مصاريف محل ونثريات</span>
                <span className="text-xl font-black text-charcoal" dir="ltr">
                  {report.outflowsDetailedBreakdown.pettyExpensesCash.toLocaleString()} <span className="text-sm text-gray-400">ج.م</span>
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-gray-500">مصروفات أخرى</span>
                <span className="text-xl font-black text-charcoal" dir="ltr">
                  {report.outflowsDetailedBreakdown.otherExpensesCash.toLocaleString()} <span className="text-sm text-gray-400">ج.م</span>
                </span>
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
