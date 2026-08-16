import React, { useState, useEffect } from 'react';
import { useSafe } from '../../hooks/useSafe';
import { 
  ShieldAlert, 
  Wallet, 
  Settings, 
  RefreshCcw, 
  Edit3, 
  Key, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const SafeControlPanel: React.FC = () => {
  const {
    safeStatus,
    isLoading,
    error,
    fetchSafeStatus,
    setupPassword,
    adjustBalance,
    resetSafe,
  } = useSafe();

  useEffect(() => {
    fetchSafeStatus();
  }, [fetchSafeStatus]);

  // Modals state
  const [activeModal, setActiveModal] = useState<'NONE' | 'SETUP_PASSWORD' | 'ADJUST_BALANCE' | 'RESET_SAFE'>('NONE');

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const closeModal = () => {
    setActiveModal('NONE');
    setCurrentPassword('');
    setNewPassword('');
    setBalanceInput('');
    setReasonInput('');
    setActionError('');
    setSuccessMsg('');
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await setupPassword({
        currentSafePassword: currentPassword || undefined,
        newSafePassword: newPassword,
      });
      setSuccessMsg('تم إعداد باسورد الخزنة بنجاح.');
      fetchSafeStatus();
      setTimeout(closeModal, 2000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await adjustBalance({
        newBalance: Number(balanceInput),
        safePassword: currentPassword,
        reason: reasonInput,
      });
      setSuccessMsg('تم تعديل رصيد الخزنة بنجاح.');
      setTimeout(closeModal, 2000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSafe = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);
    try {
      await resetSafe({
        safePassword: currentPassword,
      });
      setSuccessMsg('تم تصفير الخزنة بنجاح.');
      setTimeout(closeModal, 2000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !safeStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="font-bold">جاري تحميل حالة الخزنة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 font-bold">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Main Safe Status Card */}
      <div className="bg-white rounded-3xl shadow-sm border-2 border-gold/20 p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-tr-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-4">
            <Wallet size={32} />
          </div>
          <h2 className="text-2xl font-black text-charcoal mb-2">رصيد الخزنة الفعلي الحالي</h2>
          <div className="flex items-baseline justify-center gap-2 mb-4" dir="ltr">
            <span className="text-5xl sm:text-7xl font-black text-gold tracking-tight">
              {safeStatus?.balance?.toLocaleString() || 0}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-500">ج.م</span>
          </div>
          {safeStatus?.lastUpdatedAction && (
            <div className={`mt-4 px-6 py-4 rounded-xl border-2 font-bold text-center w-full max-w-2xl ${
              safeStatus.lastUpdatedAction.actionType === 'INFLOW' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              <div className="text-xl mb-2">
                آخر حركة: {safeStatus.lastUpdatedAction.actionType === 'INFLOW' ? 'إيداع' : 'سحب'}
              </div>
              <div className="text-lg opacity-90 leading-relaxed">
                التفاصيل: {safeStatus.lastUpdatedAction.reason}
              </div>
              <div className="text-sm mt-3 opacity-75 font-medium text-gray-500 bg-white/50 px-3 py-1 rounded inline-block" dir="ltr">
                {new Date(safeStatus.lastUpdatedAction.timestamp).toLocaleString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveModal('SETUP_PASSWORD')}
          className="bg-white hover:bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors shadow-sm group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Key size={24} />
          </div>
          <span className="font-bold text-charcoal">إعداد باسورد الخزنة</span>
          <span className="text-xs text-gray-400 text-center">الرقم السري للعمليات الحساسة</span>
        </button>

        <button
          onClick={() => setActiveModal('ADJUST_BALANCE')}
          className="bg-white hover:bg-gray-50 border border-gray-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors shadow-sm group"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Edit3 size={24} />
          </div>
          <span className="font-bold text-charcoal">تعديل الرصيد يدوياً</span>
          <span className="text-xs text-gray-400 text-center">تسوية فروقات الجرد (يتطلب باسورد)</span>
        </button>

        <button
          onClick={() => setActiveModal('RESET_SAFE')}
          className="bg-white hover:bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors shadow-sm group"
        >
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <RefreshCcw size={24} />
          </div>
          <span className="font-bold text-red-700">تصفير الخزنة</span>
          <span className="text-xs text-red-400 text-center">بدء دورة مالية جديدة (يتطلب باسورد)</span>
        </button>
      </div>

      {/* Modals Overlay */}
      {activeModal !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-charcoal">
                {activeModal === 'SETUP_PASSWORD' && 'إعداد باسورد الخزنة'}
                {activeModal === 'ADJUST_BALANCE' && 'تعديل رصيد الخزنة'}
                {activeModal === 'RESET_SAFE' && 'تصفير الخزنة بالكامل'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-charcoal transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {successMsg ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-emerald-600 space-y-4">
                  <CheckCircle2 size={48} className="animate-bounce" />
                  <p className="font-bold text-lg">{successMsg}</p>
                </div>
              ) : (
                <form 
                  onSubmit={
                    activeModal === 'SETUP_PASSWORD' ? handleSetupPassword :
                    activeModal === 'ADJUST_BALANCE' ? handleAdjustBalance :
                    handleResetSafe
                  } 
                  className="space-y-4"
                >
                  {actionError && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 flex items-start gap-2">
                      <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                      {actionError}
                    </div>
                  )}

                  {activeModal === 'SETUP_PASSWORD' && (
                    <>
                      {safeStatus?.safePassword && (
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">الباسورد الحالي</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                            placeholder="أدخل الباسورد الحالي"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">الباسورد الجديد</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                          placeholder="أدخل باسورد قوي جديد"
                        />
                      </div>
                    </>
                  )}

                  {activeModal === 'ADJUST_BALANCE' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">الرصيد الفعلي الجديد</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={balanceInput}
                            onChange={e => setBalanceInput(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none font-bold text-lg"
                            placeholder="0.00"
                            dir="ltr"
                          />
                          <span className="absolute right-4 top-3.5 text-gray-400 font-bold">ج.م</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">سبب التعديل</label>
                        <input
                          type="text"
                          required
                          value={reasonInput}
                          onChange={e => setReasonInput(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                          placeholder="مثال: تسوية فروقات جرد"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">باسورد الخزنة</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                          placeholder="أدخل باسورد الخزنة للتأكيد"
                        />
                      </div>
                    </>
                  )}

                  {activeModal === 'RESET_SAFE' && (
                    <>
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold leading-relaxed mb-4 text-center">
                        تحذير: سيتم تصفير الرصيد الفعلي للخزنة ليكون (0). هذا الإجراء لا رجعة فيه ويهدف لبدء دورة مالية جديدة.
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">باسورد الخزنة</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                          placeholder="أدخل باسورد الخزنة للتأكيد"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-4 mt-6 border-t border-gray-100 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all ${
                        activeModal === 'RESET_SAFE' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-gold hover:bg-[#b59540]'
                      } disabled:opacity-50`}
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                      تأكيد وحفظ
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-charcoal font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
