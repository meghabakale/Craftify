import React, { useState, useEffect, useRef } from 'react';
import { Mic, Globe, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { detectLanguage, DetectedLanguage, LANGUAGE_SPEECH_CODES } from '../../utils/languageDetector';
import { useVoiceTyping } from '../../hooks/useVoiceTyping';
import { SupportedLanguageCode } from '../../i18n/types';

export interface SmartTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  enableVoice?: boolean;
  enableLanguageDetection?: boolean;
  showLanguageSwitchPrompt?: boolean;
  voiceLanguageCode?: SupportedLanguageCode;
  containerClassName?: string;
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

export const SmartTextarea = React.forwardRef<HTMLTextAreaElement, SmartTextareaProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      enableVoice = true,
      enableLanguageDetection = true,
      showLanguageSwitchPrompt = true,
      voiceLanguageCode,
      containerClassName = '',
      className = '',
      id,
      placeholder,
      disabled,
      rows = 3,
      ...restProps
    },
    ref
  ) => {
    const { language, setLanguage } = useLanguage();
    const [detectedLang, setDetectedLang] = useState<DetectedLanguage | null>(null);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [selectedVoiceLang, setSelectedVoiceLang] = useState<string>(
      LANGUAGE_SPEECH_CODES[voiceLanguageCode || language] || 'en-IN'
    );
    const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (!voiceLanguageCode) {
        setSelectedVoiceLang(LANGUAGE_SPEECH_CODES[language] || 'en-IN');
      }
    }, [language, voiceLanguageCode]);

    useEffect(() => {
      if (!enableLanguageDetection) {
        setDetectedLang(null);
        return;
      }
      const detected = detectLanguage(value);
      setDetectedLang(detected);
    }, [value, enableLanguageDetection]);

    const handleSpeechTranscript = (newText: string) => {
      if (!newText) return;
      const combined = value ? `${value.trim()}\n${newText.trim()}` : newText.trim();

      if (onValueChange) {
        onValueChange(combined);
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: combined, id, name: restProps.name },
          currentTarget: { value: combined, id, name: restProps.name },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }

      const detected = detectLanguage(combined);
      if (detected && detected.speechCode !== selectedVoiceLang) {
        setSelectedVoiceLang(detected.speechCode);
      }
    };

    const {
      isListening,
      interimTranscript,
      error: voiceError,
      startListening,
      stopListening,
      toggleListening,
    } = useVoiceTyping({
      lang: selectedVoiceLang,
      continuous: true,
      interimResults: true,
      onTranscriptChange: handleSpeechTranscript,
    });

    const handleMicClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      toggleListening(selectedVoiceLang);
    };

    const handleSelectSpeechLang = (speech: string) => {
      setSelectedVoiceLang(speech);
      setShowLangMenu(false);
      if (isListening) {
        stopListening();
        setTimeout(() => startListening(speech), 150);
      }
    };

    return (
      <div className={`relative flex flex-col ${containerClassName}`}>
        <div className="relative w-full">
          <textarea
            {...restProps}
            id={id}
            rows={rows}
            ref={(element) => {
              internalTextareaRef.current = element;
              if (typeof ref === 'function') {
                ref(element);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
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
              isListening ? 'ring-2 ring-[#2874F0] border-[#2874F0] bg-[#F4F8FF]' : ''
            } transition-all duration-150`}
          />

          {/* Bottom Bar inside / under textarea for Mic and Language Status */}
          <div className="flex items-center justify-between px-2 py-1.5 bg-[#FAFAFA] border-x border-b border-[#E0E0E0] rounded-b-[2px] text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              {/* Detected Language Chip */}
              {enableLanguageDetection && detectedLang ? (
                <span
                  id={id ? `${id}-detected-lang` : undefined}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20 tracking-wider uppercase select-none"
                  title={`Detected Language: ${detectedLang.name} (${detectedLang.script})`}
                >
                  <Globe className="w-2.5 h-2.5 text-[#2874F0]" />
                  <span>{detectedLang.nativeName || detectedLang.name}</span>
                </span>
              ) : (
                <span className="text-[10px] text-[#878787] flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5 text-[#878787]" />
                  <span>Auto-detect language</span>
                </span>
              )}

              {/* Language Switch Prompt */}
              {showLanguageSwitchPrompt &&
                detectedLang &&
                detectedLang.code !== language &&
                detectedLang.confidence === 'high' && (
                  <button
                    type="button"
                    onClick={() => setLanguage(detectedLang.code)}
                    className="text-[10px] text-[#2874F0] font-bold hover:underline truncate cursor-pointer"
                  >
                    Switch app to {detectedLang.nativeName}?
                  </button>
                )}
            </div>

            {/* Voice Typing Trigger */}
            {enableVoice && (
              <div className="relative flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  id={id ? `${id}-voice-btn` : undefined}
                  onClick={handleMicClick}
                  disabled={disabled}
                  title={
                    isListening
                      ? 'Listening now... Click to stop voice typing'
                      : `Voice Dictate in ${selectedVoiceLang}`
                  }
                  className={`px-2 py-1 rounded-[2px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isListening
                      ? 'bg-[#D32F2F] text-white shadow-xs animate-pulse ring-2 ring-[#D32F2F]/30'
                      : 'bg-white border border-[#E0E0E0] text-[#555555] hover:text-[#2874F0] hover:border-[#2874F0]'
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : 'text-[#2874F0]'}`} />
                  <span>{isListening ? 'Stop' : 'Voice Type'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="p-1 rounded text-[#878787] hover:text-[#212121] hover:bg-[#EFEFEF] cursor-pointer text-[10px] font-bold uppercase"
                  title="Change voice dictation language"
                >
                  {selectedVoiceLang.split('-')[0]}
                </button>

                {/* Voice Language Menu */}
                {showLangMenu && (
                  <div className="absolute right-0 bottom-full mb-1 z-30 bg-white border border-[#E0E0E0] rounded-[4px] shadow-lg p-2 w-56 text-xs animate-fadeIn">
                    <div className="text-[11px] font-bold text-[#878787] uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                      <span>Dictation Language</span>
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
                          onClick={() => handleSelectSpeechLang(item.speech)}
                          className={`text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            selectedVoiceLang === item.speech
                              ? 'bg-[#EBF2FE] text-[#2874F0] font-bold'
                              : 'hover:bg-[#F1F3F6] text-[#212121]'
                          }`}
                        >
                          <span>{item.label}</span>
                          {selectedVoiceLang === item.speech && (
                            <Check className="w-3 h-3 text-[#2874F0]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listening Live Transcript Strip */}
        {isListening && (
          <div className="mt-1 flex items-center justify-between gap-2 px-2 py-1 bg-[#EBF2FE] border border-[#2874F0]/30 rounded-[2px] text-[11px] text-[#2874F0] animate-fadeIn">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-ping shrink-0" />
              <span className="font-semibold shrink-0">Dictating ({selectedVoiceLang}):</span>
              <span className="italic truncate text-[#212121]">
                {interimTranscript || 'Listening to your voice...'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="px-1.5 py-0.5 bg-[#D32F2F] text-white text-[10px] font-bold rounded cursor-pointer hover:bg-[#B71C1C]"
            >
              Done
            </button>
          </div>
        )}

        {/* Voice Error notice */}
        {voiceError && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#D32F2F] bg-[#FFF5F5] border border-[#FEB2B2] p-1.5 rounded-[2px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{voiceError}</span>
          </div>
        )}
      </div>
    );
  }
);

SmartTextarea.displayName = 'SmartTextarea';
