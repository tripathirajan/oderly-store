import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

export async function createI18n(language = 'en'): Promise<I18nInstance> {
  const instance = i18next.createInstance();
  await instance.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
  return instance;
}

export function resolveLanguage(acceptLanguage?: string): string {
  return acceptLanguage?.toLowerCase().startsWith('es') ? 'es' : 'en';
}
