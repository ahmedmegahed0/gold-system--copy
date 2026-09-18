import React from 'react';

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
    <div className="bg-blue-50 p-8 sm:p-12 shadow-xl max-w-3xl w-full text-black print:shadow-none print:border-none print:p-8 print:pt-12 mx-auto min-h-[297mm] relative overflow-hidden font-sans" dir="rtl" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0 print:opacity-[0.08]">
        <h1 className="text-[150px] font-black -rotate-45 text-[#b59540] whitespace-nowrap">ليلة القدر</h1>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-6">
          <p className="text-base font-bold mb-1">بسم الله الرحمن الرحيم</p>
          <p className="text-base font-bold mb-4">﴿ وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ ﴾ <span className="text-sm">صدق الله العظيم</span></p>
          <p className="text-2xl font-black mb-1">مصوغات ومجوهرات</p>
          <div className="flex justify-center items-center gap-8 mb-6 mt-2">
            <h1 className="text-[80px] leading-none font-black tracking-widest text-black whitespace-nowrap" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>ليلة القدر</h1>
            
            {/* Creative Diamond Crown Logo */}
            <div className="flex flex-col items-center justify-center w-32 h-32 border-[3px] border-black shrink-0 bg-white transform rotate-45 shadow-[6px_-6px_0_0_rgba(0,0,0,1)] relative ml-4">
               <div className="absolute inset-1 border border-dashed border-black"></div>
               <div className="transform -rotate-45 flex flex-col items-center justify-center mt-1 z-10 bg-white px-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-black mb-1">
                   <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                 </svg>
                 <span className="text-3xl font-black leading-none text-black tracking-tighter">ليلة</span>
                 <span className="text-xl font-black tracking-widest text-black mt-1">القدر</span>
               </div>
            </div>
          </div>
          <p className="text-xl font-black">إدارة الحاج / صلاح الهوش - موبايل: ٠١٠٠٢٩٠٨٠٢٦</p>
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
                      <div className="flex items-center justify-end gap-2">
                        {item.name}
                        {item.images && item.images.length > 0 && (
                          <img src={item.images[0]} alt={item.name} className="w-8 h-8 object-cover rounded-sm border border-gray-300" />
                        )}
                      </div>
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
