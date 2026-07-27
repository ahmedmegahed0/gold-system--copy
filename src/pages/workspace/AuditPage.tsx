import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Search, Loader2, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStockMovements } from '../../hooks/useStockMovements';
import type { StockMovementType } from '../../common/types/stock-movement.types';

export const AuditPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  const {
    logs,
    isLoading,
    error,
    inventoryItemId,
    setInventoryItemId,
  } = useStockMovements();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [inventoryItemId]);

  // Derived state for pagination
  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE));
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [logs, currentPage]);

  // Helper function to get badge styling based on movement type
  const getTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'INVENTORY_IN':
      case 'INVOICE_UPDATE_RETURN':
        return {
          label: t(`audit.types.${type}`),
          className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          icon: <ArrowUpRight size={14} />,
          isPositive: true,
        };
      case 'SALE_OUT':
      case 'INVOICE_UPDATE_OUT':
        return {
          label: t(`audit.types.${type}`),
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <ArrowDownRight size={14} />,
          isPositive: false,
        };
      default:
        return {
          label: type,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: null,
          isPositive: true,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-movements/10 text-theme-movements">
              <History size={24} />
            </div>
            {t('audit.title')}
          </h1>
          <p className="text-gray-400 text-sm mt-1 mr-14">
            {t('audit.subtitle')}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-400">{t('audit.totalLogs')}</span>
          <span className="text-2xl font-black text-charcoal">{logs.length}</span>
        </div>
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ─── Filter & Table Container ─── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex items-center border-b border-gray-100 bg-gray-50/30 px-6 py-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              value={inventoryItemId}
              onChange={(e) => setInventoryItemId(e.target.value)}
              placeholder={t('audit.searchPlaceholder')}
              className={`w-full py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold bg-white transition-all ${
                isRtl ? 'pl-4 pr-11' : 'pr-4 pl-11'
              }`}
            />
            <Search size={18} className={`absolute top-3 text-gray-400 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={32} className="animate-spin text-gold" />
              <span className="font-medium text-sm">{t('audit.loading')}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <History size={28} />
              </div>
              <p className="font-medium">{t('audit.empty')}</p>
            </div>
          ) : (
            <table className={`w-full text-base ${isRtl ? 'text-right' : 'text-left'}`}>
              <thead className="bg-gray-50/70 text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('audit.table.timestamp')}</th>
                  <th className="px-6 py-4 font-semibold">{t('audit.table.item')}</th>
                  <th className="px-6 py-4 font-semibold">{t('audit.table.type')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('audit.table.countDelta')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('audit.table.grossDelta')}</th>
                  <th className="px-6 py-4 font-semibold text-center">{t('audit.table.netDelta')}</th>
                  <th className="px-6 py-4 font-semibold">{t('audit.table.actionBy')}</th>
                  <th className="px-6 py-4 font-semibold">{t('audit.table.reason')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentLogs.map((log, index) => {
                  const badge = getTypeBadge(log.type);
                  const isPositive = badge.isPositive;
                  const valuePrefix = isPositive ? '+' : '-';

                  let itemTitle = log.inventoryItem?.title;
                  if (!itemTitle) {
                    let extractedCat = '';
                    const cat = (log as any).scrapCategory || (log as any).category;
                    if (cat) {
                      extractedCat = typeof cat === 'object' ? cat.name : cat;
                    } 
                    
                    if (!extractedCat && log.reason) {
                       const reason = log.reason as string;
                       const categories = ['غوايش', 'خواتم', 'خاتم', 'سلاسل', 'سلسلة', 'حلق', 'حلقان', 'دبل', 'دبلة', 'محابس', 'محبس', 'اساور', 'أساور', 'اسورة', 'إسورة', 'انسيال', 'انسيالات', 'تعليقة', 'تعاليق', 'سبيكة', 'سبائك', 'جنيه', 'جنيهات', 'كوليه', 'كوليهات', 'طقم', 'اطقم', 'أطقم'];
                       for (const c of categories) {
                         if (reason.includes(c)) {
                           extractedCat = c;
                           break;
                         }
                       }
                       if (!extractedCat && reason.includes(' - ')) {
                         const parts = reason.split(' - ');
                         const lastPart = parts[parts.length - 1].trim();
                         if (lastPart && lastPart.split(' ').length <= 2 && !lastPart.includes('عيار')) {
                           extractedCat = lastPart;
                         }
                       }
                    }

                    if (extractedCat) {
                      itemTitle = `كسر - ${extractedCat}`;
                    } else if (log.type === 'INVOICE_UPDATE_OUT' || log.type === 'INVOICE_UPDATE_RETURN' || (log.reason && log.reason.includes('فاتورة'))) {
                      const invMatch = log.reason?.match(/رقم\s*([a-zA-Z0-9-]+)/);
                      itemTitle = invMatch && invMatch[1] ? `تعديل فاتورة (#${invMatch[1]})` : 'صنف من فاتورة معدلة';
                    } else if (log.reason && log.reason.includes('كسر')) {
                      itemTitle = 'ذهب كسر';
                    } else {
                      itemTitle = 'قطعة غير معروفة/محذوفة';
                    }
                  }

                  let karatText = log.inventoryItem?.karat ? `${log.inventoryItem.karat}K` : '---';
                  if (!log.inventoryItem?.karat && log.reason) {
                    if (log.reason.includes('عيار 18')) karatText = '18K';
                    else if (log.reason.includes('عيار 21')) karatText = '21K';
                  }

                  return (
                    <tr key={log._id || log.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f7f4]'} hover:bg-gold/[0.05] transition-colors border-b border-gray-100 last:border-0`}>
                      {/* Timestamp */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-charcoal font-bold text-base" dir="ltr">
                            {new Date(log.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                          <span className="text-sm text-gray-400 flex items-center gap-1" dir="ltr">
                            <Calendar size={12} />
                            {new Date(log.createdAt).toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      </td>

                      {/* Item */}
                      <td className="px-6 py-4">
                        <div className="inline-flex flex-col gap-1 bg-indigo-50 border border-indigo-100/50 px-3 py-1.5 rounded-lg">
                          <span className="font-bold text-indigo-700 text-sm">{itemTitle}</span>
                          <span className="text-xs font-medium text-indigo-500/80 flex items-center gap-1.5">
                            <span className="px-1 py-0.5 bg-indigo-100/50 rounded text-indigo-700" dir="ltr">{karatText}</span>
                            <span>ID: {(log.inventoryItem?._id || log.inventoryItem?.id || '---').substring(0,8)}</span>
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-bold border ${badge.className}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* Count Delta */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block font-black text-sm px-2 py-1 rounded-md border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-red-50 text-red-700 border-red-100/50'}`} dir="ltr">
                          {valuePrefix}{Math.abs(log.countChange)}
                        </span>
                      </td>

                      {/* Gross Delta */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block font-black text-sm px-2 py-1 rounded-md border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-red-50 text-red-700 border-red-100/50'}`} dir="ltr">
                          {valuePrefix}{Math.abs(log.grossWeightChange).toFixed(2)}g
                        </span>
                      </td>

                      {/* Net Delta */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block font-black text-sm px-2 py-1 rounded-md border ${isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' : 'bg-red-50 text-red-700 border-red-100/50'}`} dir="ltr">
                          {valuePrefix}{Math.abs(log.netWeightChange).toFixed(2)}g
                        </span>
                      </td>

                      {/* Action By */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100/50">
                          <User size={14} />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{log.actionBy?.fullName || 'نظام / مجهول'}</span>
                            <span className="text-[10px] opacity-70">{log.actionBy?.role || '---'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-6 py-4">
                        <span className="text-base text-gray-500 max-w-[200px] truncate block" title={log.reason || '---'}>
                          {log.reason || '---'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {logs.length > 0 && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              {t('audit.pagination.showing')} <span className="font-bold text-charcoal">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> {t('audit.pagination.to')} <span className="font-bold text-charcoal">{Math.min(currentPage * ITEMS_PER_PAGE, logs.length)}</span> {t('audit.pagination.of')} <span className="font-bold text-charcoal">{logs.length}</span> {t('audit.pagination.entries')}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNumber = idx + 1;
                  // Show max 5 pages logic:
                  if (
                    totalPages > 5 &&
                    pageNumber !== 1 &&
                    pageNumber !== totalPages &&
                    (pageNumber < currentPage - 1 || pageNumber > currentPage + 1)
                  ) {
                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                      return <span key={idx} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                        currentPage === pageNumber
                          ? 'bg-theme-movements text-white shadow-sm'
                          : 'text-gray-500 hover:bg-white hover:text-charcoal border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-white hover:text-charcoal disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
