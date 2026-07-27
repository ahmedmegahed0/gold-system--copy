import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, Search, AlertCircle, Loader2, UserPlus, Info, CheckCircle2, Tag, CircleDollarSign, Scale, Printer
} from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { CategoryService } from '../../services/category.service';
import { ScrapInvoiceService } from '../../services/scrap-invoice.service';
import type { Customer } from '../../common/types/customer.types';
import type { Category } from '../../common/types/category.types';
import type { ScrapInvoice } from '../../common/types/scrap-invoice.types';
import { useAuth } from '../../core/context/AuthContext';

export const ScrapSalesCounterPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();
  

  // Data State
  const { customers } = useCustomers();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [buyPayload, setBuyPayload] = useState({
    karat: 21 as 18 | 21,
    category: '',
    count: 1,
    weight: 0,
    goldPriceToday: '' as number | '',
    makingChargesPerGram: '' as number | ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInvoice, setSuccessInvoice] = useState<ScrapInvoice | null>(null);

  useEffect(() => {
    CategoryService.getCategories('ACTIVE')
      .then(res => setCategories(Array.isArray(res) ? res : []))
      .catch(console.error);
  }, []);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
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

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(c => c.name.includes(categorySearch));
  }, [categories, categorySearch]);

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
    if (!buyPayload.category) {
      setError('الرجاء اختيار التصنيف');
      return;
    }
    if (buyPayload.weight <= 0 || buyPayload.count < 1 || buyPayload.goldPriceToday === '' || buyPayload.goldPriceToday < 0) {
      setError('الوزن، العدد، والسعر اليومي يجب أن يتم إدخالهم بشكل صحيح');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: selectedCustomer._id || selectedCustomer.id!,
        category: buyPayload.category,
        karat: buyPayload.karat,
        count: buyPayload.count,
        weight: buyPayload.weight,
        goldPriceToday: Number(buyPayload.goldPriceToday),
        makingChargesPerGram: 0
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

  const handleResetSale = () => {
    setSuccessInvoice(null);
    setSelectedCustomer(null);
    setBuyPayload({ karat: 21, category: '', count: 1, weight: 0, goldPriceToday: '', makingChargesPerGram: '' });
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
                <th className="border border-charcoal py-3 px-2">التصنيف</th>
                <th className="border border-charcoal py-3 px-2 w-16">العيار</th>
                <th className="border border-charcoal py-3 px-2 w-16">العدد</th>
                <th className="border border-charcoal py-3 px-2 w-24">الصافي (ج)</th>
                <th className="border border-charcoal py-3 px-2 w-28">سعر الجرام اليوم</th>
                <th className="border border-charcoal py-3 px-2 w-32">السعر الكلي (ج.م)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-charcoal py-3 px-2">1</td>
                <td className="border border-charcoal py-3 px-2">{typeof successInvoice.category === 'object' ? successInvoice.category.name : successInvoice.category || 'غير محدد'}</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.karat}K</td>
                <td className="border border-charcoal py-3 px-2">{successInvoice.count}</td>
                <td className="border border-charcoal py-3 px-2">{successInvoice.weight?.toFixed(2)}</td>
                <td className="border border-charcoal py-3 px-2" dir="ltr">{successInvoice.goldPriceToday?.toLocaleString()}</td>
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
                <label className="block text-base font-bold text-gray-600 mb-2">التصنيف (Category)</label>
                <div className="relative" ref={categoryDropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      value={buyPayload.category ? (categories.find(c => (c._id || c.id) === buyPayload.category)?.name || '') : categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setBuyPayload({ ...buyPayload, category: '' });
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      placeholder="-- ابحث أو اختر التصنيف --"
                      className={`w-full py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-gold transition-colors font-medium bg-white ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                    />
                    <Tag size={18} className={`absolute top-4 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  </div>

                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                          <div
                            key={cat._id || cat.id}
                            onClick={() => {
                              setBuyPayload({ ...buyPayload, category: cat._id || cat.id! });
                              setCategorySearch('');
                              setShowCategoryDropdown(false);
                            }}
                            className="p-3 hover:bg-gold/5 cursor-pointer flex flex-col border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <span className="font-bold text-base text-charcoal">{cat.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-sm text-gray-500">لا يوجد تصنيف مطابق للبحث.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-gray-600 mb-2">عدد القطع</label>
                <input
                  type="number"
                  min="1"
                  value={buyPayload.count || ''}
                  onChange={(e) => setBuyPayload({ ...buyPayload, count: parseInt(e.target.value) || 0 })}
                  className="w-full py-3.5 px-4 bg-white border-2 border-gray-100 rounded-xl text-base focus:outline-none focus:border-theme-scrap text-center font-black text-xl"
                  dir="ltr"
                />
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
            <div className="mb-6">
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

            <label className="block text-base font-bold text-charcoal mb-2">المبلغ الكلي المدفوع (ج.م) - <span className="text-gray-400 font-normal">تلقائي</span></label>
            <div className="relative max-w-sm">
              <div
                className={`w-full py-4 border-2 border-gray-200 rounded-xl text-4xl font-black bg-gray-50 text-gold flex items-center ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
                dir="ltr"
              >
                {(buyPayload.weight * (Number(buyPayload.goldPriceToday) || 0)).toLocaleString()}
              </div>
              <CircleDollarSign size={28} className={`absolute top-5 text-gold ${isRtl ? 'right-4' : 'left-4'}`} />
            </div>
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
