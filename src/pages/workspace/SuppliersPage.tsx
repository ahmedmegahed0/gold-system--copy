import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Plus, Search, Loader2, AlertCircle, Edit2, FileText, Phone, MapPin, Trash2, ShieldAlert, Banknote } from 'lucide-react';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { Supplier } from '../../common/types/supplier.types';
import { SupplierFormModal } from './SupplierFormModal';
import { SupplierTransactionModal } from './SupplierTransactionModal';
import { SupplierStatementDrawer } from './SupplierStatementDrawer';

const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onConfirm: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, supplier, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!supplier) return;
    setDeleting(true);
    setError('');
    try {
      await onConfirm(supplier._id || supplier.id || '');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في الحذف، قد يكون للمورد معاملات مرتبطة');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in-95">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-5">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-charcoal mb-2">حذف المورد</h2>
        <p className="text-gray-500 mb-6">هل أنت متأكد من حذف المورد "{supplier?.name}"؟ سيتم منعه فقط إذا كان لديه معاملات سابقة.</p>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}

        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex justify-center items-center">
            {deleting ? <Loader2 size={18} className="animate-spin" /> : 'حذف'}
          </button>
          <button onClick={onClose} className="px-6 py-3 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  );
};

export const SuppliersPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  const {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers,
  } = useSuppliers();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [transactionSupplier, setTransactionSupplier] = useState<Supplier | null>(null);
  const [statementSupplierId, setStatementSupplierId] = useState<string | null>(null);

  const filteredSuppliers = (Array.isArray(suppliers) ? suppliers : []).filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Truck size={24} />
            </div>
            حسابات الموردين
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            إدارة حسابات الورش والموردين، المشتريات، كشوفات الحساب والسداد.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          إضافة مورد جديد
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/30 px-6 py-4 gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم أو رقم الهاتف..."
              className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white transition-all ${
                isRtl ? 'pl-4 pr-10' : 'pr-4 pl-10'
              }`}
            />
            <Search size={16} className={`absolute top-2.5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <span className="font-medium text-sm">جاري التحميل...</span>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Truck size={28} />
              </div>
              <p className="font-medium">لا يوجد موردين مضافين</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sm">المورد</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">رصيد الفلوس</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">رصيد 24K</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">رصيد 21K</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">رصيد 18K</th>
                  <th className="px-6 py-4 font-semibold text-sm text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id || supplier.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-charcoal">{supplier.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone size={10} />
                              <span dir="ltr">{supplier.phone}</span>
                            </span>
                            {supplier.address && (
                              <span className="flex items-center gap-1 max-w-[120px] truncate" title={supplier.address}>
                                <MapPin size={10} />
                                {supplier.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                        supplier.cashBalance > 0 ? 'bg-red-50 text-red-600' : supplier.cashBalance < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'
                      }`} dir="ltr">
                        {Math.abs(supplier.cashBalance).toLocaleString()} ج.م
                        <span className="text-[10px] block opacity-70">
                          {supplier.cashBalance > 0 ? 'لنا' : supplier.cashBalance < 0 ? 'عليه' : 'خالص'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-charcoal" dir="ltr">
                      {(supplier.goldBalances?.karat24 || 0).toFixed(2)}g
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-charcoal" dir="ltr">
                      {(supplier.goldBalances?.karat21 || 0).toFixed(2)}g
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-charcoal" dir="ltr">
                      {(supplier.goldBalances?.karat18 || 0).toFixed(2)}g
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setTransactionSupplier(supplier)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors title='تسجيل معاملة'"
                          title="تسجيل استلام/سداد"
                        >
                          <Banknote size={18} />
                        </button>
                        <button
                          onClick={() => setStatementSupplierId(supplier._id || supplier.id || '')}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors title='كشف الحساب'"
                          title="كشف حساب"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => setEditingSupplier(supplier)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeletingSupplier(supplier)}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <SupplierFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createSupplier}
      />

      {editingSupplier && (
        <SupplierFormModal
          isOpen={true}
          onClose={() => setEditingSupplier(null)}
          onSubmit={(data) => updateSupplier(editingSupplier._id || editingSupplier.id || '', data)}
          initialData={editingSupplier}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        supplier={deletingSupplier}
        onConfirm={deleteSupplier}
      />

      {transactionSupplier && (
        <SupplierTransactionModal
          isOpen={true}
          onClose={() => setTransactionSupplier(null)}
          supplier={transactionSupplier}
          onSubmit={async (data) => {
            await import('../../services/suppliers.service').then(m => m.SuppliersService.recordTransaction(data));
            fetchSuppliers(); 
          }}
        />
      )}

      <SupplierStatementDrawer
        isOpen={!!statementSupplierId}
        onClose={() => setStatementSupplierId(null)}
        supplierId={statementSupplierId}
        isRtl={isRtl}
      />
    </div>
  );
};
