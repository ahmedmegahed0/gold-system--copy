import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  User,
  Tag,
  Save,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useSales } from '../../hooks/useSales';
import type { Invoice } from '../../common/types/sales.types';

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
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   EDIT INVOICE MODAL
   ────────────────────────────────────────────── */
const EditInvoiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (id: string, data: any) => Promise<void>;
}> = ({ isOpen, onClose, invoice, onSubmit }) => {
  const [items, setItems] = useState<{ 
    inventoryItem: string; 
    soldGrossWeight: number; 
    title: string;
    hasTag: boolean;
    tagWeight?: number;
    goldPriceToday: number;
    makingChargesPerGram: number;
  }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (invoice) {
      setItems(
        invoice.items.map((item) => ({
          inventoryItem: (item.inventoryItem && typeof item.inventoryItem === 'object') ? (item.inventoryItem._id || item.inventoryItem.id || '') : item.inventoryItem,
          soldGrossWeight: item.soldGrossWeight,
          title: (item.inventoryItem && typeof item.inventoryItem === 'object') ? item.inventoryItem.title : '---',
          hasTag: item.hasTag ?? true,
          tagWeight: item.hasTag ? parseFloat((item.soldGrossWeight - item.soldNetWeight).toFixed(3)) : undefined,
          goldPriceToday: item.goldPriceToday || 0,
          makingChargesPerGram: item.makingChargesPerGram || 0,
        }))
      );
      setError('');
    }
  }, [invoice]);

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit(invoice._id || invoice.id || '', {
        items: items.map((i) => ({ 
          inventoryItem: i.inventoryItem, 
          soldGrossWeight: i.soldGrossWeight,
          hasTag: i.hasTag,
          tagWeight: i.tagWeight,
          goldPriceToday: i.goldPriceToday,
          makingChargesPerGram: i.makingChargesPerGram
        })),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="تعديل الفاتورة">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-charcoal mb-3">تعديل الأصناف (سيتم إعادة حساب السعر آلياً)</label>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-charcoal">{item.title}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-600">
                      <input 
                        type="checkbox"
                        checked={item.hasTag}
                        onChange={() => updateItemField(idx, 'hasTag', !item.hasTag)}
                        className="w-4 h-4 text-theme-sales rounded focus:ring-theme-sales"
                      />
                      يوجد تيكت؟
                    </label>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="إزالة القطعة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">الوزن المباشر</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.soldGrossWeight === 0 ? '' : item.soldGrossWeight}
                      onChange={(e) => updateItemField(idx, 'soldGrossWeight', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold font-bold text-center"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">سعر الجرام اليوم</label>
                    <input
                      type="number"
                      min="0"
                      value={item.goldPriceToday === 0 ? '' : item.goldPriceToday}
                      onChange={(e) => updateItemField(idx, 'goldPriceToday', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold font-bold text-center"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">مصنعية הגرام</label>
                    <input
                      type="number"
                      min="0"
                      value={item.makingChargesPerGram === 0 ? '' : item.makingChargesPerGram}
                      onChange={(e) => updateItemField(idx, 'makingChargesPerGram', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold font-bold text-center"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4 mt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gold hover:bg-[#b59540] text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            حفظ التعديلات
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};

export const InvoicesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  
  const { invoices, fetchInvoices, isLoading, error, updateInvoice, cancelInvoice } = useSales();
  
  const [activeTab, setActiveTab] = useState<'COMPLETED' | 'CANCELLED'>('COMPLETED');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [cancelConfirmInvoice, setCancelConfirmInvoice] = useState<Invoice | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchInvoices({ status: activeTab });
  }, [fetchInvoices, activeTab]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter((inv) =>
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv._id && inv._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inv.id && inv.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [invoices, searchTerm]);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-sales/10 text-theme-sales">
              <FileText size={24} />
            </div>
            {t('sales.invoices.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('sales.invoices.subtitle')}
          </p>
        </div>
      </div>

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
          <div className="flex p-1 bg-gray-100/80 rounded-lg">
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'COMPLETED' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              {t('sales.invoices.tabs.completed')}
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'CANCELLED' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              {t('sales.invoices.tabs.cancelled')}
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('sales.invoices.searchPlaceholder')}
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
              <span className="font-medium text-sm">{t('sales.invoices.loading')}</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FileText size={28} />
              </div>
              <p className="font-medium">{t('sales.invoices.empty')}</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.number')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.date')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.customer')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.seller')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.weight')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.price')}</th>
                  <th className="px-6 py-4 font-semibold">{t('sales.invoices.table.status')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('sales.invoices.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentInvoices.map((inv, index) => {
                  const computedGrossWeight = inv.totalGrossWeight || inv.items?.reduce((sum, item) => sum + (item.soldGrossWeight || 0), 0) || 0;
                  return (
                  <tr key={inv._id || inv.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                    <td className="px-6 py-4">
                      <span className="font-black text-charcoal bg-gray-50 px-3 py-1.5 rounded text-base whitespace-nowrap inline-block" dir="ltr">
                        #{inv.invoiceNumber || (inv._id || inv.id)?.substring(0,8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold" dir="ltr">
                        <Calendar size={14} />
                        {new Date(inv.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                        <User size={14} />
                        <span className="font-bold text-sm">{(inv.customer && typeof inv.customer === 'object') ? inv.customer.fullName : '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/50 font-bold text-sm">
                        {(inv.soldBy && typeof inv.soldBy === 'object') ? inv.soldBy.fullName : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-bold text-sm" dir="ltr">
                        {computedGrossWeight.toFixed(2)}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/50 font-black text-sm" dir="ltr">
                        {inv.totalPrice?.toLocaleString() || 0} {t('customers.currency')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-sm font-bold">
                          <CheckCircle2 size={14} />
                          {t('sales.invoices.status.completed')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-returns/10 text-theme-returns rounded-md text-sm font-bold">
                          <XCircle size={14} />
                          {t('sales.invoices.status.cancelled')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="px-3 py-1.5 text-gold hover:text-white border border-gold hover:bg-gold rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5"
                        >
                          <Eye size={14} />
                          {t('sales.invoices.actions.view')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredInvoices.length > 0 && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              عرض <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}</span> من <span className="font-bold text-charcoal">{filteredInvoices.length}</span> فواتير
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
                          ? 'bg-theme-sales text-white shadow-sm'
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

      {/* ─── Transcript Modal ─── */}
      <ModalOverlay
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={t('sales.invoices.transcriptTitle')}
      >
        {viewingInvoice && (
          <div className="space-y-6">
            {/* Header Details */}
            <div className="flex justify-between items-start pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">{t('sales.invoices.table.number')}</span>
                <span className="text-2xl font-black text-charcoal" dir="ltr">#{viewingInvoice.invoiceNumber || (viewingInvoice._id || viewingInvoice.id)?.substring(0,8)}</span>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mt-2" dir="ltr">
                  <Calendar size={14} />
                  {new Date(viewingInvoice.createdAt).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-400 block mb-1">{t('sales.invoices.table.status')}</span>
                {viewingInvoice.status === 'COMPLETED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-base font-bold">
                    <CheckCircle2 size={18} />
                    {t('sales.invoices.status.completed')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-theme-returns/10 text-theme-returns rounded-lg text-base font-bold">
                    <XCircle size={18} />
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
                    <span className="block font-bold text-charcoal">{(viewingInvoice.customer && typeof viewingInvoice.customer === 'object') ? viewingInvoice.customer.fullName : '---'}</span>
                    <span className="block text-xs text-gray-500" dir="ltr">{(viewingInvoice.customer && typeof viewingInvoice.customer === 'object') ? viewingInvoice.customer.phoneNumber : ''}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 block mb-2">{t('sales.invoices.table.seller')}</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal">{(viewingInvoice.soldBy && typeof viewingInvoice.soldBy === 'object') ? viewingInvoice.soldBy.fullName : '---'}</span>
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
              <div className="border border-gray-100 rounded-xl overflow-hidden mt-4">
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex justify-between text-xs font-bold text-gray-500">
                  <span className="w-1/3">{t('sales.table.item')}</span>
                  <div className="flex gap-4 w-2/3 justify-end text-center">
                    <span className="w-16">المباشر</span>
                    <span className="w-16">الصافي</span>
                    <span className="w-20">سعر/ج</span>
                    <span className="w-20">إجمالي</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                  {viewingInvoice.items?.map((item: any, idx: number) => (
                    <div key={idx} className="px-4 py-3 flex justify-between items-center hover:bg-gold/[0.02] transition-colors">
                      <div className="flex flex-col w-1/3">
                        <span className="text-sm font-bold text-charcoal">{(item.inventoryItem && typeof item.inventoryItem === 'object') ? item.inventoryItem.title : '---'}</span>
                        <span className="text-xs text-gray-400 flex gap-2" dir="ltr">
                          <span>{((item.inventoryItem && typeof item.inventoryItem === 'object') ? (item.inventoryItem._id || item.inventoryItem.id) : '')?.substring(0,8)}</span>
                          {item.hasTag === false && <span className="bg-red-50 text-red-600 px-1 rounded text-[10px]">بدون تيكت</span>}
                        </span>
                      </div>
                      <div className="flex gap-4 w-2/3 justify-end text-sm font-semibold">
                        <span className="w-16 text-center text-charcoal" dir="ltr">{item.soldGrossWeight?.toFixed(2)}</span>
                        <span className="w-16 text-center text-gold" dir="ltr">{item.soldNetWeight?.toFixed(2)}</span>
                        <span className="w-20 text-center text-charcoal" dir="ltr">{item.goldPriceToday?.toLocaleString()}</span>
                        <span className="w-20 text-center font-black text-gold" dir="ltr">{item.itemTotalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gold/5 p-6 rounded-xl border border-gold/20 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-gold/80 mb-1">{t('sales.invoices.table.weight')}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gold" dir="ltr">{(viewingInvoice.totalGrossWeight || viewingInvoice.items?.reduce((sum: number, item: any) => sum + (item.soldGrossWeight || 0), 0) || 0).toFixed(2)}g</span>
                  <span className="text-base font-semibold text-gold/60" dir="ltr">({(viewingInvoice.totalNetWeight || viewingInvoice.items?.reduce((sum: number, item: any) => sum + Math.max(0, (item.soldGrossWeight || 0) - 0.06), 0) || 0).toFixed(2)}g net)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-charcoal mb-1">{t('sales.invoice.totalPrice')}</span>
                <span className="text-4xl font-black text-charcoal" dir="ltr">
                  {viewingInvoice.totalPrice?.toLocaleString()} <span className="text-xl text-gray-400">{t('customers.currency')}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            {viewingInvoice.status === 'COMPLETED' && (user?.role === 'OWNER' || (viewingInvoice.soldBy && typeof viewingInvoice.soldBy === 'object' ? (viewingInvoice.soldBy._id === user?.id || (viewingInvoice.soldBy as any).id === user?.id) : viewingInvoice.soldBy === user?.id)) && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setCancelConfirmInvoice(viewingInvoice);
                  }}
                  className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <XCircle size={18} />
                  إلغاء واسترجاع الفاتورة
                </button>

                <button
                  onClick={() => {
                    setViewingInvoice(null);
                    setEditingInvoice(viewingInvoice);
                  }}
                  className="px-6 py-3 bg-white border border-gray-200 text-charcoal hover:bg-gray-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Edit2 size={18} />
                  {t('sales.invoices.actions.edit')}
                </button>
              </div>
            )}
          </div>
        )}
      </ModalOverlay>

      {/* ─── Edit Invoice Modal ─── */}
      <EditInvoiceModal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        invoice={editingInvoice}
        onSubmit={async (id, data) => {
          await updateInvoice(id, data);
          fetchInvoices({ status: activeTab }); // Refresh fully
        }}
      />

      {/* ─── Cancel Confirmation Modal ─── */}
      <ModalOverlay
        isOpen={!!cancelConfirmInvoice}
        onClose={() => setCancelConfirmInvoice(null)}
        title="تأكيد إلغاء الفاتورة"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertCircle size={24} className="shrink-0" />
            <p className="font-bold text-sm leading-relaxed">
              هل أنت متأكد من إلغاء هذه الفاتورة بالكامل؟ سيتم استرجاع كافة القطع للمخزن وتصفير الدخل المالي المتعلق بها. هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={async () => {
                if (!cancelConfirmInvoice) return;
                try {
                  await cancelInvoice(cancelConfirmInvoice._id || cancelConfirmInvoice.id || '');
                  setCancelConfirmInvoice(null);
                  setViewingInvoice(null);
                  fetchInvoices({ status: activeTab });
                } catch (e) {
                  // Error is handled in the hook
                }
              }}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              نعم، إلغاء الفاتورة
            </button>
            <button
              onClick={() => setCancelConfirmInvoice(null)}
              className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              تراجع
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
};
