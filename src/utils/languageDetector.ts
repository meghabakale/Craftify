import { SupportedLanguageCode } from '../i18n/types';

export interface DetectedLanguage {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  script: string;
  confidence: 'high' | 'medium' | 'low';
  speechCode: string;
  isRomanized?: boolean;
}

export const LANGUAGE_SPEECH_CODES: Record<SupportedLanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  kn: 'kn-IN',
  gu: 'gu-IN',
};

export const LANGUAGE_NAMES: Record<SupportedLanguageCode, { name: string; nativeName: string; script: string }> = {
  en: { name: 'English', nativeName: 'English', script: 'Latin' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  te: { name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  mr: { name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
};

// Distinctive script regexes
const BENGALI_REGEX = /[\u0980-\u09FF]/g;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/g;
const TELUGU_REGEX = /[\u0C00-\u0C7F]/g;
const KANNADA_REGEX = /[\u0C80-\u0CFF]/g;
const GUJARATI_REGEX = /[\u0A80-\u0AFF]/g;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;

// Distinctive characters / patterns
const MARATHI_CHARS = /[\u0933\u0931\u0945\u0949]/; // ळ (Lla), ऱ, etc.
const MARATHI_WORDS = /\b(आहे|नाही|काय|कसा|कशी|नमस्कार|भाऊ|दादा|पाहिजे|करा|झाले|होते|माहिती|खरेदी|साडी)\b/i;
const HINDI_WORDS = /\b(है|हैं|था|थी|के|में|और|नमस्ते|की|को|का|से|नहीं|करो|मुझे|चाहिए|खरीदना|दाम|कुर्ता|सुंदर|कृपया|धन्यवाद)\b/i;

// Romanized / Transliterated keyword patterns
const ROMAN_HINDI = /\b(namaste|shukriya|dhanyawad|dhanyavad|chahiye|kaisa|kaisi|kaise|achha|achhi|saree|sari|kurta|bartan|mitti|kitna|paisa|paise|bhai|kripya|kripaya|madad|khareedna)\b/i;
const ROMAN_BENGALI = /\b(namaskar|khub|bhalo|shari|kemon|taka|dokan|amra|shundor)\b/i;
const ROMAN_TAMIL = /\b(vanakkam|nandri|pudavai|kaivinai|vilai|eppadi|romba|nalla)\b/i;
const ROMAN_TELUGU = /\b(namaskaram|dhanyavadalu|cheera|chenetha|chala|bagundi|enti)\b/i;
const ROMAN_MARATHI = /\b(namaskar|ahe|nahi|kasa|kashi|kiti|bhau|dada|kharidi)\b/i;
const ROMAN_GUJARATI = /\b(kem cho|saras|aabhar|hastakala|majama|bhai)\b/i;

/**
 * Detect language of input text in real-time.
 * Returns null if text is too short or empty.
 */
export function detectLanguage(text: string): DetectedLanguage | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;

  // Count script occurrences
  const bnMatches = (trimmed.match(BENGALI_REGEX) || []).length;
  const taMatches = (trimmed.match(TAMIL_REGEX) || []).length;
  const teMatches = (trimmed.match(TELUGU_REGEX) || []).length;
  const knMatches = (trimmed.match(KANNADA_REGEX) || []).length;
  const guMatches = (trimmed.match(GUJARATI_REGEX) || []).length;
  const devMatches = (trimmed.match(DEVANAGARI_REGEX) || []).length;

  const scriptCounts = [
    { code: 'bn' as SupportedLanguageCode, count: bnMatches, script: 'Bengali' },
    { code: 'ta' as SupportedLanguageCode, count: taMatches, script: 'Tamil' },
    { code: 'te' as SupportedLanguageCode, count: teMatches, script: 'Telugu' },
    { code: 'kn' as SupportedLanguageCode, count: knMatches, script: 'Kannada' },
    { code: 'gu' as SupportedLanguageCode, count: guMatches, script: 'Gujarati' },
  ];

  const highestIndic = scriptCounts.reduce((max, curr) => (curr.count > max.count ? curr : max), {
    code: 'bn' as SupportedLanguageCode,
    count: 0,
    script: '',
  });

  if (highestIndic.count > 0 && highestIndic.count >= devMatches) {
    const meta = LANGUAGE_NAMES[highestIndic.code];
    return {
      code: highestIndic.code,
      name: meta.name,
      nativeName: meta.nativeName,
      script: meta.script,
      confidence: highestIndic.count >= 3 ? 'high' : 'medium',
      speechCode: LANGUAGE_SPEECH_CODES[highestIndic.code],
    };
  }

  // Devanagari script: determine between Marathi & Hindi
  if (devMatches > 0) {
    const isMarathi = MARATHI_CHARS.test(trimmed) || MARATHI_WORDS.test(trimmed);
    const code: SupportedLanguageCode = isMarathi ? 'mr' : 'hi';
    const meta = LANGUAGE_NAMES[code];
    return {
      code,
      name: meta.name,
      nativeName: meta.nativeName,
      script: 'Devanagari',
      confidence: devMatches >= 3 ? 'high' : 'medium',
      speechCode: LANGUAGE_SPEECH_CODES[code],
    };
  }

  // Romanized text / Latin script
  if (ROMAN_HINDI.test(trimmed)) {
    return {
      code: 'hi',
      name: 'Hindi (Romanized)',
      nativeName: 'हिन्दी',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'hi-IN',
      isRomanized: true,
    };
  }
  if (ROMAN_MARATHI.test(trimmed)) {
    return {
      code: 'mr',
      name: 'Marathi (Romanized)',
      nativeName: 'मराठी',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'mr-IN',
      isRomanized: true,
    };
  }
  if (ROMAN_BENGALI.test(trimmed)) {
    return {
      code: 'bn',
      name: 'Bengali (Romanized)',
      nativeName: 'বাংলা',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'bn-IN',
      isRomanized: true,
    };
  }
  if (ROMAN_TAMIL.test(trimmed)) {
    return {
      code: 'ta',
      name: 'Tamil (Romanized)',
      nativeName: 'தமிழ்',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'ta-IN',
      isRomanized: true,
    };
  }
  if (ROMAN_TELUGU.test(trimmed)) {
    return {
      code: 'te',
      name: 'Telugu (Romanized)',
      nativeName: 'తెలుగు',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'te-IN',
      isRomanized: true,
    };
  }
  if (ROMAN_GUJARATI.test(trimmed)) {
    return {
      code: 'gu',
      name: 'Gujarati (Romanized)',
      nativeName: 'ગુજરાતી',
      script: 'Latin',
      confidence: 'medium',
      speechCode: 'gu-IN',
      isRomanized: true,
    };
  }

  // Pure Latin / English
  const latinMatches = (trimmed.match(/[A-Za-z]/g) || []).length;
  if (latinMatches >= 2) {
    const meta = LANGUAGE_NAMES.en;
    return {
      code: 'en',
      name: meta.name,
      nativeName: meta.nativeName,
      script: 'Latin',
      confidence: latinMatches >= 5 ? 'high' : 'medium',
      speechCode: LANGUAGE_SPEECH_CODES.en,
    };
  }

  return null;
}
