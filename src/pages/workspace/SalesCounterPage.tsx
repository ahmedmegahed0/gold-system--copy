import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import { useSales } from '../../hooks/useSales';
import { useInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import type { InventoryItem } from '../../common/types/inventory.types';
import type { Customer } from '../../common/types/customer.types';

import type { Invoice } from '../../common/types/sales.types';
import { useAuth } from '../../core/context/AuthContext';



export const SalesCounterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { user } = useAuth();

  const { createSale, error: salesError } = useSales();
  const { fetchInventory, inventory } = useInventory();
  const { customers, fetchCustomers } = useCustomers({ status: 'ACTIVE', search: '' });

  // ─── Local States ───
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const itemDropdownRef = useRef<HTMLFormElement>(null);

  // ─── Click Outside Logic ───
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
  
  // Cart Items
  type CartItem = {
    cartItemId: string;
    item: InventoryItem;
    hasTag: boolean;
    selectedTagWeight?: number;
    goldPriceToday: number;
    makingChargesPerGram: number;
    soldGrossWeight: number;
  };
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<Invoice | null>(null);

  // ─── Data Fetching ───
  useEffect(() => {
    fetchInventory();
    fetchCustomers();
  }, [fetchInventory, fetchCustomers]);

  // ─── Customer Selection Logic ───
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

  // ─── Item Scanner Logic ───
  const filteredInventory = useMemo(() => {
    if (!barcodeInput) return inventory;
    const query = barcodeInput.toLowerCase();
    return inventory.filter(
      (inv) =>
        (inv._id && inv._id.toLowerCase().includes(query)) ||
        (inv.id && inv.id.toLowerCase().includes(query)) ||
        (inv.title && inv.title.toLowerCase().includes(query))
    );
  }, [inventory, barcodeInput]);

  const handleItemSelect = (foundItem: InventoryItem) => {
    const initialGrossWeight = foundItem.totalGrossWeight / (foundItem.initialCount || 1);
    const defaultTagWeight = foundItem.tagDetails && foundItem.tagDetails.length > 0 
      ? foundItem.tagDetails[0].weight 
      : 0.06;
    setCart((prev) => [
      ...prev,
      {
        cartItemId: Date.now().toString() + Math.random().toString(),
        item: foundItem,
        hasTag: true,
        selectedTagWeight: defaultTagWeight,
        goldPriceToday: 0,
        makingChargesPerGram: 0,
        soldGrossWeight: initialGrossWeight,
      },
    ]);
    setBarcodeInput('');
    setShowItemDropdown(false);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim();
    // Search in inventory by title or ID
    const foundItem = inventory.find(
      (inv) => inv._id === query || inv.id === query || inv.title.includes(query)
    );

    if (foundItem) {
      handleItemSelect(foundItem);
    } else {
      alert(t('sales.errors.itemNotFound'));
    }
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.cartItemId !== cartItemId));
  };

  const updateItemGoldPrice = (cartItemId: string, price: number) => {
    setCart((prev) =>
      prev.map((c) => (c.cartItemId === cartItemId ? { ...c, goldPriceToday: price } : c))
    );
  };

  const updateItemMakingCharge = (cartItemId: string, charge: number) => {
    setCart((prev) =>
      prev.map((c) => (c.cartItemId === cartItemId ? { ...c, makingChargesPerGram: charge } : c))
    );
  };

  const toggleItemTag = (cartItemId: string) => {
    setCart((prev) =>
      prev.map((c) => (c.cartItemId === cartItemId ? { ...c, hasTag: !c.hasTag } : c))
    );
  };

  const updateItemTagWeight = (cartItemId: string, weight: number) => {
    setCart((prev) =>
      prev.map((c) => (c.cartItemId === cartItemId ? { ...c, selectedTagWeight: weight, hasTag: true } : c))
    );
  };

  const updateItemWeight = (cartItemId: string, weight: number) => {
    setCart((prev) =>
      prev.map((c) => (c.cartItemId === cartItemId ? { ...c, soldGrossWeight: weight } : c))
    );
  };

  // ─── Computations ───
  const totalItems = cart.length;
  // Weight calculations based on soldGrossWeight which can be modified by user
  const combinedGrossWeight = cart.reduce((sum, c) => sum + (c.soldGrossWeight || 0), 0);
  const combinedNetWeight = cart.reduce(
    (sum, c) => {
      const tagW = c.selectedTagWeight ?? (c.item.tagDetails && c.item.tagDetails.length > 0 ? c.item.tagDetails[0].weight : 0.06);
      return sum + (c.hasTag ? Math.max(0, (c.soldGrossWeight || 0) - tagW) : (c.soldGrossWeight || 0));
    },
    0
  );
  const totalPrice = cart.reduce((sum, c) => {
    const tagW = c.selectedTagWeight ?? (c.item.tagDetails && c.item.tagDetails.length > 0 ? c.item.tagDetails[0].weight : 0.06);
    const net = c.hasTag ? Math.max(0, (c.soldGrossWeight || 0) - tagW) : (c.soldGrossWeight || 0);
    return sum + net * ((c.goldPriceToday || 0) + (c.makingChargesPerGram || 0));
  }, 0);

  // ─── Submission ───
  const handleCheckout = async () => {
    if (!selectedCustomer) {
      alert(t('sales.errors.selectCustomer'));
      return;
    }
    if (cart.length === 0) {
      alert(t('sales.errors.emptyCart'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer: selectedCustomer._id || selectedCustomer.id || '',
        items: cart.map((c) => ({
          inventoryItem: c.item._id || c.item.id || '',
          soldGrossWeight: c.soldGrossWeight || 0,
          hasTag: c.hasTag,
          tagWeight: c.selectedTagWeight,
          goldPriceToday: c.goldPriceToday || 0,
          makingChargesPerGram: c.makingChargesPerGram || 0,
        })),
      };

      const invoice = await createSale(payload);
      setSuccessInvoice(invoice);
      
      // Refresh inventory behind the scenes
      fetchInventory();
    } catch {
      // Error is handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSale = () => {
    setSuccessInvoice(null);
    setCart([]);
    setSelectedCustomer(null);
    setBarcodeInput('');
  };

  // ─── Printable Invoice Preview Modal ───
  if (successInvoice) {
    const customerName = typeof successInvoice.customer === 'object' ? successInvoice.customer.fullName : '---';
    const invoiceNumber = successInvoice.invoiceNumber || successInvoice._id?.substring(0,8);
    const dateStr = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    const sellerName = user ? (user.role === 'OWNER' ? 'Owner' : (user.fullName || 'النظام')) : 'النظام';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 print:min-h-0 print:block print:p-0">
        
        {/* Actions (Hidden on Print) */}
        <div className="flex gap-4 mb-6 print:hidden w-full max-w-3xl justify-center">
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-200">
            <CheckCircle2 size={20} />
            {t('sales.success.title')}
          </div>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-charcoal hover:bg-black text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer size={18} />
            {t('sales.actions.print')}
          </button>
          <button
            onClick={handleResetSale}
            className="px-6 py-2 border border-gray-200 hover:bg-white text-gray-600 font-bold rounded-xl transition-colors shadow-sm"
          >
            {t('sales.actions.newSale')}
          </button>
        </div>

        {/* The Printable A4 Sheet */}
        <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-charcoal print:shadow-none print:border-none print:p-0 mx-auto" dir="rtl">
          
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-charcoal pb-6">
            <h1 className="text-3xl font-black mb-3">فاتورة مبيعات ذهب - نظام GMS</h1>

          </div>

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
              <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الفاتورة:</span> <span dir="ltr">#{invoiceNumber}</span></div>
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
              {cart.map((cartItem, idx) => {
                const item = cartItem.item;
                const tagW = cartItem.selectedTagWeight ?? (item.tagDetails && item.tagDetails.length > 0 ? item.tagDetails[0].weight : 0.06);
                const unitNet = cartItem.hasTag ? Math.max(0, cartItem.soldGrossWeight - tagW) : cartItem.soldGrossWeight;
                const itemTotal = unitNet * ((cartItem.goldPriceToday || 0) + (cartItem.makingChargesPerGram || 0));
                return (
                  <tr key={cartItem.cartItemId}>
                    <td className="border border-charcoal py-3 px-2">{idx + 1}</td>
                    <td className="border border-charcoal py-3 px-2">{item.title}</td>
                    <td className="border border-charcoal py-3 px-2" dir="ltr">{item.karat}K</td>
                    <td className="border border-charcoal py-3 px-2">{unitNet.toFixed(2)}</td>
                    <td className="border border-charcoal py-3 px-2" dir="ltr">{cartItem.goldPriceToday?.toLocaleString()}</td>
                    <td className="border border-charcoal py-3 px-2" dir="ltr">{itemTotal.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end mt-8">
            <div className="border-2 border-charcoal rounded-xl p-4 w-64 bg-gray-50">
              <div className="flex justify-between items-center text-lg font-black">
                <span>الإجمالي الكلي:</span>
                <span dir="ltr">{successInvoice.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 items-start">
      {/* ─── LEFT PANEL: Invoice Builder ─── */}
      <div className="w-full lg:flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
              <div className="p-2 bg-theme-sales/10 text-theme-sales rounded-lg">
                <ShoppingCart size={20} />
              </div>
              {t('sales.builder.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Customer Selector */}
            <div className="relative">
              <label className="block text-base font-semibold text-charcoal mb-2">{t('sales.builder.customer')}</label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 border border-gold/40 bg-gold/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                      <User size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-charcoal">{selectedCustomer.fullName}</span>
                      <span className="text-sm text-gray-500">{selectedCustomer.phoneNumber}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative" ref={customerDropdownRef}>
                  <Search size={16} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder={t('sales.builder.searchCustomer')}
                    className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                  {showCustomerDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(c => (
                          <div
                            key={c._id || c.id}
                            onClick={() => handleCustomerSelect(c)}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-sm text-charcoal">{c.fullName}</span>
                            <span className="text-xs text-gray-500" dir="ltr">{c.phoneNumber}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-400">
                          {t('sales.builder.noCustomers')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Barcode Scanner */}
            <div>
              <label className="block text-base font-semibold text-charcoal mb-2">{t('sales.builder.scanItem')}</label>
              <form onSubmit={handleBarcodeSubmit} className="relative" ref={itemDropdownRef}>
                <Hash size={16} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  placeholder={t('sales.builder.scanPlaceholder')}
                  className={`w-full py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all bg-gray-50/50 focus:bg-white ${
                    isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  }`}
                  dir="ltr"
                />
                {showItemDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map(item => {
                        const totalW = item.totalGrossWeight || 0;
                        const count = item.initialCount || 1;
                        const unitWeight = (totalW / count).toFixed(2);
                        return (
                          <div
                            key={item._id || item.id}
                            onClick={() => handleItemSelect(item)}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0"
                          >
                            <span className="font-bold text-sm text-charcoal">{item.title}</span>
                            <span className="text-xs text-gray-500 flex gap-2 mt-1" dir="ltr">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-charcoal">ID: {(item._id || item.id)?.substring(0,8)}</span>
                              <span className="bg-gold/10 px-1.5 py-0.5 rounded text-[10px] font-bold text-gold">{item.karat}K</span>
                              <span className="bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500">{unitWeight}g</span>
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">
                        {t('sales.errors.itemNotFound')}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Cart Table */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div 
              className="bg-charcoal px-4 py-5 grid gap-4 text-lg font-bold text-white text-center items-center rounded-t-xl"
              style={{ gridTemplateColumns: "2fr 0.8fr 1.2fr 0.8fr 1fr 1.6fr 1.2fr 1.5fr 0.5fr" }}
            >
              <div className="text-right">الصنف</div>
              <div>العيار</div>
              <div>الوزن المباشر</div>
              <div>تيكت؟</div>
              <div>الصافي</div>
              <div>سعر الجرام اليوم</div>
              <div>المصنعية/ج</div>
              <div>الإجمالي</div>
              <div></div>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {cart.length === 0 ? (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center">
                  <ShoppingCart size={32} className="mb-3 opacity-20" />
                  <span className="text-sm font-medium">{t('sales.builder.emptyCart')}</span>
                </div>
              ) : (
                cart.map((cartItem, idx) => {
                  const item = cartItem.item;
                  const tagW = cartItem.selectedTagWeight ?? (item.tagDetails && item.tagDetails.length > 0 ? item.tagDetails[0].weight : 0.06);
                  const unitGross = cartItem.soldGrossWeight;
                  const unitNet = cartItem.hasTag ? Math.max(0, unitGross - tagW) : unitGross;

                  return (
                    <div 
                      key={cartItem.cartItemId} 
                      className={`px-4 py-6 grid gap-4 items-center transition-colors text-center border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8faf8]'} hover:bg-theme-sales/5`}
                      style={{ gridTemplateColumns: "2fr 0.8fr 1.2fr 0.8fr 1fr 1.6fr 1.2fr 1.5fr 0.5fr" }}
                    >
                      <div className="flex flex-col text-right overflow-hidden">
                        <span className="text-xl font-black text-theme-sales truncate" title={item.title}>{item.title}</span>
                        <span className="text-sm font-bold text-gray-400 mt-1" dir="ltr">ID: {(item._id || item.id)?.substring(0,8)}</span>
                      </div>
                      <div>
                        <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-lg font-black whitespace-nowrap shadow-sm" dir="ltr">{item.karat}K</span>
                      </div>
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cartItem.soldGrossWeight === 0 ? '' : cartItem.soldGrossWeight}
                          onChange={(e) => updateItemWeight(cartItem.cartItemId, parseFloat(e.target.value) || 0)}
                          className="w-full max-w-[120px] py-3 px-1 border-2 border-indigo-200 rounded-xl text-lg font-black text-center text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 bg-indigo-50 shadow-inner"
                          dir="ltr"
                        />
                      </div>
                      <div className="flex justify-center">
                        {item.tagDetails && item.tagDetails.length > 1 ? (
                          <select
                            value={cartItem.hasTag ? cartItem.selectedTagWeight?.toString() : 'none'}
                            onChange={(e) => {
                              if (e.target.value === 'none') {
                                if (cartItem.hasTag) toggleItemTag(cartItem.cartItemId);
                              } else {
                                updateItemTagWeight(cartItem.cartItemId, parseFloat(e.target.value));
                              }
                            }}
                            className="py-2 px-1 border-2 border-theme-sales/30 rounded-xl text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-theme-sales/50 bg-white"
                          >
                            <option value="none">بدون تيكت</option>
                            {item.tagDetails.map((tag, i) => (
                              <option key={i} value={tag.weight}>
                                تيكت {tag.weight}g
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input 
                             type="checkbox" 
                             checked={cartItem.hasTag} 
                             onChange={() => toggleItemTag(cartItem.cartItemId)} 
                             className="w-6 h-6 text-theme-sales border-gray-300 rounded focus:ring-theme-sales cursor-pointer" 
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xl font-black shadow-sm">{unitNet.toFixed(2)}</span>
                        {cartItem.hasTag && <span className="text-xs font-bold text-rose-500 mt-1">-{tagW}g خصم</span>}
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={cartItem.goldPriceToday || ''}
                          onChange={(e) => updateItemGoldPrice(cartItem.cartItemId, parseFloat(e.target.value) || 0)}
                          className="w-full py-3 px-1 border-2 border-amber-200 rounded-xl text-lg font-black text-center text-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 bg-amber-50 shadow-inner"
                          placeholder="سعر الجرام"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={cartItem.makingChargesPerGram || ''}
                          onChange={(e) => updateItemMakingCharge(cartItem.cartItemId, parseFloat(e.target.value) || 0)}
                          className="w-full py-3 px-1 border-2 border-teal-200 rounded-xl text-lg font-black text-center text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 bg-teal-50 shadow-inner"
                          placeholder="مصنعية"
                          dir="ltr"
                        />
                      </div>
                      <div className="text-2xl font-black text-blue-700 bg-blue-50 py-3 rounded-xl border border-blue-200 shadow-sm">
                        {(unitNet * ((cartItem.goldPriceToday || 0) + (cartItem.makingChargesPerGram || 0))).toLocaleString()}
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => removeItem(cartItem.cartItemId)}
                          className="p-3 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-600"
                          title={t('sales.actions.remove')}
                        >
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

      {/* ─── RIGHT PANEL: Summary Frame ─── */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
            <DollarSign size={18} className="text-gold" />
            {t('sales.summary.title')}
          </h3>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-base font-semibold text-gray-500 flex items-center gap-2">
                <Tag size={16} />
                {t('sales.summary.totalItems')}
              </span>
              <span className="text-xl font-black text-charcoal">{totalItems}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-base font-semibold text-gray-500 flex items-center gap-2">
                <Scale size={16} />
                {t('sales.summary.grossWeight')}
              </span>
              <span className="text-xl font-black text-charcoal flex items-baseline gap-1" dir="ltr">
                {combinedGrossWeight.toFixed(2)} <span className="text-sm text-gray-400">g</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gold/5 rounded-xl border border-gold/20">
              <span className="text-base font-bold text-gold flex items-center gap-2">
                <Scale size={16} />
                {t('sales.summary.netWeight')}
              </span>
              <span className="text-xl font-black text-gold flex items-baseline gap-1" dir="ltr">
                {combinedNetWeight.toFixed(2)} <span className="text-sm opacity-70">g</span>
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-8">
            <span className="block text-base font-bold text-gray-500 mb-2">{t('sales.summary.finalPrice')}</span>
            <div className="text-5xl font-black text-charcoal flex items-end justify-center gap-2 bg-gray-50 py-5 rounded-xl border border-gray-100" dir="ltr">
              {totalPrice.toLocaleString()} <span className="text-2xl text-gold">{t('customers.currency')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0 || !selectedCustomer}
            className="w-full py-4 bg-theme-sales hover:bg-theme-sales/90 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
            {isSubmitting ? t('sales.actions.submitting') : t('sales.actions.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};
