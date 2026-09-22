import React, { useState, useEffect, useCallback } from 'react';
import { Vault, Loader2, ArrowUpCircle, ArrowDownCircle, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { SilverService } from '../../services/silver.service';
import type { AdjustSilverSafeDto } from '../../common/types/silver.types';

export const SilverSafePage: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const [actionType, setActionType] = useState<'NONE' | 'ADJUST' | 'RESET'>('NONE');
  const [adjustData, setAdjustData] = useState({
    amount: '',
    password: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SilverService.getSilverSafeBalance();
      setBalance(data.currentCashBalance || 0);
    } catch (error) {
      console.error('Error fetching silver safe balance:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustData.password) return;
    
    try {
      setSaving(true);
      const dto: AdjustSilverSafeDto = {
        amount: Number(adjustData.amount) || 0,
        securityPassword: adjustData.password,
        reason: adjustData.reason || undefined,
      };
      
      if (actionType === 'ADJUST') {
        await SilverService.adjustSafeBalance(dto);
        alert('تم تعديل رصيد الخزنة بنجاح');
      } else if (actionType === 'RESET') {
        await SilverService.resetSafe(dto);
        alert('تم تصفير الخزنة بنجاح');
      }
      
      setActionType('NONE');
      setAdjustData({ amount: '', password: '', reason: '' });
      fetchBalance();
    } catch (error: any) {
      console.error('Error modifying safe:', error);
      alert(error.response?.data?.message || 'كلمة المرور غير صحيحة أو حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            <Vault className="text-slate-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">خزنة الفضة</h1>
            <p className="text-gray-500 mt-1">الرصيد النقدي الخاص بمعاملات الفضة منفصلاً تماماً عن الذهب</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Vault size={160} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-slate-400 font-medium mb-2">إجمالي الرصيد النقدي بالخزنة</h2>
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-slate-400 my-4" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-white">
                  {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl text-slate-400 font-bold">ج.م</span>
              </div>
            )}
            
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-lg font-medium text-sm">
                <ArrowUpCircle size={18} />
                <span>إيرادات المبيعات</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-lg font-medium text-sm">
                <ArrowDownCircle size={18} />
                <span>مدفوعات الكسر</span>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
                <Lock className="text-amber-500" size={20} />
                <span>إدارة رصيد الخزنة (المدير فقط)</span>
              </h2>
            </div>
            
            <div className="p-6">
              {actionType === 'NONE' ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setActionType('ADJUST')}
                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-charcoal transition-colors flex items-center justify-center gap-2"
                  >
                    تعديل الرصيد يدوياً
                  </button>
                  <button
                    onClick={() => setActionType('RESET')}
                    className="flex-1 py-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    تصفير الخزنة بالكامل
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAction} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-charcoal">
                      {actionType === 'ADJUST' ? 'تعديل الرصيد يدوياً' : 'تصفير الخزنة بالكامل'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActionType('NONE')}
                      className="text-sm text-gray-500 hover:text-charcoal"
                    >
                      إلغاء
                    </button>
                  </div>
                  
                  {actionType === 'RESET' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p>أنت على وشك تصفير خزنة الفضة بالكامل. سيتم تسجيل هذه العملية في السجل وحفظها باسمك. هل أنت متأكد؟</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {actionType === 'ADJUST' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرصيد الجديد (ج.م)</label>
                        <input
                          type="number"
                          required
                          value={adjustData.amount}
                          onChange={e => setAdjustData({...adjustData, amount: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                    )}
                    
                    <div className={actionType === 'RESET' ? "col-span-2" : ""}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">سبب التعديل / ملاحظات</label>
                      <input
                        type="text"
                        value={adjustData.reason}
                        onChange={e => setAdjustData({...adjustData, reason: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        placeholder="مثال: جرد أسبوعي أو سحب أرباح"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">كلمة مرور الخزنة الآمنة</label>
                      <input
                        type="password"
                        required
                        value={adjustData.password}
                        onChange={e => setAdjustData({...adjustData, password: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        placeholder="كلمة السر الخاصة لتأكيد العمليات الحساسة"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className={`w-full py-4 rounded-xl font-bold transition-all text-white flex items-center justify-center gap-2 mt-4 ${
                      actionType === 'RESET' 
                        ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 shadow-lg shadow-red-600/20' 
                        : 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد وحفظ'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
