import React, { useState, useEffect, useMemo } from 'react';
import { PaperInvoiceLayout } from '../../components/print/PaperInvoiceLayout';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  Eye,
  X,
  User,
  Printer,
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react';

import { SilverService } from '../../services/silver.service';
import type { SilverSale } from '../../common/types/silver.types';

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

export const SilverSalesInvoicesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  
  const [invoices, setInvoices] = useState<SilverSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<SilverSale | null>(null);

  // Cancellation State
  const [cancelingInvoice, setCancelingInvoice] = useState<SilverSale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SilverService.getSalesInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب فواتير مبيعات الفضة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const term = searchTerm.toLowerCase();
    return invoices.filter((inv) =>
      (inv._id && inv._id.toLowerCase().includes(term)) ||
      (inv.id && inv.id.toLowerCase().includes(term)) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(term)) ||
      (inv.customerPhone && inv.customerPhone.toLowerCase().includes(term))
    );
  }, [invoices, searchTerm]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  const handleCancelInvoice = async () => {
    if (!cancelingInvoice || !cancelReason.trim()) return;
    
    setIsCanceling(true);
    try {
      const invoiceId = cancelingInvoice._id || cancelingInvoice.id || '';
      await SilverService.cancelSaleInvoice(invoiceId, { reason: cancelReason });
      setCancelingInvoice(null);
      setCancelReason('');
      fetchInvoices();
      alert('تم إلغاء الفاتورة بنجاح!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ أثناء إلغاء الفاتورة');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className={viewingInvoice ? 'print:hidden' : ''}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-theme-sales/10 text-theme-sales">
                <FileText size={24} />
              </div>
              فواتير بيع الفضة
            </h1>
            <p className="text-gray-400 text-sm mt-1 mr-14">
              مراجعة كافة فواتير بيع الفضة السريعة.
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
            <div className="flex gap-2 w-full">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="البحث باسم العميل أو رقم الهاتف..."
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
                    <th className="px-6 py-4 font-semibold">التاريخ</th>
                    <th className="px-6 py-4 font-semibold">العميل</th>
                    <th className="px-6 py-4 font-semibold">القطعة</th>
                    <th className="px-6 py-4 font-semibold">الوزن</th>
                    <th className="px-6 py-4 font-semibold">السعر الكلي</th>
                    <th className="px-6 py-4 font-semibold">المسؤول</th>
                    <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentInvoices.map((inv, index) => {
                    const itemName = (inv.silverItem && typeof inv.silverItem === 'object') ? (inv.silverItem as any).title : '---';
                    return (
                    <tr key={inv._id || inv.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors group border-b border-gray-100 last:border-0`}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingInvoice(inv)}
                          className="font-black text-charcoal bg-gray-50 px-3 py-1.5 rounded text-base whitespace-nowrap inline-block cursor-pointer hover:bg-gray-200 hover:text-gold transition-colors" 
                          dir="ltr"
                        >
                          #{(inv._id || inv.id)?.substring(0,8).toUpperCase()}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold" dir="ltr">
                          <Calendar size={14} />
                          {new Date(inv.createdAt || '').toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                          <User size={14} />
                          <span className="font-bold text-sm">{inv.customerName || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">
                        {itemName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-bold text-sm" dir="ltr">
                          {inv.weight?.toFixed(2)}g
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/50 font-black text-sm" dir="ltr">
                          {inv.totalPrice?.toLocaleString() || 0} ج.م
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/50 font-bold text-sm">
                          {(inv.soldBy && typeof inv.soldBy === 'object') ? (inv.soldBy as any).fullName : '---'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="px-3 py-1.5 text-gold hover:text-white border border-gold hover:bg-gold rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5"
                          >
                            <Eye size={14} />
                            عرض
                          </button>
                          {(inv as any).status !== 'CANCELED' && (
                            <button
                              onClick={() => setCancelingInvoice(inv)}
                              className="px-3 py-1.5 text-red-500 hover:text-white border border-red-500 hover:bg-red-500 rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5 mr-2"
                              title="إلغاء الفاتورة"
                            >
                              <Ban size={14} />
                            </button>
                          )}
                          {(inv as any).status === 'CANCELED' && (
                            <span className="px-3 py-1.5 text-red-700 bg-red-50 rounded-lg font-bold text-xs flex items-center gap-1.5 mr-2">
                              ملغاة
                            </span>
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
      </div>

      {/* Transcript Modal */}
      <ModalOverlay
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title="عرض فاتورة البيع"
        printFriendly={true}
      >
        {viewingInvoice && (() => {
          const customerName = viewingInvoice.customerName || '---';
          const invoiceNumber = viewingInvoice._id?.substring(0,8) || viewingInvoice.id?.substring(0,8) || '';
          const dateStr = new Date(viewingInvoice.createdAt || '').toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
          const sellerName = (viewingInvoice.soldBy && typeof viewingInvoice.soldBy === 'object') ? (viewingInvoice.soldBy as any).fullName : '---';
          const itemName = (viewingInvoice.silverItem && typeof viewingInvoice.silverItem === 'object') ? (viewingInvoice.silverItem as any).title : 'فضة';

          return (
            <div className="flex flex-col items-center justify-center p-6 print:p-0">
              
              <div className="flex justify-end items-center w-full max-w-3xl mb-6 print:hidden gap-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-charcoal text-white hover:bg-black font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Printer size={18} />
                  طباعة
                </button>
              </div>

              <PaperInvoiceLayout
                invoiceNumber={invoiceNumber.toUpperCase()}
                date={dateStr}
                customerName={customerName}
                sellerName={sellerName}
                totalAmount={viewingInvoice.totalPrice || 0}
                items={[{
                  name: itemName,
                  karat: viewingInvoice.karat || '---',
                  weight: viewingInvoice.weight || 0,
                  price: viewingInvoice.totalPrice || 0,
                }]}
              />
            </div>
          );
        })()}
      </ModalOverlay>
      {/* Cancel Invoice Modal */}
      <ModalOverlay
        isOpen={!!cancelingInvoice}
        onClose={() => {
          if (!isCanceling) {
            setCancelingInvoice(null);
            setCancelReason('');
          }
        }}
        title="إلغاء الفاتورة"
      >
        {cancelingInvoice && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold">تحذير هام!</h4>
                <p className="text-sm mt-1">
                  أنت على وشك إلغاء الفاتورة رقم <span className="font-bold font-mono">#{(cancelingInvoice._id || cancelingInvoice.id)?.substring(0,8).toUpperCase()}</span>.
                  <br/>
                  سيتم إرجاع القطعة إلى المخزون، وسيتم خصم قيمتها ({cancelingInvoice.totalPrice} ج.م) من خزنة الفضة.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                سبب الإلغاء / الارتجاع <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="مثال: طلب العميل الارتجاع، خطأ في الإدخال..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={handleCancelInvoice}
                disabled={isCanceling || !cancelReason.trim()}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCanceling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ban size={18} />}
                تأكيد الإلغاء
              </button>
              <button
                onClick={() => {
                  setCancelingInvoice(null);
                  setCancelReason('');
                }}
                disabled={isCanceling}
                className="px-6 py-3 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
};
