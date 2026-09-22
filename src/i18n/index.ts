import { en, TranslationSchema } from './en';
import { bn } from './bn';
import { hi } from './hi';
import { Language } from '../types';

export const translations: Record<Language, TranslationSchema> = {
  en,
  bn,
  hi,
};

export const availableLanguages = [
  { code: 'en' as Language, label: 'English', nativeName: 'English', active: true },
  { code: 'bn' as Language, label: 'Bengali', nativeName: 'বাংলা', active: true },
  { code: 'hi' as Language, label: 'Hindi', nativeName: 'हिंदी', active: true },
];

/**
 * Resolves dot-notation string key in a dictionary object with parameter replacement.
 * e.g., resolveKey(dict, "landing.heroTagline") -> "From Farm to Market, Smarter."
 */
export function translateKey(
  lang: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;
  const parts = key.split('.');

  let curr: any = dict;
  for (const part of parts) {
    if (curr && typeof curr === 'object' && part in curr) {
      curr = curr[part];
    } else {
      curr = undefined;
      break;
    }
  }

  // Fallback to English if key missing in current language
  if (curr === undefined && lang !== 'en') {
    let fallbackCurr: any = translations.en;
    for (const part of parts) {
      if (fallbackCurr && typeof fallbackCurr === 'object' && part in fallbackCurr) {
        fallbackCurr = fallbackCurr[part];
      } else {
        fallbackCurr = undefined;
        break;
      }
    }
    curr = fallbackCurr;
  }

  if (typeof curr !== 'string') {
    return key; // return key if not found
  }

  if (params) {
    let str = curr;
    for (const [pKey, pVal] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
    }
    return str;
  }

  return curr;
}

export type { TranslationSchema };
