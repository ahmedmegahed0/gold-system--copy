import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, AlertCircle, Banknote, Box, History, Calendar } from 'lucide-react';
import { SuppliersService } from '../../services/suppliers.service';
import type { SupplierTransaction } from '../../common/types/supplier.types';

const DrawerOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isRtl: boolean;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, isRtl, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl border-gray-100 flex flex-col animate-in ${
        isRtl ? 'slide-in-from-left mr-auto border-r' : 'slide-in-from-right ml-auto border-l'
      }`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-charcoal hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </div>
    </div>
  );
};

export const SupplierStatementDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  supplierId: string | null;
  isRtl: boolean;
}> = ({ isOpen, onClose, supplierId, isRtl }) => {
  const { i18n } = useTranslation();
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && supplierId) {
      const fetchStatement = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await SuppliersService.getSupplierStatement(supplierId);
          setStatement(data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'فشل في جلب كشف الحساب');
        } finally {
          setLoading(false);
        }
      };
      fetchStatement();
    } else {
      setStatement(null);
    }
  }, [isOpen, supplierId]);

  return (
    <DrawerOverlay isOpen={isOpen} onClose={onClose} title={`كشف حساب المورد`} isRtl={isRtl}>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <span className="font-medium text-sm">جاري التحميل...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : statement ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-charcoal">{statement.supplier.name}</h3>
              <p className="text-sm text-gray-500" dir="ltr">{statement.supplier.phone}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-xl">
              {statement.supplier.name.charAt(0)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <span className="text-sm font-semibold text-gray-400 flex items-center gap-2">
              <Banknote size={16} />
              رصيد الحساب المفتوح (النقدية)
            </span>
            <span className={`text-3xl font-bold flex items-baseline gap-1 ${statement.currentOpenBalance.cashBalance < 0 ? 'text-red-500' : 'text-charcoal'}`} dir="ltr">
              {statement.currentOpenBalance.cashBalance?.toLocaleString() || '0'}
              <span className="text-base font-medium text-gray-400">EGP</span>
            </span>
            <span className="text-xs text-gray-400">
              {statement.currentOpenBalance.cashBalance > 0 ? 'له عندنا (مستحقات للمورد)' : statement.currentOpenBalance.cashBalance < 0 ? 'عليه لنا (مديونية)' : 'خالص'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-600/60 uppercase">رصيد 24K</span>
              <span className="text-lg font-bold text-amber-700 flex items-baseline gap-1">
                {(statement.currentOpenBalance.goldBalances.karat24 || 0).toFixed(2)}
                <span className="text-xs font-medium text-amber-600/60">g</span>
              </span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-600/60 uppercase">رصيد 21K</span>
              <span className="text-lg font-bold text-amber-700 flex items-baseline gap-1">
                {(statement.currentOpenBalance.goldBalances.karat21 || 0).toFixed(2)}
                <span className="text-xs font-medium text-amber-600/60">g</span>
              </span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-amber-600/60 uppercase">رصيد 18K</span>
              <span className="text-lg font-bold text-amber-700 flex items-baseline gap-1">
                {(statement.currentOpenBalance.goldBalances.karat18 || 0).toFixed(2)}
                <span className="text-xs font-medium text-amber-600/60">g</span>
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-charcoal mb-4 flex items-center gap-2">
              <History size={16} className="text-amber-500" />
              سجل المعاملات
            </h3>

            {statement.statementHistory && statement.statementHistory.length > 0 ? (
              <div className="space-y-4">
                {statement.statementHistory.map((txn: SupplierTransaction) => (
                  <div key={txn._id || txn.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {txn.type === 'GOODS_RECEIVE' && <span className="text-xs font-black px-2 py-1 rounded bg-blue-100 text-blue-700">استلام بضاعة</span>}
                        {txn.type === 'PAYMENT' && <span className="text-xs font-black px-2 py-1 rounded bg-emerald-100 text-emerald-700">سداد</span>}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1" dir="ltr">
                        <Calendar size={12} />
                        {new Date(txn.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>

                    {txn.receivedItems && txn.receivedItems.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-xs font-bold text-gray-500 block mb-2">البضاعة المستلمة:</span>
                        {txn.receivedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm mb-1 last:mb-0">
                            <span className="font-semibold text-charcoal">{item.weight}g ({item.karat}K)</span>
                            <span className="text-gray-500" dir="ltr">{(item.totalPrice)?.toLocaleString()} EGP</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {(((txn.paymentDetails?.cashPaid ?? 0) > 0) || ((txn.paymentDetails?.manufacturingFeePaid ?? 0) > 0) || (txn.paymentDetails?.scrapPaid && txn.paymentDetails.scrapPaid.length > 0)) && (
                      <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-600 block mb-2">المدفوعات:</span>
                        {(txn.paymentDetails?.cashPaid ?? 0) > 0 && (
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-charcoal">كاش</span>
                            <span className="font-bold text-emerald-600" dir="ltr">{txn.paymentDetails?.cashPaid?.toLocaleString()} EGP</span>
                          </div>
                        )}
                        {(txn.paymentDetails?.manufacturingFeePaid ?? 0) > 0 && (
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-charcoal">مصنعية كاش</span>
                            <span className="font-bold text-emerald-600" dir="ltr">{txn.paymentDetails?.manufacturingFeePaid?.toLocaleString()} EGP</span>
                          </div>
                        )}
                        {txn.paymentDetails?.scrapPaid?.map((scrap, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm mb-1 last:mb-0">
                            <span className="font-medium text-charcoal">كسر {scrap.weight}g ({scrap.karat}K)</span>
                            <span className="font-bold text-emerald-600" dir="ltr">{scrap.totalValue?.toLocaleString()} EGP</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <Box size={24} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">لا توجد معاملات بعد</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DrawerOverlay>
  );
};
