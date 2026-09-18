import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { detectLanguage, DetectedLanguage, LANGUAGE_SPEECH_CODES } from '../../utils/languageDetector';
import { useVoiceTyping } from '../../hooks/useVoiceTyping';
import { SupportedLanguageCode } from '../../i18n/types';

export interface SmartInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  enableVoice?: boolean;
  enableLanguageDetection?: boolean;
  showLanguageSwitchPrompt?: boolean;
  voiceLanguageCode?: SupportedLanguageCode;
  badgePosition?: 'inside' | 'below';
  containerClassName?: string;
  onLanguageDetected?: (detected: DetectedLanguage | null) => void;
}

const QUICK_LANGUAGES: { code: SupportedLanguageCode; label: string; speech: string }[] = [
  { code: 'hi', label: 'हिन्दी', speech: 'hi-IN' },
  { code: 'en', label: 'English', speech: 'en-IN' },
  { code: 'bn', label: 'বাংলা', speech: 'bn-IN' },
  { code: 'ta', label: 'தமிழ்', speech: 'ta-IN' },
  { code: 'te', label: 'తెలుగు', speech: 'te-IN' },
  { code: 'mr', label: 'मराठी', speech: 'mr-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ', speech: 'kn-IN' },
  { code: 'gu', label: 'ગુજરાતી', speech: 'gu-IN' },
];

