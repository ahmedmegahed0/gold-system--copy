import React, { useState, useEffect, useMemo } from 'react';
import { InvoicePrintHeader } from '../../components/print/InvoicePrintHeader';
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
  Printer,
  ChevronLeft,
  ChevronRight,
  Barcode
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useBarcodeSales } from '../../hooks/useBarcodeSales';
import type { BarcodeInvoice } from '../../common/types/barcode.types';

const ModalOverlay: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; printFriendly?: boolean }> = ({ isOpen, onClose, title, children, printFriendly = false }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${printFriendly ? 'print:static print:inset-auto print:z-auto print:flex-none print:bg-white' : ''}`}>
      <div className={`absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity ${printFriendly ? 'print:hidden' : ''}`} onClick={onClose} />
      <div className={`relative w-full ${printFriendly ? 'max-w-4xl bg-gray-50/50' : 'max-w-2xl bg-white'} mx-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col ${printFriendly ? 'print:max-w-none print:w-full print:mx-0 print:border-none print:shadow-none print:rounded-none print:max-h-none print:block print:p-8 print:bg-white' : ''}`}>
        <div className={`flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0 bg-white rounded-t-2xl ${printFriendly ? 'print:hidden' : ''}`}>
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors"><X size={20} /></button>
        </div>
        <div className={`p-8 overflow-y-auto ${printFriendly ? 'print:overflow-visible print:p-0' : ''}`}>{children}</div>
      </div>
    </div>
  );
};

export const BarcodeInvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { invoices, fetchInvoices, isLoading, error, cancelInvoice } = useBarcodeSales();
  
  const [activeTab, setActiveTab] = useState<boolean>(false); // false = COMPLETED (not cancelled), true = CANCELLED
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<BarcodeInvoice | null>(null);
  const [cancelConfirmInvoice, setCancelConfirmInvoice] = useState<BarcodeInvoice | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    let list = invoices.filter(inv => inv.isCancelled === activeTab);
    if (searchTerm) {
      list = list.filter((inv) => inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  }, [invoices, searchTerm, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  return (
    <div className="space-y-6 relative">
      <div className={viewingInvoice ? 'print:hidden' : ''}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700"><FileText size={24} /></div>
              فواتير باركود المبيعات
            </h1>
            <p className="text-gray-400 text-sm mt-1 mr-14">إدارة فواتير بيع الذهب بالباركود وعرض تفاصيلها</p>
          </div>
        </div>

        {error && <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100"><AlertCircle size={18} /><span className="text-sm font-medium">{error}</span></div>}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
            <div className="flex p-1 bg-gray-100/80 rounded-lg">
              <button onClick={() => setActiveTab(false)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${!activeTab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}>فواتير مكتملة</button>
              <button onClick={() => setActiveTab(true)} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}>فواتير ملغاة</button>
            </div>
            <div className="relative w-full sm:w-64">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث برقم الفاتورة..." className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all pr-4 pl-10`} />
              <Search size={16} className={`absolute top-2.5 text-gray-400 left-3`} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400"><Loader2 size={32} className="animate-spin text-indigo-500" /><span className="font-medium text-sm">جاري التحميل...</span></div>
            ) : filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400"><div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4"><FileText size={28} /></div><p className="font-medium">لا توجد فواتير مطابقة</p></div>
            ) : (
              <table className={`w-full text-base text-right`}>
                <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">رقم الفاتورة</th>
                    <th className="px-6 py-4 font-semibold">التاريخ</th>
                    <th className="px-6 py-4 font-semibold">العميل</th>
                    <th className="px-6 py-4 font-semibold">إجمالي الذهب</th>
                    <th className="px-6 py-4 font-semibold">السعر الكلي</th>
                    <th className="px-6 py-4 font-semibold">الحالة</th>
                    <th className="px-6 py-4 font-semibold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentInvoices.map((inv, index) => (
                    <tr key={inv._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-indigo-50/50 transition-colors group border-b border-gray-100 last:border-0`}>
                      <td className="px-6 py-4"><button onClick={() => setViewingInvoice(inv)} className="font-black text-charcoal bg-gray-50 px-3 py-1.5 rounded text-base cursor-pointer hover:bg-gray-200 hover:text-indigo-600 transition-colors" dir="ltr">#{inv.invoiceNumber}</button></td>
                      <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-gray-500 text-sm font-semibold" dir="ltr"><Calendar size={14} />{new Date(inv.createdAt).toLocaleDateString('ar-EG')}</div></td>
                      <td className="px-6 py-4"><div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/50"><User size={14} /><span className="font-bold text-sm">{(inv.customer as any)?.fullName || 'عميل نقدي'}</span></div></td>
                      <td className="px-6 py-4"><span className="inline-block bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100/50 font-bold text-sm" dir="ltr">{inv.totalNetWeight?.toFixed(2) || 0}g</span></td>
                      <td className="px-6 py-4"><span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100/50 font-black text-sm" dir="ltr">{inv.finalPaidAmount?.toLocaleString()} ج.م</span></td>
                      <td className="px-6 py-4">{!inv.isCancelled ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md text-sm font-bold"><CheckCircle2 size={14} /> مكتملة</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-bold"><XCircle size={14} /> ملغاة</span>}</td>
                      <td className="px-6 py-4"><div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setViewingInvoice(inv)} className="px-3 py-1.5 text-indigo-600 hover:text-white border border-indigo-600 hover:bg-indigo-600 rounded-lg transition-colors font-bold text-xs flex items-center gap-1.5"><Eye size={14} /> عرض</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredInvoices.length > 0 && !isLoading && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <span className="text-sm text-gray-500 font-medium">عرض <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> إلى <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}</span> من <span className="font-bold text-charcoal">{filteredInvoices.length}</span> فواتير</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-50 transition-colors"><ChevronRight size={18} /></button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === idx + 1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-white border border-transparent'}`}>{idx + 1}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white disabled:opacity-50 transition-colors"><ChevronLeft size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalOverlay isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title="تفاصيل الفاتورة" printFriendly={true}>
        {viewingInvoice && (() => {
          const customerName = (viewingInvoice.customer as any)?.fullName || 'عميل نقدي';
          const sellerName = (viewingInvoice.createdBy as any)?.name || '---';
          return (
            <div className="flex flex-col items-center justify-center p-6 print:p-0">
              <div className="flex justify-between items-center w-full max-w-3xl mb-6 print:hidden gap-4">
                <div className="flex gap-3">
                  {!viewingInvoice.isCancelled && user?.role === 'OWNER' && (
                    <button onClick={() => setCancelConfirmInvoice(viewingInvoice)} className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold rounded-xl transition-colors flex items-center gap-2"><XCircle size={18} /> إلغاء واسترجاع</button>
                  )}
                </div>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-charcoal text-white hover:bg-black font-bold rounded-xl transition-colors flex items-center gap-2"><Printer size={18} /> طباعة</button>
              </div>

              <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm]" dir="rtl">
                <InvoicePrintHeader title={`فاتورة مبيعات ذهب بالباركود ${!viewingInvoice.isCancelled ? '' : '(ملغاة)'}`} />
                <div className="border-2 border-indigo-600 rounded-xl p-4 text-center mb-8 bg-indigo-50/30"><span className="text-2xl font-black text-indigo-800">العميل: {customerName}</span></div>
                <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
                  <div className="space-y-3"><div className="flex gap-2"><span className="text-gray-500 w-32">الموظف المسؤول:</span> <span>{sellerName}</span></div></div>
                  <div className="space-y-3">
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الفاتورة:</span> <span dir="ltr">#{viewingInvoice.invoiceNumber}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">التاريخ:</span> <span>{new Date(viewingInvoice.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
                  </div>
                </div>
                <table className="w-full mb-8 border-collapse border border-charcoal text-center text-sm font-bold">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-charcoal py-3 px-2 w-10">م</th>
                      <th className="border border-charcoal py-3 px-2">رقم الباركود</th>
                      <th className="border border-charcoal py-3 px-2">اسم الصنف</th>
                      <th className="border border-charcoal py-3 px-2 w-16">العيار</th>
                      <th className="border border-charcoal py-3 px-2 w-24">الصافي (ج)</th>
                      <th className="border border-charcoal py-3 px-2 w-28">سعر الجرام اليوم</th>
                      <th className="border border-charcoal py-3 px-2 w-32">السعر الكلي (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-charcoal py-3 px-2">{idx + 1}</td>
                        <td className="border border-charcoal py-3 px-2 font-mono" dir="ltr">{item.barcode}</td>
                        <td className="border border-charcoal py-3 px-2">{item.title}</td>
                        <td className="border border-charcoal py-3 px-2" dir="ltr">{item.karat}K</td>
                        <td className="border border-charcoal py-3 px-2">{item.netWeight.toFixed(2)}</td>
                        <td className="border border-charcoal py-3 px-2" dir="ltr">{item.goldPricePerGram.toLocaleString()}</td>
                        <td className="border border-charcoal py-3 px-2" dir="ltr">{item.finalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-8">
                  <div className="border-2 border-charcoal rounded-xl p-4 w-72 bg-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>إجمالي وزن الذهب:</span><span dir="ltr">{viewingInvoice.totalNetWeight?.toFixed(2)} g</span></div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-lg font-black mt-2"><span>الإجمالي الكلي:</span><span dir="ltr">{viewingInvoice.finalPaidAmount?.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </ModalOverlay>

      <ModalOverlay isOpen={!!cancelConfirmInvoice} onClose={() => setCancelConfirmInvoice(null)} title="تأكيد إلغاء الفاتورة">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertCircle size={24} className="shrink-0" />
            <p className="font-bold text-sm leading-relaxed">هل أنت متأكد من إلغاء هذه الفاتورة بالكامل؟ سيتم استرجاع القطع وتصفير الخزنة.</p>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button onClick={async () => { if (cancelConfirmInvoice) { await cancelInvoice(cancelConfirmInvoice._id); setCancelConfirmInvoice(null); setViewingInvoice(null); } }} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2"><XCircle size={18} /> نعم، إلغاء الفاتورة</button>
            <button onClick={() => setCancelConfirmInvoice(null)} className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50">تراجع</button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
};
