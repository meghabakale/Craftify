import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { SupportedLanguageCode } from '../i18n/types';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'mobile' | 'footer' | 'floating';
  onLanguageSelect?: (lang: SupportedLanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  onLanguageSelect,
}) => {
  const { language, setLanguage, currentLanguageMeta, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
    if (onLanguageSelect) {
      onLanguageSelect(code);
    }
  };

  // Variant 1: Mobile drawer list
  if (variant === 'mobile') {
    return (
      <div className="space-y-2 py-2 border-t border-[#EAEAEA]">
        <div className="flex items-center gap-2 px-1 text-xs font-bold text-[#878787] uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>{t('selectLanguage')}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`p-2 rounded-[3px] text-left text-xs transition-colors flex items-center justify-between border cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF2FE] text-[#2874F0] border-[#2874F0] font-bold shadow-2xs'
                    : 'bg-[#FFFFFF] text-[#212121] border-[#E0E0E0] hover:bg-[#F9F9F9]'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm leading-tight">{lang.nativeName}</div>
                  <div className="text-[10px] text-[#878787]">{lang.name}</div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2874F0] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variant 2: Footer inline selector
  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-white/60 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-white/80" />
          <span>{t('selectLanguage')}:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`px-2 py-0.5 rounded-[2px] text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFE500] text-[#111111] font-bold'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Variant 3: Default Navbar dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-language-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] hover:bg-white/10 text-white transition-colors cursor-pointer text-xs font-semibold"
        title="Change App Language / भाषा बदलें"
        aria-label="Language selection menu"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white uppercase">
          {currentLanguageMeta.scriptBadge}
        </div>
        <span className="hidden sm:inline font-medium">{currentLanguageMeta.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-64 bg-[#FFFFFF] text-[#212121] rounded-[4px] shadow-xl border border-[#E0E0E0] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 border-b border-[#F0F0F0] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2874F0]">
              <Globe className="w-3.5 h-3.5" />
              <span>{t('selectLanguage')}</span>
            </div>
            <span className="text-[10px] text-[#878787]">8 भारतीय भाषाएं</span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF2FE] text-[#2874F0] font-bold'
                      : 'hover:bg-[#F5F5F5] text-[#212121]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#F1F2F4] text-[#2874F0] flex items-center justify-center font-bold text-[11px]">
                      {lang.scriptBadge}
                    </span>
                    <div>
                      <div className="font-semibold text-sm leading-tight">{lang.nativeName}</div>
                      <div className="text-[10px] text-[#878787]">{lang.name} • {lang.region}</div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#2874F0] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-2 pb-1 border-t border-[#F0F0F0] text-[10px] text-[#878787] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B78103]" />
            <span>Translations apply to products, campaigns & pages</span>
          </div>
        </div>
      )}
    </div>
  );
};
