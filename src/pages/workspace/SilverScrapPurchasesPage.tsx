import React, { useState } from 'react';
import { Scale, Loader2, CheckCircle2, Printer, X } from 'lucide-react';
import { SilverService } from '../../services/silver.service';
import type { BuySilverScrapDto, SilverScrapPurchase } from '../../common/types/silver.types';
import { PaperInvoiceLayout } from '../../components/print/PaperInvoiceLayout';
import { useAuth } from '../../core/context/AuthContext';

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

export const SilverScrapPurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [purchaseData, setPurchaseData] = useState({
    karat: 925,
    weight: '',
    pricePerGram: '',
    customerName: '',
    customerPhone: '',
    notes: ''
  });

  const [purchasedInvoice, setPurchasedInvoice] = useState<SilverScrapPurchase | null>(null);

  const karats = [600, 800, 900, 925, 1000];

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseData.weight || !purchaseData.pricePerGram) return;
    
    try {
      setSaving(true);
      const dto: BuySilverScrapDto = {
        karat: Number(purchaseData.karat),
        weight: Number(purchaseData.weight),
        pricePerGram: Number(purchaseData.pricePerGram),
        customerName: purchaseData.customerName || undefined,
        customerPhone: purchaseData.customerPhone || undefined,
        notes: purchaseData.notes || undefined,
      };
      
      const response = await SilverService.buyScrap(dto);
      
      // Reset form
      setPurchaseData({
        karat: 925,
        weight: '',
        pricePerGram: '',
        customerName: '',
        customerPhone: '',
        notes: ''
      });
      
      // Show Invoice
      setPurchasedInvoice(response);
      
    } catch (error: any) {
      console.error('Error during scrap purchase:', error.response?.data || error);
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        alert(Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage);
      } else {
        alert('حدث خطأ أثناء إتمام العملية');
      }
    } finally {
      setSaving(false);
    }
  };

  const totalPaid = (Number(purchaseData.weight) || 0) * (Number(purchaseData.pricePerGram) || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      <div className={purchasedInvoice ? 'print:hidden' : ''}>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <Scale className="text-rose-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">شراء كسر فضة</h1>
            <p className="text-gray-500 mt-1">تسجيل شراء كسر الفضة من الزبائن وخصم المبلغ من الخزنة</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handlePurchase} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العيار</label>
                <select
                  value={purchaseData.karat}
                  onChange={e => setPurchaseData({...purchaseData, karat: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                >
                  {karats.map(k => <option key={k} value={k}>عيار {k}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوزن (جرام)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={purchaseData.weight}
                  onChange={e => setPurchaseData({...purchaseData, weight: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سعر الجرام الواحد (وقت الشراء)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="0.1"
                  step="0.01"
                  value={purchaseData.pricePerGram}
                  onChange={e => setPurchaseData({...purchaseData, pricePerGram: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-xl font-bold text-left"
                  dir="ltr"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ج.م</span>
              </div>
            </div>

            <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
              <span className="text-gray-600 font-bold">إجمالي المبلغ المدفوع للزبون:</span>
              <span className="text-3xl font-black text-rose-600">
                {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
              </span>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <h3 className="font-bold text-charcoal mb-4">بيانات العميل (اختياري)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                  <input
                    type="text"
                    value={purchaseData.customerName}
                    onChange={e => setPurchaseData({...purchaseData, customerName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={purchaseData.customerPhone}
                    onChange={e => setPurchaseData({...purchaseData, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  value={purchaseData.notes}
                  onChange={e => setPurchaseData({...purchaseData, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || totalPaid <= 0}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 flex items-center justify-center gap-2 mt-8"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              <span className="text-lg">تأكيد الشراء</span>
            </button>
          </form>
        </div>
      </div>

      {/* Invoice Modal */}
      <ModalOverlay 
        isOpen={!!purchasedInvoice} 
        onClose={() => setPurchasedInvoice(null)} 
        title="إيصال شراء كسر فضة"
        printFriendly={true}
      >
        {purchasedInvoice && (() => {
          const customerName = purchasedInvoice.customerName || '---';
          const invoiceNumber = (purchasedInvoice as any)._id?.substring(0, 8)?.toUpperCase() || '---';
          const dateStr = new Date((purchasedInvoice as any).createdAt || new Date()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
          const sellerName = user?.fullName || '---';

          return (
            <div className="flex flex-col items-center justify-center p-6 print:p-0">
              <div className="flex justify-between items-center w-full max-w-3xl mb-6 print:hidden gap-4">
                <div className="px-6 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  تم شراء الكسر بنجاح
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-charcoal text-white hover:bg-black font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Printer size={18} />
                  طباعة الإيصال
                </button>
              </div>

              <PaperInvoiceLayout
                invoiceNumber={invoiceNumber}
                date={dateStr}
                customerName={customerName}
                sellerName={sellerName}
                totalAmount={purchasedInvoice.totalPaid}
                items={[{
                  name: 'كسر فضة',
                  karat: purchasedInvoice.karat.toString(),
                  weight: purchasedInvoice.weight,
                  price: purchasedInvoice.totalPaid
                }]}
              />
            </div>
          );
        })()}
      </ModalOverlay>
    </div>
  );
};