export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      enableVoice = true,
      enableLanguageDetection = true,
      showLanguageSwitchPrompt = true,
      voiceLanguageCode,
      badgePosition = 'inside',
      containerClassName = '',
      className = '',
      id,
      placeholder,
      disabled,
      ...restInputProps
    },
    ref
  ) => {
    const { language, setLanguage, t } = useLanguage();
    const [detectedLang, setDetectedLang] = useState<DetectedLanguage | null>(null);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>(
      LANGUAGE_SPEECH_CODES[voiceLanguageCode || language] || 'en-IN'
    );
    const internalInputRef = useRef<HTMLInputElement | null>(null);

    // Keep voice recognition language in sync when context language changes
    useEffect(() => {
      if (!voiceLanguageCode) {
        setSelectedVoiceLang(LANGUAGE_SPEECH_CODES[language] || 'en-IN');
      }
    }, [language, voiceLanguageCode]);

    // Real-time language detection on input value change
    useEffect(() => {
      if (!enableLanguageDetection) {
        setDetectedLang(null);
        return;
      }
      const detected = detectLanguage(value);
      setDetectedLang(detected);
    }, [value, enableLanguageDetection]);

    const handleSpeechTranscript = (newText: string, isFinal: boolean) => {
      if (!newText) return;
      const combined = value ? `${value.trim()} ${newText.trim()}` : newText.trim();
      
      // Update via onValueChange if provided, otherwise simulate onChange
      if (onValueChange) {
        onValueChange(combined);
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: combined, id, name: restInputProps.name },
          currentTarget: { value: combined, id, name: restInputProps.name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      // Automatically adjust voice language if non-English script detected in speech
      const detected = detectLanguage(combined);
      if (detected && detected.speechCode !== selectedVoiceLang) {
        setSelectedVoiceLang(detected.speechCode);
      }
    };

    const {
      isListening,
      interimTranscript,
      error: voiceError,
      isSupported,
      startListening,
      stopListening,
      toggleListening,
    } = useVoiceTyping({
      lang: selectedVoiceLang,
      continuous: false,
      interimResults: true,
      onTranscriptChange: handleSpeechTranscript,
    });

    const handleMicClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      toggleListening(selectedVoiceLang);
    };

    const handleSelectSpeechLang = (langCode: SupportedLanguageCode, speech: string) => {
      setSelectedVoiceLang(speech);
      setShowLangMenu(false);
      if (isListening) {
        stopListening();
        setTimeout(() => startListening(speech), 150);
      }
    };

    const handleSwitchAppLanguage = (e: React.MouseEvent, targetLang: SupportedLanguageCode) => {
      e.preventDefault();
      e.stopPropagation();
      setLanguage(targetLang);
    };

    // Calculate padding right depending on controls
    const hasRightControls = enableVoice || (enableLanguageDetection && detectedLang);

    return (
      <div className={`relative flex flex-col ${containerClassName}`}>
        <div className="relative flex items-center w-full">
          <input
            {...restInputProps}
            id={id}
            ref={(element) => {
              internalInputRef.current = element;
              if (typeof ref === 'function') {
                ref(element);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
              }
            }}
            value={value}
            disabled={disabled}
            placeholder={
              isListening
                ? interimTranscript || '🎙️ Listening... speak in any Indian language or English'
                : placeholder
            }
            onChange={onChange}
            className={`${className} ${
              hasRightControls ? (badgePosition === 'inside' && detectedLang ? 'pr-24' : 'pr-10') : ''
            } ${
              isListening ? 'ring-2 ring-[#2874F0] border-[#2874F0] bg-[#F4F8FF]' : ''
            } transition-all duration-150`}
          />

          {/* Right Action Icons & Badges */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 pointer-events-auto">
            {/* Inline Detected Language Badge */}
            {enableLanguageDetection && detectedLang && badgePosition === 'inside' && (
              <span
                id={id ? `${id}-lang-badge` : undefined}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20 tracking-wider uppercase select-none transition-opacity duration-200"
                title={`Detected Language: ${detectedLang.name} (${detectedLang.script} script)`}
              >
                <Globe className="w-2.5 h-2.5 text-[#2874F0]" />
                <span>{detectedLang.nativeName || detectedLang.name}</span>
              </span>
            )}

            {/* Voice Typing Microphone Button */}
            {enableVoice && (
              <div className="relative flex items-center">
                <button
                  type="button"
                  id={id ? `${id}-voice-btn` : undefined}
                  onClick={handleMicClick}
                  disabled={disabled}
                  title={
                    isListening
                      ? 'Listening now... Click to stop voice typing'
                      : `Click for Voice Typing (${selectedVoiceLang})`
                  }
                  className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    isListening
                      ? 'bg-[#D32F2F] text-white shadow-md animate-pulse ring-2 ring-[#D32F2F]/30 scale-105'
                      : 'text-[#878787] hover:text-[#2874F0] hover:bg-[#F1F3F6]'
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Quick speech language button when listening */}
                {isListening && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLangMenu(!showLangMenu);
                    }}
                    className="ml-1 text-[10px] font-bold uppercase text-[#2874F0] hover:underline cursor-pointer bg-white px-1 py-0.5 rounded border border-[#2874F0]/30 shadow-2xs"
                    title="Change voice recognition dialect"
                  >
                    {selectedVoiceLang.split('-')[0]}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listening Status Bar / Audio Feedback Wave */}
        {isListening && (
          <div className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#EBF2FE] border border-[#2874F0]/30 rounded-[2px] text-[11px] text-[#2874F0] animate-fadeIn">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-ping shrink-0" />
              <span className="font-semibold shrink-0">Listening ({selectedVoiceLang}):</span>
              <span className="italic truncate text-[#212121]">
                {interimTranscript || 'Speak naturally now...'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="text-[10px] font-bold underline cursor-pointer text-[#2874F0] hover:text-[#1853B0]"
              >
                Change Language
              </button>
              <button
                type="button"
                onClick={stopListening}
                className="ml-1 px-1.5 py-0.5 bg-[#D32F2F] text-white text-[10px] font-bold rounded cursor-pointer hover:bg-[#B71C1C]"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Voice Language Picker Dropdown */}
        {showLangMenu && (
          <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-[#E0E0E0] rounded-[4px] shadow-lg p-2 w-56 text-xs animate-fadeIn">
            <div className="text-[11px] font-bold text-[#878787] uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
              <span>Voice Recognition Language</span>
              <button
                type="button"
                onClick={() => setShowLangMenu(false)}
                className="text-[#878787] hover:text-[#212121]"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_LANGUAGES.map((item) => (
                <button
                  key={item.speech}
                  type="button"
                  onClick={() => handleSelectSpeechLang(item.code, item.speech)}
                  className={`text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedVoiceLang === item.speech
                      ? 'bg-[#EBF2FE] text-[#2874F0] font-bold'
                      : 'hover:bg-[#F1F3F6] text-[#212121]'
                  }`}
                >
                  <span>{item.label}</span>
                  {selectedVoiceLang === item.speech && <Check className="w-3 h-3 text-[#2874F0]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Error notice */}
        {voiceError && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#D32F2F] bg-[#FFF5F5] border border-[#FEB2B2] p-1.5 rounded-[2px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{voiceError}</span>
          </div>
        )}

        {/* Auto Language Switch Suggestion (if user typed in a different language) */}
        {showLanguageSwitchPrompt &&
          detectedLang &&
          detectedLang.code !== language &&
          detectedLang.confidence === 'high' && (
            <div className="mt-1 flex items-center justify-between gap-1 text-[11px] bg-[#FFF8E7] border border-[#FFE082] px-2 py-1 rounded-[2px] text-[#8D6E63] animate-fadeIn">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3 h-3 text-[#FF9F00] shrink-0" />
                <span className="truncate">
                  Detected <strong className="text-[#212121]">{detectedLang.name}</strong> ({detectedLang.nativeName}).
                </span>
              </div>
              <button
                type="button"
                id={id ? `${id}-switch-lang-btn` : undefined}
                onClick={(e) => handleSwitchAppLanguage(e, detectedLang.code)}
                className="shrink-0 font-bold text-[#2874F0] hover:underline cursor-pointer ml-1"
              >
                Switch app to {detectedLang.nativeName}?
              </button>
            </div>
          )}

        {/* External / Below Badge if configured */}
        {enableLanguageDetection && detectedLang && badgePosition === 'below' && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#878787]">
            <Globe className="w-3 h-3 text-[#2874F0]" />
            <span>Detected Language:</span>
            <strong className="text-[#212121]">
              {detectedLang.name} ({detectedLang.nativeName})
            </strong>
          </div>
        )}
      </div>
    );
  }
);

SmartInput.displayName = 'SmartInput';
