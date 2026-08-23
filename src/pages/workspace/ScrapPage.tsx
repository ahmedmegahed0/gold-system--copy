import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Scale, AlertCircle, Loader2, Info, X, Edit2, 
  Trash2, Receipt 
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { ScrapGoldService } from '../../services/scrap-gold.service';
import { useScrapPurchases } from '../../hooks/useScrapPurchases';
import type { ScrapGold, UpdateScrapDto } from '../../common/types/scrap-gold.types';
import type { CreateScrapPurchaseDto, ScrapPurchase } from '../../common/types/scrap-purchases.types';

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
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ScrapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [activeTab, setActiveTab] = useState<'BALANCES' | 'PURCHASES'>('BALANCES');

  // ==========================================
  // BALANCES TAB STATE
  // ==========================================
  const [balances, setBalances] = useState<ScrapGold[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatePayload, setUpdatePayload] = useState<UpdateScrapDto>({ karat: 21, newWeight: 0 });
  const [updating, setUpdating] = useState(false);

  const fetchBalances = async () => {
    setLoadingBalances(true);
    setBalanceError(null);
    try {
      const balData = await ScrapGoldService.getScrapBalance();
      const normalizedBalances = Array.isArray(balData) ? balData : Object.values(balData || {});
      setBalances(normalizedBalances as ScrapGold[]);
    } catch (err: any) {
      setBalanceError(err.response?.data?.message || 'حدث خطأ أثناء جلب أرصدة الكسر');
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'BALANCES') {
      fetchBalances();
    }
  }, [activeTab]);

  const karat21 = useMemo(() => balances.find(b => b.karat === 21) || { karat: 21 as const, totalWeight: 0 }, [balances]);
  const karat18 = useMemo(() => balances.find(b => b.karat === 18) || { karat: 18 as const, totalWeight: 0 }, [balances]);

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
      fetchBalances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء تعديل الوزن');
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // PURCHASES LOG TAB STATE
  // ==========================================
  const {
    purchases,
    isLoading: loadingPurchases,
    error: purchasesError,
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
  } = useScrapPurchases();

  useEffect(() => {
    if (activeTab === 'PURCHASES') {
      fetchPurchases();
    }
  }, [activeTab, fetchPurchases]);

  // Modal State for Create/Edit Purchase
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [purchasePayload, setPurchasePayload] = useState<CreateScrapPurchaseDto>({
    karat: 21,
    weight: 0,
    totalPrice: 0,
    notes: ''
  });
  const [submittingPurchase, setSubmittingPurchase] = useState(false);

  const openCreatePurchaseModal = () => {
    setEditingPurchaseId(null);
    setPurchasePayload({ karat: 21, weight: 0, totalPrice: 0, notes: '' });
    setIsPurchaseModalOpen(true);
  };

  const openEditPurchaseModal = (purchase: ScrapPurchase) => {
    setEditingPurchaseId(purchase._id);
    setPurchasePayload({
      karat: purchase.karat,
      weight: purchase.weight,
      totalPrice: purchase.totalPrice,
      notes: purchase.notes || ''
    });
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchasePayload.weight <= 0) {
      alert('الوزن يجب أن يكون أكبر من صفر');
      return;
    }
    if (purchasePayload.totalPrice < 0) {
      alert('السعر الإجمالي لا يمكن أن يكون بالسالب');
      return;
    }

    setSubmittingPurchase(true);
    try {
      if (editingPurchaseId) {
        await updatePurchase(editingPurchaseId, purchasePayload);
      } else {
        await createPurchase(purchasePayload);
      }
      setIsPurchaseModalOpen(false);
      fetchBalances(); // Refresh balances in background
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setSubmittingPurchase(false);
    }
  };

  const handleDeletePurchase = async (id: string, num: string) => {
    if (window.confirm(`هل أنت متأكد من حذف فاتورة الشراء رقم ${num}؟ سيتم استرداد المبلغ للخزنة وخصم الوزن من المخزن.`)) {
      try {
        await deletePurchase(id);
        fetchBalances(); // Refresh balances
      } catch (err: any) {
        alert(err.response?.data?.message || 'خطأ في الحذف');
      }
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const renderKaratPanel = (data: Partial<ScrapGold>) => {
    const totalWeight = data.totalWeight || 0;
    const updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="bg-theme-scrap/10 px-6 py-5 border-b border-theme-scrap/20 flex items-center justify-between">
          <h3 className="text-xl font-black text-charcoal flex items-center gap-2" dir="ltr">
            {data.karat}K <span className="text-theme-scrap text-xl">Scrap</span>
          </h3>
          <div className="flex items-center gap-4 text-base font-bold text-charcoal">
            <div className="flex flex-col items-end">
              <span className="text-xs text-charcoal/50 font-semibold">{t('scrap.totalWeight')}</span>
              <span className="text-theme-scrap text-2xl" dir="ltr">{totalWeight.toFixed(2)}<span className="text-sm text-charcoal/50 ml-1">g</span></span>
            </div>
            {isOwner && (
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
            )}
          </div>
        </div>

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
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-theme-scrap/10 text-theme-scrap">
                <Scale size={24} />
              </div>
              إدارة ودفتر شراء الذهب الكسر
            </h1>
            <p className="text-gray-400 text-sm mt-1 mr-14">
              إدارة أرصدة الكسر وسجل الشراء من الزبائن مع ربط الخزنة.
            </p>
          </div>
          <button
            onClick={openCreatePurchaseModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-scrap hover:bg-theme-scrap/90 text-white rounded-xl font-bold transition-all shadow-sm shadow-theme-scrap/20"
          >
            <Plus size={18} />
            شراء كسر جديد
          </button>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
          <button
            onClick={() => setActiveTab('BALANCES')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'BALANCES'
                ? 'bg-theme-scrap text-white shadow-sm'
                : 'text-gray-500 hover:text-theme-scrap hover:bg-gray-50'
            }`}
          >
            أرصدة المخزن
          </button>
          <button
            onClick={() => setActiveTab('PURCHASES')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'PURCHASES'
                ? 'bg-theme-scrap text-white shadow-sm'
                : 'text-gray-500 hover:text-theme-scrap hover:bg-gray-50'
            }`}
          >
            دفتر المشتريات
          </button>
        </div>
      </div>

      {(balanceError || purchasesError) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{balanceError || purchasesError}</span>
        </div>
      )}

      {/* Constraints Notice (Only in balances tab) */}
      {activeTab === 'BALANCES' && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm">مخزون الكسر</h4>
            <p className="text-sm text-blue-700/80 mt-1">
              الوزن المعروض هنا يمثل الرصيد الإجمالي التراكمي لكسر الخزنة المتوفر للبيع للمصانع، ويتم تغذيته تلقائياً من فواتير دفتر المشتريات.
            </p>
          </div>
        </div>
      )}

      {/* Content Rendering based on active tab */}
      {activeTab === 'BALANCES' ? (
        loadingBalances ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin text-gold" />
            <span className="font-medium text-sm">جاري تحميل الأرصدة...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {renderKaratPanel(karat21)}
            {renderKaratPanel(karat18)}
          </div>
        )
      ) : (
        /* PURCHASES TAB */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loadingPurchases ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
               <Loader2 size={32} className="animate-spin text-gold" />
               <span className="font-medium text-sm">جاري تحميل دفتر المشتريات...</span>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-charcoal">
                    <th className="px-6 py-4 font-bold text-sm">رقم الفاتورة</th>
                    <th className="px-6 py-4 font-bold text-sm">العيار</th>
                    <th className="px-6 py-4 font-bold text-sm">الوزن المشتري</th>
                    <th className="px-6 py-4 font-bold text-sm">المدفوع للزبون</th>
                    <th className="px-6 py-4 font-bold text-sm">الموظف</th>
                    <th className="px-6 py-4 font-bold text-sm">التاريخ</th>
                    <th className="px-6 py-4 font-bold text-sm text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="p-10 text-center text-gray-400 flex flex-col items-center justify-center">
                          <Receipt size={40} className="mb-3 opacity-20" />
                          <span className="text-base font-medium">لا توجد فواتير شراء كسر مسجلة</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    purchases.map(p => {
                       const empName = typeof p.actionBy === 'object' ? p.actionBy.fullName : '---';
                       return (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-theme-scrap font-bold">
                            {p.purchaseNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-sm font-bold bg-gold/10 text-gold" dir="ltr">
                              {p.karat}K
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-charcoal" dir="ltr">{p.weight}g</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-charcoal">
                            {p.totalPrice.toLocaleString('ar-EG')} ج.م
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {empName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500" dir="ltr">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isOwner ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditPurchaseModal(p)}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="تعديل"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeletePurchase(p._id, p.purchaseNumber)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                       );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* MODALS */}
      {/* ----------------------------------------------------- */}

      {/* Modal for Create/Edit Purchase */}
      <InlineModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title={editingPurchaseId ? "تعديل فاتورة شراء كسر" : "فاتورة شراء كسر جديدة من زبون"}
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-5">
          {!editingPurchaseId && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-sm mb-4">
              <Info size={20} className="shrink-0 mt-0.5 text-blue-600" />
              <p className="leading-relaxed">
                بمجرد الحفظ سيتم <strong>سحب كاش من الخزنة</strong> بقيمة الفاتورة، و<strong>إضافة الوزن</strong> تلقائياً لكسر الخزنة.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">العيار (Karat)</label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${purchasePayload.karat === 21 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karat" className="hidden" checked={purchasePayload.karat === 21} onChange={() => setPurchasePayload({...purchasePayload, karat: 21})} />
                  21K
                </label>
                <label className={`flex-1 flex items-center justify-center py-3 border-2 rounded-xl cursor-pointer transition-colors font-bold text-lg ${purchasePayload.karat === 18 ? 'border-gold bg-gold/5 text-gold' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  <input type="radio" name="karat" className="hidden" checked={purchasePayload.karat === 18} onChange={() => setPurchasePayload({...purchasePayload, karat: 18})} />
                  18K
                </label>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-charcoal mb-2">الوزن المشتري بالجرام *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={purchasePayload.weight || ''}
                onChange={(e) => setPurchasePayload({ ...purchasePayload, weight: parseFloat(e.target.value) || 0 })}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-bold text-gold text-center"
                dir="ltr"
                required
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-bold text-charcoal mb-2">المبلغ المدفوع كاش للزبون *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchasePayload.totalPrice || ''}
                onChange={(e) => setPurchasePayload({ ...purchasePayload, totalPrice: parseFloat(e.target.value) || 0 })}
                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-bold text-charcoal text-center"
                dir="ltr"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-charcoal mb-2">بيان / ملاحظات (اختياري)</label>
              <textarea
                rows={2}
                value={purchasePayload.notes || ''}
                onChange={(e) => setPurchasePayload({ ...purchasePayload, notes: e.target.value })}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent font-medium text-charcoal"
                placeholder="مثال: شراء إسورة مكسورة..."
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submittingPurchase}
              className="flex-1 py-3 bg-theme-scrap hover:bg-theme-scrap/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {submittingPurchase ? <Loader2 size={18} className="animate-spin" /> : (editingPurchaseId ? 'حفظ التعديل والتسوية' : 'تأكيد الشراء من الخزنة')}
            </button>
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </InlineModal>

      {/* Modal for UpdateScrapDto (Manual balance adjustment) */}
      <InlineModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="تعديل وتسوية رصيد الكسر (جرد مباشر)"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-100 flex items-start gap-3 text-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              هذه العملية ستقوم <strong>بتعديل رصيد كسر المخزن مباشرة</strong> بدون إيصال نقدي في الخزنة. استخدمها فقط في حالة تصحيح جرد الأوزان. لتسجيل شراء فعلي استخدم زر "شراء كسر جديد".
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
              <label className="block text-sm font-bold text-charcoal mb-2">الوزن الكلي الجديد بالجرام</label>
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
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {updating ? <Loader2 size={18} className="animate-spin" /> : 'تحديث الرصيد مباشرة'}
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
