export type SupportedLanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'kn' | 'gu';

export interface LanguageMeta {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  scriptBadge: string;
  region: string;
}
