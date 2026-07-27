import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslations from '../locales/ar.json';
import enTranslations from '../locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslations },
      en: { translation: enTranslations }
    },
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
