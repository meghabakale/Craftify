import { useState, useEffect, useRef, useCallback } from 'react';
import { SupportedLanguageCode } from '../i18n/types';
import { LANGUAGE_SPEECH_CODES } from '../utils/languageDetector';

// Declare SpeechRecognition interface for browser compatibility
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface UseVoiceTypingOptions {
  lang?: SupportedLanguageCode | string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onAutoDetectLang?: (detectedSpeechLang: string) => void;
}

export function useVoiceTyping(options: UseVoiceTypingOptions = {}) {
  const {
    lang = 'en',
    continuous = false,
    interimResults = true,
    onTranscriptChange,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeSpeechLang, setActiveSpeechLang] = useState<string>(() => {
    return LANGUAGE_SPEECH_CODES[lang as SupportedLanguageCode] || lang || 'en-IN';
  });

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // Check browser speech recognition support
  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  // Update speech recognition language when lang prop changes (unless actively listening)
  useEffect(() => {
    const code = LANGUAGE_SPEECH_CODES[lang as SupportedLanguageCode] || lang || 'en-IN';
    setActiveSpeechLang(code);
  }, [lang]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback((customLang?: string) => {
    setError(null);
    if (!isSupported) {
      setError('Voice typing is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognitionRef.current = recognition;

      const targetLang = customLang || activeSpeechLang || 'en-IN';
      recognition.lang = targetLang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      isManuallyStoppedRef.current = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          const finalTrimmed = currentFinal.trim();
          setTranscript((prev) => (prev ? `${prev} ${finalTrimmed}` : finalTrimmed));
          setInterimTranscript('');
          setTimeout(() => {
            onTranscriptChangeRef.current?.(finalTrimmed, true);
          }, 0);
        } else if (currentInterim) {
          const interimTrimmed = currentInterim.trim();
          setInterimTranscript(currentInterim);
          setTimeout(() => {
            onTranscriptChangeRef.current?.(interimTrimmed, false);
          }, 0);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        if (event.error === 'no-speech') {
          setError('No speech was detected. Please try speaking again.');
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in browser settings.');
        } else if (event.error === 'network') {
          setError('Network issue connecting to voice transcription service.');
        } else {
          setError(`Voice input notice: ${event.error || 'Stopped'}`);
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setError('Could not access microphone. Please verify device permissions.');
      setIsListening(false);
    }
  }, [isSupported, activeSpeechLang, continuous, interimResults, onTranscriptChange]);

  const toggleListening = useCallback((customLang?: string) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(customLang);
    }
  }, [isListening, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    activeSpeechLang,
    setActiveSpeechLang,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript: () => {
      setTranscript('');
      setInterimTranscript('');
    },
  };
}
