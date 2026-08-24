import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, ShoppingCart, Trash2, CheckCircle, 
  Printer, Ban, FileText, X, XCircle 
} from 'lucide-react';
import { InvoicePrintHeader } from '../../components/print/InvoicePrintHeader';
import { useAuth } from '../../core/context/AuthContext';
import { useBarcodeSales } from '../../hooks/useBarcodeSales';
import { useBarcodeInventory } from '../../hooks/useBarcodeInventory';
import { useCustomers } from '../../hooks/useCustomers';
import type { BarcodeCheckoutDto, BarcodeInvoice } from '../../common/types/barcode-sales.types';
import type { BarcodeItem } from '../../common/types/barcode-inventory.types';

const GoldButton = ({ children, onClick, className = '', icon: Icon, disabled = false }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C9A84C] hover:bg-[#D4AF37] text-white rounded-md transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
);



const ModalOverlay: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; printFriendly?: boolean }> = ({ isOpen, onClose, title, children, printFriendly = false }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${printFriendly ? 'print:static print:inset-auto print:z-auto print:flex-none print:bg-white' : ''}`}>
      <div className={`absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm transition-opacity ${printFriendly ? 'print:hidden' : ''}`} onClick={onClose} />
      <div className={`relative w-full ${printFriendly ? 'max-w-4xl bg-gray-50/50' : 'max-w-2xl bg-white'} mx-4 rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col ${printFriendly ? 'print:max-w-none print:w-full print:mx-0 print:border-none print:shadow-none print:rounded-none print:max-h-none print:block print:p-8 print:bg-white' : ''}`}>
        <div className={`flex items-center justify-between px-8 py-6 border-b border-gray-100 shrink-0 bg-white rounded-t-2xl ${printFriendly ? 'print:hidden' : ''}`}>
          <h2 className="text-xl font-bold text-[#1A1A1A]">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50 transition-colors"><X size={20} /></button>
        </div>
        <div className={`p-8 overflow-y-auto ${printFriendly ? 'print:overflow-visible print:p-0' : ''}`}>{children}</div>
      </div>
    </div>
  );
};

export function BarcodeSalesWorkspacePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [activeTab, setActiveTab] = useState<'CASHIER' | 'INVOICES'>('CASHIER');
  const [viewingInvoice, setViewingInvoice] = useState<BarcodeInvoice | null>(null);

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen text-[#1A1A1A]" dir="rtl">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">مبيعات الباركود بالفواتير</h1>
          <p className="text-gray-500 mt-2">إدارة المبيعات الفورية وسجل الفواتير</p>
        </div>

        <div className="flex p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveTab('CASHIER')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'CASHIER'
                ? 'bg-[#C9A84C] text-white shadow'
                : 'text-gray-600 hover:text-[#C9A84C] hover:bg-gray-50'
            }`}
          >
            <ShoppingCart size={18} /> شاشة الكاشير
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'INVOICES'
                ? 'bg-[#C9A84C] text-white shadow'
                : 'text-gray-600 hover:text-[#C9A84C] hover:bg-gray-50'
            }`}
          >
            <FileText size={18} /> سجل الفواتير
          </button>
        </div>
      </div>

<ModalOverlay isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title="تفاصيل الفاتورة" printFriendly={true}>
        {viewingInvoice && (() => {
          const customerName = (viewingInvoice.customer as any)?.fullName || '---';
          const sellerName = (viewingInvoice.cashier as any)?.fullName || '---';
          const totalGoldWeight = viewingInvoice.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0;
          return (
            <div className="flex flex-col items-center justify-center p-6 print:p-0 text-[#1A1A1A]" dir="rtl">
              <div className="flex justify-between items-center w-full max-w-3xl mb-6 print:hidden gap-4">
                <div className="flex gap-3"></div>
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-[#C9A84C] text-white hover:bg-[#D4AF37] font-bold rounded-xl transition-colors flex items-center gap-2">
                  <Printer size={18} /> طباعة
                </button>
              </div>

              <div className="bg-white p-8 sm:p-12 shadow-xl border border-gray-200 max-w-3xl w-full text-[#1A1A1A] print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm]">
                <InvoicePrintHeader title={`فاتورة مبيعات باركود ${viewingInvoice.status === 'ACTIVE' ? '' : '(ملغاة)'}`} />
                
                <div className="border-2 border-[#C9A84C] rounded-xl p-4 text-center mb-8 bg-[#C9A84C]/5">
                  <span className="text-2xl font-black text-[#1A1A1A]">العميل: {customerName}</span>
                </div>
                
                <div className="flex justify-between items-start mb-8 text-sm font-bold border-b border-gray-200 pb-8">
                  <div className="space-y-3">
                    <div className="flex gap-2"><span className="text-gray-500 w-32">الموظف المسؤول:</span> <span>{sellerName}</span></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">رقم الفاتورة:</span> <span dir="ltr">#{viewingInvoice.invoiceNumber}</span></div>
                    <div className="flex gap-2"><span className="text-gray-500 w-24 text-left">التاريخ:</span> <span>{new Date(viewingInvoice.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
                  </div>
                </div>

                <table className="w-full mb-8 border-collapse border border-[#1A1A1A] text-center text-sm font-bold">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-[#1A1A1A] py-3 px-2">م</th>
                      <th className="border border-[#1A1A1A] py-3 px-2">اسم الصنف</th>
                      <th className="border border-[#1A1A1A] py-3 px-2">الباركود</th>
                      <th className="border border-[#1A1A1A] py-3 px-2">العيار</th>
                      <th className="border border-[#1A1A1A] py-3 px-2">الوزن</th>
                      <th className="border border-[#1A1A1A] py-3 px-2">السعر (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-[#1A1A1A] py-3 px-2">{idx + 1}</td>
                        <td className="border border-[#1A1A1A] py-3 px-2">{item.title || 'قطعة'}</td>
                        <td className="border border-[#1A1A1A] py-3 px-2" dir="ltr">{item.barcode}</td>
                        <td className="border border-[#1A1A1A] py-3 px-2" dir="ltr">{item.karat || 21}k</td>
                        <td className="border border-[#1A1A1A] py-3 px-2">{(item.weight || 0).toFixed(2)}</td>
                        <td className="border border-[#1A1A1A] py-3 px-2" dir="ltr">{(item.itemTotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-8">
                  <div className="border-2 border-[#1A1A1A] rounded-xl p-4 w-72 bg-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                      <span>إجمالي وزن الذهب:</span><span dir="ltr">{totalGoldWeight.toFixed(2)} g</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-lg font-black mt-2">
                      <span>الإجمالي الكلي:</span><span dir="ltr">{(viewingInvoice.totalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center text-gray-500 font-bold text-sm">
                  <p>شكراً لزيارتكم!</p>
                </div>
              </div>
            </div>
          );
        })()}
      </ModalOverlay>
      {activeTab === 'CASHIER' ? <CashierTab setViewingInvoice={setViewingInvoice} /> : <InvoicesTab isOwner={isOwner} setViewingInvoice={setViewingInvoice} />}
      
    </div>
  );
}

// =========================================================================
// CASHIER TAB
// =========================================================================
function CashierTab({ setViewingInvoice }: { setViewingInvoice: any }) {
  const { scanItem } = useBarcodeInventory();
  const { checkoutBarcodeSale } = useBarcodeSales();
  const { customers } = useCustomers();

  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [cart, setCart] = useState<(BarcodeItem & { itemTotal: number })[]>([]);
  const [customerMode, setCustomerMode] = useState<'SELECT' | 'NEW'>('SELECT');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manualTotalAmount, setManualTotalAmount] = useState<number | ''>('');
  const [isManualTotal, setIsManualTotal] = useState(false);

  // Focus scanner initially
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    // Check if already in cart
    if (cart.find(c => c.barcode === scanInput.trim())) {
      setScanError('القطعة موجودة بالفعل في السلة');
      setScanInput('');
      return;
    }

    try {
      setScanError(null);
      const item = await scanItem(scanInput.trim());
      if (item.status !== 'AVAILABLE') {
        setScanError('القطعة مباعة أو غير متاحة');
      } else {
        // Calculate initial total
        // Note: For gold, we typically ask for gold price per gram, but here we can just add it and let them set prices
        const itemTotal = (item.netWeight * 0) + ((item.makingChargePerGram || 0) * item.netWeight);
        setCart(prev => [...prev, { ...item, itemTotal }]);
      }
    } catch (err) {
      setScanError('الباركود غير موجود');
    } finally {
      setScanInput('');
    }
  };

  const removeFromCart = (barcode: string) => {
    setCart(prev => prev.filter(c => c.barcode !== barcode));
  };

  const updateCartItem = (barcode: string, field: 'goldPricePerGram' | 'makingChargePerGram' | 'itemTotal', value: number) => {
    setCart(prev => prev.map(c => {
      if (c.barcode === barcode) {
        const updatedItem = { ...c, [field]: value };
        
        if (field === 'itemTotal') {
          // User edited the item total directly
          // Recalculate making charge: makingCharge = (total / weight) - goldPrice
          const gp = (c as any).goldPricePerGram || 0;
          updatedItem.makingChargePerGram = parseFloat(((value / c.netWeight) - gp).toFixed(2));
          updatedItem.itemTotal = value;
          (updatedItem as any).goldPricePerGram = gp;
        } else {
          // User edited gold price or making charge
          const gp = field === 'goldPricePerGram' ? value : (c as any).goldPricePerGram || 0;
          const mp = field === 'makingChargePerGram' ? value : c.makingChargePerGram || 0;
          updatedItem.itemTotal = parseFloat(((c.netWeight * gp) + (c.netWeight * mp)).toFixed(2));
          (updatedItem as any).goldPricePerGram = gp;
        }
        
        return updatedItem;
      }
      return c;
    }));
  };

  const totalWeight = cart.reduce((sum, item) => sum + item.netWeight, 0);
  const autoGrandTotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  useEffect(() => {
    if (!isManualTotal) {
      setManualTotalAmount(autoGrandTotal > 0 ? parseFloat(autoGrandTotal.toFixed(2)) : '');
    }
  }, [autoGrandTotal, isManualTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload: BarcodeCheckoutDto = {
        items: cart.map(c => {
          let finalMakingCharge = c.makingChargePerGram || 0;
          if (isManualTotal && manualTotalAmount !== '' && autoGrandTotal > 0 && c.netWeight > 0) {
             const ratio = Number(manualTotalAmount) / autoGrandTotal;
             const newItemTotal = c.itemTotal * ratio;
             const gp = (c as any).goldPricePerGram || 0;
             finalMakingCharge = (newItemTotal / c.netWeight) - gp;
          }
          return {
            barcode: c.barcode,
            goldPricePerGram: (c as any).goldPricePerGram || 0,
            makingChargePerGram: parseFloat(finalMakingCharge.toFixed(2)),
          };
        })
      };

      if (customerMode === 'SELECT' && selectedCustomerId) {
        payload.customerId = selectedCustomerId;
      } else if (customerMode === 'NEW' && newCustomerName.trim()) {
        payload.customerName = newCustomerName;
        payload.phoneNumber = newCustomerPhone;
      }

      const invoice = await checkoutBarcodeSale(payload);
      alert('تم إتمام البيع بنجاح! الفاتورة رقم: ' + invoice.invoiceNumber);
      
      // Open print directly
      setViewingInvoice(invoice);

      // Reset
      setCart([]);
      setSelectedCustomerId('');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setCustomerMode('SELECT');
      setIsManualTotal(false);
      setManualTotalAmount('');
      scanInputRef.current?.focus();
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.message || 'خطأ في إتمام البيع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left: Cart & Scanner */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[600px]">
        
        {/* Scanner */}
        <form onSubmit={handleScan} className="relative mb-6">
          <input
            ref={scanInputRef}
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="مرر الباركود هنا..."
            className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none font-mono text-lg text-left"
            dir="ltr"
          />
          <ScanLine className="absolute right-4 top-4.5 text-[#C9A84C]" size={24} />
          {scanError && <p className="text-red-500 text-sm mt-2">{scanError}</p>}
        </form>

        {/* Cart Table */}
        <div className="flex-1 overflow-auto border rounded-xl border-gray-100">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium sticky top-0">
              <tr>
                <th className="px-4 py-3">الباركود</th>
                <th className="px-4 py-3">القطعة</th>
                <th className="px-4 py-3">الوزن</th>
                <th className="px-4 py-3">سعر الذهب/ج</th>
                <th className="px-4 py-3">المصنعية/ج</th>
                <th className="px-4 py-3">الإجمالي</th>
                <th className="px-4 py-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    السلة فارغة. قم بمسح باركود لإضافة قطع.
                  </td>
                </tr>
              ) : (
                cart.map(item => {
                  let displayItemTotal = item.itemTotal;
                  let displayMakingCharge = item.makingChargePerGram || 0;
                  
                  if (isManualTotal && manualTotalAmount !== '' && autoGrandTotal > 0 && item.netWeight > 0) {
                     const ratio = Number(manualTotalAmount) / autoGrandTotal;
                     displayItemTotal = item.itemTotal * ratio;
                     const gp = (item as any).goldPricePerGram || 0;
                     displayMakingCharge = (displayItemTotal / item.netWeight) - gp;
                  }

                  return (
                    <tr key={item.barcode} className="hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-none shadow-sm">
                      <td className="px-4 py-4 font-mono text-sm font-bold text-amber-700 bg-amber-50/40">{item.barcode}</td>
                      <td className="px-4 py-4 font-bold text-base text-gray-800">{item.title}</td>
                      <td className="px-4 py-4 font-black text-lg text-gray-700 bg-gray-100/50" dir="ltr">{item.netWeight}g</td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          min="0"
                          className="w-28 p-2 border-2 border-blue-200 bg-blue-50 text-blue-800 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all shadow-inner"
                          value={(item as any).goldPricePerGram || ''}
                          onChange={(e) => {
                            setIsManualTotal(false);
                            updateCartItem(item.barcode, 'goldPricePerGram', parseFloat(e.target.value) || 0);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input 
                          type="number"
                          min="0"
                          className={`w-28 p-2 border-2 rounded-lg text-center font-bold text-lg focus:ring-2 outline-none transition-all shadow-inner ${isManualTotal ? 'bg-amber-100 text-amber-700 border-amber-300 focus:ring-amber-400' : 'bg-purple-50 text-purple-800 border-purple-200 focus:ring-purple-400 focus:border-purple-400'}`}
                          value={isManualTotal ? displayMakingCharge.toFixed(2) : (item.makingChargePerGram || '')}
                          onChange={(e) => {
                            setIsManualTotal(false);
                            updateCartItem(item.barcode, 'makingChargePerGram', parseFloat(e.target.value) || 0);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 font-bold text-[#1A1A1A]">
                        <input 
                          type="number"
                          min="0"
                          step="0.01"
                          className={`w-32 p-2 border-2 rounded-xl text-center font-black text-xl focus:ring-2 outline-none transition-all shadow-inner ${isManualTotal ? 'bg-amber-100 text-amber-700 border-amber-300 focus:ring-amber-400' : 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                          value={isManualTotal ? displayItemTotal.toFixed(2) : (item.itemTotal || '')}
                          onChange={(e) => {
                            setIsManualTotal(false);
                            updateCartItem(item.barcode, 'itemTotal', parseFloat(e.target.value) || 0);
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => removeFromCart(item.barcode)} className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-transparent hover:border-red-600 shadow-sm">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Right: Checkout Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
          <ShoppingCart className="text-[#C9A84C]" /> ملخص الفاتورة
        </h2>

        {/* Customer Selector */}
        <div className="mb-8">
          <div className="flex bg-gray-50 p-1 rounded-lg mb-4">
            <button
              onClick={() => setCustomerMode('SELECT')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                customerMode === 'SELECT' ? 'bg-white text-[#C9A84C] shadow-sm' : 'text-gray-500'
              }`}
            >
              عميل مسجل
            </button>
            <button
              onClick={() => setCustomerMode('NEW')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                customerMode === 'NEW' ? 'bg-white text-[#C9A84C] shadow-sm' : 'text-gray-500'
              }`}
            >
              عميل جديد
            </button>
          </div>

          {customerMode === 'SELECT' ? (
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C9A84C] outline-none"
            >
              <option value="">-- اختر عميلاً --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.fullName} ({c.phoneNumber})</option>
              ))}
            </select>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="اسم العميل (اختياري)"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#C9A84C]"
              />
              <input
                type="tel"
                placeholder="رقم الهاتف (اختياري)"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#C9A84C] text-left"
                dir="ltr"
              />
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="mt-auto bg-[#1A1A1A] text-white p-6 rounded-xl shadow-lg border border-[#333]">
          <div className="flex justify-between items-center mb-4 text-gray-300">
            <span>عدد القطع</span>
            <span className="font-bold text-white text-lg">{cart.length}</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-gray-300">
            <span>إجمالي الجرامات</span>
            <span className="font-bold text-[#C9A84C] text-lg">{totalWeight.toFixed(2)}g</span>
          </div>
          <hr className="border-gray-700 my-4" />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>المبلغ المطلوب</span>
              {isManualTotal ? (
                <span
                  className="text-xs font-bold text-amber-500 cursor-pointer hover:text-amber-700 underline underline-offset-2"
                  onClick={() => setIsManualTotal(false)}
                >✏️ يدوي (عودة للتلقائي)</span>
              ) : (
                <span className="text-xs text-gray-400 font-normal">تلقائي</span>
              )}
            </div>
            <div className="relative mt-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={isManualTotal ? manualTotalAmount : (autoGrandTotal > 0 ? parseFloat(autoGrandTotal.toFixed(2)) : '')}
                onChange={(e) => {
                  setIsManualTotal(true);
                  setManualTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value) || 0);
                }}
                className={`w-full text-3xl font-black text-center py-4 rounded-xl border-2 focus:outline-none transition-colors ${
                  isManualTotal
                    ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] focus:border-[#D4AF37]'
                    : 'border-transparent bg-transparent text-[#C9A84C] focus:border-transparent'
                }`}
                dir="ltr"
                placeholder="0"
              />
              <span className="absolute bottom-4 left-4 text-xl text-[#C9A84C] font-black pointer-events-none">ج.م</span>
            </div>
            {isManualTotal && autoGrandTotal > 0 && Number(manualTotalAmount) > 0 && (
              <div className="mt-2 p-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-lg text-xs font-bold text-[#C9A84C] flex justify-between">
                <span>الأصلي: {parseFloat(autoGrandTotal.toFixed(2)).toLocaleString()} ج.م</span>
                <span dir="ltr">{(Number(manualTotalAmount) - autoGrandTotal).toLocaleString()} ج.م (فرق)</span>
              </div>
            )}
          </div>
        </div>

        <GoldButton
          className="w-full mt-6 py-4 text-lg"
          icon={CheckCircle}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'جاري التنفيذ...' : 'إتمام البيع وطباعة الفاتورة'}
        </GoldButton>

      </div>

      
    </div>
  );
}

