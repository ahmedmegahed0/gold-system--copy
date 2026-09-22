import React, { useState, useEffect } from 'react';

import { X, Loader2, Plus, AlertCircle, Banknote, Trash2, Box } from 'lucide-react';
import type { Supplier, RecordSupplierTransactionDto, ReceivedItemDto, ScrapPaidDto } from '../../common/types/supplier.types';

const ModalOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm flex items-center justify-between px-8 py-6 border-b border-gray-100 z-10 shrink-0">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

// useAuth removed

export const SupplierTransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordSupplierTransactionDto) => Promise<void>;
  supplier: Supplier | null;
}> = ({ isOpen, onClose, onSubmit, supplier }) => {
  // useAuth removed
  const [type, setType] = useState<'GOODS_RECEIVE' | 'PAYMENT'>('GOODS_RECEIVE');
  
  const [receivedItems, setReceivedItems] = useState<ReceivedItemDto[]>([]);
  const [cashPaid, setCashPaid] = useState<number | ''>('');
  const [manufacturingFeePaid, setManufacturingFeePaid] = useState<number | ''>('');
  const [scrapPaid, setScrapPaid] = useState<ScrapPaidDto[]>([]);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Temp states for adding received item
  const [recvKarat, setRecvKarat] = useState<number | ''>(21);
  const [recvWeight, setRecvWeight] = useState<number | ''>('');
  const [recvFee, setRecvFee] = useState<number | ''>('');

  // Temp states for adding scrap paid
  const [scrapKarat, setScrapKarat] = useState<number | ''>(21);
  const [scrapWeight, setScrapWeight] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      setType('GOODS_RECEIVE');
      setReceivedItems([]);
      setCashPaid('');
      setManufacturingFeePaid('');
      setScrapPaid([]);
      setNotes('');
      setFormError('');
    }
  }, [isOpen]);

  const addReceivedItem = () => {
    if (!recvKarat || !recvWeight || recvFee === '') return;
    const item: ReceivedItemDto = {
      karat: Number(recvKarat),
      weight: Number(recvWeight),
      manufacturingFeePerGram: Number(recvFee) || 0,
    };
    setReceivedItems([...receivedItems, item]);
    setRecvWeight('');
    setRecvFee('');
  };

  const addScrapItem = () => {
    if (!scrapKarat || !scrapWeight) return;
    const item: ScrapPaidDto = {
      karat: Number(scrapKarat),
      weight: Number(scrapWeight),
    };
    setScrapPaid([...scrapPaid, item]);
    setScrapWeight('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;

    if (type === 'GOODS_RECEIVE' && receivedItems.length === 0) {
      setFormError('يرجى إضافة بند بضاعة واحد على الأقل');
      return;
    }

    if (type === 'PAYMENT' && !cashPaid && !manufacturingFeePaid && scrapPaid.length === 0) {
      setFormError('يرجى إدخال أي قيمة للسداد (نقدي أو كسر)');
      return;
    }

    setSaving(true);
    setFormError('');

    const payload: any = {
      supplierId: supplier._id || supplier.id || '',
      type,
      notes: notes.trim() || undefined,
    };
    
    console.log("--- SENDING PAYLOAD ---", payload);

    if (receivedItems.length > 0) {
      payload.receivedItems = receivedItems;
    }

    const hasPayment = Number(manufacturingFeePaid) > 0 || scrapPaid.length > 0;
    if (hasPayment) {
      payload.paymentDetails = {
        manufacturingFeePaid: Number(manufacturingFeePaid) || undefined,
        scrapPaid: scrapPaid.length > 0 ? scrapPaid : undefined,
      };
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المعاملة');
    } finally {
      setSaving(false);
    }
  };

  const totalManufacturingValue = receivedItems.reduce((sum, item) => sum + (item.weight * (item.manufacturingFeePerGram || 0)), 0);


  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? `تسجيل معاملة - ${supplier.name}` : 'تسجيل معاملة'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        {/* Transaction Type */}
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            type === 'GOODS_RECEIVE' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-200'
          }`}>
            <input type="radio" name="txnType" value="GOODS_RECEIVE" checked={type === 'GOODS_RECEIVE'} onChange={() => setType('GOODS_RECEIVE')} className="hidden" />
            <Box size={20} />
            <span className="font-bold">استلام بضاعة (مشتريات)</span>
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            type === 'PAYMENT' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-200'
          }`}>
            <input type="radio" name="txnType" value="PAYMENT" checked={type === 'PAYMENT'} onChange={() => setType('PAYMENT')} className="hidden" />
            <Banknote size={20} />
            <span className="font-bold">سداد للمورد</span>
          </label>
        </div>

        {/* Received Items Section */}
        {type === 'GOODS_RECEIVE' && (
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h3 className="font-bold text-charcoal flex items-center gap-2">
              <Box size={18} className="text-amber-500" />
              البضاعة المستلمة
            </h3>
            
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">العيار</label>
                <select value={recvKarat} onChange={e => setRecvKarat(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value={24}>24K</option>
                  <option value={21}>21K</option>
                  <option value={18}>18K</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">الوزن</label>
                <input type="number" step="0.01" value={recvWeight} onChange={e => setRecvWeight(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white" placeholder="جرام" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">المصنعية/ج</label>
                <input type="number" step="1" value={recvFee} onChange={e => setRecvFee(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white" placeholder="ج.م" />
              </div>
              <button type="button" onClick={addReceivedItem} disabled={!recvKarat || !recvWeight || recvFee === ''} className="p-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-bold disabled:opacity-50">
                <Plus size={20} />
              </button>
            </div>

            {receivedItems.length > 0 && (
              <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm text-right">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 font-semibold">العيار</th>
                      <th className="px-4 py-2 font-semibold">الوزن</th>
                      <th className="px-4 py-2 font-semibold">أجر الجرام (مصنعية)</th>
                      <th className="px-4 py-2 font-semibold">إجمالي المصنعية</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receivedItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2" dir="ltr">{item.karat}K</td>
                        <td className="px-4 py-2">{item.weight}g</td>
                        <td className="px-4 py-2">{item.manufacturingFeePerGram} ج.م</td>
                        <td className="px-4 py-2 font-bold">{(item.weight * (item.manufacturingFeePerGram || 0)).toLocaleString()} ج.م</td>
                        <td className="px-4 py-2">
                          <button type="button" onClick={() => setReceivedItems(receivedItems.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end pt-2 text-sm">
              <span className="font-bold text-gray-500">إجمالي المصنعية المطلوبة: <span className="text-amber-600 text-lg mx-1">{totalManufacturingValue.toLocaleString()}</span> ج.م</span>
            </div>
          </div>
        )}

        {/* Payments Section */}
        <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <h3 className="font-bold text-charcoal flex items-center gap-2">
            <Banknote size={18} className="text-emerald-500" />
            {type === 'GOODS_RECEIVE' ? 'سداد مع الاستلام (اختياري)' : 'تفاصيل السداد'}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">مصنعية كاش مدفوعة (ج.م)</label>
              <input type="number" step="1" value={manufacturingFeePaid} onChange={e => setManufacturingFeePaid(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-emerald-200 rounded-lg text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500" placeholder="0" />
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-200/50">
            <h4 className="text-sm font-semibold text-emerald-800 mb-3">سداد بذهب كسر</h4>
            <div className="flex items-end gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">العيار</label>
                <select value={scrapKarat} onChange={e => setScrapKarat(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-emerald-200 rounded-lg text-sm bg-white">
                  <option value={24}>24K</option>
                  <option value={21}>21K</option>
                  <option value={18}>18K</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">الوزن (جرام)</label>
                <input type="number" step="0.01" value={scrapWeight} onChange={e => setScrapWeight(e.target.value ? Number(e.target.value) : '')} className="w-full p-2.5 border border-emerald-200 rounded-lg text-sm bg-white" placeholder="0.00" />
              </div>
              <button type="button" onClick={addScrapItem} disabled={!scrapKarat || !scrapWeight} className="p-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-bold disabled:opacity-50">
                <Plus size={20} />
              </button>
            </div>

            {scrapPaid.length > 0 && (
              <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm text-right">
                  <thead className="bg-emerald-50 text-emerald-700">
                    <tr>
                      <th className="px-4 py-2 font-semibold">العيار</th>
                      <th className="px-4 py-2 font-semibold">الوزن الكسري</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50">
                    {scrapPaid.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2" dir="ltr">{item.karat}K</td>
                        <td className="px-4 py-2 font-bold">{item.weight}g</td>
                        <td className="px-4 py-2">
                          <button type="button" onClick={() => setScrapPaid(scrapPaid.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-2 text-sm">
            <span className="font-bold text-emerald-700">إجمالي النقدية المدفوعة: <span className="text-xl mx-1">{Number(manufacturingFeePaid || 0).toLocaleString()}</span> ج.م</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">ملاحظات (اختياري)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl text-sm" placeholder="أي ملاحظات حول العملية..." />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            تسجيل المعاملة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
};
