import React, { useState, useRef, useEffect } from 'react';
import { 
  ScanLine, ShoppingCart, Trash2, CheckCircle, 
  Printer, Ban, FileText 
} from 'lucide-react';
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


export function BarcodeSalesWorkspacePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [activeTab, setActiveTab] = useState<'CASHIER' | 'INVOICES'>('CASHIER');

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

      {activeTab === 'CASHIER' ? <CashierTab /> : <InvoicesTab isOwner={isOwner} />}
      
    </div>
  );
}

// =========================================================================
// CASHIER TAB
// =========================================================================
function CashierTab() {
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
      if (item.status !== 'IN_STOCK') {
        setScanError('القطعة مباعة أو غير متاحة');
      } else {
        // Calculate initial total
        // Note: For gold, we typically ask for gold price per gram, but here we can just add it and let them set prices
        const itemTotal = (item.netWeight * 0) + ((item.makingChargesPerGram || 0) * item.netWeight);
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

  const updateCartItem = (barcode: string, field: 'goldPricePerGram' | 'makingChargesPerGram', value: number) => {
    setCart(prev => prev.map(c => {
      if (c.barcode === barcode) {
        const updatedItem = { ...c, [field]: value };
        // Recalculate itemTotal
        const gp = field === 'goldPricePerGram' ? value : (c as any).goldPricePerGram || 0;
        const mp = field === 'makingChargesPerGram' ? value : c.makingChargesPerGram || 0;
        updatedItem.itemTotal = (c.netWeight * gp) + (c.netWeight * mp);
        // Also mutate the object to store goldPricePerGram temporarily
        (updatedItem as any).goldPricePerGram = gp;
        return updatedItem;
      }
      return c;
    }));
  };

  const totalWeight = cart.reduce((sum, item) => sum + item.netWeight, 0);
  const grandTotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload: BarcodeCheckoutDto = {
        items: cart.map(c => ({
          barcode: c.barcode,
          goldPricePerGram: (c as any).goldPricePerGram || 0,
          makingChargePerGram: c.makingChargesPerGram || 0,
        }))
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
      printInvoice(invoice);

      // Reset
      setCart([]);
      setSelectedCustomerId('');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setCustomerMode('SELECT');
      scanInputRef.current?.focus();
    } catch (err: any) {
      alert(err.response?.data?.message || 'خطأ في إتمام البيع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const printInvoice = (invoice: BarcodeInvoice) => {
    // Basic thermal print window generator
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;

    w.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة ${invoice.invoiceNumber}</title>
          <style>
            @media print { @page { margin: 0; } }
            body { font-family: sans-serif; width: 300px; margin: 0 auto; padding: 20px 10px; font-size: 12px; }
            .center { text-align: center; }
            .border-b { border-bottom: 1px dashed #000; margin: 10px 0; padding-bottom: 10px; }
            .flex-between { display: flex; justify-content: space-between; margin-bottom: 5px; }
            table { width: 100%; text-align: right; border-collapse: collapse; margin-top: 10px; }
            th, td { border-bottom: 1px dotted #ccc; padding: 5px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center border-b">
            <h2>فاتورة مبيعات</h2>
            <p>رقم الفاتورة: ${invoice.invoiceNumber}</p>
            <p>التاريخ: ${new Date(invoice.createdAt).toLocaleString('ar-EG')}</p>
          </div>
          <div class="border-b">
            <div class="flex-between"><span>العميل:</span> <strong>${typeof invoice.customer === 'object' ? invoice.customer.fullName : invoice.customer}</strong></div>
            <div class="flex-between"><span>الكاشير:</span> <strong>${invoice.cashier.fullName}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>القطعة</th>
                <th>الوزن</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.title} (${item.karat}K)</td>
                  <td>${item.weight}g</td>
                  <td>${item.itemTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="border-b" style="margin-top: 15px;">
            <div class="flex-between bold" style="font-size: 14px;">
              <span>الإجمالي الكلي:</span>
              <span>${invoice.totalAmount.toFixed(2)} ج.م</span>
            </div>
          </div>
          <div class="center" style="margin-top: 20px;">
            <p>شكراً لزيارتكم!</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    w.document.close();
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
                cart.map(item => (
                  <tr key={item.barcode} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-[#C9A84C]">{item.barcode}</td>
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">{item.netWeight}g</td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        min="0"
                        className="w-24 p-1 border rounded text-center"
                        value={(item as any).goldPricePerGram || ''}
                        onChange={(e) => updateCartItem(item.barcode, 'goldPricePerGram', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number"
                        min="0"
                        className="w-24 p-1 border rounded text-center"
                        value={item.makingChargesPerGram || ''}
                        onChange={(e) => updateCartItem(item.barcode, 'makingChargesPerGram', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1A1A1A]">{item.itemTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => removeFromCart(item.barcode)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
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
          <div className="flex justify-between items-center text-xl font-bold">
            <span>المبلغ المطلوب</span>
            <span className="text-[#C9A84C] text-2xl">{grandTotal.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م</span>
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
function InvoicesTab({ isOwner }: { isOwner: boolean }) {
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

  const printInvoice = (invoice: BarcodeInvoice) => {
    // Basic thermal print window generator
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) return;

    w.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة ${invoice.invoiceNumber}</title>
          <style>
            @media print { @page { margin: 0; } }
            body { font-family: sans-serif; width: 300px; margin: 0 auto; padding: 20px 10px; font-size: 12px; }
            .center { text-align: center; }
            .border-b { border-bottom: 1px dashed #000; margin: 10px 0; padding-bottom: 10px; }
            .flex-between { display: flex; justify-content: space-between; margin-bottom: 5px; }
            table { width: 100%; text-align: right; border-collapse: collapse; margin-top: 10px; }
            th, td { border-bottom: 1px dotted #ccc; padding: 5px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center border-b">
            <h2>فاتورة مبيعات ${invoice.status === 'CANCELLED' ? '(ملغاة)' : ''}</h2>
            <p>رقم الفاتورة: ${invoice.invoiceNumber}</p>
            <p>التاريخ: ${new Date(invoice.createdAt).toLocaleString('ar-EG')}</p>
          </div>
          <div class="border-b">
            <div class="flex-between"><span>العميل:</span> <strong>${typeof invoice.customer === 'object' ? invoice.customer.fullName : invoice.customer}</strong></div>
            <div class="flex-between"><span>الكاشير:</span> <strong>${invoice.cashier.fullName}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>القطعة</th>
                <th>الوزن</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.title} (${item.karat}K)</td>
                  <td>${item.weight}g</td>
                  <td>${item.itemTotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="border-b" style="margin-top: 15px;">
            <div class="flex-between bold" style="font-size: 14px;">
              <span>الإجمالي الكلي:</span>
              <span>${invoice.totalAmount.toFixed(2)} ج.م</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    w.document.close();
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
                  <td className="px-6 py-4 font-bold text-[#C9A84C]">{invoice.totalAmount.toLocaleString('ar-EG')}</td>
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
                        onClick={() => printInvoice(invoice)}
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
