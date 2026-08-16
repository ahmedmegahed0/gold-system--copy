import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Scale, 
  AlertCircle, 
  Loader2, 
  Info,
  X,
  Edit2
} from 'lucide-react';
import { ScrapGoldService } from '../../services/scrap-gold.service';
import type { ScrapGold, BuyScrapDto, UpdateScrapDto } from '../../common/types/scrap-gold.types';

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

  const [balances, setBalances] = useState<ScrapGold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyPayload, setBuyPayload] = useState<BuyScrapDto>({
    karat: 21,
    weight: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatePayload, setUpdatePayload] = useState<UpdateScrapDto>({
    karat: 21,
    newWeight: 0
  });
  const [updating, setUpdating] = useState(false);

  // Security Check is now rendered below all hooks

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const balData = await ScrapGoldService.getScrapBalance();
      
      // The API could return an array or object. Let's force an array to easily find 21K and 18K
      const normalizedBalances = Array.isArray(balData) ? balData : Object.values(balData || {});
      setBalances(normalizedBalances as ScrapGold[]);
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
  const karat21 = useMemo(() => balances.find(b => b.karat === 21) || { karat: 21 as const, totalWeight: 0 }, [balances]);
  const karat18 = useMemo(() => balances.find(b => b.karat === 18) || { karat: 18 as const, totalWeight: 0 }, [balances]);

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (buyPayload.weight <= 0) {
      alert('الوزن يجب أن يكون أكبر من صفر');
      return;
    }

    setSubmitting(true);
    try {
      await ScrapGoldService.buyScrap(buyPayload);
      setIsBuyModalOpen(false);
      setBuyPayload({ karat: 21, weight: 0 });
      fetchData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ عملية الشراء');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updatePayload.newWeight < 0) {
      alert('الوزن لا يمكن أن يكون بالسالب');
      return;
    }

    setUpdating(true);
    try {
      await ScrapGoldService.updateScrapBalance(updatePayload);
      setIsUpdateModalOpen(false);
      setUpdatePayload({ karat: 21, newWeight: 0 });
      fetchData(); // Refresh UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء تعديل الوزن');
    } finally {
      setUpdating(false);
    }
  };

  const renderKaratPanel = (data: Partial<ScrapGold>) => {
    const totalWeight = data.totalWeight || 0;
    const updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;

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
            <button
              onClick={() => {
                setUpdatePayload({ karat: data.karat as 18 | 21, newWeight: totalWeight });
                setIsUpdateModalOpen(true);
              }}
              className="p-2 bg-white text-gray-400 hover:text-theme-scrap hover:bg-theme-scrap/10 rounded-lg transition-colors border border-gray-100 shadow-sm"
              title="تعديل رصيد كسر المخزن"
            >
              <Edit2 size={18} />
            </button>
          </div>
        </div>

        {/* Data / Last Update */}
        <div className="flex-1 p-6">
          <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Scale size={32} className="opacity-50 text-gold" />
            <div className="text-center">
              <p className="font-bold text-lg text-charcoal mb-1">الرصيد الإجمالي</p>
              <p className="text-sm text-gray-500 mb-2">
                الوزن الكلي لكسر الخزنة عيار {data.karat}
              </p>
              {updatedAt && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                  <Info size={14} />
                  آخر إضافة/تعديل: <span dir="ltr">{updatedAt.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          {renderKaratPanel(karat21)}
          {/* Left Panel: Karat 18 */}
          {renderKaratPanel(karat18)}
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

      {/* Inline Modal for UpdateScrapDto */}
      <InlineModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="تعديل وتسوية رصيد الكسر (جرد مباشر)"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-sm">
            <Info size={20} className="shrink-0 mt-0.5 text-blue-600" />
            <p className="leading-relaxed">
              هذه العملية ستقوم <strong>بتعديل الرصيد الحالي بشكل مباشر</strong> ليتطابق مع الوزن المُدخل أدناه، وسيتم تسجيل فارق الوزن كحركة تسوية. استخدمها فقط في حالة تصحيح الجرد.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">العيار (Karat)</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${updatePayload.karat === 21 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karatUpdate" className="hidden" checked={updatePayload.karat === 21} onChange={() => setUpdatePayload({...updatePayload, karat: 21})} />
                  21K
                </label>
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${updatePayload.karat === 18 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karatUpdate" className="hidden" checked={updatePayload.karat === 18} onChange={() => setUpdatePayload({...updatePayload, karat: 18})} />
                  18K
                </label>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">الوزن الكلي الجديد بالجرام (New Total Weight)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={updatePayload.newWeight === 0 && updatePayload.newWeight.toString() !== '0' ? '' : updatePayload.newWeight}
                onChange={(e) => setUpdatePayload({ ...updatePayload, newWeight: parseFloat(e.target.value) || 0 })}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-bold text-gold text-center"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : 'تحديث الرصيد'}
            </button>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
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
