import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('ar') ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  }, [i18n.language]);

  return (
    <button 
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors border border-transparent hover:border-gold/20"
    >
      <Globe size={18} />
      <span>{i18n.language.startsWith('ar') ? 'English' : 'عربي'}</span>
    </button>
  );
};
