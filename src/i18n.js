import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru.js';

const i18n = i18next.createInstance().use(initReactI18next);

export const initI18n = () => i18n.init({
  lng: 'ru',
  fallbackLng: 'ru',
  resources: { ru },
  interpolation: { escapeValue: false },
});

export default i18n;
