import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flame,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Scale,
  History,
  FileText
} from 'lucide-react';
import { useMelting } from '../../hooks/useMelting';
import type { CreateMeltingDto } from '../../common/types/melting.types';

export const MeltingPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const { history, isLoading, error, fetchHistory, processMelting } = useMelting();

  const [formData, setFormData] = useState<CreateMeltingDto>({
    karat: 21,
    rawWeightBeforeMelting: 0,
    netWeightAfterMelting: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rawWeightBeforeMelting <= 0 || formData.netWeightAfterMelting <= 0) {
      setLocalError('يجب أن تكون الأوزان أكبر من صفر');
      return;
    }
    if (formData.netWeightAfterMelting > formData.rawWeightBeforeMelting) {
      setLocalError('لا يمكن أن يكون الوزن الصافي أكبر من الوزن القائم قبل التسييح');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');
    setSuccessMsg('');

    try {
      await processMelting(formData);
      setSuccessMsg('تم تسجيل عملية التسييح وحساب الهالك بنجاح');
      setFormData({
        karat: 21,
        rawWeightBeforeMelting: 0,
        netWeightAfterMelting: 0,
        notes: ''
      });
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setLocalError(err.message || 'حدث خطأ أثناء التسييح');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedLoss = Math.max(0, formData.rawWeightBeforeMelting - formData.netWeightAfterMelting).toFixed(2);
  const calculatedLossPercentage = formData.rawWeightBeforeMelting > 0 
    ? ((parseFloat(calculatedLoss) / formData.rawWeightBeforeMelting) * 100).toFixed(2) 
    : '0.00';

  return (
    <div className="space-y-6 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600">
              <Flame size={24} />
            </div>
            تسييح وسبك الذهب الكسر
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            تحويل الذهب الكسر إلى سبايك أو ذهب نقي وحساب نسبة الهالك
          </p>
        </div>
      </div>

      {(error || localError) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{localError || error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-bold text-charcoal mb-6 flex items-center gap-2">
            <Scale className="text-orange-500" size={20} />
            تسجيل عملية تسييح جديدة
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">عيار الكسر المُراد تسييحه</label>
              <select
                value={formData.karat}
                onChange={(e) => setFormData({ ...formData, karat: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-bold"
              >
                <option value={18}>عيار 18</option>
                <option value={21}>عيار 21</option>
                <option value={24}>عيار 24</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوزن القائم قبل التسييح (جرام)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.rawWeightBeforeMelting || ''}
                onChange={(e) => setFormData({ ...formData, rawWeightBeforeMelting: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-left font-bold text-lg"
                dir="ltr"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوزن الصافي المسبوك (جرام)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.netWeightAfterMelting || ''}
                onChange={(e) => setFormData({ ...formData, netWeightAfterMelting: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-left font-bold text-lg"
                dir="ltr"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                rows={2}
                placeholder="مثال: تسييح خواتم وسلاسل لحامات كثيرة"
              />
            </div>

            {/* Expected Loss Preview */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-orange-800">وزن الهالك المتوقع:</span>
                <span className="font-black text-orange-600" dir="ltr">{calculatedLoss} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-orange-800">نسبة الهالك:</span>
                <span className="font-black text-orange-600" dir="ltr">{calculatedLossPercentage}%</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Flame size={20} />}
              تنفيذ عملية التسييح
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <History className="text-gray-500" size={20} />
            <h2 className="text-lg font-bold text-charcoal">سجل التسييح والهالك</h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                <Loader2 size={32} className="animate-spin text-orange-500" />
                <span className="font-medium text-sm">جاري التحميل...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <FileText size={28} className="text-gray-300" />
                </div>
                <p className="font-medium">لا توجد عمليات تسييح سابقة</p>
              </div>
            ) : (
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">العيار</th>
                    <th className="px-4 py-3">الوزن قبل</th>
                    <th className="px-4 py-3">الوزن الصافي</th>
                    <th className="px-4 py-3 text-red-600">الهالك</th>
                    <th className="px-4 py-3 text-red-600">نسبة الهالك</th>
                    <th className="px-4 py-3">المستخدم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((log) => (
                    <tr key={log._id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-4 text-gray-500 font-medium" dir="ltr">
                        {new Date(log.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-4 font-bold text-charcoal" dir="ltr">
                        {log.karat}K
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-medium" dir="ltr">
                        {log.rawWeightBeforeMelting}g
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-600" dir="ltr">
                        {log.netWeightAfterMelting}g
                      </td>
                      <td className="px-4 py-4 font-bold text-red-600 bg-red-50/50" dir="ltr">
                        {log.lossWeight}g
                      </td>
                      <td className="px-4 py-4 font-bold text-red-600 bg-red-50/50" dir="ltr">
                        {log.lossPercentage}%
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs font-bold">
                        {typeof log.actionBy === 'object' ? log.actionBy.fullName : '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
