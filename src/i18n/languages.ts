import { LanguageMeta, SupportedLanguageCode } from './types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    scriptBadge: 'EN',
    region: 'Default / Pan-India',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    scriptBadge: 'हि',
    region: 'उत्तर भारत (North India)',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    scriptBadge: 'বাং',
    region: 'পশ্চিমবঙ্গ ও ত্রিপুরা (West Bengal)',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    scriptBadge: 'தமி',
    region: 'தமிழ்நாடு (Tamil Nadu)',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    scriptBadge: 'తె',
    region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ (AP & Telangana)',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    scriptBadge: 'म',
    region: 'महाराष्ट्र (Maharashtra)',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    scriptBadge: 'ಕ',
    region: 'ಕರ್ನಾಟಕ (Karnataka)',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    scriptBadge: 'ગુ',
    region: 'ગુજરાત (Gujarat)',
  },
];

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'en';
