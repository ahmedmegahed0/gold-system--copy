import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users, Phone, MapPin, Loader2, Edit2, Plus, AlertCircle } from 'lucide-react';
import type { Supplier } from '../../common/types/supplier.types';

const ModalOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
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

export const SupplierFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  initialData?: Supplier;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          phone: initialData.phone,
          address: initialData.address || '',
        });
      } else {
        setFormData({ name: '', phone: '', address: '' });
      }
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      setFormError('يرجى إدخال اسم ورقم المورد');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.address?.trim()) {
        payload.address = formData.address.trim();
      }
      
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل المورد' : 'إضافة مورد جديد'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <Users size={16} className="text-gray-400" />
            اسم المورد أو الورشة
            <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder="مثال: ورشة الأمل"
            autoFocus
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <Phone size={16} className="text-gray-400" />
            رقم الهاتف
            <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder="رقم الهاتف"
            dir="ltr"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <MapPin size={16} className="text-gray-400" />
            العنوان (اختياري)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder="العنوان"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {saving ? t('customers.saving') : isEditing ? 'تعديل' : 'إضافة'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {t('customers.cancel')}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};
