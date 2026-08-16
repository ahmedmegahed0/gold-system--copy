import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { 
  Printer, 
  Activity, 
  Wallet,
  TrendingUp,
  Scale,
  ShieldAlert,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { LedgerService } from '../../services/ledger.service';
import type { LedgerReportResponse, LedgerPeriodData } from '../../common/types/ledger.types';
import { SafeControlPanel } from '../../components/safe/SafeControlPanel';
import { ShieldCheck } from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  // Strict Owner Guard
  if (user?.role !== 'OWNER') {
    return <Navigate to="/workspace/dashboard" replace />;
  }

  const [report, setReport] = useState<LedgerReportResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'yesterday' | 'lastWeek' | 'safe'>('today');

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await LedgerService.getLedgerReport();
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
    fetchReport();
  }, []);

  const renderPeriodData = (data: LedgerPeriodData, title: string) => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {/* Print Header Visible only on Print */}
        <div className="hidden print:block text-center border-b-2 border-charcoal pb-4 mb-6">
          <h2 className="text-3xl font-black text-charcoal mb-2">دفتر اليومية وجرد الأرصدة</h2>
          <p className="text-gray-500 font-bold">{title}</p>
        </div>

        {/* 1. Central Grand Cashflow Card */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-gold/20 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-tr-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-4">
              <Wallet size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-500 mb-2">صافي التدفق النقدي بالخزنة</h2>
            <div className="flex items-baseline justify-center gap-2" dir="ltr">
              <span className="text-5xl sm:text-6xl font-black text-charcoal tracking-tight">
                {data.financials.netCashflow.toLocaleString()}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-gold">ج.م</span>
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
              <h3 className="text-xl font-black text-charcoal">مبيعات الذهب الجديد والسبايك</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-bold text-gray-400 mb-1">نقدي المشغولات</span>
                  <div className="text-3xl font-black text-charcoal" dir="ltr">
                    {data.financials.newGoldSalesCash.toLocaleString()} <span className="text-base text-blue-600">ج.م</span>
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-400 mb-1">نقدي السبايك والجنيهات</span>
                  <div className="text-3xl font-black text-charcoal" dir="ltr">
                    {(data.financials.bullionGoldSalesCash || 0).toLocaleString()} <span className="text-base text-blue-600">ج.م</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gray-50"></div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 24
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.newGoldSalesGrams.karat24.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 21
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.newGoldSalesGrams.karat21.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 18
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.newGoldSalesGrams.karat18.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column B: Scrap Gold Purchases */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-black text-charcoal">شراء الذهب الكسر</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <span className="block text-sm font-bold text-gray-400 mb-1">إجمالي المدفوعات النقدية</span>
                <div className="text-3xl font-black text-charcoal" dir="ltr">
                  {data.financials.scrapGoldSalesCash.toLocaleString()} <span className="text-base text-emerald-600">ج.م</span>
                </div>
              </div>

              <div className="h-px w-full bg-gray-50"></div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 24
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.scrapGoldPurchasesGrams.karat24.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 21
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.scrapGoldPurchasesGrams.karat21.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <Scale size={12} />
                    عيار 18
                  </span>
                  <span className="text-xl font-black text-charcoal" dir="ltr">
                    {data.goldWeights.scrapGoldPurchasesGrams.karat18.toFixed(2)}<span className="text-sm text-gray-400 ml-1">g</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* 3. Extra Incomes & Expenses Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 p-6 flex flex-col justify-center text-center relative overflow-hidden">
            <span className="block text-sm font-bold text-emerald-600 mb-2">إجمالي الإيرادات الإضافية والسيولة المودعة</span>
            <div className="text-3xl font-black text-emerald-700" dir="ltr">
              + {data.financials.extraIncomesCash.toLocaleString()} <span className="text-base">ج.م</span>
            </div>
          </div>
          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6 flex flex-col justify-center text-center relative overflow-hidden">
            <span className="block text-sm font-bold text-red-600 mb-2">إجمالي المصروفات والنثريات الخارجية</span>
            <div className="text-3xl font-black text-red-700" dir="ltr">
              - {data.financials.expensesOutflow.toLocaleString()} <span className="text-base">ج.م</span>
            </div>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-12 text-sm text-gray-400 border-t border-gray-200 pt-4">
          نظام إدارة مجوهرات أبو كبشة - تم استخراج التقرير في {new Date().toLocaleString('ar-EG')}
        </div>
      </div>
    );
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
            جرد وتقارير اليومية
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            شاشة مالية إدارية للمقارنة بين أرصدة اليوم وأمس والأسبوع الماضي (المالك فقط)
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

      {/* ─── Tabs Bar (Print Hidden) ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 print:hidden flex items-center gap-2">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'today' ? 'bg-charcoal text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <CalendarDays size={18} /> تقرير اليوم
        </button>
        <button
          onClick={() => setActiveTab('yesterday')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'yesterday' ? 'bg-charcoal text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <CalendarDays size={18} /> تقرير الأمس
        </button>
        <button
          onClick={() => setActiveTab('lastWeek')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'lastWeek' ? 'bg-charcoal text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <CalendarDays size={18} /> تقرير الأسبوع الماضي كامل
        </button>
        <button
          onClick={() => setActiveTab('safe')}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'safe' ? 'bg-gold text-white shadow-md' : 'text-gold hover:bg-gold/10 border-2 border-transparent hover:border-gold/20'}`}
        >
          <ShieldCheck size={18} /> الخزنة الفعلية
        </button>
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
        <>
          {activeTab === 'today' && renderPeriodData(report.today, 'تقرير اليوم')}
          {activeTab === 'yesterday' && renderPeriodData(report.yesterday, 'تقرير الأمس')}
          {activeTab === 'lastWeek' && (report.lastWeek || report.exactlyOneWeekAgo) ? renderPeriodData((report.lastWeek || report.exactlyOneWeekAgo) as LedgerPeriodData, 'تقرير الأسبوع الماضي كامل') : activeTab === 'lastWeek' && (
            <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl">
              عذراً، بيانات الأسبوع الماضي غير متوفرة من الخادم حالياً.
              <br/>
              البيانات المتاحة: {JSON.stringify(Object.keys(report))}
            </div>
          )}
          {activeTab === 'safe' && <SafeControlPanel />}
        </>
      )}
      {!isLoading && !report && activeTab === 'safe' && (
        <SafeControlPanel />
      )}
    </div>
  );
};
