import React, { useState, useEffect } from 'react';
import { InvoicePrintHeader } from '../../components/print/InvoicePrintHeader';
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
  printFriendly?: boolean;
}> = ({ isOpen, onClose, title, children, printFriendly = false }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${printFriendly ? 'print:static print:inset-auto print:z-auto print:flex-none print:bg-white' : ''}`}>
      <div
        className={`absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity ${printFriendly ? 'print:hidden' : ''}`}
        onClick={onClose}
      />
      <div className={`relative w-full ${printFriendly ? 'max-w-4xl bg-gray-50/50' : 'max-w-2xl bg-white'} mx-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col ${printFriendly ? 'print:max-w-none print:w-full print:mx-0 print:border-none print:shadow-none print:rounded-none print:max-h-none print:block print:p-8 print:bg-white' : ''}`}>
        <div className={`flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0 bg-white rounded-t-2xl ${printFriendly ? 'print:hidden' : ''}`}>
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className={`p-8 overflow-y-auto ${printFriendly ? 'print:overflow-visible print:p-0' : ''}`}>{children}</div>
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
  const [formData, setFormData] = useState<{
    karat: 18 | 21;
    weight: number;
    goldPriceToday: number;
    makingChargesPerGram: number;
  }>({
    karat: 21,
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
  const [activeTab, setActiveTab] = useState<'COMPLETED' | 'CANCELLED'>('COMPLETED');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState('');
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
      const data = await ScrapInvoiceService.getScrapInvoices({
        status: activeTab,
        customerName: customerNameFilter || undefined,
        customerPhone: customerPhoneFilter || undefined
      });
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
  }, [activeTab, customerNameFilter, customerPhoneFilter]);

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
  }, [searchTerm, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  return (
    <div className="space-y-6 relative">
      <div className={viewingInvoice ? 'print:hidden' : ''}>
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
          <div className="flex p-1 bg-gray-100/80 rounded-lg">
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'COMPLETED' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              مكتملة
            </button>
            <button
              onClick={() => setActiveTab('CANCELLED')}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === 'CANCELLED' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              ملغاة
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
                placeholder="البحث باسم العميل"
                className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                  isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
                }`}
              />
              <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            </div>
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                value={customerPhoneFilter}
                onChange={(e) => setCustomerPhoneFilter(e.target.value)}
                placeholder="البحث برقم الهاتف"
                className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                  isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
                }`}
              />
              <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            </div>
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الفاتورة..."
                className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                  isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
                }`}
              />
              <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
            </div>
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
                  <th className="px-6 py-4 font-semibold text-center">العيار</th>
                  <th className="px-6 py-4 font-semibold text-center">الوزن الصافي الكلي (ج)</th>
                  <th className="px-6 py-4 font-semibold text-center">المصنعية</th>
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
                        <button 
                          onClick={() => setViewingInvoice(inv)}
                          className={`font-black px-3 py-1.5 rounded text-base whitespace-nowrap inline-block w-fit cursor-pointer hover:bg-gray-200 transition-colors ${isCancelled ? 'bg-red-100 text-red-700 line-through' : 'bg-gray-50 text-charcoal'}`} 
                          dir="ltr"
                        >
                          #{inv.invoiceNumber || (inv._id || inv.id)?.substring(0,8).toUpperCase()}
                        </button>
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
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-sm font-black border border-gray-200" dir="ltr">
                        {inv.karat}K
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-bold text-sm" dir="ltr">
                        {inv.weight?.toFixed(2)}g
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100/50 font-bold text-sm" dir="ltr">
                        0 ج.م
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
      </div>

      {/* View Invoice Modal */}
      <ModalOverlay 
        isOpen={!!viewingInvoice} 
        onClose={() => setViewingInvoice(null)} 
        title="عرض الفاتورة"
        printFriendly={true}
      >
        {viewingInvoice && (() => {
          const customerName = (viewingInvoice.customer && typeof viewingInvoice.customer === 'object') ? viewingInvoice.customer.fullName : '---';
          const invoiceNumber = viewingInvoice.invoiceNumber || viewingInvoice._id?.substring(0,8) || viewingInvoice.id?.substring(0,8);
          const dateStr = new Date(viewingInvoice.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
          const sellerName = (viewingInvoice.actionBy && typeof viewingInvoice.actionBy === 'object') ? viewingInvoice.actionBy.fullName : '---';

          return (
            <div className="flex flex-col items-center justify-center p-6 print:p-0">
              
              {/* Actions (Hidden on Print) */}
              <div className="flex justify-between items-center w-full max-w-3xl mb-6 print:hidden gap-4">
                <div className="flex gap-2">
                  {viewingInvoice.status !== 'CANCELLED' && (user?.role === 'OWNER' || (viewingInvoice.actionBy && typeof viewingInvoice.actionBy === 'object' ? (viewingInvoice.actionBy._id === user?.id || viewingInvoice.actionBy.id === user?.id) : viewingInvoice.actionBy === user?.id)) && (
                    <>
                      <button
                        onClick={() => {
                          setViewingInvoice(null);
                          setCancelingInvoice(viewingInvoice);
                        }}
                        className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Ban size={18} />
                        إلغاء الفاتورة
                      </button>
                      <button
                        onClick={() => {
                          setViewingInvoice(null);
                          setEditingInvoice(viewingInvoice);
                        }}
                        className="px-6 py-2.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Edit2 size={18} />
                        تعديل
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-charcoal text-white hover:bg-black font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Printer size={18} />
                  طباعة
                </button>
              </div>

              {/* The Printable A4 Sheet */}
              <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm]" dir="rtl">
                
                {/* Header */}
                <InvoicePrintHeader title={`فاتورة شراء ذهب كسر ${viewingInvoice.status === 'COMPLETED' ? '' : '(ملغاة)'}`} />

                {/* Customer Box */}
                <div className="border-2 border-blue-600 rounded-xl p-4 text-center mb-8 bg-blue-50/30">
                  <span className="text-2xl font-black text-blue-800">العميل: {customerName}</span>
                </div>

                {/* Invoice Info Details */}
                <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
                  <div className="space-y-3">
                    <div className="flex gap-2"><span className="text-gray-500 w-32">اسم الموظف المسؤول:</span> <span>{sellerName}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-32">طريقة الدفع:</span> <span>آجل / نقداً</span></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الفاتورة:</span> <span dir="ltr">#{invoiceNumber?.toUpperCase()}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">التاريخ والوقت:</span> <span>{dateStr}</span></div>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full mb-8 border-collapse border border-charcoal text-center text-sm font-bold">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-charcoal py-3 px-2 w-10">م</th>
                      <th className="border border-charcoal py-3 px-2">اسم الصنف</th>
                      <th className="border border-charcoal py-3 px-2 w-16">العيار</th>
                      <th className="border border-charcoal py-3 px-2 w-24">الصافي (ج)</th>
                      <th className="border border-charcoal py-3 px-2 w-28">سعر الجرام اليوم</th>
                      <th className="border border-charcoal py-3 px-2 w-32">السعر الكلي (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-charcoal py-3 px-2">1</td>
                      <td className="border border-charcoal py-3 px-2">ذهب كسر</td>
                      <td className="border border-charcoal py-3 px-2" dir="ltr">{viewingInvoice.karat}K</td>
                      <td className="border border-charcoal py-3 px-2">{viewingInvoice.weight?.toFixed(2)}</td>
                      <td className="border border-charcoal py-3 px-2" dir="ltr">{viewingInvoice.goldPriceToday?.toLocaleString()}</td>
                      <td className="border border-charcoal py-3 px-2" dir="ltr">{viewingInvoice.totalPrice?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end mt-8">
                  <div className="border-2 border-charcoal rounded-xl p-4 w-64 bg-gray-50">
                    <div className="flex justify-between items-center text-lg font-black">
                      <span>المبلغ المستلم:</span>
                      <span dir="ltr">{viewingInvoice.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}
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
