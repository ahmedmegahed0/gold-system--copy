import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        className={`flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 cursor-pointer transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gold/50 hover:bg-white'
        } ${isOpen ? 'border-gold ring-2 ring-gold/40 bg-white' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-charcoal font-bold'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-3 pr-9 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal font-medium"
                placeholder="ابحث هنا..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400 font-medium">
                لا توجد نتائج مطابقة
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-xl transition-colors mb-1 last:mb-0 ${
                      isSelected ? 'bg-gold/10 text-gold font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium hover:text-charcoal'
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={16} className="text-gold" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
