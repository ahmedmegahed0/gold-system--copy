import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { SilverService } from '../../services/silver.service';
import type { SilverItem, QuickSilverSaleDto } from '../../common/types/silver.types';

export const SilverSalesCounterPage: React.FC = () => {
  const [items, setItems] = useState<SilverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<SilverItem | null>(null);
  
  const [saleData, setSaleData] = useState({
    pricePerGram: '',
    customerName: '',
    customerPhone: '',
    notes: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SilverService.getAvailableItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching silver items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !saleData.pricePerGram) return;
    
    try {
      setSaving(true);
      const dto: QuickSilverSaleDto = {
        itemId: selectedItem._id || selectedItem.id || '',
        pricePerGram: Number(saleData.pricePerGram),
        customerName: saleData.customerName || undefined,
        customerPhone: saleData.customerPhone || undefined,
        notes: saleData.notes || undefined,
      };
      
      await SilverService.quickSale(dto);
      
      alert('تم البيع بنجاح وتسجيل المبلغ في الخزنة');
      
      // Reset form
      setSelectedItem(null);
      setSaleData({ pricePerGram: '', customerName: '', customerPhone: '', notes: '' });
      fetchItems();
    } catch (error) {
      console.error('Error during sale:', error);
      alert('حدث خطأ أثناء البيع');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.includes(search) || item.karat.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">بيع الفضة (سريع)</h1>
          <p className="text-gray-500 mt-1">اختر قطعة للبيع ليتم تسجيلها آلياً في الخزنة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ابحث عن قطعة (الاسم أو العيار)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                لا توجد قطع متاحة للبيع
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div 
                    key={item._id || item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedItem?._id === item._id || selectedItem?.id === item.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-md' 
                        : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-charcoal">{item.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                        {item.karat}K
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">الوزن:</span>
                      <span className="font-bold text-charcoal">{item.weight} جم</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sale Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start sticky top-6">
          <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
            <ShoppingCart className="text-emerald-500" />
            <span>تفاصيل البيع</span>
          </h2>

          {!selectedItem ? (
            <div className="text-center py-12 text-gray-400">
              يرجى اختيار قطعة للبيع من القائمة
            </div>
          ) : (
            <form onSubmit={handleSale} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                <h3 className="font-bold text-emerald-800 mb-2">{selectedItem.title}</h3>
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>الوزن: {selectedItem.weight} جم</span>
                  <span>العيار: {selectedItem.karat}K</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">سعر الجرام (وقت البيع)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.01"
                    value={saleData.pricePerGram}
                    onChange={e => setSaleData({...saleData, pricePerGram: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold text-left"
                    dir="ltr"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ج.م</span>
                </div>
              </div>

              {saleData.pricePerGram && Number(saleData.pricePerGram) > 0 && (
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-600 font-medium">الإجمالي المطلوب:</span>
                  <span className="text-xl font-black text-emerald-600">
                    {(Number(saleData.pricePerGram) * selectedItem.weight).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل (اختياري)</label>
                  <input
                    type="text"
                    value={saleData.customerName}
                    onChange={e => setSaleData({...saleData, customerName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    value={saleData.customerPhone}
                    onChange={e => setSaleData({...saleData, customerPhone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
                  <input
                    type="text"
                    value={saleData.notes}
                    onChange={e => setSaleData({...saleData, notes: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !saleData.pricePerGram || Number(saleData.pricePerGram) <= 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2 mt-6"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>إتمام البيع</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
