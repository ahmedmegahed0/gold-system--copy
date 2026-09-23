import React from 'react';
import logoImg from '../../assets/logo .jpeg';

export interface PaperInvoiceItem {
  name: string;
  karat: number | string;
  weight: number; 
  price: number;
  images?: string[];
}

interface PaperInvoiceLayoutProps {
  invoiceNumber: string;
  date: string;
  customerName: string;
  sellerName: string;
  items: PaperInvoiceItem[];
  totalAmount: number;
}

export const PaperInvoiceLayout: React.FC<PaperInvoiceLayoutProps> = ({
  invoiceNumber,
  date,
  customerName,
  sellerName,
  items,
  totalAmount
}) => {
  const toArabicNumerals = (str: string | number) => {
    return str.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  // Ensure we always have at least 6 rows to make it look like a physical receipt
  const displayItems = [...items];
  while (displayItems.length < 6) {
    displayItems.push({ name: '', karat: '', weight: 0, price: 0 });
  }

  return (
    <div id="invoice-print-area" className="bg-blue-100 p-8 sm:p-12 shadow-xl w-full text-black print:shadow-none print:border-none mx-auto min-h-[210mm] max-w-[148mm] relative overflow-hidden font-sans" dir="rtl" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0 print:opacity-[0.12]">
        <h1 className="text-[150px] font-black -rotate-45 text-[#D4AF37] whitespace-nowrap">ليلة القدر</h1>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-2">
          <div className="flex justify-between items-start w-full">
            <div className="w-20 shrink-0 opacity-0 hidden sm:block"></div> {/* Spacer for perfect centering */}
            
            <div className="flex-1 text-center pt-1">
              <p className="text-base print:text-sm font-bold mb-0.5">بسم الله الرحمن الرحيم</p>
              <p className="text-base print:text-sm font-bold mb-0.5">﴿ وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ ﴾</p>
              <p className="text-sm print:text-xs font-bold mb-2">صدق الله العظيم</p>
            </div>
            
            {/* Styled Logo - Top Left */}
            <div className="w-24 h-24 print:w-20 print:h-20 shrink-0 rounded-full border-[3px] border-[#D4AF37] p-1 shadow-[3px_3px_0_0_rgba(212,175,55,0.3)] bg-white z-20">
              <div className="w-full h-full rounded-full border-[2px] border-dashed border-black overflow-hidden bg-black flex items-center justify-center">
                <img src={logoImg} alt="شعار ليلة القدر" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
          </div>
          
          <p className="text-3xl print:text-2xl font-black mb-1 mt-1">مصوغات ومجوهرات</p>
          
          <div className="flex justify-center items-center mb-2 mt-1">
            <h1 className="text-[60px] print:text-[45px] leading-none font-black tracking-widest whitespace-nowrap text-[#D4AF37]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 3px 3px 0 #222' }}>
              ليلة القدر
            </h1>
          </div>
          
          <p className="text-lg print:text-base font-black mt-1">إدارة الحاج / صلاح الهوش - موبايل: ٠١٠٠٢٩٠٨٠٢٦</p>
          <p className="text-base print:text-sm font-bold mt-0.5 text-gray-800">إبراهيم صلاح الهوش - موبايل: ٠١٠٣٢٥٦١٠٦٨</p>
        </div>

        {/* Contact & Legal Info */}
        <div className="flex justify-between text-sm print:text-xs font-bold border-b-2 border-black pb-1 mb-1">
          <div className="text-right flex flex-col gap-0.5">
            <p>س.ت : ١٤٠٦٧</p>
            <p>ب.ض : ٤٥٤٩٠٨١٤٨</p>
            <p className="flex items-center gap-2" dir="rtl"><span>📞</span> <span>٠٤٨ / ٣٦٦٦٦٨١</span></p>
          </div>
          <div className="text-left flex flex-col justify-end gap-0.5">
            <p>منوف - ش السينما - أول سوق الصرف (الصاغة)</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="flex justify-between text-sm print:text-xs font-bold mb-2">
          <div className="flex gap-2 items-end">
            <span>تحريراً في :</span>
            <span dir="ltr">{toArabicNumerals(date)}</span>
          </div>
          <div className="flex gap-2 items-end text-sm print:text-xs">
            <span>المطلوب من السيد :</span>
            <span className="w-40 border-b-2 border-dotted border-black inline-block text-center text-base print:text-sm pb-0.5">{customerName}</span>
            <span className="mr-1">البلد /</span>
            <span className="w-24 border-b-2 border-dotted border-black inline-block"></span>
          </div>
        </div>

        <div className="flex gap-2 text-sm print:text-xs font-bold mb-1">
          <span>رقم الفاتورة :</span>
          <span dir="ltr">#{toArabicNumerals(invoiceNumber)}</span>
        </div>

        {/* Main Table */}
        <div className="flex">
          {/* Right side text */}
          <div className="writing-vertical-rl rotate-180 flex items-center justify-center p-1 text-sm print:text-xs font-bold w-10 print:w-6">
            البضاعة وصلتنا بعد المعاينة والقبول
          </div>

          <table className="w-full border-collapse border-2 border-black text-center text-sm print:text-xs font-bold">
            <thead>
              <tr>
                <th className="border-2 border-black py-1 px-1 w-20 print:w-16 font-black">جنيه</th>
                <th className="border-2 border-black py-1 px-1 w-12 print:w-10 font-black">مللى</th>
                <th className="border-2 border-black py-1 px-1 w-12 print:w-10 font-black">جرام</th>
                <th className="border-2 border-black py-1 px-1 w-12 print:w-10 font-black">عيار</th>
                <th className="border-2 border-black py-1 px-1 font-black">الصنـــــــــــــــــــف</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, idx) => {
                const wholeGrams = item.weight ? Math.floor(item.weight) : '';
                const milliGrams = item.weight ? Math.round((item.weight - Math.floor(item.weight)) * 100) : ''; // 2 decimal digits as milli
                
                return (
                  <tr key={idx} className="h-7 print:h-6">
                    <td className="border border-black px-1">{item.price ? toArabicNumerals(item.price.toLocaleString()) : ''}</td>
                    <td className="border border-black px-1">{milliGrams !== '' ? toArabicNumerals(milliGrams) : ''}</td>
                    <td className="border border-black px-1">{wholeGrams !== '' ? toArabicNumerals(wholeGrams) : ''}</td>
                    <td className="border border-black px-1" dir="ltr">{item.karat ? `${toArabicNumerals(item.karat)}K` : ''}</td>
                    <td className="border border-black px-1 text-right">
                      {item.name}
                    </td>
                  </tr>
                );
              })}
              
              {/* Footer Rows inside Table */}
              <tr className="h-7 print:h-6">
                <td className="border border-black px-1 font-black bg-gray-50">{toArabicNumerals(totalAmount.toLocaleString())}</td>
                <td className="border border-black px-1 text-right" colSpan={4}>
                  الإجمالي
                </td>
              </tr>
              <tr className="h-7 print:h-6">
                <td className="border border-black px-1" colSpan={2}></td>
                <td className="border border-black px-1 text-right bg-gray-50 font-black" colSpan={3}>
                  سعر الجرام خلاف المصنعية والضريبة
                </td>
              </tr>
            </tbody>
          </table>

          {/* Left side text */}
          <div className="writing-vertical-rl rotate-180 flex items-center justify-center p-1 text-[11px] print:text-[9px] font-bold w-10 print:w-6 text-center leading-tight">
            تتم مراجعة الميزان والسعر خلال اسبوع فقط من تاريخه والمحل غير مسئول بعد ذلك
          </div>
        </div>

        {/* Footer Details */}
        <div className="mt-2 flex flex-col items-center gap-2 text-sm print:text-xs font-bold">
          <p>﴿ الضريبة والدمغة ٤ جنيه عيار ٢١ & ٦ عيار ١٨ حسب القرار الوزارى ﴾</p>
          
          <div className="w-full flex justify-between px-8 print:px-4">
            <div className="flex gap-2 font-black text-base print:text-sm">
              <span>لا تعتمد إلا بختم المحل</span>
            </div>
            <div className="flex gap-2">
              <span className="font-black text-base print:text-sm">البائع :</span>
              <span className="w-40 border-b-2 border-dotted border-black inline-block text-center">{sellerName}</span>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 148mm !important;
            min-height: 210mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 4mm 6mm !important;
            box-sizing: border-box !important;
            background-color: #dbeafe !important;
          }
        }
      `}} />
    </div>
  );
};
