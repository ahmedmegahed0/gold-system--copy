import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Plus,
  Archive,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Tag,
  Hash,
  Scale,
  Calendar,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  PlusSquare
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useInventory } from '../../hooks/useInventory';
import { useCategories } from '../../hooks/useCategories';
import type { CreateInventoryDto, InventoryItem, AddStockDto } from '../../common/types/inventory.types';

/* ──────────────────────────────────────────────
   MODAL OVERLAY
   ────────────────────────────────────────────── */
const ModalOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b border-gray-100 z-10">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {/* Body */}
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   INVENTORY FORM MODAL (CREATE/UPDATE)
   ────────────────────────────────────────────── */
const InventoryFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: InventoryItem | null;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const activeCategories = categories.filter((c) => !c.isArchived && c.status !== 'ARCHIVED');

  const isEditing = !!initialData;

  const [formData, setFormData] = useState<CreateInventoryDto>({
    title: '',
    companyName: '',
    category: '',
    karat: 21,
    initialCount: '' as any,
    totalGrossWeight: '' as any,
    tagDetails: [],
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          companyName: initialData.companyName || '',
          category: typeof initialData.category === 'object' ? (initialData.category._id || initialData.category.id || '') : initialData.category,
          karat: initialData.karat,
          initialCount: initialData.initialCount,
          totalGrossWeight: initialData.totalGrossWeight,
          tagDetails: initialData.tagDetails || [],
        });
      } else {
        setFormData({
          title: '',
          companyName: '',
          category: '',
          karat: 21,
          initialCount: '' as any,
          totalGrossWeight: '' as any,
          tagDetails: [],
        });
      }
      setFormError('');
    }
  }, [isOpen, initialData]);

  const totalTagsWeight = (formData.tagDetails || []).reduce((acc, tag) => acc + (tag.count * tag.weight), 0);
  const calculatedNetWeight = Math.max(0, Number(formData.totalGrossWeight || 0) - totalTagsWeight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category || Number(formData.totalGrossWeight || 0) <= 0 || Number(formData.initialCount || 0) <= 0) {
      setFormError(t('inventory.validation.required'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit({ 
        ...formData, 
        title: formData.title.trim(),
        totalGrossWeight: Number(formData.totalGrossWeight || 0),
        initialCount: Number(formData.initialCount || 0),
        tagDetails: (formData.tagDetails || []).map(tag => ({
          ...tag,
          count: Number(tag.count) || 0,
          weight: Number(tag.weight) || 0
        }))
      });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || (isEditing ? 'حدث خطأ أثناء التعديل' : t('inventory.errors.createFailed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل بيانات البضاعة' : t('inventory.addItem')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Tag size={16} className="text-gray-400" />
              {t('inventory.fields.title')}
              <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
              placeholder={t('inventory.placeholders.title')}
              autoFocus
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Box size={16} className="text-gray-400" />
              اسم الشركة
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
              placeholder="مثال: انريا"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Box size={16} className="text-gray-400" />
              {t('inventory.fields.category')}
              <span className="text-red-400 text-xs">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            >
              <option value="" disabled>{t('inventory.placeholders.selectCategory')}</option>
              {activeCategories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Karat */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <span className="font-bold text-gray-400">K</span>
              {t('inventory.fields.karat')}
            </label>
            <div className="flex gap-2">
              {[21, 18].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFormData({ ...formData, karat: k as 18 | 21 })}
                  className={`flex-1 py-3 border rounded-xl font-bold transition-all ${
                    formData.karat === k
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Initial Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Hash size={16} className="text-gray-400" />
              {t('inventory.fields.initialCount')}
              <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.initialCount ?? ''}
              onChange={(e) => setFormData({ ...formData, initialCount: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            />
          </div>

          {/* Total Gross Weight */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Scale size={16} className="text-gray-400" />
              {t('inventory.fields.totalGrossWeight')}
              <span className="text-red-400 text-xs">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalGrossWeight ?? ''}
                onChange={(e) => setFormData({ ...formData, totalGrossWeight: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal pr-12"
              />
              <span className="absolute left-4 top-3.5 text-gray-400 text-sm">{t('inventory.grams')}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              تفاصيل أوزان التيكت (اختياري)
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tagDetails: [...(formData.tagDetails || []), { count: 1, weight: 0.04 }] })}
              className="text-xs font-bold text-theme-inventory bg-theme-inventory/10 hover:bg-theme-inventory/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> إضافة تيكت
            </button>
          </div>
          
          {(formData.tagDetails || []).length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-400">
              لا يوجد تيكت مسجل لهذه البضاعة
            </div>
          ) : (
            <div className="space-y-3">
              {(formData.tagDetails || []).map((tag, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">عدد القطع</label>
                    <input
                      type="number"
                      min="1"
                      value={tag.count ?? ''}
                      onChange={(e) => {
                        const newTags = [...(formData.tagDetails || [])];
                        newTags[idx].count = e.target.value as any;
                        setFormData({ ...formData, tagDetails: newTags });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">الوزن (جم)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={tag.weight ?? ''}
                      onChange={(e) => {
                        const newTags = [...(formData.tagDetails || [])];
                        newTags[idx].weight = e.target.value as any;
                        setFormData({ ...formData, tagDetails: newTags });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = [...(formData.tagDetails || [])];
                      newTags.splice(idx, 1);
                      setFormData({ ...formData, tagDetails: newTags });
                    }}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 mb-0.5 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculated Net Weight Preview */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">{t('inventory.previewNetWeight')}</span>
          <span className="text-lg font-bold text-charcoal">
            {calculatedNetWeight.toFixed(2)} {t('inventory.grams')}
          </span>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {saving ? t('inventory.saving') : isEditing ? 'حفظ التعديلات' : t('inventory.addItem')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('inventory.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   RESTOCK MODAL
   ────────────────────────────────────────────── */
const RestockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: AddStockDto) => Promise<void>;
  item: InventoryItem | null;
}> = ({ isOpen, onClose, onSubmit, item }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<AddStockDto>({
    count: '' as any,
    grossWeight: '' as any,
    tagDetails: [],
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        count: '' as any,
        grossWeight: '' as any,
        tagDetails: [],
      });
      setFormError('');
    }
  }, [isOpen]);

  const totalTagsWeight = (formData.tagDetails || []).reduce((acc, tag) => acc + (tag.count * tag.weight), 0);
  const calculatedNetWeight = Math.max(0, Number(formData.grossWeight || 0) - totalTagsWeight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (Number(formData.grossWeight || 0) <= 0 || Number(formData.count || 0) <= 0) {
      setFormError('يرجى إدخال العدد والوزن القائم بشكل صحيح');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit(item._id || item.id || '', { 
        count: Number(formData.count || 0),
        grossWeight: Number(formData.grossWeight || 0),
        tagDetails: (formData.tagDetails || []).map(tag => ({
          ...tag,
          count: Number(tag.count) || 0,
          weight: Number(tag.weight) || 0
        }))
      });
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء التزويد');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={`تزويد كمية: ${item.title}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-4">
          <p className="text-sm text-blue-800">أنت تقوم بتزويد كمية إضافية لهذه البضاعة. سيتم دمج الأوزان الجديدة وإضافة القطع إلى العدد الحالي.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Hash size={16} className="text-gray-400" />
              عدد القطع المضافة
              <span className="text-red-400 text-xs">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.count ?? ''}
              onChange={(e) => setFormData({ ...formData, count: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
              placeholder="مثال: 5"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
              <Scale size={16} className="text-gray-400" />
              الوزن القائم المضاف
              <span className="text-red-400 text-xs">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.grossWeight ?? ''}
                onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal pr-12"
              />
              <span className="absolute left-4 top-3.5 text-gray-400 text-sm">{t('inventory.grams')}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <Tag size={16} className="text-gray-400" />
              أوزان التيكت للكمية المضافة (اختياري)
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tagDetails: [...(formData.tagDetails || []), { count: 1, weight: 0.04 }] })}
              className="text-xs font-bold text-theme-inventory bg-theme-inventory/10 hover:bg-theme-inventory/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> إضافة تيكت
            </button>
          </div>
          
          {(formData.tagDetails || []).length === 0 ? (
            <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-400">
              لا يوجد تيكت إضافي لهذه الدفعة
            </div>
          ) : (
            <div className="space-y-3">
              {(formData.tagDetails || []).map((tag, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">عدد القطع</label>
                    <input
                      type="number"
                      min="1"
                      value={tag.count ?? ''}
                      onChange={(e) => {
                        const newTags = [...(formData.tagDetails || [])];
                        newTags[idx].count = e.target.value as any;
                        setFormData({ ...formData, tagDetails: newTags });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">الوزن (جم)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={tag.weight ?? ''}
                      onChange={(e) => {
                        const newTags = [...(formData.tagDetails || [])];
                        newTags[idx].weight = e.target.value as any;
                        setFormData({ ...formData, tagDetails: newTags });
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = [...(formData.tagDetails || [])];
                      newTags.splice(idx, 1);
                      setFormData({ ...formData, tagDetails: newTags });
                    }}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 mb-0.5 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">الوزن الصافي المضاف:</span>
          <span className="text-lg font-bold text-charcoal">
            {calculatedNetWeight.toFixed(2)} {t('inventory.grams')}
          </span>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <PlusSquare size={18} />}
            {saving ? t('inventory.saving') : 'تأكيد الإضافة'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('inventory.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   CONFIRM ARCHIVE MODAL
   ────────────────────────────────────────────── */
const ConfirmArchiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, item, onConfirm }) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await onConfirm(item._id || item.id || '');
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('inventory.confirmArchive.title')}>
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-5">
          <Archive size={28} />
        </div>
        <p className="text-charcoal font-medium text-lg mb-2">
          {t('inventory.confirmArchive.message')}
        </p>
        <p className="text-gray-400 font-medium bg-gray-50 py-2 px-4 rounded-lg inline-block mt-2">
          {item?.title}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {deleting ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
          {deleting ? t('inventory.archiving') : t('inventory.confirmArchive.confirm')}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          {t('inventory.cancel')}
        </button>
      </div>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   INVENTORY DETAILS MODAL
   ────────────────────────────────────────────── */
const InventoryDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}> = ({ isOpen, onClose, item }) => {
  const { t, i18n } = useTranslation();
  if (!item) return null;

  const catName = typeof item.category === 'string' ? item.category : item.category?.name || '---';

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('inventory.details.title')}>
      <div className="space-y-6 py-2">
        {/* Header Summary */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
            <Box size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal">{item.title}</h3>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-1">
              <Box size={14} /> {item.companyName || '---'}
              <span className="mx-2 text-gray-300">•</span>
              <Tag size={14} /> {catName}
              <span className="mx-2 text-gray-300">•</span>
              <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-white border border-gray-200 text-charcoal">
                {item.karat}K
              </span>
            </p>
          </div>
        </div>

        {/* Weights Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Scale size={14} /> الوزن القائم الابتدائي
            </span>
            <span className="text-xl font-bold text-charcoal">
              {(item.initialGrossWeight ?? item.totalGrossWeight).toFixed(2)} <span className="text-sm font-medium text-gray-400">{t('inventory.grams')}</span>
            </span>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Scale size={14} /> الوزن القائم الحالي
            </span>
            <span className="text-xl font-bold text-charcoal">
              {item.totalGrossWeight.toFixed(2)} <span className="text-sm font-medium text-gray-400">{t('inventory.grams')}</span>
            </span>
          </div>
          <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 shadow-sm flex flex-col gap-1 col-span-2">
            <span className="text-xs font-semibold text-gold/80 flex items-center gap-1.5">
              <Scale size={14} /> {t('inventory.details.netWeight')}
            </span>
            <span className="text-xl font-bold text-gold">
              {item.totalNetWeight.toFixed(2)} <span className="text-sm font-medium text-gold/60">{t('inventory.grams')}</span>
            </span>
          </div>
        </div>

        {/* Counts Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Hash size={14} /> {t('inventory.details.initialCount')}
            </span>
            <span className="text-lg font-bold text-charcoal">{item.initialCount}</span>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Hash size={14} /> {t('inventory.details.currentCount')}
            </span>
            <span className={`text-lg font-bold ${item.currentCount === 0 ? 'text-red-500' : 'text-emerald-600'}`}>
              {item.currentCount}
            </span>
          </div>
        </div>

        {(!item.tagDetails || item.tagDetails.length === 0) ? (
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center text-sm font-medium text-gray-400">
            لا يوجد تيكت لهذه البضاعة
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-sm font-semibold text-charcoal block">أوزان التيكت:</span>
            <div className="grid grid-cols-2 gap-3">
              {item.tagDetails.map((tag, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex justify-between items-center">
                  <span className="text-sm font-bold text-charcoal flex items-center gap-1"><Hash size={14} className="text-gray-400" /> {tag.count}</span>
                  <span className="text-sm font-bold text-charcoal flex items-center gap-1"><Scale size={14} className="text-gray-400" /> {tag.weight} جم</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-400 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            {t('inventory.details.addedOn')}: <span dir="ltr">{new Date(item.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.status === 'ARCHIVED' || item.isArchived ? 'bg-gray-400' : 'bg-emerald-500'}`}></span>
            {item.status === 'ARCHIVED' || item.isArchived ? t('inventory.status.archived') : t('inventory.status.active')}
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-charcoal font-bold rounded-xl transition-all border border-gray-200"
        >
          {t('inventory.close')}
        </button>
      </div>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   MAIN INVENTORY PAGE
   ────────────────────────────────────────────── */
export const InventoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const isRtl = i18n.language.startsWith('ar');

  const {
    inventory,
    isLoading,
    error,
    filters,
    setFilters,
    createInventory,
    updateInventory,
    softDeleteInventory,
    restockInventory,
  } = useInventory({ status: 'ACTIVE', karat: 21 });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [archivingItem, setArchivingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  const [currentCompanyPage, setCurrentCompanyPage] = useState(1);
  const COMPANY_ITEMS_PER_PAGE = 3;

  const handleKaratChange = (karat: 18 | 21) => setFilters({ ...filters, karat });
  const handleStatusChange = (status: 'ACTIVE' | 'ARCHIVED') => setFilters({ ...filters, status });

  const isArchiveView = filters.status === 'ARCHIVED';

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setCurrentCompanyPage(1);
  }, [filters]);

  // Calculate Owner Dashboard Metrics
  const metrics = useMemo(() => {
    const companies: Record<string, {
      name: string;
      totalItems: number;
      taggedItems: number;
      totalGross: number;
      totalTagDeduction: number;
      totalNet: number;
    }> = {};

    let totalItems = 0;
    let totalTagged = 0;
    let totalGross = 0;
    let totalTagDeduction = 0;
    let totalNet = 0;

    inventory.forEach((item) => {
      const compName = item.companyName?.trim() || 'أخرى';
      if (!companies[compName]) {
        companies[compName] = { name: compName, totalItems: 0, taggedItems: 0, totalGross: 0, totalTagDeduction: 0, totalNet: 0 };
      }

      let tagDeduction = 0;
      let tagsCount = 0;
      if (item.tagDetails) {
        item.tagDetails.forEach(tag => {
          tagsCount += tag.count;
          tagDeduction += tag.count * tag.weight;
        });
      }

      const netWeight = item.totalNetWeight || (item.totalGrossWeight - tagDeduction);

      companies[compName].totalItems += item.currentCount;
      companies[compName].taggedItems += tagsCount;
      companies[compName].totalGross += item.totalGrossWeight;
      companies[compName].totalTagDeduction += tagDeduction;
      companies[compName].totalNet += netWeight;

      totalItems += item.currentCount;
      totalTagged += tagsCount;
      totalGross += item.totalGrossWeight;
      totalTagDeduction += tagDeduction;
      totalNet += netWeight;
    });

    return { 
      totals: { totalItems, totalTagged, totalGross, totalTagDeduction, totalNet },
      byCompany: Object.values(companies).sort((a, b) => b.totalNet - a.totalNet)
    };
  }, [inventory]);

  const totalCompanyPages = Math.max(1, Math.ceil(metrics.byCompany.length / COMPANY_ITEMS_PER_PAGE));
  const currentCompanies = useMemo(() => {
    const startIndex = (currentCompanyPage - 1) * COMPANY_ITEMS_PER_PAGE;
    return metrics.byCompany.slice(startIndex, startIndex + COMPANY_ITEMS_PER_PAGE);
  }, [metrics.byCompany, currentCompanyPage]);

  const totalPages = Math.max(1, Math.ceil(inventory.length / ITEMS_PER_PAGE));
  const currentInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return inventory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [inventory, currentPage]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-inventory/10 text-theme-inventory">
              <Box size={24} />
            </div>
            {t('inventory.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('inventory.subtitle')}
          </p>
        </div>

        {isOwner && !isArchiveView && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-theme-inventory hover:bg-theme-inventory/90 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            {t('inventory.addItem')}
          </button>
        )}
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ─── Owner Metrics Dashboard & Company Breakdown ─── */}
      {isOwner && !isArchiveView && (
        <div className="space-y-4">
          {/* Overall Totals */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-500">إجمالي القطع</span>
              <span className="text-2xl font-black text-charcoal">{metrics.totals.totalItems}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-500">القطع بتيكت</span>
              <span className="text-2xl font-black text-charcoal">{metrics.totals.totalTagged}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-500">الوزن القائم</span>
              <span className="text-2xl font-black text-charcoal flex items-baseline gap-1">
                {metrics.totals.totalGross.toFixed(2)} <span className="text-xs font-semibold text-gray-400">جم</span>
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-red-100/50 bg-red-50/30 shadow-sm flex flex-col gap-1">
              <span className="text-sm font-semibold text-red-500">خصم الورق</span>
              <span className="text-2xl font-black text-red-600 flex items-baseline gap-1">
                {metrics.totals.totalTagDeduction.toFixed(2)} <span className="text-xs font-semibold text-red-400">جم</span>
              </span>
            </div>
            <div className="bg-theme-inventory/10 p-5 rounded-xl border border-theme-inventory/20 shadow-sm flex flex-col gap-1">
              <span className="text-sm font-semibold text-theme-inventory">الصافي الاجمالي</span>
              <span className="text-2xl font-black text-theme-inventory flex items-baseline gap-1">
                {metrics.totals.totalNet.toFixed(2)} <span className="text-xs font-semibold text-theme-inventory/60">جم</span>
              </span>
            </div>
          </div>

          {/* Company Breakdown */}
          {metrics.byCompany.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                <h3 className="font-bold text-charcoal text-sm flex items-center gap-2">
                  <Box size={16} className="text-theme-inventory" />
                  تصنيف الشركات وخصم الورق
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                  <thead className="text-gray-400 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3 font-semibold">الشركة</th>
                      <th className="px-5 py-3 font-semibold text-center">إجمالي القطع</th>
                      <th className="px-5 py-3 font-semibold text-center">القطع بتيكت</th>
                      <th className="px-5 py-3 font-semibold text-center">الوزن القائم</th>
                      <th className="px-5 py-3 font-semibold text-center text-red-500">خصم الورق</th>
                      <th className="px-5 py-3 font-semibold text-center text-theme-inventory">الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentCompanies.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 font-bold text-charcoal">{comp.name}</td>
                        <td className="px-5 py-3 text-center font-medium text-gray-600">{comp.totalItems}</td>
                        <td className="px-5 py-3 text-center font-medium text-gray-600">{comp.taggedItems}</td>
                        <td className="px-5 py-3 text-center font-bold text-gray-700" dir="ltr">{comp.totalGross.toFixed(2)}g</td>
                        <td className="px-5 py-3 text-center font-bold text-red-500" dir="ltr">{comp.totalTagDeduction.toFixed(2)}g</td>
                        <td className="px-5 py-3 text-center font-black text-theme-inventory" dir="ltr">{comp.totalNet.toFixed(2)}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Company Pagination Controls */}
              {metrics.byCompany.length > 0 && totalCompanyPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/30">
                  <span className="text-sm text-gray-500 font-medium">
                    عرض <span className="font-bold text-charcoal">{((currentCompanyPage - 1) * COMPANY_ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentCompanyPage * COMPANY_ITEMS_PER_PAGE, metrics.byCompany.length)}</span> من <span className="font-bold text-charcoal">{metrics.byCompany.length}</span> شركات
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentCompanyPage(p => Math.max(1, p - 1))}
                      disabled={currentCompanyPage === 1}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalCompanyPages }).map((_, idx) => {
                        const pageNumber = idx + 1;
                        if (
                          totalCompanyPages > 5 &&
                          pageNumber !== 1 &&
                          pageNumber !== totalCompanyPages &&
                          (pageNumber < currentCompanyPage - 1 || pageNumber > currentCompanyPage + 1)
                        ) {
                          if (pageNumber === currentCompanyPage - 2 || pageNumber === currentCompanyPage + 2) {
                            return <span key={idx} className="px-1 text-gray-400">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentCompanyPage(pageNumber)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                              currentCompanyPage === pageNumber
                                ? 'bg-theme-inventory text-white shadow-sm'
                                : 'text-gray-500 hover:bg-white hover:text-charcoal border border-transparent hover:border-gray-200'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentCompanyPage(p => Math.min(totalCompanyPages, p + 1))}
                      disabled={currentCompanyPage === totalCompanyPages}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Filter Bar & Table Container ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
          
          <div className="flex items-center gap-4">
            {/* Karat Toggle */}
            <div className="flex p-1 bg-gray-100/80 rounded-lg">
              {[21, 18].map((k) => (
                <button
                  key={k}
                  onClick={() => handleKaratChange(k as 18 | 21)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    filters.karat === k ? 'bg-white text-gold shadow-sm' : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  {k}K
                </button>
              ))}
            </div>

            {/* Status Toggle (Owner Only) */}
            {isOwner && (
              <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            )}
            
            {isOwner && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusChange('ACTIVE')}
                  className={`text-sm font-bold transition-colors ${
                    !isArchiveView ? 'text-charcoal' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t('inventory.tabs.active')}
                </button>
                <button
                  onClick={() => handleStatusChange('ARCHIVED')}
                  className={`text-sm font-bold transition-colors ${
                    isArchiveView ? 'text-charcoal' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t('inventory.tabs.archived')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={filters.companyName || ''}
                onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
                placeholder="بحث باسم الشركة..."
                className={`w-full sm:w-64 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white ${
                  isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
                }`}
              />
              <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:text-charcoal hover:bg-gray-50 bg-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin text-gold" />
              <span className="font-medium">{t('inventory.loading')}</span>
            </div>
          ) : inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Box size={28} />
              </div>
              <p className="font-medium">{t('inventory.empty')}</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('inventory.table.title')}</th>
                  <th className="px-6 py-4 font-semibold">{t('inventory.table.category')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('inventory.table.karat')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('inventory.table.currentCount')}</th>
                  
                  {/* Owner Only Weight Columns */}
                  {isOwner && (
                    <>
                      <th className="px-6 py-4 font-semibold text-center">القطع بتيكت</th>
                      <th className="px-6 py-4 font-semibold text-center">{t('inventory.table.grossWeight')}</th>
                      <th className="px-6 py-4 font-semibold text-center text-red-400">خصم التيكت</th>
                      <th className="px-6 py-4 font-semibold text-center">{t('inventory.table.netWeight')}</th>
                      <th className="px-6 py-4 font-semibold text-center">{t('inventory.table.actions')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentInventory.map((item, index) => {
                  const catName = typeof item.category === 'string' ? item.category : item.category?.name || '---';
                  const tagsCount = (item.tagDetails || []).reduce((acc, t) => acc + t.count, 0);
                  const tagDeduction = (item.tagDetails || []).reduce((acc, t) => acc + (t.count * t.weight), 0);
                  return (
                    <tr key={item._id || item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-charcoal text-base">{item.title}</span>
                          {item.companyName && (
                            <span className="text-xs text-gray-500 font-medium mt-0.5">{item.companyName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100/50 font-bold text-sm">
                          {catName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-charcoal text-sm font-black border border-gray-200">
                          {item.karat}K
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div>
                            <span className="font-black text-charcoal text-lg">{item.currentCount}</span>
                            <span className="text-gray-400 text-sm mx-1">/ {item.initialCount}</span>
                          </div>
                          {isArchiveView ? (
                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-sm font-bold">بضاعة مؤرشفة</span>
                          ) : item.currentCount === 0 ? (
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-bold">نفدت الكمية ⚠️</span>
                          ) : (
                            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-sm font-bold">متوفر بالمخزن ✅</span>
                          )}
                        </div>
                      </td>

                      {isOwner && (
                        <>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-charcoal">{tagsCount}</span>
                              {tagsCount > 0 && (
                                <span className="text-xs text-gray-400 mt-0.5" dir="ltr">(-{tagDeduction.toFixed(2)}g)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-baseline bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50" dir="ltr">
                              <span className="font-bold text-sm">{item.totalGrossWeight.toFixed(2)}g</span>
                              <span className="text-amber-700/60 text-xs font-bold mx-1">/ {(item.initialGrossWeight ?? item.totalGrossWeight).toFixed(2)}g</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100/50 font-bold text-sm" dir="ltr">
                              {tagDeduction.toFixed(2)}g
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-baseline bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/50" dir="ltr">
                              <span className="font-black text-sm">{item.totalNetWeight.toFixed(2)}g</span>
                              <span className="text-emerald-700/60 text-xs font-bold mx-1">/ {Math.max(0, (item.initialGrossWeight ?? item.totalGrossWeight) - tagDeduction).toFixed(2)}g</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setViewingItem(item)}
                                className="p-1.5 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                title={t('inventory.actions.details')}
                              >
                                <FileText size={16} />
                              </button>
                              {!isArchiveView && (
                                <>
                                  <button
                                    onClick={() => setRestockingItem(item)}
                                    className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    title="تزويد الكمية"
                                  >
                                    <PlusSquare size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(item)}
                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setArchivingItem(item)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t('inventory.actions.archive')}
                                  >
                                    <Archive size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {inventory.length > 0 && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              عرض <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, inventory.length)}</span> من <span className="font-bold text-charcoal">{inventory.length}</span> أصناف
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
                          ? 'bg-theme-inventory text-white shadow-sm'
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
      </div>

      {/* ─── Modals ─── */}
      <InventoryFormModal
        isOpen={showCreateModal || !!editingItem}
        onClose={() => {
          setShowCreateModal(false);
          setEditingItem(null);
        }}
        onSubmit={async (data) => {
          if (editingItem) {
            await updateInventory(editingItem._id || editingItem.id || '', data);
          } else {
            await createInventory(data);
          }
        }}
        initialData={editingItem}
      />

      <InventoryDetailsModal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
      />

      <RestockModal
        isOpen={!!restockingItem}
        onClose={() => setRestockingItem(null)}
        item={restockingItem}
        onSubmit={restockInventory}
      />

      <ConfirmArchiveModal
        isOpen={!!archivingItem}
        onClose={() => setArchivingItem(null)}
        item={archivingItem}
        onConfirm={softDeleteInventory}
      />
    </div>
  );
};
