import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, Search, AlertCircle, Loader2, UserPlus, Info, CheckCircle2, CircleDollarSign, Scale, Printer
} from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { ScrapInvoiceService } from '../../services/scrap-invoice.service';
import type { Customer } from '../../common/types/customer.types';
import type { ScrapInvoice } from '../../common/types/scrap-invoice.types';
import { useAuth } from '../../core/context/AuthContext';

export const ScrapSalesCounterPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  

  // Data State
  const { customers } = useCustomers();
  
  // Form State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [buyPayload, setBuyPayload] = useState({
    karat: 21 as 18 | 21,
    weight: 0,
    goldPriceToday: '' as number | '',
    makingChargesPerGram: '' as number | ''
  });

  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [isManualTotal, setIsManualTotal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<ScrapInvoice | null>(null);



  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 100);
    return customers.filter(c => 
      c.fullName.includes(customerSearch) || 
      (c.phoneNumber && c.phoneNumber.includes(customerSearch))
    ).slice(0, 100);
  }, [customers, customerSearch]);



  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const handleCheckout = async () => {
    setError(null);
    if (!selectedCustomer) {
      setError('الرجاء اختيار العميل');
      return;
    }
    if (buyPayload.weight <= 0 || buyPayload.goldPriceToday === '' || buyPayload.goldPriceToday < 0) {
      setError('الوزن والسعر اليومي يجب أن يتم إدخالهم بشكل صحيح');
      return;
    }
    if (!isManualTotal && (buyPayload.makingChargesPerGram === '' || buyPayload.makingChargesPerGram < 0)) {
      setError('سعر المصنعية يجب أن يتم إدخاله بشكل صحيح');
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      setError('المبلغ الكلي يجب أن يكون أكبر من صفر');
      return;
    }
    // منع الإصدار لو الإجمالي اليدوي أقل من قيمة الذهب الخام
    if (isManualTotal) {
      const w = buyPayload.weight || 0;
      const p = Number(buyPayload.goldPriceToday) || 0;
      const t = Number(totalAmount) || 0;
      const recalcMaking = w > 0 ? t / w - p : -1;
      if (recalcMaking < 0) {
        setError('المبلغ الكلي المدخل أقل من قيمة الذهب الخام! يرجى رفع المبلغ أو مراجعة السعر.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: selectedCustomer._id || selectedCustomer.id!,
        karat: buyPayload.karat,
        weight: buyPayload.weight,
        goldPriceToday: Number(buyPayload.goldPriceToday),
        makingChargesPerGram: Number(buyPayload.makingChargesPerGram),
        ...(isManualTotal && totalAmount ? { totalPrice: Number(totalAmount) } : {})
      };
      
      const invoice = await ScrapInvoiceService.createScrapInvoice(payload);
      setSuccessInvoice(invoice);
    } catch (err: any) {
      console.error("Scrap Sales Error:", err.response?.data || err);
      let errorMsg = 'حدث خطأ أثناء إصدار فاتورة الكسر';
      const data = err.response?.data;
      
      if (data) {
        const msg = data.message || data.error || '';
        
        // Handle class-validator array of strings or Validation failed objects
        if (msg === 'Validation failed' || data.error === 'Bad Request' || Array.isArray(msg)) {
          if (Array.isArray(msg)) {
             errorMsg = 'تأكد من البيانات المكتوبة: ' + msg.join(' ، ');
          } else if (Array.isArray(data.errors)) {
             errorMsg = 'تأكد من البيانات: ' + data.errors.map((e: any) => e.message || e).join(' ، ');
          } else {
             errorMsg = 'البيانات المدخلة غير صحيحة أو ناقصة. يرجى مراجعة الحقول.';
          }
        } else {
          // Translate common backend text
          if (typeof msg === 'string') {
            if (msg.toLowerCase().includes('insufficient') || msg.toLowerCase().includes('not enough')) {
              errorMsg = 'عذراً، الكمية المطلوبة غير متوفرة في الخزنة (الرصيد لا يكفي).';
            } else if (msg.toLowerCase().includes('not found')) {
              errorMsg = 'لم يتم العثور على العنصر (تأكد من التصنيف أو العميل).';
            } else {
              errorMsg = msg; // fallback to backend message
            }
          }
        }
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-calculate total when inputs change (unless user manually edited it)
  useEffect(() => {
    if (!isManualTotal) {
      const w = buyPayload.weight || 0;
      const p = Number(buyPayload.goldPriceToday) || 0;
      const m = Number(buyPayload.makingChargesPerGram) || 0;
      const calc = w * (p + m);
      setTotalAmount(calc > 0 ? parseFloat(calc.toFixed(2)) : '');
    }
  }, [buyPayload.weight, buyPayload.goldPriceToday, buyPayload.makingChargesPerGram, isManualTotal]);

  const handleResetSale = () => {
    setSuccessInvoice(null);
    setSelectedCustomer(null);
    setBuyPayload({ karat: 21, weight: 0, goldPriceToday: '', makingChargesPerGram: '' });
    setTotalAmount('');
    setIsManualTotal(false);
  };

  // ✅ Printable Success Invoice
  if (successInvoice) {
    const customerName = typeof successInvoice.customer === 'object' ? successInvoice.customer.fullName : selectedCustomer?.fullName || '---';
    const invoiceNumber = successInvoice.invoiceNumber || (successInvoice._id || successInvoice.id)?.substring(0,8).toUpperCase();
    const dateStr = new Date(successInvoice.createdAt || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    const actionByName = user ? (user.role === 'OWNER' ? 'Owner' : (user.fullName || 'النظام')) : 'النظام';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 print:min-h-0 print:block print:p-0">
        
        {/* Actions (Hidden on Print) */}
        <div className="flex gap-4 mb-6 print:hidden w-full max-w-3xl justify-center">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-200 shadow-sm">
            <CheckCircle2 size={20} />
            تم إصدار فاتورة الكسر بنجاح
          </div>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-charcoal hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer size={18} />
            طباعة الفاتورة
          </button>
          <button
            onClick={handleResetSale}
            className="px-6 py-2 border border-gray-200 hover:bg-white text-gray-600 font-bold rounded-xl transition-colors shadow-sm"
          >
            إصدار فاتورة جديدة
          </button>
        </div>

        {/* The Printable A4 Sheet */}
        <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-0 mx-auto" dir="rtl">
          
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-charcoal pb-6">
            <h1 className="text-3xl font-black mb-3">فاتورة شراء كسر - نظام GMS</h1>

          </div>

          {/* Customer Box */}
          <div className="border-2 border-blue-600 rounded-xl p-4 text-center mb-8 bg-blue-50/30">
            <span className="text-2xl font-black text-blue-800">العميل: {customerName}</span>
          </div>

          {/* Invoice Info Details */}
          <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
            <div className="space-y-3">
              <div className="flex gap-2"><span className="text-gray-500 w-32">نوع الفاتورة:</span> <span>شراء كسر</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-32">مسؤول الاستلام:</span> <span>{actionByName}</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الإيصال:</span> <span dir="ltr">SCRAP-SALE-{new Date().getFullYear()}-{invoiceNumber}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">تاريخ الإيصال:</span> <span dir="ltr">{dateStr}</span></div>
            </div>
          </div>

          <table className="w-full mb-8 border-collapse border border-charcoal text-center text-sm font-bold">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-charcoal py-3 px-2 w-10">م</th>
                <th className="border border-charcoal py-3 px-2 w-16">العيار</th>
                <th className="border border-charcoal py-3 px-2 w-24">الصافي (ج)</th>
                <th className="border border-charcoal py-3 px-2 w-28">سعر الجرام اليوم</th>
                <th className="border border-charcoal py-3 px-2 w-24">المصنعية/جرام</th>
                <th className="border border-charcoal py-3 px-2 w-32">السعر الكلي (ج.م)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-charcoal py-3 px-2">1</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.karat}K</td>
                <td className="border border-charcoal py-3 px-2">{successInvoice.weight?.toFixed(2)}</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.goldPriceToday?.toLocaleString()}</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.makingChargesPerGram?.toLocaleString()}</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.totalPrice?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Total Price */}
          <div className="flex justify-end mt-8">
            <div className="border-2 border-charcoal rounded-xl p-4 w-72 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-black">
                <span>المبلغ المدفوع (ج.م):</span>
                <span dir="ltr">{successInvoice.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-scrap/10 text-theme-scrap">
              <ShoppingCart size={24} />
            </div>
            بيع كسر (إصدار فاتورة شراء)
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            تسجيل وإصدار فواتير شراء الذهب الكسر من العملاء وتحديث الخزنة مباشرة.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-in fade-in">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Constraints Notice */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-blue-900 text-sm">تنبيه هام</h4>
          <p className="text-sm text-blue-700/80 mt-1">
            حسبة الكسر مباشرة دون خصم تكت الأوراق (0.06ج). الأوزان المسجلة هنا هي الأوزان الفعلية الصافية للذهب الكسر.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Customer Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserPlus size={18} className="text-gold" />
              بيانات العميل
            </h3>
            
            {!selectedCustomer ? (
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="ابحث عن العميل بالاسم أو رقم الهاتف..."
                    className={`w-full py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-gold transition-colors ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                  />
                  <Search size={18} className={`absolute top-4 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                </div>

                {showCustomerDropdown && customerSearch !== null && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <div
                          key={c._id || c.id}
                          onClick={() => handleCustomerSelect(c)}
                          className="p-4 hover:bg-gold/5 cursor-pointer flex flex-col border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <span className="font-bold text-base text-charcoal">{c.fullName}</span>
                          <span className="text-sm text-gray-500 mt-1" dir="ltr">{c.phoneNumber}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">لا يوجد عملاء مطابقين للبحث.</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="block font-black text-charcoal text-xl mb-1">{selectedCustomer.fullName}</span>
                  <span className="block text-base text-gray-500 font-semibold" dir="ltr">{selectedCustomer.phoneNumber}</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  تغيير العميل
                </button>
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2 border-b border-gray-100 pb-3">
              <Scale size={18} className="text-gold" />
              تفاصيل الفاتورة والذهب
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-bold text-gray-600 mb-2">العيار (Karat)</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center py-3.5 border-2 rounded-xl cursor-pointer transition-colors font-black text-xl ${buyPayload.karat === 21 ? 'border-theme-scrap bg-theme-scrap/10 text-theme-scrap' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    <input type="radio" name="karat" className="hidden" checked={buyPayload.karat === 21} onChange={() => setBuyPayload({...buyPayload, karat: 21})} />
                    21K
                  </label>
                  <label className={`flex-1 flex items-center justify-center py-3.5 border-2 rounded-xl cursor-pointer transition-colors font-black text-xl ${buyPayload.karat === 18 ? 'border-theme-scrap bg-theme-scrap/10 text-theme-scrap' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    <input type="radio" name="karat" className="hidden" checked={buyPayload.karat === 18} onChange={() => setBuyPayload({...buyPayload, karat: 18})} />
                    18K
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-600 mb-2">الوزن المباشر بالجرام</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={buyPayload.weight || ''}
                  onChange={(e) => setBuyPayload({ ...buyPayload, weight: parseFloat(e.target.value) || 0 })}
                  className="w-full py-3.5 px-4 bg-white border-2 border-gray-100 rounded-xl text-base focus:outline-none focus:border-theme-scrap font-black text-theme-scrap text-center text-xl"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-charcoal mb-4">التسعير والمبلغ الكلي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-base font-bold text-gray-600 mb-2">سعر جرام الكسر اليوم</label>
                <input
                  type="number"
                  min="0"
                  value={buyPayload.goldPriceToday}
                  onChange={(e) => setBuyPayload({ ...buyPayload, goldPriceToday: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                  className="w-full py-3.5 px-4 bg-white border-2 border-gray-100 rounded-xl text-base focus:outline-none focus:border-theme-scrap font-black text-charcoal text-xl"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-base font-bold text-gray-600 mb-2">
                  المصنعية للجرام
                  {isManualTotal && (() => {
                    const w = buyPayload.weight || 0;
                    const p = Number(buyPayload.goldPriceToday) || 0;
                    const t = Number(totalAmount) || 0;
                    const recalc = w > 0 && t > 0 ? parseFloat((t / w - p).toFixed(2)) : null;
                    return recalc !== null && recalc < 0 ? (
                      <span className="mr-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-xs font-black border border-red-200">
                        ⚠️ الإجمالي أقل من سعر الذهب!
                      </span>
                    ) : null;
                  })()}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={(() => {
                      if (!isManualTotal) return buyPayload.makingChargesPerGram;
                      const w = buyPayload.weight || 0;
                      const p = Number(buyPayload.goldPriceToday) || 0;
                      const t = Number(totalAmount) || 0;
                      if (w <= 0 || t <= 0) return buyPayload.makingChargesPerGram;
                      return parseFloat((t / w - p).toFixed(2));
                    })()}
                    onChange={(e) => setBuyPayload({ ...buyPayload, makingChargesPerGram: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 })}
                    className={`w-full py-3.5 px-4 border-2 rounded-xl text-base focus:outline-none font-black text-xl transition-all ${
                      isManualTotal
                        ? 'bg-amber-50 border-amber-300 text-amber-700 focus:border-amber-400 cursor-default'
                        : 'bg-white border-gray-100 text-charcoal focus:border-theme-scrap'
                    }`}
                    dir="ltr"
                    readOnly={isManualTotal}
                    title={isManualTotal ? 'محسوبة تلقائياً من المبلغ الكلي المعدّل' : ''}
                  />

                </div>
              </div>
            </div>

            <label className="block text-base font-bold text-charcoal mb-2">
              المبلغ الكلي المدفوع (ج.م)
              {isManualTotal ? (
                <span
                  className="mr-2 text-xs font-bold text-amber-500 cursor-pointer hover:text-amber-600 underline underline-offset-2"
                  onClick={() => setIsManualTotal(false)}
                  title="انقر للرجوع للحساب التلقائي"
                >
                  ✏️ يدوي (فاصلت) — انقر للإعادة تلقائي
                </span>
              ) : (
                <span className="mr-2 text-xs text-gray-400 font-normal">تلقائي</span>
              )}
            </label>
            <div className="relative max-w-sm">
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={(e) => {
                  setIsManualTotal(true);
                  setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0);
                }}
                className={`w-full py-4 border-2 rounded-xl text-4xl font-black text-gold focus:outline-none transition-colors ${
                  isManualTotal
                    ? 'border-amber-400 bg-amber-50 focus:border-amber-500'
                    : 'border-gray-200 bg-gray-50 focus:border-theme-scrap'
                } ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
                dir="ltr"
                placeholder="0"
              />
              <CircleDollarSign size={28} className={`absolute top-5 text-gold pointer-events-none ${isRtl ? 'right-4' : 'left-4'}`} />
            </div>

            {/* Live recalculation summary when manual mode */}
            {isManualTotal && (() => {
              const w = buyPayload.weight || 0;
              const p = Number(buyPayload.goldPriceToday) || 0;
              const t = Number(totalAmount) || 0;
              const recalcMaking = w > 0 && t > 0 ? parseFloat((t / w - p).toFixed(2)) : null;
              if (recalcMaking === null) return null;
              if (recalcMaking < 0) {
                return (
                  <div className="mt-3 max-w-sm p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold">
                    ⚠️ المبلغ الكلي أقل من قيمة الذهب الخام! لا يمكن إصدار الفاتورة.
                  </div>
                );
              }
              return (
                <div className="mt-3 max-w-sm p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <p className="text-xs font-black text-amber-700 mb-2">📊 ملخص الحسبة بعد الفصال:</p>
                  <div className="flex justify-between text-sm font-bold text-charcoal">
                    <span className="text-gray-500">سعر الجرام اليوم:</span>
                    <span dir="ltr">{p.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-charcoal">
                    <span className="text-gray-500">المصنعية الجديدة/جرام:</span>
                    <span dir="ltr" className="text-amber-600">{recalcMaking.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-charcoal border-t border-amber-200 pt-2 mt-1">
                    <span className="text-gray-500">الإجمالي المعدّل:</span>
                    <span dir="ltr" className="text-gold font-black">{t.toLocaleString()} ج.م</span>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

        {/* Action Bar */}
        <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-theme-scrap hover:bg-theme-scrap/90 text-white rounded-xl font-bold text-lg transition-all shadow-md shadow-theme-scrap/20 disabled:opacity-50 min-w-[300px]"
          >
            {submitting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={24} />
                إصدار فاتورة الكسر وتحديث الخزنة
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
