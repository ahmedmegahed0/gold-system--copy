import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { 
  Printer, 
  Calendar, 
  Filter, 
  ShieldAlert,
  Wallet,
  ShoppingCart,
  Receipt,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { PurchasesLedgerService } from '../../services/purchases-ledger.service';
import type { PurchasesQueryDto, OutflowsReportResponse } from '../../common/types/purchases-ledger.types';

export const PurchasesLedgerPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  // Strict Owner Guard
  if (user?.role !== 'OWNER') {
    return <Navigate to="/workspace/dashboard" replace />;
  }

  const [query, setQuery] = useState<PurchasesQueryDto>({ preset: 'TODAY' });
  const [report, setReport] = useState<OutflowsReportResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (currentQuery: PurchasesQueryDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await PurchasesLedgerService.getOutflowsReport(currentQuery);
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

  const handlePresetChange = (preset: PurchasesQueryDto['preset']) => {
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
              <ShoppingCart size={24} />
            </div>
            دفتر المشتريات والخوارج الكلية
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            شاشة مالية إدارية خاصة بمراقبة كافة المخرجات المالية والتكاليف (صلاحية المالك فقط)
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
          <p className="font-bold">جاري تحميل بيانات المشتريات والخوارج...</p>
        </div>
      )}

      {!isLoading && report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Print Header Visible only on Print */}
          <div className="hidden print:block text-center border-b-2 border-charcoal pb-4 mb-6">
            <h2 className="text-3xl font-black text-charcoal mb-2">دفتر المشتريات والخوارج الكلية</h2>
            <p className="text-gray-500 font-bold" dir="ltr">
              {new Date(report.reportPeriod.startDate).toLocaleDateString('en-GB')} - {new Date(report.reportPeriod.endDate).toLocaleDateString('en-GB')}
            </p>
          </div>

          {/* 1. Central Total Outflows Display (Hero) */}
          <div className="bg-white rounded-3xl shadow-sm border-2 border-gold/20 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-tr-[120px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-4">
                <Wallet size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-500 mb-2">إجمالي الخارج المالي الفعلي (التكلفة الكلية)</h2>
              <div className="flex items-baseline justify-center gap-2" dir="ltr">
                <span className="text-5xl sm:text-6xl font-black text-charcoal tracking-tight">
                  {report.totalOutflowsPrice.toLocaleString()}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-gold">ج.م</span>
              </div>
              <div className="mt-4 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-400" dir="ltr">
                Period: {report.reportPeriod.startDate.split('T')[0]} / {report.reportPeriod.endDate.split('T')[0]}
              </div>
            </div>
          </div>

          {/* 2. Structural Breakdown Grid (تفنيط المخرجات) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* Card 1: Gold Purchases */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ShoppingCart size={20} />
                </div>
                <h3 className="text-lg font-black text-charcoal">مشتريات الذهب</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 h-8">تكلفة شراء المشغولات الذهبية (زبون أو جملة)</p>
              <div className="h-px w-full bg-gray-50 mb-4"></div>
              <div className="mt-auto" dir="ltr">
                <span className="text-3xl font-black text-charcoal tracking-tight">{report.outflowsBreakdown.goldPurchasesCash.toLocaleString()}</span>
                <span className="text-sm font-bold text-gold ml-1">ج.م</span>
              </div>
            </div>

            {/* Card 2: Petty Expenses (Shop Costs) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Receipt size={20} />
                </div>
                <h3 className="text-lg font-black text-charcoal">تكاليف المحل</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 h-8">مصروفات التشغيل اليومية الاعتيادية</p>
              <div className="h-px w-full bg-gray-50 mb-4"></div>
              <div className="mt-auto" dir="ltr">
                <span className="text-3xl font-black text-charcoal tracking-tight">{report.outflowsBreakdown.pettyExpensesCash.toLocaleString()}</span>
                <span className="text-sm font-bold text-gold ml-1">ج.م</span>
              </div>
            </div>

            {/* Card 3: Salaries */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Briefcase size={20} />
                </div>
                <h3 className="text-lg font-black text-charcoal">المرتبات</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 h-8">مدفوعات أجور ورواتب الموظفين</p>
              <div className="h-px w-full bg-gray-50 mb-4"></div>
              <div className="mt-auto" dir="ltr">
                <span className="text-3xl font-black text-charcoal tracking-tight">{report.outflowsBreakdown.salariesCash.toLocaleString()}</span>
                <span className="text-sm font-bold text-gold ml-1">ج.م</span>
              </div>
            </div>

            {/* Card 4: Others */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl">
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="text-lg font-black text-charcoal">مصروفات أخرى</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 h-8">تكاليف متنوعة أخرى خارج التصنيفات</p>
              <div className="h-px w-full bg-gray-50 mb-4"></div>
              <div className="mt-auto" dir="ltr">
                <span className="text-3xl font-black text-charcoal tracking-tight">{report.outflowsBreakdown.othersCash.toLocaleString()}</span>
                <span className="text-sm font-bold text-gold ml-1">ج.م</span>
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
