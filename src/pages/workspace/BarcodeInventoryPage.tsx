import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Edit, Archive, Printer,
  ShoppingCart, ScanLine, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../core/context/AuthContext';
import { useBarcodeInventory } from '../../hooks/useBarcodeInventory';
import { useCategories } from '../../hooks/useCategories';
import { useInventory } from '../../hooks/useInventory';
import type {
  CreateBarcodeItemDto,
  BarcodeItem
} from '../../common/types/barcode-inventory.types';
import logoImg from '../../assets/logo .jpeg';

const GoldButton = ({ children, onClick, className = '', type = 'button', icon: Icon }: any) => (
  <button
    type={type}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C9A84C] hover:bg-[#D4AF37] text-white rounded-md transition-all font-medium shadow-sm ${className}`}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
);

const OutlineButton = ({ children, onClick, className = '', icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-6 py-2.5 border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10 rounded-md transition-all font-medium ${className}`}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
);

// --- MAIN PAGE COMPONENT ---
export function BarcodeInventoryPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const { categories } = useCategories();

  const {
    items,
    isLoading,
    filters,
    setFilters,
    createItem,
    updateItem,
    archiveItem,
    getPrintTag,
    scanItem,
  } = useBarcodeInventory();

  // State
  const [quickScan, setQuickScan] = useState('');
  const [scannedResult, setScannedResult] = useState<BarcodeItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPrintingMultiple, setIsPrintingMultiple] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarcodeItem | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<{ barcode: string, imageBase64: string, item?: BarcodeItem } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Focus scanner on load
  useEffect(() => {
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, []);

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScan.trim()) return;

    try {
      setScanError(null);
      const result = await scanItem(quickScan.trim());
      setScannedResult(result);
    } catch (err: any) {
      setScanError('القطعة غير موجودة أو تم بيعها');
      setScannedResult(null);
    } finally {
      setQuickScan('');
    }
  };

  const handleAddToSale = (item: BarcodeItem) => {
    // Placeholder callback for add to sale
    alert(`تمت إضافة القطعة (${item.barcode}) إلى سلة البيع بنجاح`);
    setScannedResult(null);
  };

  const openPrintTag = async (item: BarcodeItem) => {
    try {
      const tagData = await getPrintTag(item.barcode);
      setPrintData({ ...tagData, item });
      setIsPrintModalOpen(true);
    } catch (err) {
      alert('خطأ في جلب بيانات الطباعة');
    }
  };

  const printCurrentTag = () => {
    if (!printData) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemWeight = printData.item?.grossWeight || '';
      const itemKarat = printData.item?.karat || '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>طباعة التاج</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;900&display=swap" rel="stylesheet">
            <style>
              /* ضبط مقاس الطباعة للطابعة */
              @page {
                size: 82mm 37mm;
                margin: 0;
              }
          
              body {
                margin: 0;
                padding: 0;
                width: 82mm;
                height: 37mm;
                font-family: 'Tajawal', Arial, sans-serif;
                box-sizing: border-box;
                background: white;
              }
          
              /* الحاوية الرئيسية بعرض الرول الكامل */
              .label-page {
                width: 82mm;
                height: 37mm;
                position: relative;
                background: #fff;
              }
          
              /* مربع الطباعة (2سم × 2.5سم) */
              .printable-area {
                width: 20mm;
                height: 25mm;
                position: absolute;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                text-align: center;
                box-sizing: border-box;
              }
          
              .left-box { left: 0; bottom: 0; }
              .right-box { right: 0; top: 0; }
          
              /* النصف العلوي: 1.25سم + دوران 180 درجة */
              .top-half {
                width: 100%;
                height: 12.5mm;
                display: flex;
                justify-content: center;
                align-items: center;
                transform: rotate(180deg);
                overflow: hidden;
              }
          
              /* النصف السفلي: 1.25سم + اتجاه عدل */
              .bottom-half {
                width: 100%;
                height: 12.5mm;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                font-size: 5.5pt;
                font-weight: bold;
                line-height: 1.2;
              }
          
              .barcode-img { max-height: 7mm; width: 18mm; margin-bottom: 2mm; }
              .logo-img { max-height: 6mm; object-fit: contain; display: none; }
              
              @media screen {
                body {
                  border: 1px dashed #ccc;
                  margin: 20px auto;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                  zoom: 1.5;
                }
              }
            </style>
          </head>
          <body>
          
            <div class="label-page">
              <div class="printable-area left-box">
                <!-- النصف العلوي: الباركود مقلوب للطي -->
                <div class="top-half">
                  <img src="${printData.imageBase64}" class="barcode-img" />
                </div>
                
                <!-- النصف السفلي: التفاصيل عدل -->
                <div class="bottom-half">
                  <div style="font-size: 5.5pt; font-weight: bold; margin-bottom: 1px;">ليلة القدر</div>
                  <div style="font-size: 5.5pt; font-weight: bold; margin-bottom: 3px;">صلاح الهوش</div>
                  <div dir="ltr" style="font-size: 5.5pt; font-weight: bold;">${itemWeight}g | ${itemKarat}K</div>
                </div>
              </div>
            </div>
          
            <script>
              window.onload = function() { 
                setTimeout(function() {
                  window.print(); 
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };

  const toggleAll = () => {
    if (selectedItems.size === items.length && items.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(i => i._id)));
    }
  };

  const printSelectedTags = async () => {
    if (selectedItems.size === 0) return;
    setIsPrintingMultiple(true);
    try {
      const selectedBarcodes = Array.from(selectedItems);
      const selectedData = items.filter(i => selectedBarcodes.includes(i._id));
      
      const tagsData = await Promise.all(
        selectedData.map(async (item) => {
          const tag = await getPrintTag(item.barcode);
          return { ...tag, item };
        })
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      let pagesHtml = '';
      for (let i = 0; i < tagsData.length; i += 2) {
        const tag1 = tagsData[i];
        const tag2 = tagsData[i + 1];
        
        const renderPrintableArea = (tagData: any, sideClass: string) => {
          if (!tagData) return '';
          const itemWeight = tagData.item?.grossWeight || '';
          const itemKarat = tagData.item?.karat || '';
          return `
            <div class="printable-area ${sideClass}">
              <div class="top-half">
                <img src="${tagData.imageBase64}" class="barcode-img" />
              </div>
              <div class="bottom-half">
                <div style="font-size: 5.5pt; font-weight: bold; margin-bottom: 1px;">ليلة القدر</div>
                <div style="font-size: 5.5pt; font-weight: bold; margin-bottom: 3px;">صلاح الهوش</div>
                <div dir="ltr" style="font-size: 5.5pt; font-weight: bold;">${itemWeight}g | ${itemKarat}K</div>
              </div>
            </div>
          `;
        };

        pagesHtml += `
          <div class="label-page">
            ${renderPrintableArea(tag1, 'left-box')}
            ${renderPrintableArea(tag2, 'right-box')}
          </div>
        `;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8">
            <title>طباعة التاجات المحددة</title>
            <style>
              @page { size: 82mm 37mm; margin: 0; }
              body { margin: 0; padding: 0; width: 82mm; font-family: Arial, sans-serif; box-sizing: border-box; background: white; }
              .label-page { width: 82mm; height: 37mm; position: relative; background: #fff; page-break-after: always; }
              .printable-area { width: 20mm; height: 25mm; position: absolute; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center; box-sizing: border-box; }
              .left-box { left: 0; bottom: 0; }
              .right-box { right: 0; top: 0; }
              .top-half { width: 100%; height: 12.5mm; display: flex; justify-content: center; align-items: center; transform: rotate(180deg); overflow: hidden; }
              .bottom-half { width: 100%; height: 12.5mm; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; font-size: 5.5pt; font-weight: bold; line-height: 1.2; }
              .barcode-img { max-height: 7mm; width: 18mm; margin-bottom: 2mm; }
              @media screen { body { border: 1px dashed #ccc; margin: 20px auto; zoom: 1.5; } }
            </style>
          </head>
          <body>
            ${pagesHtml}
            <script>
              window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      setSelectedItems(new Set());
    } catch (err) {
      alert('خطأ في جلب بيانات الطباعة للمجموعة المحددة');
    } finally {
      setIsPrintingMultiple(false);
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen text-[#1A1A1A]" dir="rtl">

      {/* Header & Quick Scanner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">مخزون الباركود والقطع الفردية</h1>
          <p className="text-gray-500 mt-2">إدارة القطع، طباعة التاج، والبحث السريع</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleQuickScan} className="relative w-full md:w-80">
            <input
              ref={scanInputRef}
              type="text"
              value={quickScan}
              onChange={(e) => setQuickScan(e.target.value)}
              placeholder="فحص بالباركود / Scanner..."
              className="w-full pl-4 pr-12 py-3 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent shadow-sm text-left"
              dir="ltr"
            />
              <ScanLine className="absolute right-4 top-3.5 text-[#C9A84C]" size={20} />
            </form>

            {selectedItems.size > 0 && (
              <OutlineButton 
                icon={Printer} 
                onClick={printSelectedTags}
                className={isPrintingMultiple ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {isPrintingMultiple ? 'جاري التجهيز...' : `طباعة المحدد (${selectedItems.size})`}
              </OutlineButton>
            )}

            {isOwner && (
              <GoldButton
                icon={Plus}
                onClick={() => { setEditingItem(null); setIsFormModalOpen(true); }}
            >
              إضافة قطعة جديدة
            </GoldButton>
          )}
        </div>
      </div>

      {/* Scanned Result Popup / Banner */}
      {scanError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <span className="font-medium">{scanError}</span>
          </div>
          <button onClick={() => setScanError(null)} className="text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        </div>
      )}

      {scannedResult && (
        <div className="mb-8 p-6 bg-white border border-[#C9A84C]/40 rounded-xl shadow-[0_4px_20px_-4px_rgba(201,168,76,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 transform transition-all duration-300">
          <div className="flex items-center gap-6 w-full">
            <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center">
              <ScanLine size={32} className="text-[#C9A84C]" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-1">{scannedResult.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="bg-gray-100 px-3 py-1 rounded-full">الباركود: <strong className="text-[#1A1A1A]">{scannedResult.barcode}</strong></span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">العيار: <strong className="text-[#1A1A1A]">{scannedResult.karat}</strong></span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">الوزن: <strong className="text-[#1A1A1A]">{scannedResult.grossWeight}g</strong></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <OutlineButton icon={Printer} onClick={() => openPrintTag(scannedResult)}>
              طباعة التاج
            </OutlineButton>
            <GoldButton icon={ShoppingCart} onClick={() => handleAddToSale(scannedResult)}>
              إضافة لسلة البيع
            </GoldButton>
            <button onClick={() => setScannedResult(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Karat Tabs */}
        <div className="flex p-1 bg-gray-50 rounded-lg w-full md:w-auto">
          {[
            { label: 'الكل', value: undefined },
            { label: 'عيار 24', value: 24 },
            { label: 'عيار 21', value: 21 },
            { label: 'عيار 18', value: 18 },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilters({ ...filters, karat: tab.value as any })}
              className={`flex-1 md:px-8 py-2 text-sm font-medium rounded-md transition-colors ${filters.karat === tab.value
                  ? 'bg-white text-[#C9A84C] shadow-sm ring-1 ring-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            className="w-full md:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all outline-none text-sm text-gray-700 font-medium"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tabs (Owner Only for Archived) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex p-1 bg-gray-50 rounded-lg flex-1 md:flex-none">
            <button
              onClick={() => setFilters({ ...filters, isArchived: false })}
              className={`flex-1 md:px-6 py-2 text-sm font-medium rounded-md transition-colors ${!filters.isArchived
                  ? 'bg-white text-[#1A1A1A] shadow-sm ring-1 ring-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              المتاحة بالمخزن (AVAILABLE)
            </button>
            {isOwner && (
              <button
                onClick={() => setFilters({ ...filters, isArchived: true })}
                className={`flex-1 md:px-6 py-2 text-sm font-medium rounded-md transition-colors ${filters.isArchived
                    ? 'bg-white text-[#1A1A1A] shadow-sm ring-1 ring-gray-200/50'
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                الأرشيف (ARCHIVED)
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#C9A84C] bg-white border-gray-300 rounded focus:ring-[#C9A84C]"
                    checked={items.length > 0 && selectedItems.size === items.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-6 py-4">الباركود</th>
                <th className="px-6 py-4">الصورة</th>
                <th className="px-6 py-4">اسم القطعة</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">العيار</th>
                <th className="px-6 py-4">الوزن القائم</th>
                <th className="px-6 py-4">وزن التاج</th>
                <th className="px-6 py-4">الوزن الصافي</th>
                <th className="px-6 py-4">المصنعية/جرام</th>
                <th className="px-6 py-4">الشركة</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    لا توجد قطع مطابقة للبحث
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className={`hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-none shadow-sm ${selectedItems.has(item._id) ? 'bg-[#C9A84C]/5' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#C9A84C] bg-white border-gray-300 rounded focus:ring-[#C9A84C]"
                        checked={selectedItems.has(item._id)}
                        onChange={() => toggleSelection(item._id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-indigo-700 bg-indigo-50/40">{item.barcode}</td>
                    <td className="px-6 py-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity hover:shadow-md"
                          onClick={() => setSelectedImage(item.imageUrl!)}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">لا صورة</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-base text-gray-800">{item.title}</td>
                    <td className="px-6 py-4 font-bold text-gray-600 bg-gray-50/50">
                      {typeof item.category === 'object' ? (item.category as any)?.name : categories.find(c => c._id === item.category)?.name || item.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-black bg-amber-100 text-amber-800 border border-amber-200">
                        {item.karat}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-lg text-gray-700 bg-gray-100/50" dir="ltr">{item.grossWeight}g</td>
                    <td className="px-6 py-4 font-bold text-blue-700 bg-blue-50/30" dir="ltr">{item.tagWeight}g</td>
                    <td className="px-6 py-4 font-black text-lg text-emerald-700 bg-emerald-50/40" dir="ltr">{item.netWeight}g</td>
                    <td className="px-6 py-4 font-bold text-purple-700 bg-purple-50/30">{item.makingChargePerGram || 0}</td>
                    <td className="px-6 py-4 text-gray-600 font-bold">{item.companyName || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="طباعة التاج"
                          onClick={() => openPrintTag(item)}
                          className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-200 shadow-sm"
                        >
                          <Printer size={18} />
                        </button>
                        {isOwner && (
                          <>
                            <button
                              title="تعديل"
                              onClick={() => { setEditingItem(item); setIsFormModalOpen(true); }}
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors border border-blue-200 shadow-sm"
                            >
                              <Edit size={18} />
                            </button>
                            {!filters.isArchived && (
                              <button
                                title="أرشفة"
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من أرشفة هذه القطعة؟')) {
                                    archiveItem(item._id);
                                  }
                                }}
                                className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-red-200 shadow-sm"
                              >
                                <Archive size={18} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full cursor-pointer"
            >
              <X size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-default ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Item Form Modal */}
      {isFormModalOpen && (
        <ItemFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          initialData={editingItem}
          onSubmit={async (data: Partial<CreateBarcodeItemDto>) => {
            if (editingItem) {
              await updateItem(editingItem._id, data);
            } else {
              await createItem(data as CreateBarcodeItemDto);
            }
            setIsFormModalOpen(false);
          }}
        />
      )}

      {/* Print Tag Dialog */}
      {isPrintModalOpen && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1A1A1A]">معاينة التاج</h2>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center justify-center bg-gray-50/50">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <img src={printData.imageBase64} alt="Barcode Tag" className="max-w-full h-auto" />
              </div>
              <p className="mt-4 font-mono text-[#C9A84C] font-semibold tracking-wider">{printData.barcode}</p>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex gap-3">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={printCurrentTag}
                className="flex-1 px-4 py-2.5 bg-[#1A1A1A] text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={18} /> طباعة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- ITEM FORM MODAL COMPONENT ---
function ItemFormModal({ isOpen, onClose, initialData, onSubmit }: any) {
  const { categories } = useCategories();
  const { inventory } = useInventory({ status: 'ACTIVE' });

  const [formData, setFormData] = useState<Partial<CreateBarcodeItemDto>>(
    initialData || {
      barcode: '',
      title: '',
      karat: 21,
      grossWeight: 0,
      tagWeight: 0,
      makingChargePerGram: 0,
      category: '',
      inventoryId: '',
      companyName: '',
    }
  );

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        grossWeight: Number(formData.grossWeight) || 0,
        tagWeight: formData.tagWeight ? Number(formData.tagWeight) : undefined,
        makingChargePerGram: Number(formData.makingChargePerGram) || 0,
        karat: Number(formData.karat) || 21,
      };
      // If inventoryId is empty string, remove it so it's not sent
      if (!submitData.inventoryId) {
        delete submitData.inventoryId;
      }
      await onSubmit(submitData);
    } catch (error) {
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            {initialData ? 'تعديل بيانات القطعة' : 'إضافة قطعة باركود جديدة'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {initialData && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">الباركود</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg outline-none text-gray-500 font-mono font-bold"
                  disabled={true}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">اسم/وصف القطعة *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">التصنيف *</label>
              <select
                name="category"
                required
                value={formData.category || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              >
                <option value="" disabled>اختر التصنيف...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">العيار *</label>
              <select
                name="karat"
                value={formData.karat}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              >
                <option value={18}>عيار 18</option>
                <option value={21}>عيار 21</option>
                <option value={24}>عيار 24</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">المخزون العام (اختياري)</label>
              <select
                name="inventoryId"
                value={formData.inventoryId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              >
                <option value="">-- بدون ربط بالمخزون --</option>
                {inventory
                  .filter((inv) => Number(inv.karat) === Number(formData.karat))
                  .map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.title} (عيار {inv.karat} - {inv.companyName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">الوزن القائم (جرام) *</label>
              <input
                type="number"
                step="0.01"
                name="grossWeight"
                required
                value={formData.grossWeight || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">وزن التاج (جرام)</label>
              <input
                type="number"
                step="0.01"
                name="tagWeight"
                value={formData.tagWeight || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">المصنعية للجرام</label>
              <input
                type="number"
                step="0.01"
                name="makingChargePerGram"
                value={formData.makingChargePerGram || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">اسم الشركة/المورد</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">صورة القطعة</label>
              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C9A84C]/10 file:text-[#C9A84C] hover:file:bg-[#C9A84C]/20"
              />
            </div>

          </div>

          <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-[#C9A84C] text-white rounded-lg font-medium hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
