import React, { useState } from 'react';

import {
  Plus,
  Archive,
  Search,
  Loader2,
  AlertCircle,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  PlusSquare,
  Coins,
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useBullionInventory } from '../../hooks/useBullionInventory';
import { BullionType } from '../../common/types/bullion.types';
import type { BullionInventory, CreateBullionDto, AddQuantityDto } from '../../common/types/bullion.types';

const ModalOverlay: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b border-gray-100 z-10">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

const BullionFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<void>; initialData?: BullionInventory | null }> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<CreateBullionDto>({
    title: '',
    companyName: '',
    type: BullionType.INGOT,
    karat: 24,
    weightPerUnit: '' as any,
    quantity: '' as any,
    makingChargePerUnit: '' as any,
    cashbackPerUnit: '' as any,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          companyName: initialData.companyName,
          type: initialData.type,
          karat: initialData.karat,
          weightPerUnit: initialData.weightPerUnit,
          quantity: initialData.quantity,
          makingChargePerUnit: initialData.makingChargePerUnit,
          cashbackPerUnit: initialData.cashbackPerUnit,
        });
      } else {
        setFormData({
          title: '',
          companyName: '',
          type: BullionType.INGOT,
          karat: 24,
          weightPerUnit: '' as any,
          quantity: '' as any,
          makingChargePerUnit: '' as any,
          cashbackPerUnit: '' as any,
        });
      }
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.companyName || Number(formData.weightPerUnit) <= 0) {
      setFormError('يرجى تعبئة الحقول الأساسية المطلوبة بشكل صحيح.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit({
        ...formData,
        weightPerUnit: Number(formData.weightPerUnit),
        quantity: Number(formData.quantity || 0),
        makingChargePerUnit: Number(formData.makingChargePerUnit || 0),
        cashbackPerUnit: Number(formData.cashbackPerUnit || 0),
      });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل بيانات سبيكة/جنيه' : 'إضافة سبيكة/جنيه'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />{formError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">العنوان <span className="text-red-400">*</span></label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" placeholder="مثال: سبيكة 5 جرام BTC" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">اسم الشركة <span className="text-red-400">*</span></label>
            <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" placeholder="BTC, Master Gold..." />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">النوع <span className="text-red-400">*</span></label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as BullionType, karat: e.target.value === BullionType.INGOT ? 24 : 21})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none">
              <option value={BullionType.INGOT}>سبيكة</option>
              <option value={BullionType.COIN}>جنيه / نصف / ربع</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">العيار <span className="text-red-400">*</span></label>
            <input type="number" value={formData.karat} onChange={e => setFormData({...formData, karat: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">وزن القطعة (جم) <span className="text-red-400">*</span></label>
            <input type="number" step="0.01" value={formData.weightPerUnit} onChange={e => setFormData({...formData, weightPerUnit: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">العدد الابتدائي <span className="text-red-400">*</span></label>
            <input type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">المصنعية للقطعة (ج.م)</label>
            <input type="number" min="0" value={formData.makingChargePerUnit} onChange={e => setFormData({...formData, makingChargePerUnit: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">قيمة الكاش باك للقطعة (ج.م)</label>
            <input type="number" min="0" value={formData.cashbackPerUnit} onChange={e => setFormData({...formData, cashbackPerUnit: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" />
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} حفظ البيانات
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50">إلغاء</button>
        </div>
      </form>
    </ModalOverlay>
  );
};

const AddQuantityModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (id: string, data: AddQuantityDto) => Promise<void>; item: BullionInventory | null }> = ({ isOpen, onClose, onSubmit, item }) => {
  const [addedQuantity, setAddedQuantity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isOpen) { setAddedQuantity(''); setFormError(''); }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || Number(addedQuantity) <= 0) { setFormError('يرجى إدخال كمية صحيحة'); return; }
    setSaving(true);
    try {
      await onSubmit(item._id, { addedQuantity: Number(addedQuantity) });
      onClose();
    } catch (err: any) { setFormError(err.response?.data?.message || 'حدث خطأ'); }
    finally { setSaving(false); }
  };

  if (!item) return null;
  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={`تزويد كمية: ${item.title}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{formError}</div>}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-800">
          سيتم إضافة هذه الكمية إلى رصيد المخزن الحالي للصنف وتسجيل حركة واردة.
        </div>
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">عدد القطع المضافة <span className="text-red-400">*</span></label>
          <input type="number" min="1" value={addedQuantity} onChange={e => setAddedQuantity(e.target.value as any)} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-gold outline-none" autoFocus />
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <PlusSquare size={18} />} تأكيد الإضافة
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50">إلغاء</button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export const BullionInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  
  const {
    bullions, isLoading, error, filters, setFilters, createBullion, updateBullion, addQuantity, archiveBullion
  } = useBullionInventory({ isArchived: false });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BullionInventory | null>(null);
  const [restockingItem, setRestockingItem] = useState<BullionInventory | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(bullions.length / ITEMS_PER_PAGE);
  const currentItems = bullions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <Coins className="text-theme-inventory" size={28} />
            مخزن السبايك والجنيهات
          </h1>
          <p className="text-gray-500 mt-1">إدارة أرصدة وأوزان السبايك والجنيهات الذهبية المغلفة</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-3 bg-theme-inventory hover:bg-theme-inventory/90 text-white rounded-xl font-bold shadow-sm transition-all">
            <Plus size={20} /> إضافة سبيكة/جنيه جديد
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="ابحث باسم الشركة المصنعة..." value={filters.companyName || ''} onChange={e => setFilters({ ...filters, companyName: e.target.value })} className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:border-theme-inventory outline-none bg-gray-50/50" />
          </div>
          <div className="w-48">
            <select value={filters.type || ''} onChange={e => setFilters({ ...filters, type: (e.target.value as BullionType) || undefined })} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50">
              <option value="">الكل (سبيكة/جنيه)</option>
              <option value={BullionType.INGOT}>سبائك فقط</option>
              <option value={BullionType.COIN}>جنيهات فقط</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50">
            <input type="checkbox" id="archived" checked={filters.isArchived} onChange={e => setFilters({ ...filters, isArchived: e.target.checked })} className="w-4 h-4 rounded text-theme-inventory focus:ring-theme-inventory" />
            <label htmlFor="archived" className="text-sm font-medium text-gray-700 cursor-pointer">عرض المؤرشف</label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-theme-inventory/40 mb-4" />
          <p className="text-gray-500 font-medium">جاري تحميل البيانات...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={24} />{error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">البيان</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">النوع والعيار</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الوزن للقطعة</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الكمية بالمخزن</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">المصنعية/الكاش باك</th>
                  {isOwner && <th className="px-6 py-4 text-sm font-bold text-gray-500 text-left">إجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-charcoal">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-charcoal">{item.type === BullionType.INGOT ? 'سبيكة' : 'عملة/جنيه'}</div>
                      <div className="text-xs font-bold text-gold bg-gold/10 inline-block px-2 py-0.5 rounded mt-1">{item.karat}K</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-charcoal">{item.weightPerUnit} جم</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${item.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.quantity} قطعة
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">المصنعية: {item.makingChargePerUnit} ج.م</div>
                      <div className="text-xs text-emerald-600 mt-1">كاش باك: {item.cashbackPerUnit} ج.م</div>
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                        <button onClick={() => setRestockingItem(item)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="إضافة كمية للمخزن">
                          <PlusSquare size={18} />
                        </button>
                        <button onClick={() => setEditingItem(item)} className="p-2 text-theme-inventory bg-theme-inventory/10 hover:bg-theme-inventory/20 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        {!item.isArchived && (
                          <button onClick={() => archiveBullion(item._id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="أرشفة السبيكة">
                            <Archive size={18} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      لا توجد بيانات مطابقة للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500 font-medium">صفحة {currentPage} من {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-50 text-charcoal hover:bg-gray-50">
                  <ChevronRight size={18} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg bg-white disabled:opacity-50 text-charcoal hover:bg-gray-50">
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BullionFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={createBullion} />
      {editingItem && <BullionFormModal isOpen={true} onClose={() => setEditingItem(null)} onSubmit={(data) => updateBullion(editingItem._id, data)} initialData={editingItem} />}
      {restockingItem && <AddQuantityModal isOpen={true} onClose={() => setRestockingItem(null)} onSubmit={addQuantity} item={restockingItem} />}
    </div>
  );
};
