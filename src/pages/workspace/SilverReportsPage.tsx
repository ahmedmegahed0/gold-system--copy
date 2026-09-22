import React, { useState, useEffect, useCallback } from 'react';
import { FileBarChart2, Loader2, RefreshCw, TrendingUp, TrendingDown, Package, Coins } from 'lucide-react';
import { SilverService } from '../../services/silver.service';
import type { SilverReportData } from '../../common/types/silver.types';

export const SilverReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<SilverReportData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SilverService.getSilverReport({
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(new Date(dateRange.endDate).setHours(23, 59, 59, 999)).toISOString()
      });
      setReportData(data);
    } catch (error) {
      console.error('Error fetching silver report:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <FileBarChart2 className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">تقارير الفضة</h1>
            <p className="text-gray-500 mt-1">حركة المبيعات والمشتريات والخزنة للفضة خلال فترة محددة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          <span>تحديث التقرير</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <TrendingUp className="text-emerald-500 absolute top-4 right-4" size={24} />
              <h3 className="text-gray-500 font-medium relative z-10">إجمالي المبيعات (إيرادات)</h3>
              <div className="mt-2 flex items-baseline gap-2 relative z-10">
                <span className="text-3xl font-black text-charcoal">
                  {reportData.financialSummary.totalSalesIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-500 font-medium">ج.م</span>
              </div>
              <p className="text-sm text-emerald-600 mt-2 font-medium relative z-10">
                عدد عمليات البيع: {reportData.counts.salesCount}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <TrendingDown className="text-rose-500 absolute top-4 right-4" size={24} />
              <h3 className="text-gray-500 font-medium relative z-10">مشتريات الكسر (مصروفات)</h3>
              <div className="mt-2 flex items-baseline gap-2 relative z-10">
                <span className="text-3xl font-black text-charcoal">
                  {reportData.financialSummary.totalScrapExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-500 font-medium">ج.م</span>
              </div>
              <p className="text-sm text-rose-600 mt-2 font-medium relative z-10">
                عدد عمليات الشراء: {reportData.counts.scrapPurchasesCount}
              </p>
            </div>

            <div className={`bg-white rounded-2xl p-6 border shadow-sm relative overflow-hidden group ${
              reportData.financialSummary.netCashFlow >= 0 ? 'border-indigo-100' : 'border-red-100'
            }`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${
                reportData.financialSummary.netCashFlow >= 0 ? 'bg-indigo-50' : 'bg-red-50'
              }`} />
              <Coins className={`absolute top-4 right-4 ${
                reportData.financialSummary.netCashFlow >= 0 ? 'text-indigo-500' : 'text-red-500'
              }`} size={24} />
              <h3 className="text-gray-500 font-medium relative z-10">صافي التدفق النقدي</h3>
              <div className="mt-2 flex items-baseline gap-2 relative z-10">
                <span className={`text-3xl font-black ${
                  reportData.financialSummary.netCashFlow >= 0 ? 'text-indigo-600' : 'text-red-600'
                }`}>
                  {reportData.financialSummary.netCashFlow > 0 ? '+' : ''}
                  {reportData.financialSummary.netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-500 font-medium">ج.م</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium flex items-center gap-2 mb-2">
                  <Package size={18} className="text-emerald-500" />
                  إجمالي الأوزان المباعة
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-charcoal">{reportData.weightSummary.totalSoldWeight}</span>
                  <span className="text-gray-500">جرام</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium flex items-center gap-2 mb-2">
                  <Package size={18} className="text-rose-500" />
                  إجمالي الأوزان المشتراة (كسر)
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-charcoal">{reportData.weightSummary.totalScrapBoughtWeight}</span>
                  <span className="text-gray-500">جرام</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <TrendingDown size={20} className="text-rose-600" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
