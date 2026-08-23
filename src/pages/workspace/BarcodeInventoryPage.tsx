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
  Barcode,
  Printer
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useBarcodeInventory } from '../../hooks/useBarcodeInventory';
import type { BarcodeInventoryItem, CreateBarcodeItemDto } from '../../common/types/barcode.types';

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

const PrintTagModal: React.FC<{ isOpen: boolean; onClose: () => void; barcode: string; getPrintTag: (b: string) => Promise<{imageBase64: string}> }> = ({ isOpen, onClose, barcode, getPrintTag }) => {
  const [imgData, setImgData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    if (isOpen && barcode) {
      setLoading(true);
      getPrintTag(barcode).then(res => {
        setImgData(res.imageBase64);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [isOpen, barcode, getPrintTag]);

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="طباعة الباركود">
       {loading ? (
         <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
       ) : imgData ? (
         <div className="flex flex-col items-center justify-center space-y-6">
           <img src={imgData} alt="Barcode" className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm max-w-full" />
           <p className="text-xl font-bold tracking-widest font-mono text-charcoal">{barcode}</p>
           
           <div className="w-full flex gap-3 pt-4 border-t border-gray-100">
             <button onClick={() => {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head><title>Print Barcode</title></head>
                      <body style="text-align:center; margin-top:20px;">
                        <img src="${imgData}" style="width: 200px;" />
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 250);
                }
             }} className="flex-1 py-3 bg-charcoal hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2">
               <Printer size={18} /> طباعة التيكت
             </button>
             <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-medium">إغلاق</button>
           </div>
         </div>
       ) : (
         <div className="text-center text-red-500 py-8">فشل في توليد الباركود</div>
       )}
    </ModalOverlay>
  )
}

const BarcodeFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<any>; initialData?: BarcodeInventoryItem | null }> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState<CreateBarcodeItemDto>({
    title: '',
    karat: 21,
    grossWeight: '' as any,
    tagWeight: '' as any,
    makingChargePerGram: '' as any,
    companyName: '',
    barcode: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          karat: initialData.karat,
          grossWeight: initialData.grossWeight,
          tagWeight: initialData.tagWeight || 0.06,
          makingChargePerGram: initialData.makingChargePerGram,
          companyName: initialData.companyName,
          barcode: initialData.barcode,
        });
      } else {
        setFormData({
          title: '',
          karat: 21,
          grossWeight: '' as any,
          tagWeight: '' as any,
          makingChargePerGram: '' as any,
          companyName: '',
          barcode: '',
        });
      }
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || Number(formData.grossWeight) <= 0 || Number(formData.makingChargePerGram) < 0) {
      setFormError('يرجى تعبئة الحقول الأساسية المطلوبة بشكل صحيح.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit({
        ...formData,
        grossWeight: Number(formData.grossWeight),
        tagWeight: (formData.tagWeight as any) === '' || formData.tagWeight === undefined ? undefined : Number(formData.tagWeight),
        makingChargePerGram: Number(formData.makingChargePerGram),
        barcode: formData.barcode?.trim() || undefined,
        companyName: formData.companyName?.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل قطعة' : 'إضافة قطعة باركود'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />{formError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-charcoal mb-2">رقم الباركود (اختياري، يولد تلقائياً)</label>
            <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} disabled={isEditing} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none disabled:opacity-60" placeholder="مثال: 20261001001" dir="ltr" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-charcoal mb-2">اسم/وصف القطعة <span className="text-red-400">*</span></label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none" placeholder="خاتم سوليتير، غويشة سادة..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">العيار <span className="text-red-400">*</span></label>
            <select value={formData.karat} onChange={e => setFormData({...formData, karat: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none">
              <option value={18}>18K</option>
              <option value={21}>21K</option>
              <option value={24}>24K</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">الشركة / المصنع</label>
            <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none" placeholder="لازوردي، اندريا..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">الوزن القائم شامل التيكت (جم) <span className="text-red-400">*</span></label>
            <input type="number" step="0.01" value={formData.grossWeight} onChange={e => setFormData({...formData, grossWeight: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">وزن التيكت (جم) (اختياري)</label>
            <input type="number" step="0.01" value={formData.tagWeight ?? ''} onChange={e => setFormData({...formData, tagWeight: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none" dir="ltr" placeholder="الافتراضي 0.06" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-charcoal mb-2">مصنعية الجرام (ج.م) <span className="text-red-400">*</span></label>
            <input type="number" step="0.01" min="0" value={formData.makingChargePerGram} onChange={e => setFormData({...formData, makingChargePerGram: e.target.value as any})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none" dir="ltr" />
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} حفظ القطعة
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50">إلغاء</button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export const BarcodeInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  
  const {
    items, isLoading, error, filters, setFilters, createItem, updateItem, archiveItem, getPrintTag
  } = useBarcodeInventory(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BarcodeInventoryItem | null>(null);
  const [printBarcode, setPrintBarcode] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const currentItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <Barcode className="text-indigo-600" size={28} />
            مخزن الباركود
          </h1>
          <p className="text-gray-500 mt-1">إدارة القطع المربوطة بباركود وتفاصيلها الفردية</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all">
            <Plus size={20} /> إضافة قطعة باركود
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="ابحث باسم القطعة، الباركود، الشركة..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none bg-gray-50/50" />
          </div>
          <div className="w-48">
            <select value={filters.karat || ''} onChange={e => setFilters({ ...filters, karat: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none bg-gray-50/50">
              <option value="">الكل (العيار)</option>
              <option value={18}>18K</option>
              <option value={21}>21K</option>
              <option value={24}>24K</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50">
            <input type="checkbox" id="archived" checked={filters.isArchived} onChange={e => setFilters({ ...filters, isArchived: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="archived" className="text-sm font-medium text-gray-700 cursor-pointer">عرض المؤرشف/المباع</label>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-indigo-300 mb-4" />
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
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الباركود والقطعة</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">العيار</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الوزن (قائم/صافي)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">المصنعية/جرام</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500">الحالة</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-500 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-charcoal">{item.title}</div>
                      <div className="text-xs font-mono text-gray-500 mt-1" dir="ltr">{item.barcode}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{item.companyName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 inline-block px-2 py-1 rounded">{item.karat}K</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-charcoal">{item.grossWeight.toFixed(2)}g (ق)</div>
                      <div className="text-xs text-gray-500 mt-1">{item.netWeight.toFixed(2)}g (ص)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{item.makingChargePerGram} ج.م</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === 'AVAILABLE' ? (
                        <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">متاح</span>
                      ) : item.status === 'SOLD' ? (
                         <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200">مباع</span>
                      ) : (
                         <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">محجوز</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                      <button onClick={() => setPrintBarcode(item.barcode)} className="p-2 text-charcoal bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="طباعة الباركود">
                        <Printer size={18} />
                      </button>
                      {isOwner && item.status !== 'SOLD' && (
                        <>
                          <button onClick={() => setEditingItem(item)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          {!item.isArchived && (
                            <button onClick={() => archiveItem(item._id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="أرشفة القطعة">
                              <Archive size={18} />
                            </button>
                          )}
                        </>
                      )}
                    </td>
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
      <BarcodeFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={createItem} />
      {editingItem && <BarcodeFormModal isOpen={true} onClose={() => setEditingItem(null)} onSubmit={(data) => updateItem(editingItem._id, data)} initialData={editingItem} />}
      {printBarcode && <PrintTagModal isOpen={true} onClose={() => setPrintBarcode(null)} barcode={printBarcode} getPrintTag={getPrintTag} />}
    </div>
  );
};
