import React from 'react';

interface InvoicePrintHeaderProps {
  title?: string;
  invoiceNumber?: string;
}

export const InvoicePrintHeader: React.FC<InvoicePrintHeaderProps> = ({ 
  title = 'فاتورة مبيعات ذهب',
}) => {
  return (
    <div className="flex items-center justify-between mb-8 border-b-2 border-charcoal pb-6">
      <div className="text-right">
        <h1 className="text-4xl font-black mb-2 text-charcoal">DuoDev</h1>
        <h2 className="text-2xl font-bold text-gray-500 mb-2">{title}</h2>
        <p className="text-gray-500 font-bold" dir="ltr">📞 01150080068</p>
      </div>
      
      {/* Golden Circle Logo purely via CSS/SVG instead of public image */}
      <div className="flex items-center justify-center w-32 h-32 rounded-full border-[3px] border-[#d4af37] bg-gradient-to-tr from-white to-[#d4af37]/10 shadow-inner">
        <div className="w-28 h-28 rounded-full border-[1px] border-[#d4af37]/40 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-[1px] border-[#d4af37]/20 flex flex-col items-center justify-center">
             <span className="text-2xl font-black text-[#d4af37] opacity-90" style={{ fontFamily: 'serif' }}>Duo</span>
             <span className="text-[10px] font-bold text-[#d4af37] opacity-60 tracking-widest mt-1">DEV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
