import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Archive,
  Edit2,
  FileText,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  X,
  History,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  User,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useCustomers } from '../../hooks/useCustomers';
import { SalesService } from '../../services/sales.service';
import { ScrapInvoiceService } from '../../services/scrap-invoice.service';
import type { CreateCustomerDto, UpdateCustomerDto, Customer } from '../../common/types/customer.types';

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
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b border-gray-100 z-10">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   SLIDING PANEL (DRAWERS) OVERLAY
   ────────────────────────────────────────────── */
const DrawerOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isRtl: boolean;
}> = ({ isOpen, onClose, title, children, isRtl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md bg-white h-full shadow-2xl border-gray-100 flex flex-col animate-in ${
          isRtl ? 'slide-in-from-left mr-auto border-r' : 'slide-in-from-right ml-auto border-l'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   CUSTOMER FORM MODAL (CREATE/UPDATE)
   ────────────────────────────────────────────── */
const CustomerFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Customer;
}> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useTranslation();
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<CreateCustomerDto | UpdateCustomerDto>({
    fullName: '',
    phoneNumber: '',
    nationalId: '',
    address: '',
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          fullName: initialData.fullName,
          phoneNumber: initialData.phoneNumber,
          nationalId: initialData.nationalId || '',
          address: initialData.address || '',
          status: initialData.status,
        });
      } else {
        setFormData({ fullName: '', phoneNumber: '', nationalId: '', address: '' });
      }
      setFormError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) {
      setFormError(t('customers.validation.required'));
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const payload: any = {
        ...formData,
        fullName: formData.fullName?.trim(),
        phoneNumber: formData.phoneNumber?.trim(),
        address: formData.address?.trim(),
      };
      if (isEditing) {
        delete payload.nationalId;
      }
      // Clean up empty strings to undefined if backend requires
      if (!payload.address) delete payload.address;
      if (!payload.nationalId) delete payload.nationalId;
      if (!payload.phoneNumber) delete payload.phoneNumber;
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('customers.errors.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t('customers.editCustomer') : t('customers.addCustomer')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <Users size={16} className="text-gray-400" />
            {t('customers.fields.fullName')}
            <span className="text-red-400 text-xs">*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder={t('customers.placeholders.fullName')}
            autoFocus
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <Phone size={16} className="text-gray-400" />
            {t('customers.fields.phoneNumber')}
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder={t('customers.placeholders.phoneNumber')}
            dir="ltr"
          />
        </div>

        {/* National ID */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <CreditCard size={16} className="text-gray-400" />
            {t('customers.fields.nationalId')}
          </label>
          <input
            type="text"
            value={(formData as any).nationalId || ''}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            disabled={isEditing}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all text-charcoal ${
              isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50/50 focus:bg-white'
            }`}
            placeholder={t('customers.placeholders.nationalId')}
            dir="ltr"
          />
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-charcoal mb-2">
            <MapPin size={16} className="text-gray-400" />
            {t('customers.fields.address')}
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal"
            placeholder={t('customers.placeholders.address')}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
            {saving ? t('customers.saving') : isEditing ? t('customers.saveChanges') : t('customers.addCustomer')}
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

/* ──────────────────────────────────────────────
   CUSTOMER STATEMENT DRAWER
   ────────────────────────────────────────────── */
const CustomerStatementDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  isRtl: boolean;
}> = ({ isOpen, onClose, customerId, isRtl }) => {
  const { t, i18n } = useTranslation();
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  useEffect(() => {
    if (isOpen && customerId) {
      const fetchStatement = async () => {
        setLoading(true);
        setError(null);
        try {
          // Bypass the broken backend endpoint by fetching invoices directly and calculating locally
          const [allInvoices, allScrap] = await Promise.all([
            SalesService.getInvoices(),
            ScrapInvoiceService.getScrapInvoices()
          ]);

          const customerInvoices = allInvoices.filter(inv => {
            if (typeof inv.customer === 'string') return inv.customer === customerId;
            return inv.customer?._id === customerId || inv.customer?.id === customerId;
          }).map(inv => ({ ...inv, type: 'SALE' }));

          const customerScrap = allScrap.filter(inv => {
            if (typeof inv.customer === 'string') return inv.customer === customerId;
            return inv.customer?._id === customerId || inv.customer?.id === customerId;
          }).map(inv => ({ ...inv, type: 'SCRAP' }));
          
          const totalSpent = customerInvoices.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);
          const totalScrapBought = customerScrap.reduce((sum, inv) => sum + (inv.totalPrice || 0), 0);
          const invoicesCount = customerInvoices.length + customerScrap.length;
          const totalGoldWeight = customerInvoices.reduce((sum, inv) => 
            sum + (inv.items?.reduce((w: number, item: any) => w + (item.soldGrossWeight || 0), 0) || 0), 0);
          const totalScrapGoldWeight = customerScrap.reduce((sum, inv) => sum + (inv.weight || 0), 0);
          
          const statementData = {
            totalSpent,
            totalScrapBought,
            invoicesCount,
            totalGoldWeight,
            totalScrapGoldWeight,
            recentInvoices: [...customerInvoices, ...customerScrap].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          };
          
          setStatement(statementData);
        } catch (err: any) {
          if (err.response?.status === 403) {
            setError('عذراً، غير مسموح لك بعرض كشف الحساب الخاص بالعملاء.');
          } else {
            setError(err.response?.data?.message || t('customers.errors.fetchStatementFailed'));
          }
        } finally {
          setLoading(false);
        }
      };
      fetchStatement();
    } else {
      setStatement(null);
    }
  }, [isOpen, customerId, t]);

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClose={onClose} title={t('customers.statement.title')} isRtl={isRtl}>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-gold" />
          <span className="font-medium text-sm">{t('customers.loading')}</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : statement ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-theme-customers"></div>
            <span className="text-sm font-semibold text-gray-400 flex items-center gap-2">
              <CreditCard size={16} />
              {t('customers.statement.totalSpent')} (مبيعات)
            </span>
            <span className="text-3xl font-bold text-charcoal flex items-baseline gap-1" dir="ltr">
              {statement.totalSpent?.toLocaleString() || '0'}
              <span className="text-base font-medium text-gray-400">{t('customers.currency')}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">{t('customers.statement.totalInvoices')}</span>
              <span className="text-xl font-bold text-charcoal">{statement.invoicesCount || 0}</span>
            </div>
            <div className="bg-gold/5 p-5 rounded-2xl border border-gold/20 flex flex-col gap-1">
              <span className="text-xs font-semibold text-gold/80">{t('customers.statement.totalGoldBought')}</span>
              <span className="text-xl font-bold text-gold flex items-baseline gap-1">
                {(statement.totalGoldWeight || 0).toFixed(2)}
                <span className="text-xs font-medium text-gold/60">{t('customers.grams')}</span>
              </span>
            </div>
            
            {statement.totalScrapBought > 0 && (
              <>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-blue-600">إجمالي الذهب الكسر</span>
                  <span className="text-xl font-bold text-blue-800 flex items-baseline gap-1">
                    {(statement.totalScrapGoldWeight || 0).toFixed(2)}
                    <span className="text-xs font-medium text-blue-600/60">{t('customers.grams')}</span>
                  </span>
                </div>
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-blue-600">قيمة الكسر المستلمة</span>
                  <span className="text-xl font-bold text-blue-800 flex items-baseline gap-1">
                    {(statement.totalScrapBought || 0).toLocaleString()}
                    <span className="text-xs font-medium text-blue-600/60">{t('customers.currency')}</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Invoices List */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-charcoal mb-4 flex items-center gap-2">
              <History size={16} className="text-gold" />
              {t('customers.statement.recentInvoices')}
            </h3>
            
            {statement.recentInvoices && statement.recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {statement.recentInvoices.map((inv: any) => (
                  <div key={inv._id || inv.id} className="p-4 rounded-xl border border-gray-100 hover:border-gold/30 transition-colors bg-white shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded whitespace-nowrap inline-block">
                        #{inv.invoiceNumber || (inv._id || inv.id).substring(0, 8)}
                      </span>
                      {inv.type === 'SCRAP' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700">شراء كسر</span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
                        <Calendar size={12} />
                        {new Date(inv.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-500">{t('customers.statement.invoiceTotal')}</span>
                        <span className="text-lg font-bold text-charcoal" dir="ltr">
                          {inv.totalPrice?.toLocaleString() || '0'} {t('customers.currency')}
                        </span>
                      </div>
                      <button 
                        onClick={() => setViewingInvoice(inv)}
                        className="text-xs font-bold text-gold hover:text-[#b59540] flex items-center gap-1"
                      >
                        {t('customers.statement.viewInvoice')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <FileText size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">{t('customers.statement.noInvoices')}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
      </DrawerOverlay>

      {/* Transcript Modal */}
      <ModalOverlay
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={viewingInvoice?.type === 'SCRAP' ? 'تفاصيل فاتورة شراء الكسر' : t('sales.invoices.transcriptTitle')}
      >
        {viewingInvoice && (
          <div className="space-y-6">
            {/* Header Details */}
            <div className="flex justify-between items-start pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">{t('sales.invoices.table.number')}</span>
                <span className="text-xl font-black text-charcoal" dir="ltr">#{viewingInvoice.invoiceNumber || (viewingInvoice._id || viewingInvoice.id)?.substring(0,8)}</span>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mt-2" dir="ltr">
                  <Calendar size={14} />
                  {new Date(viewingInvoice.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 block mb-1">{t('sales.invoices.table.status')}</span>
                {viewingInvoice.type === 'SCRAP' || viewingInvoice.status === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold">
                    <CheckCircle2 size={16} />
                    {t('sales.invoices.status.completed')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
                    <XCircle size={16} />
                    {t('sales.invoices.status.cancelled')}
                  </span>
                )}
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 block mb-2">{t('sales.invoices.table.customer')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal">{viewingInvoice.customer && typeof viewingInvoice.customer === 'object' ? viewingInvoice.customer.fullName : '---'}</span>
                    <span className="block text-xs text-gray-500" dir="ltr">{viewingInvoice.customer && typeof viewingInvoice.customer === 'object' ? viewingInvoice.customer.phoneNumber : ''}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 block mb-2">{viewingInvoice.type === 'SCRAP' ? 'مسؤول الاستلام' : t('sales.invoices.table.seller')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal">{(viewingInvoice.seller || viewingInvoice.actionBy) && typeof (viewingInvoice.seller || viewingInvoice.actionBy) === 'object' ? (viewingInvoice.seller || viewingInvoice.actionBy).fullName : '---'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
                <Tag size={16} className="text-gold" />
                {t('sales.invoices.itemsIncluded')}
              </h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100 flex justify-between text-xs font-bold text-gray-500">
                  <span>{t('sales.table.item')}</span>
                  <div className="flex gap-8">
                    {viewingInvoice.type === 'SCRAP' ? (
                      <>
                        <span className="w-16 text-center">العيار</span>
                        <span className="w-16 text-center">الوزن</span>
                      </>
                    ) : (
                      <>
                        <span>{t('sales.table.grossWeight')}</span>
                        <span>{t('sales.table.netWeight')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto">
                  {viewingInvoice.type === 'SCRAP' ? (
                    <div className="px-4 py-3 flex justify-between items-center hover:bg-gold/[0.02] transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-charcoal">{viewingInvoice.category && typeof viewingInvoice.category === 'object' ? viewingInvoice.category.name : viewingInvoice.category}</span>
                        <span className="text-xs text-gray-400" dir="ltr">{viewingInvoice.count} قطع</span>
                      </div>
                      <div className="flex gap-8 text-sm font-semibold">
                        <span className="w-16 text-center text-charcoal" dir="ltr">{viewingInvoice.karat}K</span>
                        <span className="w-16 text-center text-gold" dir="ltr">{viewingInvoice.weight?.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    viewingInvoice.items?.map((item: any, idx: number) => (
                      <div key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-gold/[0.02] transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-charcoal">{item.inventoryItem && typeof item.inventoryItem === 'object' ? item.inventoryItem.title : '---'}</span>
                          <span className="text-xs text-gray-400" dir="ltr">{item.inventoryItem && (typeof item.inventoryItem === 'object' ? (item.inventoryItem._id || item.inventoryItem.id) : '')?.substring(0,8)}</span>
                        </div>
                        <div className="flex gap-8 text-sm font-semibold">
                          <span className="w-16 text-center text-charcoal" dir="ltr">{item.soldGrossWeight?.toFixed(2)}</span>
                          <span className="w-16 text-center text-gold" dir="ltr">{item.soldNetWeight?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gold/5 p-6 rounded-xl border border-gold/20 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-gold/80 mb-1">{t('sales.invoices.table.weight')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gold" dir="ltr">{(viewingInvoice.type === 'SCRAP' ? viewingInvoice.weight : viewingInvoice.totalGrossWeight)?.toFixed(2)}g</span>
                  {viewingInvoice.type !== 'SCRAP' && (
                    <span className="text-sm font-semibold text-gold/60" dir="ltr">({viewingInvoice.totalNetWeight?.toFixed(2)}g net)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-charcoal mb-1">{t('sales.invoice.totalPrice')}</span>
                <span className="text-3xl font-black text-charcoal" dir="ltr">
                  {viewingInvoice.totalPrice?.toLocaleString()} <span className="text-lg text-gray-400">{t('customers.currency')}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </ModalOverlay>
    </>
  );
};

/* ──────────────────────────────────────────────
   CONFIRM ARCHIVE MODAL
   ────────────────────────────────────────────── */
const ConfirmArchiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, customer, onConfirm }) => {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!customer) return;
    setDeleting(true);
    try {
      await onConfirm(customer._id || customer.id || '');
      onClose();
    } catch {
      // Error handled by hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title={t('customers.confirmArchive.title')}>
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-5">
          <Archive size={28} />
        </div>
        <p className="text-charcoal font-medium text-lg mb-2">
          {t('customers.confirmArchive.message')}
        </p>
        <p className="text-gray-400 font-medium bg-gray-50 py-2 px-4 rounded-lg inline-block mt-2">
          {customer?.fullName}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {deleting ? <Loader2 size={18} className="animate-spin" /> : <Archive size={18} />}
          {deleting ? t('customers.archiving') : t('customers.confirmArchive.confirm')}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          {t('customers.cancel')}
        </button>
      </div>
    </ModalOverlay>
  );
};

/* ──────────────────────────────────────────────
   MAIN CUSTOMERS PAGE
   ────────────────────────────────────────────── */
export const CustomersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const isRtl = i18n.language.startsWith('ar');

  const {
    customers,
    isLoading,
    error,
    filters,
    setFilters,
    createCustomer,
    updateCustomer,
    softDeleteCustomer,
  } = useCustomers({ status: 'ACTIVE', search: '' });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [archivingCustomer, setArchivingCustomer] = useState<Customer | null>(null);
  const [statementCustomerId, setStatementCustomerId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev: any) => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);

  const handleStatusChange = (status: 'ACTIVE' | 'ARCHIVED') => {
    setFilters({ ...filters, status });
    setCurrentPage(1);
  };

  const isArchiveView = filters.status === 'ARCHIVED';

  // Derived state for pagination
  const totalPages = Math.max(1, Math.ceil(customers.length / ITEMS_PER_PAGE));
  const currentCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [customers, currentPage]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-customers/10 text-theme-customers">
              <Users size={24} />
            </div>
            {t('customers.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('customers.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-theme-customers hover:bg-theme-customers/90 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          {t('customers.addCustomer')}
        </button>
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ─── Filter & Table Container ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
          
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-gray-100/80 rounded-lg">
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  !isArchiveView ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                {t('customers.tabs.active')}
              </button>
              <button
                onClick={() => handleStatusChange('ARCHIVED')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  isArchiveView ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                {t('customers.tabs.archived')}
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('customers.searchPlaceholder')}
              className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
              }`}
            />
            <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-gold" />
              <span className="font-medium text-sm">{t('customers.loading')}</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Users size={28} />
              </div>
              <p className="font-medium">{t('customers.empty')}</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('customers.table.fullName')}</th>
                  <th className="px-6 py-4 font-semibold">{t('customers.table.phoneNumber')}</th>
                  <th className="px-6 py-4 font-semibold">{t('customers.table.nationalId')}</th>
                  <th className="px-6 py-4 font-semibold">{t('customers.table.address')}</th>
                  <th className="px-6 py-4 font-semibold">{t('customers.table.registeredAt')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('customers.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentCustomers.map((customer, index) => (
                  <tr key={customer._id || customer.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                        <User size={14} />
                        <span className="font-bold text-sm">{customer.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-bold text-sm" dir="ltr">
                        {customer.phoneNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 font-bold text-sm" dir="ltr">
                        {customer.nationalId || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate" title={customer.address}>
                      {customer.address || '---'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold" dir="ltr">
                        <Calendar size={14} />
                        {new Date(customer.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setStatementCustomerId(customer._id || customer.id || '')}
                          className="px-4 py-2 text-theme-customers hover:text-white border border-theme-customers hover:bg-theme-customers rounded-lg transition-colors font-bold text-sm flex items-center gap-1.5"
                          title={t('customers.actions.statement')}
                        >
                          <FileText size={14} />
                          {t('customers.actions.statement')}
                        </button>
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="p-1.5 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                          title={t('customers.actions.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        {isOwner && !isArchiveView && (
                          <button
                            onClick={() => setArchivingCustomer(customer)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('customers.actions.archive')}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        {isOwner && isArchiveView && (
                          <button
                            onClick={async () => {
                              try {
                                await updateCustomer(customer._id || customer.id || '', { status: 'ACTIVE' });
                              } catch(e) {}
                            }}
                            className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={t('customers.actions.restore')}
                          >
                            <RefreshCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {customers.length > 0 && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              {t('customers.pagination.showing')} <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> {t('customers.pagination.to')} <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, customers.length)}</span> {t('customers.pagination.of')} <span className="font-bold text-charcoal">{customers.length}</span> {t('customers.pagination.entries')}
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
                  // Show max 5 pages logic:
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
                          ? 'bg-theme-customers text-white shadow-sm'
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

      {/* ─── Modals & Drawers ─── */}
      <CustomerFormModal
        isOpen={showCreateModal || !!editingCustomer}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCustomer(null);
        }}
        onSubmit={editingCustomer ? (data) => updateCustomer(editingCustomer._id || editingCustomer.id || '', data) : createCustomer}
        initialData={editingCustomer || undefined}
      />

      <CustomerStatementDrawer
        isOpen={!!statementCustomerId}
        onClose={() => setStatementCustomerId(null)}
        customerId={statementCustomerId}
        isRtl={isRtl}
      />

      <ConfirmArchiveModal
        isOpen={!!archivingCustomer}
        onClose={() => setArchivingCustomer(null)}
        customer={archivingCustomer}
        onConfirm={softDeleteCustomer}
      />
    </div>
  );
};
