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
    <div className="bg-blue-100 p-8 sm:p-12 shadow-xl max-w-3xl w-full text-black print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm] relative overflow-hidden font-sans" dir="rtl" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0 print:opacity-[0.12]">
        <h1 className="text-[150px] font-black -rotate-45 text-[#D4AF37] whitespace-nowrap">ليلة القدر</h1>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-start w-full">
            <div className="w-28 shrink-0 opacity-0 hidden sm:block"></div> {/* Spacer for perfect centering */}
            
            <div className="flex-1 text-center pt-2">
              <p className="text-lg font-bold mb-1">بسم الله الرحمن الرحيم</p>
              <p className="text-lg font-bold mb-6">﴿ وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ ﴾ <span className="text-base">صدق الله العظيم</span></p>
            </div>
            
            {/* Styled Logo - Top Left */}
            <div className="w-28 h-28 shrink-0 rounded-full border-[4px] border-[#D4AF37] p-1 shadow-[4px_4px_0_0_rgba(212,175,55,0.3)] bg-white z-20">
              <div className="w-full h-full rounded-full border-[2px] border-dashed border-black overflow-hidden bg-black flex items-center justify-center">
                <img src={logoImg} alt="شعار ليلة القدر" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
          </div>
          
          <p className="text-4xl font-black mb-3 mt-4">مصوغات ومجوهرات</p>
          
          <div className="flex justify-center items-center mb-6 mt-4">
            <h1 className="text-[110px] leading-none font-black tracking-widest whitespace-nowrap text-[#D4AF37]" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 3px 3px 0 #222' }}>
              ليلة القدر
            </h1>
          </div>
          
          <p className="text-xl font-black mt-2">إدارة الحاج / صلاح الهوش - موبايل: ٠١٠٠٢٩٠٨٠٢٦</p>
          <p className="text-lg font-bold mt-1 text-gray-800">إبراهيم صلاح الهوش - موبايل: ٠١٠٣٢٥٦١٠٦٨</p>
        </div>

        {/* Contact & Legal Info */}
        <div className="flex justify-between text-base font-bold border-b-2 border-black pb-4 mb-4">
          <div className="text-right flex flex-col gap-1">
            <p>س.ت : ١٤٠٦٧</p>
            <p>ب.ض : ٤٥٤٩٠٨١٤٨</p>
            <p className="flex items-center gap-2" dir="rtl"><span>📞</span> <span>٠٤٨ / ٣٦٦٦٦٨١</span></p>
          </div>
          <div className="text-left flex flex-col justify-end gap-1">
            <p>منوف - ش السينما - أول سوق الصرف</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="flex justify-between text-sm font-bold mb-4">
          <div className="flex gap-2">
            <span>تحريراً في :</span>
            <span dir="ltr">{toArabicNumerals(date)}</span>
          </div>
          <div className="flex gap-2">
            <span>المطلوب من السيد :</span>
            <span className="w-64 border-b-2 border-dotted border-black inline-block text-center">{customerName}</span>
          </div>
        </div>

        <div className="flex gap-2 text-sm font-bold mb-2">
          <span>رقم الفاتورة :</span>
          <span dir="ltr">#{toArabicNumerals(invoiceNumber)}</span>
        </div>

        {/* Main Table */}
        <div className="flex">
          {/* Right side text */}
          <div className="writing-vertical-rl rotate-180 flex items-center justify-center p-2 text-sm font-bold w-10">
            البضاعة وصلتنا بعد المعاينة والقبول
          </div>

          <table className="w-full border-collapse border-2 border-black text-center text-base font-bold">
            <thead>
              <tr>
                <th className="border-2 border-black py-2 px-1 w-24 font-black">جنيه</th>
                <th className="border-2 border-black py-2 px-1 w-16 font-black">مللى</th>
                <th className="border-2 border-black py-2 px-1 w-16 font-black">جرام</th>
                <th className="border-2 border-black py-2 px-1 w-16 font-black">عيار</th>
                <th className="border-2 border-black py-2 px-2 font-black">الصنـــــــــــــــــــف</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, idx) => {
                const wholeGrams = item.weight ? Math.floor(item.weight) : '';
                const milliGrams = item.weight ? Math.round((item.weight - Math.floor(item.weight)) * 100) : ''; // 2 decimal digits as milli
                
                return (
                  <tr key={idx} className="h-10">
                    <td className="border border-black px-1">{item.price ? toArabicNumerals(item.price.toLocaleString()) : ''}</td>
                    <td className="border border-black px-1">{milliGrams !== '' ? toArabicNumerals(milliGrams) : ''}</td>
                    <td className="border border-black px-1">{wholeGrams !== '' ? toArabicNumerals(wholeGrams) : ''}</td>
                    <td className="border border-black px-1" dir="ltr">{item.karat ? `${toArabicNumerals(item.karat)}K` : ''}</td>
                    <td className="border border-black px-2 text-right">
                      {item.name}
                    </td>
                  </tr>
                );
              })}
              
              {/* Footer Rows inside Table */}
              <tr className="h-10">
                <td className="border border-black px-1 font-black bg-gray-50">{toArabicNumerals(totalAmount.toLocaleString())}</td>
                <td className="border border-black px-2 text-right" colSpan={4}>
                  الإجمالي
                </td>
              </tr>
              <tr className="h-10">
                <td className="border border-black px-1" colSpan={2}></td>
                <td className="border border-black px-2 text-right bg-gray-50 font-black" colSpan={3}>
                  سعر الجرام خلاف المصنعية والضريبة
                </td>
              </tr>
            </tbody>
          </table>

          {/* Left side text */}
          <div className="writing-vertical-rl rotate-180 flex items-center justify-center p-2 text-xs font-bold w-10 text-center leading-tight">
            تتم مراجعة الميزان والسعر خلال اسبوع فقط من تاريخه والمحل غير مسئول بعد ذلك
          </div>
        </div>

        {/* Footer Details */}
        <div className="mt-6 flex flex-col items-center gap-8 text-base font-bold">
          <p>﴿ الضريبة والدمغة ٤ جنيه عيار ٢١ & ٦ عيار ١٨ حسب القرار الوزارى ﴾</p>
          
          <div className="w-full flex justify-between px-12">
            <div className="flex gap-2 font-black text-lg">
              <span>لا تعتمد إلا بختم المحل</span>
            </div>
            <div className="flex gap-2">
              <span className="font-black text-lg">البائع :</span>
              <span className="w-48 border-b-2 border-dotted border-black inline-block text-center">{sellerName}</span>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .writing-vertical-rl {
          writing-mode: vertical-rl;
        }
      `}} />
    </div>
  );
};
