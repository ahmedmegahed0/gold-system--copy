import React, { useState, useEffect, useRef } from 'react';
import { InvoicePrintHeader } from '../../components/print/InvoicePrintHeader';
import {
  ShoppingCart,
  Search,
  Trash2,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Scale,
  DollarSign,
  Tag,
  Hash,
  X,
  Barcode
} from 'lucide-react';
import { useBarcodeSales } from '../../hooks/useBarcodeSales';
import { BarcodeInventoryService } from '../../services/barcode-inventory.service';
import { useCustomers } from '../../hooks/useCustomers';
import type { Customer } from '../../common/types/customer.types';
import type { BarcodeInventoryItem, BarcodeInvoice } from '../../common/types/barcode.types';

export const BarcodeSalesCounterPage: React.FC = () => {
  const { checkout, error: salesError } = useBarcodeSales();
  const { customers, fetchCustomers } = useCustomers({ status: 'ACTIVE', search: '' });

  // ─── Local States ───
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // ─── Click Outside Logic ───
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Cart Items
  type CartItem = {
    cartItemId: string;
    item: BarcodeInventoryItem;
    goldPriceToday: number;
    makingChargePerGram: number;
  };
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<BarcodeInvoice | null>(null);

  // ─── Data Fetching ───
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ─── Customer Selection Logic ───
  const filteredCustomers = customerSearch 
    ? customers.filter(c => c.fullName.includes(customerSearch) || c.phoneNumber?.includes(customerSearch)).slice(0, 5)
    : customers.slice(0, 5);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  // ─── Item Scanner Logic ───
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim();
    if (cart.some(c => c.item.barcode === query)) {
      setScanError('هذه القطعة موجودة بالفعل في الفاتورة');
      return;
    }

    setIsScanning(true);
    setScanError('');
    try {
      const foundItem = await BarcodeInventoryService.scanBarcode(query);
      
      setCart((prev) => [
        ...prev,
        {
          cartItemId: Date.now().toString() + Math.random().toString(),
          item: foundItem,
          goldPriceToday: 0,
          makingChargePerGram: foundItem.makingChargePerGram || 0,
        },
      ]);
      setBarcodeInput('');
    } catch (err: any) {
      setScanError(err.response?.data?.message || 'فشل في قراءة الباركود أو القطعة غير متاحة');
    } finally {
      setIsScanning(false);
    }
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  const updateItemGoldPrice = (cartItemId: string, price: number) => {
    setCart((prev) => prev.map((c) => (c.cartItemId === cartItemId ? { ...c, goldPriceToday: price } : c)));
  };

  const updateItemMakingCharge = (cartItemId: string, charge: number) => {
    setCart((prev) => prev.map((c) => (c.cartItemId === cartItemId ? { ...c, makingChargePerGram: charge } : c)));
  };

  // ─── Computations ───
  const combinedGrossWeight = cart.reduce((sum, c) => sum + (c.item.grossWeight || 0), 0);
  const combinedNetWeight = cart.reduce((sum, c) => sum + (c.item.netWeight || 0), 0);
  
  const calcItemTotal = (c: CartItem) => {
    return c.item.netWeight * ((c.goldPriceToday || 0) + (c.makingChargePerGram || 0));
  };
  const totalPrice = cart.reduce((sum, c) => sum + calcItemTotal(c), 0);

  // ─── Submission ───
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        items: cart.map((c) => ({
          barcode: c.item.barcode,
          goldPricePerGram: c.goldPriceToday || 0,
          makingChargePerGram: c.makingChargePerGram || 0,
        })),
      };
      if (selectedCustomer) {
        payload.customerId = selectedCustomer._id || selectedCustomer.id;
      }

      const invoice = await checkout(payload);
      setSuccessInvoice(invoice);
    } catch (err: any) {
      alert(err?.message || 'حدث خطأ أثناء إصدار الفاتورة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSale = () => {
    setSuccessInvoice(null);
    setCart([]);
    setSelectedCustomer(null);
    setBarcodeInput('');
    setScanError('');
  };

  // ─── Printable Invoice Preview Modal ───
  if (successInvoice) {
    const customerName = selectedCustomer ? selectedCustomer.fullName : 'عميل نقدي';
    const invoiceNumber = successInvoice.invoiceNumber || successInvoice._id?.substring(0,8);
    const dateStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 print:min-h-0 print:block print:p-0">
        <div className="flex gap-4 mb-6 print:hidden w-full max-w-3xl justify-center">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-200">
            <CheckCircle2 size={20} /> تم إصدار الفاتورة بنجاح
          </div>
          <button onClick={() => window.print()} className="px-6 py-2 bg-charcoal hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Printer size={18} /> طباعة الفاتورة
          </button>
          <button onClick={handleResetSale} className="px-6 py-2 border border-gray-200 hover:bg-white text-gray-600 font-bold rounded-xl transition-colors shadow-sm">
            فاتورة جديدة
          </button>
        </div>

        <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm]" dir="rtl">
          <InvoicePrintHeader title="فاتورة مبيعات ذهب (باركود)" />
          
          <div className="border-2 border-indigo-600 rounded-xl p-4 text-center mb-8 bg-indigo-50/30">
            <span className="text-2xl font-black text-indigo-800">العميل: {customerName}</span>
          </div>

          <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
            <div className="space-y-3">
              <div className="flex gap-2"><span className="text-gray-500 w-32">طريقة الدفع:</span> <span>نقداً</span></div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الفاتورة:</span> <span dir="ltr">#{invoiceNumber}</span></div>
              <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">التاريخ والوقت:</span> <span>{dateStr}</span></div>
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
              {successInvoice.items?.map((item, idx) => (
                <tr key={item._id || idx}>
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
            <div className="border-2 border-charcoal rounded-xl p-4 w-64 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-black">
                <span>الإجمالي الكلي:</span>
                <span dir="ltr">{successInvoice.finalPaidAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 items-start">
      <div className="w-full lg:flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Barcode size={20} />
              </div>
              بيع قطع ذهب بالباركود
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <label className="block text-base font-semibold text-charcoal mb-2">العميل (اختياري)</label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border border-indigo-200 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-charcoal">{selectedCustomer.fullName}</span>
                      <span className="text-sm text-gray-500">{selectedCustomer.phoneNumber}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={customerDropdownRef}>
                  <Search size={16} className={`absolute top-3.5 text-gray-400 right-4`} />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="ابحث عن عميل..."
                    className="w-full py-3 pr-10 pl-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                  />
                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <div key={c._id || c.id} onClick={() => handleCustomerSelect(c)} className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0">
                            <span className="font-bold text-sm text-charcoal">{c.fullName}</span>
                            <span className="text-xs text-gray-500" dir="ltr">{c.phoneNumber}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-400">لا يوجد عملاء</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-charcoal mb-2">قراءة الباركود</label>
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <Hash size={16} className="absolute top-3.5 text-gray-400 right-4" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="مرر قارئ الباركود هنا..."
                  className="w-full py-3 pr-10 pl-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white font-mono"
                  dir="ltr"
                  autoFocus
                />
                {isScanning && <Loader2 size={16} className="absolute top-3.5 left-4 text-indigo-500 animate-spin" />}
              </form>
              {scanError && <p className="text-xs text-red-500 font-bold mt-2">{scanError}</p>}
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-charcoal px-5 py-6 grid gap-3 text-xl font-bold text-white text-center items-center rounded-t-xl" style={{ gridTemplateColumns: "1fr 2fr 0.8fr 1fr 1fr 1fr 1.5fr 0.5fr" }}>
              <div className="text-right">الباركود</div>
              <div className="text-right">الصنف</div>
              <div>العيار</div>
              <div>قائم</div>
              <div>صافي</div>
              <div>سعر الجرام</div>
              <div>المصنعية/ج</div>
              <div></div>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[560px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center justify-center">
                  <ShoppingCart size={40} className="mb-3 opacity-20" />
                  <span className="text-base font-medium">قم بقراءة باركود القطع لإضافتها للسلة</span>
                </div>
              ) : (
                cart.map((cartItem, idx) => {
                  const item = cartItem.item;
                  return (
                    <div key={cartItem.cartItemId} className={`px-5 py-5 grid gap-3 items-center transition-colors text-center border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8faf8]'} hover:bg-indigo-50/50`} style={{ gridTemplateColumns: "1fr 2fr 0.8fr 1fr 1fr 1fr 1.5fr 0.5fr" }}>
                      <div className="text-right font-mono font-bold text-sm" dir="ltr">{item.barcode}</div>
                      <div className="text-right font-bold text-lg text-indigo-800">{item.title}</div>
                      <div>
                        <span className="inline-block px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-lg font-black" dir="ltr">{item.karat}K</span>
                      </div>
                      <div className="font-bold text-gray-500">{item.grossWeight.toFixed(2)}g</div>
                      <div>
                        <span className="inline-block px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xl font-black shadow-sm">{item.netWeight.toFixed(2)}</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={cartItem.goldPriceToday || ''}
                          onChange={(e) => updateItemGoldPrice(cartItem.cartItemId, parseFloat(e.target.value) || 0)}
                          className="w-full py-3 px-1 border-2 border-amber-200 rounded-xl text-lg font-black text-center text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50 shadow-inner"
                          placeholder="السعر"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={cartItem.makingChargePerGram || ''}
                          onChange={(e) => updateItemMakingCharge(cartItem.cartItemId, parseFloat(e.target.value) || 0)}
                          className="w-full py-3 px-1 border-2 border-teal-200 rounded-xl text-lg font-black text-center text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-50 shadow-inner"
                          placeholder="المصنعية"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => removeItem(cartItem.cartItemId)} className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-600">
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {salesError && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">{salesError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-indigo-600" />
            ملخص الفاتورة
          </h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-lg font-semibold text-gray-500 flex items-center gap-2"><Tag size={18} /> عدد القطع</span>
              <span className="text-4xl font-black text-charcoal">{cart.length}</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-lg font-semibold text-gray-500 flex items-center gap-2"><Scale size={18} /> الوزن القائم</span>
              <span className="text-3xl font-black text-charcoal flex items-baseline gap-1" dir="ltr">
                {combinedGrossWeight.toFixed(2)} <span className="text-base text-gray-400">g</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-5 bg-indigo-50 rounded-xl border border-indigo-200">
              <span className="text-lg font-bold text-indigo-700 flex items-center gap-2"><Scale size={18} /> الوزن الصافي</span>
              <span className="text-3xl font-black text-indigo-700 flex items-baseline gap-1" dir="ltr">
                {combinedNetWeight.toFixed(2)} <span className="text-base opacity-70">g</span>
              </span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-500">الإجمالي النهائي للذهب</span>
            </div>
            <div className="relative">
              <div className="w-full text-5xl font-black text-center py-6 rounded-xl border-2 border-indigo-100 bg-indigo-50 text-indigo-800" dir="ltr">
                {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="absolute bottom-6 left-4 text-2xl text-indigo-600 font-black pointer-events-none">ج.م</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl"
          >
            {isSubmitting ? <Loader2 size={26} className="animate-spin" /> : <CheckCircle2 size={26} />}
            إصدار الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};
