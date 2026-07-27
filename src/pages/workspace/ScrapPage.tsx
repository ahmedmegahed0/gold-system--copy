import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Scale, 
  AlertCircle, 
  Loader2, 
  ShieldAlert, 
  Info,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { ScrapGoldService } from '../../services/scrap-gold.service';
import { CategoryService } from '../../services/category.service';
import type { ScrapGold, BuyScrapDto, ScrapCategoryItem } from '../../common/types/scrap-gold.types';
import type { Category } from '../../common/types/category.types';

// Modal component scoped to this file to minimize dependencies
const InlineModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ScrapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  const [balances, setBalances] = useState<ScrapGold[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states for each panel
  const [page21, setPage21] = useState(1);
  const [page18, setPage18] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Modal State
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyPayload, setBuyPayload] = useState<BuyScrapDto>({
    karat: 21,
    category: '',
    count: 1,
    weight: 0
  });
  const [submitting, setSubmitting] = useState(false);

  // Security Check is now rendered below all hooks

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balData, catData] = await Promise.all([
        ScrapGoldService.getScrapBalance(),
        CategoryService.getCategories('ACTIVE')
      ]);
      
      // The API could return an array or object. Let's force an array to easily find 21K and 18K
      const normalizedBalances = Array.isArray(balData) ? balData : Object.values(balData || {});
      setBalances(normalizedBalances as ScrapGold[]);
      
      // Ensure we only map valid arrays
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الكسر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Split balances
  const karat21 = useMemo(() => balances.find(b => b.karat === 21) || { karat: 21, items: [] }, [balances]);
  const karat18 = useMemo(() => balances.find(b => b.karat === 18) || { karat: 18, items: [] }, [balances]);

  const calcTotalCount = (items: ScrapCategoryItem[]) => items.reduce((sum, item) => sum + (item.count || 0), 0);
  const calcTotalWeight = (items: ScrapCategoryItem[]) => items.reduce((sum, item) => sum + (item.weight || 0), 0);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyPayload.category) {
      alert('الرجاء اختيار التصنيف');
      return;
    }
    if (buyPayload.weight <= 0 || buyPayload.count < 1) {
      alert('الوزن والعدد يجب أن يكونا أكبر من صفر');
      return;
    }

    setSubmitting(true);
    try {
      await ScrapGoldService.buyScrap(buyPayload);
      setIsBuyModalOpen(false);
      setBuyPayload({ karat: 21, category: '', count: 1, weight: 0 });
      fetchData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ عملية الشراء');
    } finally {
      setSubmitting(false);
    }
  };

  const renderKaratPanel = (data: ScrapGold | { karat: number, items: ScrapCategoryItem[] }, page: number, setPage: React.Dispatch<React.SetStateAction<number>>) => {
    const totalCount = calcTotalCount(data.items);
    const totalWeight = calcTotalWeight(data.items);
    
    const totalPages = Math.max(1, Math.ceil(data.items.length / ITEMS_PER_PAGE));
    const currentItems = data.items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        {/* Panel Header */}
        <div className="bg-theme-scrap/10 px-6 py-5 border-b border-theme-scrap/20 flex items-center justify-between">
          <h3 className="text-xl font-black text-charcoal flex items-center gap-2" dir="ltr">
            {data.karat}K <span className="text-theme-scrap text-xl">Scrap</span>
          </h3>
          <div className="flex items-center gap-4 text-base font-bold text-charcoal">
            <div className="flex flex-col items-end">
              <span className="text-xs text-charcoal/50 font-semibold">{t('scrap.totalWeight')}</span>
              <span className="text-theme-scrap text-2xl" dir="ltr">{totalWeight.toFixed(2)}<span className="text-sm text-charcoal/50 ml-1">g</span></span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500 text-xs">إجمالي القطع</span>
              <span className="text-charcoal text-2xl" dir="ltr">{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 p-6">
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <Scale size={24} className="opacity-50" />
              <p className="font-medium text-sm">لا يوجد كسر متوفر في هذا العيار حالياً.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-100 rounded-xl">
              <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">نوع التصنيف المستعمل</th>
                    <th className="px-4 py-3">عدد القطع الحالي</th>
                    <th className="px-4 py-3">الوزن الإجمالي الحالي (جرام)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((item, idx) => {
                    // Handle populated object or raw string
                    const categoryName = typeof item.category === 'object' 
                      ? (item.category.name || '---') 
                      : item.category;

                    return (
                      <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                        <td className="px-4 py-4">
                          <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100/50 font-bold text-sm">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-sm">
                            {item.count}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-black text-sm" dir="ltr">
                            {item.weight.toFixed(2)}g
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {data.items.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              عرض <span className="font-bold text-charcoal">{((page - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(page * ITEMS_PER_PAGE, data.items.length)}</span> من <span className="font-bold text-charcoal">{data.items.length}</span> أصناف
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  if (
                    totalPages > 3 &&
                    pageNumber !== 1 &&
                    pageNumber !== totalPages &&
                    (pageNumber < page - 1 || pageNumber > page + 1)
                  ) {
                    if (pageNumber === page - 2 || pageNumber === page + 2) {
                      return <span key={idx} className="px-1 text-gray-400 text-xs">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setPage(pageNumber)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        page === pageNumber
                          ? 'bg-theme-scrap text-white shadow-sm'
                          : 'text-gray-500 hover:bg-white hover:text-charcoal border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (user?.role !== 'OWNER') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10 animate-in fade-in">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-3xl font-black text-charcoal mb-4">صلاحيات غير كافية</h2>
        <p className="text-gray-500 max-w-md">عذراً، هذه الصفحة مخصصة لمدير النظام (Owner) فقط. لا يمكنك عرض أو تعديل بيانات كسر الخزنة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-scrap/10 text-theme-scrap">
              <Scale size={24} />
            </div>
            إدارة الذهب الكسر (كسر الخزنة)
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            تتبع ومراجعة وإضافة الذهب الكسر المنفصل تماماً عن فواتير البيع للعملاء.
          </p>
        </div>
        <button
          onClick={() => setIsBuyModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-scrap hover:bg-theme-scrap/90 text-white rounded-xl font-bold transition-all shadow-sm shadow-theme-scrap/20"
        >
          <Plus size={18} />
          شراء / إضافة كسر
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Constraints Notice */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">قاعدة أوزان الكسر الثابتة</h4>
          <p className="text-sm text-blue-700/80 mt-1">
            لا يتم خصم (0.06 جرام - وزن الورقة) من أي معاملات في هذه الوحدة. الأوزان المسجلة هنا هي أوزان فعلية إجمالية ولا تخضع لمعادلات الوزن الصافي المعمول بها في الفواتير.
          </p>
        </div>
      </div>

      {/* Main Dual Panels */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-gold" />
          <span className="font-medium text-sm">جاري تحميل بيانات كسر الخزنة...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Right Panel: Karat 21 (Assuming RTL layout puts first item on right naturally) */}
          {renderKaratPanel(karat21, page21, setPage21)}
          {/* Left Panel: Karat 18 */}
          {renderKaratPanel(karat18, page18, setPage18)}
        </div>
      )}

      {/* Inline Modal for BuyScrapDto */}
      <InlineModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        title="شراء / إضافة كسر للخزنة"
      >
        <form onSubmit={handleBuySubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">العيار (Karat)</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${buyPayload.karat === 21 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karat" className="hidden" checked={buyPayload.karat === 21} onChange={() => setBuyPayload({...buyPayload, karat: 21})} />
                  21K
                </label>
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${buyPayload.karat === 18 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karat" className="hidden" checked={buyPayload.karat === 18} onChange={() => setBuyPayload({...buyPayload, karat: 18})} />
                  18K
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">التصنيف (Category)</label>
              <select
                value={buyPayload.category}
                onChange={(e) => setBuyPayload({ ...buyPayload, category: e.target.value })}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-medium"
                required
              >
                <option value="">-- اختر التصنيف --</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">العدد (Count)</label>
              <input
                type="number"
                min="1"
                value={buyPayload.count || ''}
                onChange={(e) => setBuyPayload({ ...buyPayload, count: parseInt(e.target.value) || 0 })}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-center"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">الوزن الكلي بالجرام (Weight)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={buyPayload.weight || ''}
                onChange={(e) => setBuyPayload({ ...buyPayload, weight: parseFloat(e.target.value) || 0 })}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-bold text-gold text-center"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-theme-scrap hover:bg-theme-scrap/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : 'حفظ إضافة الكسر'}
            </button>
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(false)}
              className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </InlineModal>
    </div>
  );
};
