export const locales = [
  'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru', 'ar',
  'hi', 'it', 'tr', 'vi', 'th', 'id', 'nl', 'pl', 'uk', 'ms'
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  it: 'Italiano',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  id: 'Bahasa',
  nl: 'Nederlands',
  pl: 'Polski',
  uk: 'Українська',
  ms: 'Melayu',
};
