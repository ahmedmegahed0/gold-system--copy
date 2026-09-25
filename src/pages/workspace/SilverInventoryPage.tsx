import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2, RefreshCw, Edit2, Trash2, PackagePlus } from 'lucide-react';
// Removed useAuth
import { SilverService } from '../../services/silver.service';
import type { SilverItem, CreateSilverItemDto } from '../../common/types/silver.types';
import { CategoryService } from '../../services/category.service';
import type { Category } from '../../common/types/category.types';

export const SilverInventoryPage: React.FC = () => {
  // useAuth() was here but unused
  const [items, setItems] = useState<SilverItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [karatFilter, setKaratFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SilverItem | null>(null);
  
  // New/Edit Item State
  const [newItem, setNewItem] = useState<CreateSilverItemDto>({
    title: '',
    karat: 925,
    category: '',
    weight: 0,
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories independently first so they never disappear
      try {
        const categoriesData = await CategoryService.getCategories();
        setCategories(categoriesData);
      } catch (catErr) {
        console.error('Error fetching categories:', catErr);
      }

      // Then fetch items
      try {
        console.log(`[DEBUG] Fetching with karat=${karatFilter}, category=${categoryFilter}, search=${searchTerm}`);
        const itemsData = await SilverService.getAvailableItems(
          karatFilter ? Number(karatFilter) : undefined, 
          categoryFilter || undefined
        );
        console.log('[DEBUG] Fetched silver items successfully:', itemsData);
        setItems(itemsData || []);
      } catch (itemsErr: any) {
        const errData = itemsErr.response?.data || itemsErr.message || itemsErr;
        console.error('[DEBUG] Error fetching silver items:', errData);
        alert(`خطأ في جلب البيانات:\n${JSON.stringify(errData, null, 2)}`);
        setItems([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [karatFilter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.category || newItem.weight <= 0) return;
    
    try {
      setSaving(true);
      if (selectedItem) {
        await SilverService.updateSilverItem(selectedItem._id || selectedItem.id || '', newItem);
      } else {
        await SilverService.addSilverItem(newItem);
      }
      setIsAddModalOpen(false);
      setSelectedItem(null);
      setNewItem({ title: '', karat: 925, category: '', weight: 0, notes: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding/updating silver item:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (item: SilverItem) => {
    setSelectedItem(item);
    setNewItem({
      title: item.title,
      karat: item.karat,
      category: typeof item.category === 'object' ? item.category._id || item.category.id || '' : item.category,
      weight: item.weight,
      notes: item.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (item: SilverItem) => {
    if (window.confirm(`هل أنت متأكد من حذف القطعة: ${item.title}؟`)) {
      try {
        await SilverService.deleteSilverItem(item._id || item.id || '');
        fetchData();
      } catch (error) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  const [stockToAdd, setStockToAdd] = useState({ weight: 0, quantity: 1 });
  
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || stockToAdd.weight <= 0) return;
    try {
      setSaving(true);
      await SilverService.addStockToExistingItem(selectedItem._id || selectedItem.id || '', {
        addedWeight: stockToAdd.weight,
        addedQuantity: stockToAdd.quantity,
      });
      setIsStockModalOpen(false);
      setSelectedItem(null);
      setStockToAdd({ weight: 0, quantity: 1 });
      fetchData();
    } catch (error) {
      alert('حدث خطأ أثناء زيادة المخزون');
    } finally {
      setSaving(false);
    }
  };

  const karats = [600, 800, 900, 925, 1000];

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">مخزون الفضة</h1>
          <p className="text-gray-500 mt-1">إدارة قطع الفضة المتاحة للبيع</p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setNewItem({ title: '', karat: 925, category: '', weight: 0, notes: '' });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
        >
          <Plus size={20} />
          <span>إضافة قطعة فضة</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم القطعة..."
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-colors"
            />
          </div>
          
          <select
            value={karatFilter}
            onChange={(e) => setKaratFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500/20 text-gray-700 font-medium"
          >
            <option value="">كل العيارات</option>
            {karats.map(k => <option key={k} value={k}>عيار {k}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500/20 text-gray-700 font-medium"
          >
            <option value="">كل التصنيفات</option>
            {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
          </select>
        </div>

        <button 
          onClick={fetchData}
          className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors title='تحديث'"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">اسم القطعة</th>
                <th className="px-6 py-4">العيار</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">الوزن (جرام)</th>
                <th className="px-6 py-4">الكمية</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">ملاحظات</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    لا توجد قطع مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-charcoal">{item.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold">
                        {item.karat}K
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {typeof item.category === 'object' ? item.category.name : item.category}
                    </td>
                    <td className="px-6 py-4 font-bold text-charcoal">
                      {item.weight} جم
                    </td>
                    <td className="px-6 py-4 text-charcoal">
                      {item.quantity || 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg font-medium text-xs ${
                        item.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'SOLD' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status === 'AVAILABLE' ? 'متاح' : item.status === 'SOLD' ? 'مباع' : 'مؤرشف'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {item.notes || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setStockToAdd({ weight: 0, quantity: 1 });
                            setIsStockModalOpen(true);
                          }}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="إضافة للمخزون"
                        >
                          <PackagePlus size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-charcoal mb-6">{selectedItem ? 'تعديل بيانات قطعة الفضة' : 'إضافة قطعة فضة للمخزون'}</h2>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم القطعة</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  placeholder="مثال: دبلة فضة رجالي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العيار</label>
                  <select
                    value={newItem.karat}
                    onChange={e => setNewItem({...newItem, karat: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  >
                    {karats.map(k => <option key={k} value={k}>عيار {k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (جرام)</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={newItem.weight || ''}
                    onChange={e => setNewItem({...newItem, weight: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select
                  required
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                >
                  <option value="">اختر التصنيف...</option>
                  {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={newItem.notes}
                  onChange={e => setNewItem({...newItem, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ القطعة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={() => setIsStockModalOpen(false)} />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-charcoal mb-6">إضافة وزن وكمية للمخزون - {selectedItem.title}</h2>
            
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوزن المضاف (جرام)</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={stockToAdd.weight || ''}
                    onChange={e => setStockToAdd({...stockToAdd, weight: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المضافة (عدد)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={stockToAdd.quantity || ''}
                    onChange={e => setStockToAdd({...stockToAdd, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إضافة وتحديث المخزون'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
