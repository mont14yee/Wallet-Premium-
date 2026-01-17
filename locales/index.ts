import en from './en';
import am from './am';
import fr from './fr';
import de from './de';
import es from './es';

export const translations = {
  en,
  am,
  fr,
  de,
  es,
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;