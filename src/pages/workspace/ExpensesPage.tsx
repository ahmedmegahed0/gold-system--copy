import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Receipt, 
  Plus, 
  X, 
  Clock, 
  FileText, 
  DollarSign, 
  User, 
  ShieldAlert,
  Loader2,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { ExpenseService } from '../../services/expense.service';
import type { Expense, ExpenseCategory, CreateExpenseDto } from '../../common/types/expense.types';

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; color: string }> = {
  GOLD_PURCHASE: { label: 'مشتريات الذهب', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  SHOP_EXPENSES: { label: 'مصاريف المحل والنثريات', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  SALARIES: { label: 'المرتبات', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  OTHERS: { label: 'أخرى', color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

export const ExpensesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  
  const isOwner = user?.role === 'OWNER';

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(isOwner);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateExpenseDto>({
    title: '',
    amount: '' as any,
    category: 'SHOP_EXPENSES'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchExpenses = async () => {
    if (!isOwner) return; // Employees don't fetch list
    try {
      setIsLoading(true);
      setError(null);
      const res = await ExpenseService.getExpenses(selectedCategory);
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'فشل في تحميل المصروفات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    setCurrentPage(1);
  }, [isOwner, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await ExpenseService.createExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ title: '', amount: '' as any, category: 'SHOP_EXPENSES' });
        // Refresh list if owner
        if (isOwner) {
          fetchExpenses();
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'فشل في تسجيل المصروف.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(expenses.length / ITEMS_PER_PAGE));
  const currentExpenses = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return expenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [expenses, currentPage]);

  return (
    <div className="h-full flex flex-col gap-6 p-2 lg:p-6 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold/10 text-gold">
              <Receipt size={24} />
            </div>
            المصاريف النثرية والتشغيلية
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14 font-medium">
            تسجيل ومتابعة كافة المصروفات التشغيلية والمشتروات الصادرة من الخزنة
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          {isOwner && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-200 text-charcoal font-bold px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold appearance-none cursor-pointer"
            >
              <option value="ALL">جميع المصروفات</option>
              {Object.entries(CATEGORY_MAP).map(([key, data]) => (
                <option key={key} value={key}>{data.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              setError(null);
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            تسجيل مصروف جديد
          </button>
        </div>
      </div>

      {/* ─── Data Ledger Grid (OWNER ONLY) ─── */}
      {isOwner ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12">
              <Loader2 size={40} className="animate-spin text-gold mb-4" />
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
                    <th className="px-6 py-4 font-bold min-w-[200px]">بيان المصروف</th>
                    <th className="px-6 py-4 font-bold text-center">المبلغ المخصوم (ج.م)</th>
                    <th className="px-6 py-4 font-bold">تصنيف المصروف</th>
                    <th className="px-6 py-4 font-bold">المسؤول عن الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                        لا توجد مصروفات مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    currentExpenses.map((expense, index) => (
                      <tr key={expense.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm font-medium" dir="ltr">
                              {new Date(expense.createdAt).toLocaleString('en-GB')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-charcoal">
                          {expense.title}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block text-lg font-black text-red-700 tracking-tight bg-red-50 border border-red-100/50 px-3 py-1 rounded-lg">
                            {expense.amount.toLocaleString()} ج.م
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${CATEGORY_MAP[expense.category].color}`}>
                            {CATEGORY_MAP[expense.category].label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                            <User size={14} />
                            <span className="font-bold text-sm">{expense.actionBy?.fullName || 'غير معروف'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {expenses.length > 0 && !isLoading && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30 shrink-0">
                <span className="text-sm text-gray-500 font-medium">
                  عرض <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, expenses.length)}</span> من <span className="font-bold text-charcoal">{expenses.length}</span> مصروفات
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
                              ? 'bg-gold text-white shadow-sm'
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
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6">
            <Receipt size={32} />
          </div>
          <h2 className="text-xl font-bold text-charcoal mb-2">تسجيل المصروفات الصادرة</h2>
          <p className="text-gray-500 font-medium max-w-md">
            بصفتك موظفاً، يمكنك تسجيل مصاريف أو مشتريات جديدة ليتم خصمها من عهدة الخزنة. السجل الكامل متاح فقط للإدارة.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 bg-white border-2 border-gold text-gold hover:bg-gold hover:text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm"
          >
            تسجيل مصروف الآن
          </button>
        </div>
      )}

      {/* ─── Creation Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
                <Receipt size={20} className="text-gold" />
                تسجيل مصروف جديد
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <FileText size={16} className="text-gray-400" />
                    سبب خروج الفلوس أو بيان المصروف بالتفصيل
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-charcoal font-bold focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="مثال: شراء مقشة جديدة للمحل"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={16} className="text-gray-400" />
                    المبلغ المالي المخصوم (ج.م)
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    disabled={isSubmitting}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-charcoal font-black text-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    placeholder="0.00"
                    dir="ltr"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Tag size={16} className="text-gray-400" />
                    تصنيف الحركة المخرجة
                  </label>
                  <select
                    required
                    disabled={isSubmitting}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-charcoal font-bold focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all appearance-none cursor-pointer"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, data]) => (
                      <option key={key} value={key}>{data.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gold hover:bg-gold/90 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'تأكيد وتسجيل المصروف'
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
