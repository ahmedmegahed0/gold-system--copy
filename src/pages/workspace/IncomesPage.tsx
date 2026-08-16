import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Banknote, 
  Plus, 
  X, 
  Clock, 
  FileText, 
  DollarSign, 
  User, 
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { IncomeService } from '../../services/income.service';
import type { Income, CreateIncomeDto } from '../../common/types/income.types';

export const IncomesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  
  const isOwner = user?.role === 'OWNER';

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(isOwner);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateIncomeDto>({
    reason: '',
    amount: '' as any
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchIncomes = async () => {
    if (!isOwner) return; // Employees don't fetch list
    try {
      setIsLoading(true);
      setError(null);
      const res = await IncomeService.getIncomes();
      // backend returns data directly if it's an array, or wrapped in { data: ... }
      if (Array.isArray(res)) {
        setIncomes(res);
      } else if (res.data) {
        setIncomes(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'فشل في تحميل الإيرادات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
    setCurrentPage(1);
  }, [isOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason || !formData.amount) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await IncomeService.createIncome({
        ...formData,
        amount: Number(formData.amount)
      });
      
      setIsModalOpen(false);
      setFormData({ reason: '', amount: '' as any });
      
      if (isOwner) {
        fetchIncomes();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'فشل في تسجيل الإيراد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(incomes.length / ITEMS_PER_PAGE));
  const currentIncomes = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return incomes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [incomes, currentPage]);

  return (
    <div className="h-full flex flex-col gap-6 p-2 lg:p-6 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Banknote size={24} />
            </div>
            الإيرادات والدخل الإضافي
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            تسجيل ومتابعة كافة الإيرادات الإضافية والسيولة المضافة للدرج
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            تسجيل إيراد جديد
          </button>
        </div>
      </div>

      {/* ─── Data Ledger Grid (OWNER ONLY) ─── */}
      {isOwner ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
              <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
              <p className="font-bold">جاري تحميل السجل...</p>
            </div>
          ) : error && !isModalOpen ? (
            <div className="p-6">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 font-bold">
                <ShieldAlert size={20} />
                {error}
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-bold whitespace-nowrap">التوقيت</th>
                    <th className="px-6 py-4 font-bold min-w-[200px]">سبب الدخل</th>
                    <th className="px-6 py-4 font-bold text-center">المبلغ المضاف (ج.م)</th>
                    <th className="px-6 py-4 font-bold">المسؤول عن الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {incomes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                        لا توجد إيرادات مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    currentIncomes.map((income, index) => (
                      <tr key={income.id || income._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm font-medium" dir="ltr">
                              {new Date(income.createdAt).toLocaleString('en-GB')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-charcoal">
                          {income.reason}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block text-lg font-black text-emerald-700 tracking-tight bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-lg">
                            {income.amount.toLocaleString()} ج.م
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                            <User size={14} />
                            <span className="font-bold text-sm">{income.actionBy?.fullName || 'غير معروف'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {incomes.length > 0 && !isLoading && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30 shrink-0">
                <span className="text-sm text-gray-500 font-medium">
                  عرض <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, incomes.length)}</span> من <span className="font-bold text-charcoal">{incomes.length}</span> إيرادات
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNumber = idx + 1;
                      if (
                        totalPages > 5 &&
                        pageNumber !== 1 &&
                        pageNumber !== totalPages &&
                        (pageNumber < currentPage - 1 || pageNumber > currentPage + 1)
                      ) {
                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return <span key={idx} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                            currentPage === pageNumber
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-gray-500 hover:bg-white hover:text-charcoal border border-transparent hover:border-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      ) : (
        /* Employee Empty State View */
        <div className="flex-1 bg-white/50 rounded-2xl border border-gray-100 border-dashed flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6">
            <Banknote size={32} />
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">تسجيل إيرادات ودخل إضافي</h2>
          <p className="text-gray-500 font-medium max-w-md">
            بصفتك موظفاً، يمكنك تسجيل سيولة إضافية تم إيداعها في الدرج. السجل الكامل متاح فقط للإدارة.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            تسجيل إيراد الآن
          </button>
        </div>
      )}

      {/* ─── Creation Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
                <Banknote size={20} className="text-emerald-500" />
                تسجيل دخل جديد
              </h3>
              <button 
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-center gap-2">
                  <ShieldAlert size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Reason */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FileText size={16} className="text-gray-400" />
                    سبب الدخل أو تفاصيل الإيداع
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-charcoal font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="مثال: إضافة سيولة للدرج أو سداد دين"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={16} className="text-gray-400" />
                    المبلغ المضاف (ج.م)
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    disabled={isSubmitting}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-charcoal font-black text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="0.00"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'تأكيد وتسجيل الإيراد'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all disabled:opacity-70"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
