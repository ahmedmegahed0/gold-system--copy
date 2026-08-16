import React, { useState, useEffect, useMemo, useRef } from 'react';
import { InvoicePrintHeader } from '../../components/print/InvoicePrintHeader';
import { useTranslation } from 'react-i18next';
import {
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
  Coins,
} from 'lucide-react';
import { useBullionSales } from '../../hooks/useBullionSales';
import { useBullionInventory } from '../../hooks/useBullionInventory';
import { useCustomers } from '../../hooks/useCustomers';
import type { BullionInventory } from '../../common/types/bullion.types';
import type { Customer } from '../../common/types/customer.types';
import type { BullionSale } from '../../common/types/bullion-sales.types';
import { useAuth } from '../../core/context/AuthContext';

export const BullionSalesCounterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  const { createSale, error: salesError } = useBullionSales();
  const { fetchBullions, bullions } = useBullionInventory({ isArchived: false });
  const { customers, fetchCustomers } = useCustomers({ status: 'ACTIVE', search: '' });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const itemDropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target as Node)) {
        setShowItemDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  type CartItem = {
    cartItemId: string;
    item: BullionInventory;
    soldCount: number;
    goldPriceToday: number;
    makingChargePerUnit: number;
  };
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<BullionSale | null>(null);
  


  useEffect(() => {
    fetchBullions();
    fetchCustomers();
  }, [fetchBullions, fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 5);
    return customers.filter(
      (c) =>
        c.fullName.includes(customerSearch) ||
        c.phoneNumber?.includes(customerSearch)
    ).slice(0, 5);
  }, [customers, customerSearch]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  const filteredInventory = useMemo(() => {
    if (!searchInput) return bullions;
    const query = searchInput.toLowerCase();
    return bullions.filter(
      (inv) =>
        inv._id.toLowerCase().includes(query) ||
        inv.title.toLowerCase().includes(query) ||
        inv.companyName.toLowerCase().includes(query)
    );
  }, [bullions, searchInput]);

  const handleItemSelect = (foundItem: BullionInventory) => {
    if (foundItem.quantity <= 0) {
      alert('لا توجد كمية كافية في المخزن من هذا الصنف.');
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        cartItemId: Date.now().toString() + Math.random().toString(),
        item: foundItem,
        soldCount: 1,
        goldPriceToday: 0,
        makingChargePerUnit: foundItem.makingChargePerUnit || 0,
      },
    ]);
    setSearchInput('');
    setShowItemDropdown(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const query = searchInput.trim();
    const foundItem = bullions.find((inv) => inv._id === query || inv.title.includes(query));
    if (foundItem) {
      handleItemSelect(foundItem);
    } else {
      alert('الصنف غير موجود.');
    }
  };

  const removeItem = (cartItemId: string) => setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  const updateItemGoldPrice = (cartItemId: string, price: number) => setCart((prev) => prev.map((c) => (c.cartItemId === cartItemId ? { ...c, goldPriceToday: price } : c)));
  const updateItemMakingCharge = (cartItemId: string, charge: number) => setCart((prev) => prev.map((c) => (c.cartItemId === cartItemId ? { ...c, makingChargePerUnit: charge } : c)));
  const updateItemCount = (cartItemId: string, count: number) => setCart((prev) => prev.map((c) => (c.cartItemId === cartItemId ? { ...c, soldCount: count } : c)));

  const combinedGrossWeight = cart.reduce((sum, c) => sum + (c.item.weightPerUnit * c.soldCount), 0);

  
  const autoTotalPrice = cart.reduce((sum, c) => {
    const goldTotal = (c.item.weightPerUnit * c.soldCount) * c.goldPriceToday;
    const makingTotal = c.makingChargePerUnit * c.soldCount;
    return sum + goldTotal + makingTotal;
  }, 0);

  const [isManualTotal, setIsManualTotal] = useState(false);
  const [manualTotalAmount, setManualTotalAmount] = useState<number | ''>('');

  useEffect(() => {
    if (!isManualTotal) {
      setManualTotalAmount(autoTotalPrice > 0 ? parseFloat(autoTotalPrice.toFixed(2)) : '');
    }
  }, [autoTotalPrice, isManualTotal]);

  const getEffectiveMakingChargePerUnit = (cartItem: CartItem) => {
    if (isManualTotal && manualTotalAmount !== '' && Number(manualTotalAmount) > 0) {
      const goldTotal = cart.reduce((sum, c) => sum + ((c.item.weightPerUnit * c.soldCount) * c.goldPriceToday), 0);
      const requiredTotalMaking = Number(manualTotalAmount) - goldTotal;
      const totalUnits = cart.reduce((sum, c) => sum + c.soldCount, 0);
      if (totalUnits > 0) {
        return requiredTotalMaking / totalUnits;
      }
    }
    return cartItem.makingChargePerUnit || 0;
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) { alert(t('sales.errors.selectCustomer')); return; }
    if (cart.length === 0) { alert(t('sales.errors.emptyCart')); return; }

    for (const c of cart) {
      if (c.goldPriceToday <= 0) {
        alert(`يرجى إدخال سعر الذهب لصنف: ${c.item.title}`);
        return;
      }
      if (c.soldCount > c.item.quantity) {
        alert(`الكمية المباعة للصنف "${c.item.title}" تتجاوز الكمية المتاحة بالمخزن (${c.item.quantity}).`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let finalCart = [...cart];
      if (isManualTotal && manualTotalAmount !== '' && Number(manualTotalAmount) > 0) {
        const newTotal = Number(manualTotalAmount);
        const goldTotal = finalCart.reduce((sum, c) => sum + ((c.item.weightPerUnit * c.soldCount) * c.goldPriceToday), 0);
        const requiredTotalMaking = newTotal - goldTotal;
        const totalUnits = finalCart.reduce((sum, c) => sum + c.soldCount, 0);
        if (totalUnits > 0) {
          finalCart = finalCart.map(c => ({
            ...c,
            makingChargePerUnit: requiredTotalMaking / totalUnits
          }));
        }
      }

      const payload = {
        customerId: selectedCustomer._id || selectedCustomer.id || '',
        items: finalCart.map((c) => ({
          bullionItem: c.item._id,
          quantity: c.soldCount,
          goldPricePerGram: c.goldPriceToday,
          makingChargePerUnit: c.makingChargePerUnit,
        })),
      };
      const invoice = await createSale(payload);
      setSuccessInvoice(invoice);
      fetchBullions();
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
    setSearchInput('');
    setIsManualTotal(false);
    setManualTotalAmount('');
  };

  if (successInvoice) {
    const customerName = typeof successInvoice.customer === 'object' ? successInvoice.customer.fullName : '---';
    const invoiceNumber = successInvoice.invoiceNumber || successInvoice._id?.substring(0,8);
    const dateStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    const sellerName = user ? (user.role === 'OWNER' ? 'Owner' : (user.fullName || 'النظام')) : 'النظام';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 print:min-h-0 print:block print:p-0">
        <div className="flex gap-4 mb-6 print:hidden w-full max-w-3xl justify-center">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-200">
            <CheckCircle2 size={20} />تم إصدار الفاتورة بنجاح
          </div>
          <button onClick={() => window.print()} className="px-6 py-2 bg-charcoal hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center gap-2">
            <Printer size={18} /> طباعة
          </button>
          <button onClick={handleResetSale} className="px-6 py-2 border border-gray-200 hover:bg-white text-gray-600 font-bold rounded-xl transition-colors">
            فاتورة جديدة
          </button>
        </div>

        <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm]" dir="rtl">
          <InvoicePrintHeader title="فاتورة بيع سبايك وجنيهات" />
          <div className="border-2 border-blue-600 rounded-xl p-4 text-center mb-8 bg-blue-50/30">
            <span className="text-2xl font-black text-blue-800">العميل: {customerName}</span>
          </div>
          <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
            <div className="space-y-3">
              <div className="flex gap-2"><span className="text-gray-500 w-32">اسم الموظف المسؤول:</span> <span>{sellerName}</span></div>
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
                <th className="border border-charcoal py-3 px-2">اسم الصنف</th>
                <th className="border border-charcoal py-3 px-2 w-16">العدد</th>
                <th className="border border-charcoal py-3 px-2 w-24">وزن القطعة (ج)</th>
                <th className="border border-charcoal py-3 px-2 w-24">الوزن الإجمالي</th>
                <th className="border border-charcoal py-3 px-2 w-28">سعر الجرام اليوم</th>
                <th className="border border-charcoal py-3 px-2 w-32">السعر الكلي (ج.م)</th>
              </tr>
            </thead>
            <tbody>
              {successInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-charcoal py-3 px-2">{idx + 1}</td>
                  <td className="border border-charcoal py-3 px-2">{item.title}</td>
                  <td className="border border-charcoal py-3 px-2">{item.quantity}</td>
                  <td className="border border-charcoal py-3 px-2">{item.weightPerUnit.toFixed(2)}</td>
                  <td className="border border-charcoal py-3 px-2">{(item.weightPerUnit * item.quantity).toFixed(2)}</td>
                  <td className="border border-charcoal py-3 px-2" dir="ltr">{item.goldPricePerGram.toLocaleString()}</td>
                  <td className="border border-charcoal py-3 px-2" dir="ltr">{item.itemTotalPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-8">
            <div className="border-2 border-charcoal rounded-xl p-4 w-72 bg-gray-50 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                <span>إجمالي وزن الذهب:</span>
                <span dir="ltr">{successInvoice.totalGoldWeight.toFixed(2)} g</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-lg font-black mt-2">
                <span>الإجمالي الكلي:</span>
                <span dir="ltr">{successInvoice.grandTotal?.toLocaleString()}</span>
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
              <div className="p-2 bg-theme-sales/10 text-theme-sales rounded-lg"><Coins size={20} /></div>
              فاتورة بيع سبايك وجنيهات
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <label className="block text-base font-semibold text-charcoal mb-2">{t('sales.builder.customer')}</label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border border-gold/40 bg-gold/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold"><User size={14} /></div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-charcoal">{selectedCustomer.fullName}</span>
                      <span className="text-sm text-gray-500">{selectedCustomer.phoneNumber}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
                </div>
              ) : (
                <div className="relative" ref={customerDropdownRef}>
                  <Search size={16} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input type="text" value={customerSearch} onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }} onFocus={() => setShowCustomerDropdown(true)} placeholder="ابحث عن اسم العميل..." className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                      {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                        <div key={c._id || c.id} onClick={() => handleCustomerSelect(c)} className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-50"><span className="font-bold text-sm text-charcoal">{c.fullName}</span><span className="text-xs text-gray-500" dir="ltr">{c.phoneNumber}</span></div>
                      )) : <div className="p-4 text-center text-sm text-gray-400">لا يوجد عملاء بهذا الاسم</div>}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-semibold text-charcoal mb-2">البحث عن السبيكة/الجنيه</label>
              <form onSubmit={handleSearchSubmit} className="relative" ref={itemDropdownRef}>
                <Hash size={16} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input type="text" value={searchInput} onChange={(e) => { setSearchInput(e.target.value); setShowItemDropdown(true); }} onFocus={() => setShowItemDropdown(true)} placeholder="اكتب اسم أو كود السبيكة..." className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} dir="ltr" />
                {showItemDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                    {filteredInventory.length > 0 ? filteredInventory.map(item => (
                      <div key={item._id} onClick={() => handleItemSelect(item)} className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-50">
                        <div className="flex justify-between items-center"><span className="font-bold text-sm text-charcoal">{item.title}</span><span className="text-xs font-bold text-gray-400">متاح: {item.quantity}</span></div>
                        <span className="text-xs text-gray-500 flex gap-2 mt-1" dir="ltr">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">{item.companyName}</span>
                          <span className="bg-gold/10 text-gold px-1.5 py-0.5 rounded font-bold">{item.karat}K</span>
                          <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded font-bold">{item.weightPerUnit}g</span>
                        </span>
                      </div>
                    )) : <div className="p-4 text-center text-sm text-gray-400">لا يوجد بيانات مطابقة</div>}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-charcoal px-5 py-6 grid gap-3 text-sm lg:text-base font-bold text-white text-center items-center rounded-t-xl" style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 1.5fr 0.6fr" }}>
              <div className="text-right">الصنف والوزن</div>
              <div>العدد</div>
              <div>المصنعية/قطعة</div>
              <div>سعر جرام الذهب (ع{cart[0]?.item.karat || 24})</div>
              <div>الإجمالي للصنف</div>
              <div></div>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[560px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center justify-center">
                  <Coins size={40} className="mb-3 opacity-20" />
                  <span className="text-base font-medium">لم يتم إضافة أي سبائك أو جنيهات للفاتورة</span>
                </div>
              ) : (
                cart.map((cartItem, idx) => {
                  const item = cartItem.item;
                  const itemTotalGold = (item.weightPerUnit * cartItem.soldCount) * cartItem.goldPriceToday;
                  const itemTotalMaking = getEffectiveMakingChargePerUnit(cartItem) * cartItem.soldCount;
                  const itemTotalPrice = itemTotalGold + itemTotalMaking;

                  return (
                    <div key={cartItem.cartItemId} className={`px-5 py-7 grid gap-3 items-center transition-colors text-center border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8faf8]'} hover:bg-theme-sales/5`} style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1.5fr 1.5fr 0.6fr" }}>
                      <div className="flex flex-col text-right overflow-hidden">
                        <span className="text-xl font-black text-theme-sales truncate">{item.title}</span>
                        <div className="flex gap-2 mt-2">
                          <span className="text-sm font-bold text-gray-400 px-2 py-0.5 bg-gray-100 rounded">{item.weightPerUnit}g وزن القطعة</span>
                          <span className="text-sm font-bold text-gold px-2 py-0.5 bg-gold/10 rounded">{item.karat}K</span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <input type="number" min="1" max={item.quantity} value={cartItem.soldCount || ''} onChange={(e) => updateItemCount(cartItem.cartItemId, parseInt(e.target.value) || 1)} className="w-20 py-3 px-1 border-2 border-indigo-200 rounded-xl text-lg font-black text-center text-indigo-700 bg-indigo-50 focus:border-indigo-500 outline-none" dir="ltr" />
                      </div>
                      <div className="flex justify-center">
                        <input type="number" min="0" value={getEffectiveMakingChargePerUnit(cartItem) || ''} onChange={(e) => {
                          setIsManualTotal(false);
                          updateItemMakingCharge(cartItem.cartItemId, parseFloat(e.target.value) || 0);
                        }} className="w-full py-3 px-1 border-2 border-teal-200 rounded-xl text-lg font-black text-center text-teal-700 bg-teal-50 focus:border-teal-500 outline-none" dir="ltr" />
                      </div>
                      <div className="flex justify-center">
                        <input type="number" min="0" value={cartItem.goldPriceToday || ''} onChange={(e) => updateItemGoldPrice(cartItem.cartItemId, parseFloat(e.target.value) || 0)} className="w-full py-3 px-1 border-2 border-amber-200 rounded-xl text-lg font-black text-center text-amber-700 bg-amber-50 focus:border-amber-500 outline-none" placeholder="السعر" dir="ltr" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="inline-block w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xl font-black">{itemTotalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-center">
                        <button onClick={() => removeItem(cartItem.cartItemId)} className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-transparent hover:border-red-600"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {salesError && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <AlertCircle size={18} /><span className="text-sm font-medium">{salesError}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-gold" /> إجمالي الفاتورة
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-lg font-semibold text-gray-500 flex items-center gap-2"><Tag size={18} />إجمالي القطع</span>
              <span className="text-4xl font-black text-charcoal">{cart.reduce((sum, c) => sum + c.soldCount, 0)}</span>
            </div>

            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-lg font-semibold text-gray-500 flex items-center gap-2"><Scale size={18} />إجمالي الذهب</span>
              <span className="text-3xl font-black text-charcoal flex items-baseline gap-1" dir="ltr">{combinedGrossWeight.toFixed(2)} <span className="text-base text-gray-400">g</span></span>
            </div>

            <div className="flex items-center justify-between p-5 bg-gold/5 rounded-xl border border-gold/20">
              <span className="text-lg font-bold text-gold flex items-center gap-2"><DollarSign size={18} />إجمالي المصنعيات</span>
              <span className="text-2xl font-black text-gold flex items-baseline gap-1" dir="ltr">{cart.reduce((sum, c) => sum + (getEffectiveMakingChargePerUnit(c) * c.soldCount), 0).toLocaleString()} <span className="text-base opacity-70">EGP</span></span>
            </div>
          </div>

          {/* الإجمالي الكلي مع دعم التعديل اليدوي */}
          <div className="border-t border-gray-100 pt-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-500">إجمالي السعر النهائي المدفوع (ج.م)</span>
              {isManualTotal ? (
                <span
                  className="text-xs font-bold text-amber-500 cursor-pointer hover:text-amber-700 underline underline-offset-2"
                  onClick={() => setIsManualTotal(false)}
                >✏️ يدوي (فاصلت) — إعادة تلقائي</span>
              ) : (
                <span className="text-xs text-gray-400 font-normal">تلقائي</span>
              )}
            </div>
            <div className="relative w-full">
              <input 
                type="number"
                min="0"
                step="0.01"
                value={isManualTotal ? manualTotalAmount : (autoTotalPrice > 0 ? parseFloat(autoTotalPrice.toFixed(2)) : '')}
                onChange={(e) => {
                  setIsManualTotal(true);
                  setManualTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0);
                }}
                className={`w-full text-5xl font-black text-center py-6 rounded-xl border-2 focus:outline-none transition-colors ${
                  isManualTotal
                    ? 'border-amber-400 bg-amber-50 text-amber-700 focus:border-amber-500'
                    : 'border-gray-100 bg-gray-50 text-charcoal focus:border-gold'
                }`}
                dir="ltr"
                placeholder="0"
              />
              <span className="absolute bottom-6 left-4 text-2xl text-gold font-black pointer-events-none">ج.م</span>
            </div>
            {isManualTotal && autoTotalPrice > 0 && Number(manualTotalAmount) > 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700 flex justify-between">
                <span>الإجمالي الأصلي: {parseFloat(autoTotalPrice.toFixed(2)).toLocaleString()} ج.م</span>
                <span>الفرق: {(Number(manualTotalAmount) - autoTotalPrice).toLocaleString()} ج.م</span>
              </div>
            )}
          </div>

          <button onClick={handleCheckout} disabled={isSubmitting || cart.length === 0 || !selectedCustomer} className="w-full py-5 bg-theme-sales hover:bg-theme-sales/90 text-white font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl">
            {isSubmitting ? <Loader2 size={26} className="animate-spin" /> : <CheckCircle2 size={26} />} إصدار الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};