// =========================================================================
// INVOICES TAB
// =========================================================================
function InvoicesTab({ isOwner, setViewingInvoice }: { isOwner: boolean, setViewingInvoice: any }) {
  const { invoices, isLoading, fetchInvoices, cancelBarcodeInvoice } = useBarcodeSales();
  
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCancel = async (invoice: BarcodeInvoice) => {
    if (!window.confirm(`هل أنت متأكد من إلغاء الفاتورة ${invoice.invoiceNumber}؟ سيتم استرجاع القطع للمخزن وتسوية الخزينة.`)) return;
    try {
      await cancelBarcodeInvoice(invoice._id);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطأ في إلغاء الفاتورة');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">رقم الفاتورة</th>
              <th className="px-6 py-4">تاريخ البيع</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4">القطع</th>
              <th className="px-6 py-4">الإجمالي (ج.م)</th>
              <th className="px-6 py-4">الكاشير</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">جاري تحميل الفواتير...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">لا توجد فواتير سابقة</td>
              </tr>
            ) : (
              invoices.map(invoice => (
                <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-[#1A1A1A]">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(invoice.createdAt).toLocaleString('ar-EG')}</td>
                  <td className="px-6 py-4 font-medium">
                    {typeof invoice.customer === 'object' ? invoice.customer.fullName : invoice.customer}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-full text-sm font-medium">{invoice.items.length} قطع</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#C9A84C]">{(invoice.totalAmount || 0).toLocaleString('ar-EG')}</td>
                  <td className="px-6 py-4 text-gray-600">{invoice.cashier?.fullName}</td>
                  <td className="px-6 py-4">
                    {invoice.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                        نشطة
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                        ملغاة
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="عرض / طباعة"
                        onClick={() => setViewingInvoice(invoice)}
                        className="p-1.5 text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-md transition-colors"
                      >
                        <Printer size={18} />
                      </button>
                      
                      {isOwner && invoice.status === 'ACTIVE' && (
                        <button
                          title="إلغاء الفاتورة"
                          onClick={() => handleCancel(invoice)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
