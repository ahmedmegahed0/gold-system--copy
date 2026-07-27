import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Search, 
  Loader2, 
  AlertCircle, 
  Calendar,
  User,
  Edit2,
  Save,
  X,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { ScrapInvoiceService } from '../../services/scrap-invoice.service';
import type { ScrapInvoice } from '../../common/types/scrap-invoice.types';

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
   EDIT SCRAP INVOICE MODAL
   ────────────────────────────────────────────── */
const EditScrapInvoiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoice: ScrapInvoice | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { categories } = useCategories();
  const activeCategories = categories.filter((c) => !c.isArchived && c.status !== 'ARCHIVED');

  const [formData, setFormData] = useState<{
    karat: 18 | 21;
    category: string;
    count: number;
    weight: number;
    goldPriceToday: number;
    makingChargesPerGram: number;
  }>({
    karat: 21,
    category: '',
    count: 0,
    weight: 0,
    goldPriceToday: 0,
    makingChargesPerGram: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (invoice) {
      setFormData({
        karat: invoice.karat,
        category: (invoice.category && typeof invoice.category === 'object') ? (invoice.category._id || invoice.category.id || '') : (typeof invoice.category === 'string' ? invoice.category : ''),
        count: invoice.count,
        weight: invoice.weight,
        goldPriceToday: invoice.goldPriceToday || 0,
        makingChargesPerGram: 0,
      });
      setError('');
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        count: Number(formData.count) || 0,
        weight: Number(formData.weight) || 0,
        goldPriceToday: Number(formData.goldPriceToday) || 0,
        makingChargesPerGram: 0,
      };
      await ScrapInvoiceService.updateScrapInvoice(invoice._id || invoice.id || '', payload as any);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} title="تعديل فاتورة الكسر">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">التصنيف</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal font-bold"
            >
              <option value="" disabled>اختر التصنيف</option>
              {activeCategories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">العيار</label>
            <select
              value={formData.karat}
              onChange={(e) => setFormData({ ...formData, karat: Number(e.target.value) as 18 | 21 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal font-bold"
            >
              <option value={21}>21K</option>
              <option value={18}>18K</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">العدد</label>
            <input
              type="number"
              min="0"
              value={formData.count ?? ''}
              onChange={(e) => setFormData({ ...formData, count: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">الوزن</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight ?? ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal font-bold pr-8"
              />
              <span className="absolute left-3 top-3.5 text-gray-400 text-sm">g</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-charcoal mb-2">سعر جرام الكسر اليوم</label>
          <input
            type="number"
            min="0"
            value={formData.goldPriceToday ?? ''}
            onChange={(e) => setFormData({ ...formData, goldPriceToday: e.target.value as any })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white text-charcoal font-bold text-center"
            dir="ltr"
          />
        </div>

        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold text-center border border-blue-100">
          سيتم إعادة حساب السعر الكلي آلياً عند حفظ التعديلات
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
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

export const ScrapInvoicesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<ScrapInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingInvoice, setEditingInvoice] = useState<ScrapInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<ScrapInvoice | null>(null);
  const [cancelingInvoice, setCancelingInvoice] = useState<ScrapInvoice | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ScrapInvoiceService.getScrapInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب فواتير الكسر');
    } finally {
      setLoading(false);
    }
  };

  // Allowed for both OWNER and EMPLOYEE

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCancelInvoice = async () => {
    if (!cancelingInvoice) return;
    setIsCanceling(true);
    try {
      await ScrapInvoiceService.cancelScrapInvoice(cancelingInvoice._id || cancelingInvoice.id || '');
      setCancelingInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إلغاء الفاتورة');
    } finally {
      setIsCanceling(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const customerName = (inv.customer && typeof inv.customer === 'object') ? inv.customer.fullName : inv.customer;
    return (
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(term)) ||
      (customerName && typeof customerName === 'string' && customerName.toLowerCase().includes(term)) ||
      (inv._id && inv._id.toLowerCase().includes(term)) ||
      (inv.id && inv.id.toLowerCase().includes(term))
    );
  });

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-scrap/10 text-theme-scrap">
              <FileText size={24} />
            </div>
            سجل فواتير الكسر
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            مراجعة كافة عمليات الشراء وإيصالات ذهب الكسر المسجلة بالخزنة.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter & Table Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم الفاتورة أو العميل..."
              className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
              }`}
            />
            <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-gold" />
              <span className="font-medium text-sm">جاري تحميل الفواتير...</span>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FileText size={28} />
              </div>
              <p className="font-medium">لا توجد فواتير مطابقة لبحثك.</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">رقم الفاتورة</th>
                  <th className="px-6 py-4 font-semibold">تاريخ البيع</th>
                  <th className="px-6 py-4 font-semibold">العميل المشتري</th>
                  <th className="px-6 py-4 font-semibold">التصنيف</th>
                  <th className="px-6 py-4 font-semibold text-center">العيار</th>
                  <th className="px-6 py-4 font-semibold text-center">العدد</th>
                  <th className="px-6 py-4 font-semibold text-center">الوزن الصافي الكلي (ج)</th>
                  <th className="px-6 py-4 font-semibold">المبلغ المستلم</th>
                  <th className="px-6 py-4 font-semibold">المسؤول</th>
                  <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentInvoices.map((inv, index) => {
                  const isCancelled = inv.status === 'CANCELLED';
                  return (
                  <tr key={inv._id || inv.id} className={`${isCancelled ? 'bg-red-50/50 opacity-75' : index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-black px-3 py-1.5 rounded text-base whitespace-nowrap inline-block w-fit ${isCancelled ? 'bg-red-100 text-red-700 line-through' : 'bg-gray-50 text-charcoal'}`} dir="ltr">
                          #{inv.invoiceNumber || (inv._id || inv.id)?.substring(0,8).toUpperCase()}
                        </span>
                        {isCancelled && <span className="text-xs font-bold text-red-500">ملغاة</span>}
                      </div>
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
                      <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100/50 font-bold text-sm">
                        {(inv.category && typeof inv.category === 'object') ? inv.category.name : (typeof inv.category === 'string' ? inv.category : '---')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm font-black border border-gray-200" dir="ltr">
                        {inv.karat}K
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-sm border border-slate-200">
                        {inv.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-bold text-sm" dir="ltr">
                        {inv.weight?.toFixed(2)}g
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/50 font-black text-sm" dir="ltr">
                        {inv.totalPrice?.toLocaleString()} ج.م
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/50 font-bold text-sm">
                        {(inv.actionBy && typeof inv.actionBy === 'object') ? inv.actionBy.fullName : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="px-3 py-1.5 text-gold hover:text-white border border-gold hover:bg-gold rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5"
                          title="عرض الفاتورة"
                        >
                          <Eye size={14} />
                          عرض
                        </button>
                        {inv.status !== 'CANCELLED' && (user?.role === 'OWNER' || (inv.actionBy && typeof inv.actionBy === 'object' ? (inv.actionBy._id === user?.id || inv.actionBy.id === user?.id) : inv.actionBy === user?.id)) && (
                          <>
                            <button
                              onClick={() => setEditingInvoice(inv)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="تعديل الفاتورة"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setCancelingInvoice(inv)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="إلغاء الفاتورة بالكامل وإرجاع البضاعة"
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredInvoices.length > 0 && !loading && (
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

      {/* View Invoice Modal */}
      <ModalOverlay 
        isOpen={!!viewingInvoice} 
        onClose={() => setViewingInvoice(null)} 
        title="عرض الفاتورة"
      >
        {viewingInvoice && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-gold" dir="ltr">#{viewingInvoice.invoiceNumber || (viewingInvoice._id || viewingInvoice.id)?.substring(0,8)}</h3>
                  {viewingInvoice.status === 'CANCELLED' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <Ban size={12} />
                      ملغاة
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-2" dir="ltr">
                  <Calendar size={14} />
                  {new Date(viewingInvoice.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                  {' - '}
                  {new Date(viewingInvoice.createdAt).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-bold text-gray-400 block mb-2">العميل المشتري</span>
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
                <span className="text-xs font-bold text-gray-400 block mb-2">المسئول</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="block font-bold text-charcoal">{(viewingInvoice.actionBy && typeof viewingInvoice.actionBy === 'object') ? viewingInvoice.actionBy.fullName : '---'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h4 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
                <FileText size={16} className="text-gold" />
                تفاصيل الكسر
              </h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100 flex justify-between text-xs font-bold text-gray-500">
                  <span>التصنيف</span>
                  <div className="flex gap-8">
                    <span>العيار</span>
                    <span>العدد</span>
                    <span>الوزن الصافي الكلي (ج)</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-charcoal">
                      {(viewingInvoice.category && typeof viewingInvoice.category === 'object') ? viewingInvoice.category.name : (typeof viewingInvoice.category === 'string' ? viewingInvoice.category : '---')}
                    </span>
                    <div className="flex gap-8 text-sm font-semibold">
                      <span className="w-16 text-center text-charcoal" dir="ltr">{viewingInvoice.karat}K</span>
                      <span className="w-16 text-center text-charcoal">{viewingInvoice.count}</span>
                      <span className="w-16 text-center text-gold" dir="ltr">{viewingInvoice.weight?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <span className="text-sm font-bold text-gray-500 block mb-1">سعر جرام الكسر اليوم</span>
              <span className="text-lg font-black text-charcoal" dir="ltr">{viewingInvoice.goldPriceToday?.toLocaleString() || '---'}</span>
            </div>

            {/* Totals */}
            <div className="bg-gold/5 p-6 rounded-xl border border-gold/20 flex items-center justify-between">
              <div>
                <span className="block text-sm font-bold text-gold/80 mb-1">الوزن الصافي الكلي</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gold" dir="ltr">{viewingInvoice.weight?.toFixed(2)}g</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-charcoal mb-1">المبلغ المستلم</span>
                <span className="text-3xl font-black text-charcoal" dir="ltr">
                  {viewingInvoice.totalPrice?.toLocaleString()} <span className="text-lg text-gray-400">ج.م</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-white border border-gray-200 text-charcoal hover:bg-gray-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Printer size={18} />
                طباعة الإيصال
              </button>
              {viewingInvoice.status !== 'CANCELLED' && (user?.role === 'OWNER' || (viewingInvoice.actionBy && typeof viewingInvoice.actionBy === 'object' ? (viewingInvoice.actionBy._id === user?.id || viewingInvoice.actionBy.id === user?.id) : viewingInvoice.actionBy === user?.id)) && (
                <>
                  <button
                    onClick={() => {
                      setViewingInvoice(null);
                      setEditingInvoice(viewingInvoice);
                    }}
                    className="px-6 py-3 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit2 size={18} />
                    تعديل الفاتورة
                  </button>
                  <button
                    onClick={() => {
                      setViewingInvoice(null);
                      setCancelingInvoice(viewingInvoice);
                    }}
                    className="px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Ban size={18} />
                    إلغاء الفاتورة
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </ModalOverlay>

      <EditScrapInvoiceModal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        invoice={editingInvoice}
        onSuccess={fetchInvoices}
      />

      {/* Cancel Confirmation Modal */}
      <ModalOverlay
        isOpen={!!cancelingInvoice}
        onClose={() => setCancelingInvoice(null)}
        title="تأكيد إلغاء الفاتورة واسترجاع البضاعة"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-100 text-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Ban size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-black text-red-700">تحذير! إجراء لا رجعة فيه</h3>
            <p className="text-sm font-medium text-red-600">
              سيتم إلغاء فاتورة الكسر بالكامل، وتصفير إجمالي المبلغ، وسيتم إرجاع الذهب المباع (الوزن والعدد) إلى سجل الكسر في الخزنة بشكل فوري للتوازن المالي.
            </p>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleCancelInvoice}
              disabled={isCanceling}
              className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCanceling ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
              تأكيد الإلغاء والمرتجع الكلي
            </button>
            <button
              onClick={() => setCancelingInvoice(null)}
              disabled={isCanceling}
              className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              تراجع
            </button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
};
