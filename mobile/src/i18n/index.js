import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ru from './locales/ru.json';
import ro from './locales/ro.json';
import en from './locales/en.json';

const fallback = 'en';

const detect = () => {
  try {
    const tags = Localization.getLocales?.() || [];
    for (const t of tags) {
      const code = (t?.languageCode || '').toLowerCase();
      if (['ru', 'ro', 'en'].includes(code)) return code;
    }
  } catch (e) {
    console.log('Localization detect error:', e);
  }
  return fallback;
};

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, ro: { translation: ro }, en: { translation: en } },
  lng: detect(),
  fallbackLng: fallback,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(lng) {
  if (['ru', 'ro', 'en'].includes(lng)) {
    i18n.changeLanguage(lng);
  }
}

export default i18n;
