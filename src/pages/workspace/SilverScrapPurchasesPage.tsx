import React, { useState } from 'react';
import { Scale, Loader2, CheckCircle2 } from 'lucide-react';
import { SilverService } from '../../services/silver.service';
import type { BuySilverScrapDto } from '../../common/types/silver.types';

export const SilverScrapPurchasesPage: React.FC = () => {
  const [saving, setSaving] = useState(false);
  
  const [purchaseData, setPurchaseData] = useState({
    karat: 925,
    weight: '',
    pricePerGram: '',
    customerName: '',
    customerPhone: '',
    notes: ''
  });

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
      
      await SilverService.buyScrap(dto);
      
      alert('تم شراء الكسر بنجاح وخصم المبلغ من الخزنة');
      
      // Reset form
      setPurchaseData({
        karat: 925,
        weight: '',
        pricePerGram: '',
        customerName: '',
        customerPhone: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error during scrap purchase:', error);
      alert('حدث خطأ أثناء إتمام العملية');
    } finally {
      setSaving(false);
    }
  };

  const totalPaid = (Number(purchaseData.weight) || 0) * (Number(purchaseData.pricePerGram) || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
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
  );
};
