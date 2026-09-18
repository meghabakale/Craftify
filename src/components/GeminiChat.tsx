import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Bot,
  User as UserIcon,
  ShieldCheck,
  Rocket,
  ShoppingBag,
  Zap,
  Brain,
  X,
  Maximize2,
  Minimize2,
  ThumbsUp,
  ThumbsDown,
  Info,
  Edit3,
  ArrowLeft,
  MoreVertical,
  Mic,
  MicOff,
  Globe,
  Plus,
  History,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { ChatMessage, GeminiModelId, ChatPersona, User } from '../types';
import { useVoiceTyping } from '../hooks/useVoiceTyping';
import { detectLanguage } from '../utils/languageDetector';
import { useLanguage } from '../context/LanguageContext';

interface GeminiChatProps {
  currentUser?: User | null;
  onClose?: () => void;
  onBack?: () => void;
  isModal?: boolean;
}

interface SavedSession {
  id: string;
  title: string;
  timestamp: string;
  personaId: string;
  model: GeminiModelId;
  messages: ChatMessage[];
}

const PERSONAS: ChatPersona[] = [
  {
    id: 'escrow-specialist',
    name: 'Escrow & Covenant Specialist',
    badge: 'Trust & Finance',
    roleTitle: 'Escrow & Covenant Concierge',
    description: 'Specializes in all-or-nothing pre-authorization holds, milestone settlements, 5% platform fees, and backer fund security.',
    recommendedModel: 'gemini-3.8-flash',
    systemInstruction: `You are the Craftify Escrow & Platform Specialist. Craftify is an artisanal hybrid platform supporting Indian craftspeople, combining Kickstarter-style all-or-nothing crowdfunding with a permanent retail marketplace. Currency is always Indian Rupees (₹ INR).
Core covenants to uphold:
1. Pledges are ₹0 authorized card/UPI holds until 100% threshold is met by the campaign deadline.
2. If successful, charges are captured, and funds disburse in milestone tranches: 5% platform fee, 3% payment processing, 92% net artisan capital.
3. If deadline lapses without reaching 100%, pre-authorizations are voided (₹0 collected, zero fees).
4. Funded and fulfilled campaigns graduate permanently into the Craftify Shop with a "Funded on Craftify" badge.
Provide precise, transparent, and authoritative financial and covenant explanations. Format output with clean markdown, bullet points, and tables where suitable.`,
    starterPrompts: [
      "How does Craftify's all-or-nothing ₹0 escrow hold protect my pledge?",
      "Calculate platform fees and artisan net payout on a ₹2,50,000 campaign goal.",
      "What happens to patron payment authorizations if a campaign ends at 94% funding?",
      "Explain the exact path from artisan milestone completion to Shop graduation.",
    ],
  },
  {
    id: 'marketplace-advisor',
    name: 'Heritage Craft Curator',
    badge: 'Craft & GI Provenance',
    roleTitle: 'Provenance & Heritage Guide',
    description: 'Helps patrons discover authentic Indian handcrafted goods, verify GI tags, inspect artisan origins, and distinguish handmade from mass-produced items.',
    recommendedModel: 'gemini-3.8-flash',
    systemInstruction: `You are the Craftify Heritage Craft Curator. You help conscious collectors and design enthusiasts discover exceptional Indian handmade textiles, pottery, woodwork, metal craft, and jewellery.
Guidance points:
- Distinguish between active crowdfunding runs (pledge now with conditional escrow hold, receive artisan signature pieces and early patron pricing) and graduated store items (in stock, ships in 48 hours).
- Highlight verified regional provenance, GI tags, and craft traditions (e.g. Khurja pottery, Varanasi silk, Jaipur blue pottery, Saharanpur woodcraft, Bidriware metalwork).
- Help users inspect authentic craft markings, understand artisan hand-processes, and choose heirloom pieces.
Tone: Warm, sophisticated, attentive, culturally literate.`,
    starterPrompts: [
      "Recommend authentic handcrafted decor items with Jaipur blue pottery or Saharanpur woodcraft accents.",
      "How do I verify the GI tag and regional provenance of a product in the Craftify Shop?",
      "What is the key difference between backing an artisan campaign and buying ready store stock?",
      "How does buying directly from master weavers preserve India's handloom heritage?",
    ],
  },
  {
    id: 'campaign-strategist',
    name: 'Artisan Campaign Architect',
    badge: 'Creator Strategy',
    roleTitle: 'Heritage & Campaign Architect',
    description: 'Assists Indian artisans and guild leaders in drafting craft narratives, reward tiers, production schedules, and backer updates.',
    recommendedModel: 'gemini-3.1-pro-preview',
    systemInstruction: `You are the Craftify Artisan Campaign Architect. Your mission is to help Indian artisans, master craftspeople, handloom weavers, potters, woodcarvers, and jewellery makers launch thriving crowdfunding campaigns that successfully graduate to direct retail without middlemen.
Capabilities:
- Formulate tiered pledge rewards (Early Patron Edition, Master Guild Batch, Heirloom Collection).
- Structure authentic project narratives focusing on craft heritage, regional provenance (Varanasi, Kutch, Kashmir, Khurja, Jaipur), and sustainable materials.
- Outline realistic artisan timelines (dyeing, hand-spinning, pit-loom weaving, kiln firing, packaging).
- Draft engaging backer updates and milestone celebrations.
Tone: Knowledgeable, inspiring, pragmatic, heritage-literate.`,
    starterPrompts: [
      "Help me draft a campaign pitch for hand-spun Changthangi pashmina woven on Srinagar cedar looms.",
      "Design a 3-tier reward matrix for hand-hammered Bidriware silver inlay art.",
      "Write an update announcement celebrating our Varanasi silk campaign crossing the 100% threshold.",
      "How should an artisan price reward tiers in INR compared to anticipated future retail store pricing?",
    ],
  },
  {
    id: 'gemini-universal',
    name: 'Craftify General Assistant',
    badge: 'Universal AI',
    roleTitle: 'Multimodal Intelligence',
    description: 'The versatile Gemini AI assistant for open-ended queries, order assistance, calculations, writing, and deep synthesis.',
    recommendedModel: 'gemini-3.8-flash',
    systemInstruction: `You are Gemini, an intelligent, professional, and comprehensive AI assistant embedded in the Craftify application. You possess broad knowledge across craft design, logistics, escrow finance, business, and platform policies. Always be helpful, concise, well-structured, and polite.`,
    starterPrompts: [
      "Explain the economic trade-offs between artisan pre-orders and traditional retail distribution.",
      "Give me a 5-step checklist for launching an authentic physical craft product.",
      "How can patrons track delivery status for fulfilled crowdfunding campaigns?",
      "Draft a message to an artisan inquiring about custom dimensions on a brass lamp.",
    ],
  },
];

const MODEL_OPTIONS: { id: GeminiModelId; label: string; desc: string; icon: any; badge: string }[] = [
  {
    id: 'gemini-3.8-flash',
    label: 'gemini-3.8-flash',
    desc: 'Advanced reasoning, high accuracy & fast streaming (Default)',
    icon: Bot,
    badge: 'Recommended',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'gemini-3.1-flash-lite',
    desc: 'Ultra-fast responses with high availability & low latency',
    icon: Zap,
    badge: 'Ultra-Fast',
  },
  {
    id: 'gemini-flash-latest',
    label: 'gemini-flash-latest',
    desc: 'High-throughput stable model for reliable queries & guidance',
    icon: Sparkles,
    badge: 'High-Availability',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'gemini-3.1-pro-preview',
    desc: 'Deep reasoning for complex strategy, reward matrices & financial math',
    icon: Brain,
    badge: 'Deep Reasoning',
  },
];

const SESSIONS_STORAGE_KEY = 'craftify_gemini_saved_sessions_v2';

export const GeminiChat: React.FC<GeminiChatProps> = ({
  currentUser,
  onClose,
  onBack,
  isModal = false,
}) => {
  // REQUIREMENT: Start a fresh new conversation every time the chatbot is opened!
  // We initialize with an empty message thread.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);

  const [selectedPersona, setSelectedPersona] = useState<ChatPersona>(PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(PERSONAS[0].recommendedModel);
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(PERSONAS[0].systemInstruction);

  // Dropdowns & Modals
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showSystemInstructionModal, setShowSystemInstructionModal] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>('New conversation started');

  // Saved past sessions for history drawer
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { language, setLanguage } = useLanguage();
  const [detectedLang, setDetectedLang] = useState<ReturnType<typeof detectLanguage> | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Real-time language detection
  useEffect(() => {
    if (inputValue.trim().length >= 3) {
      const detected = detectLanguage(inputValue);
      setDetectedLang(detected);
    } else {
      setDetectedLang(null);
    }
  }, [inputValue]);

  // Voice typing integration
  const {
    isListening,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useVoiceTyping({
    lang: language,
    onTranscriptChange: (transcriptText, isFinal) => {
      if (isFinal) {
        setInputValue((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
      }
    },
  });

  const chatThreadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
        setShowPersonaMenu(false);
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  // Scroll chat thread to bottom ONLY internally within the chat container, never scrolling the browser window
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (chatThreadRef.current && (messages.length > 0 || isLoading)) {
      chatThreadRef.current.scrollTo({
        top: chatThreadRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Auto-archive active conversation into past sessions list when it has messages
  useEffect(() => {
    if (messages.length >= 2) {
      const firstUserMsg = messages.find((m) => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 48) + (firstUserMsg.content.length > 48 ? '...' : '') : 'Craftify Discussion';
      const updatedSession: SavedSession = {
        id: currentSessionId,
        title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        personaId: selectedPersona.id,
        model: selectedModel,
        messages,
      };

      setSavedSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== currentSessionId);
        const updated = [updatedSession, ...filtered].slice(0, 15); // Keep up to 15 recent sessions
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [messages, currentSessionId, selectedPersona.id, selectedModel]);

  // Explicit New Conversation trigger
  const handleStartNewConversation = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setCurrentSessionId(`session-${Date.now()}`);
    setInputValue('');
    setErrorMessage(null);
    setShowMoreMenu(false);
    setShowHistoryDrawer(false);
    setToastNotification('Started a new conversation');
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
  };

  // Load a session from history
  const handleLoadSession = (session: SavedSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    const persona = PERSONAS.find((p) => p.id === session.personaId) || PERSONAS[0];
    setSelectedPersona(persona);
    setSelectedModel(session.model || persona.recommendedModel);
    setShowHistoryDrawer(false);
    setToastNotification(`Loaded "${session.title}"`);
  };

  // Delete a saved session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Switch Persona
  const handleSelectPersona = (persona: ChatPersona) => {
    setSelectedPersona(persona);
    setSelectedModel(persona.recommendedModel);
    setCustomSystemInstruction(persona.systemInstruction);
    setShowPersonaMenu(false);
    setToastNotification(`Switched role to ${persona.name}`);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setFeedbackMap((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined : (type as any),
    }));
  };

  const sendMessage = async (promptText?: string) => {
    const textToSend = promptText || inputValue.trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    setInputValue('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    const botMessageId = `msg-${Date.now()}-model`;
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      isStreaming: true,
    };

    setMessages([...newHistory, initialBotMessage]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
          systemInstruction: customSystemInstruction,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errDetails = 'Failed to connect with Craftify Gemini engine.';
        try {
          const errJson = await response.json();
          if (errJson.error) errDetails = errJson.error;
        } catch {
          // ignore
        }
        throw new Error(errDetails);
      }

      if (!response.body) {
        throw new Error('No response stream returned from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';
      let actualModelUsed: string = selectedModel;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.modelUsed) {
                actualModelUsed = parsed.modelUsed;
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, content: accumulatedText, modelUsed: actualModelUsed, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON.parse')) {
                throw e;
              }
            }
          }
        }
      }

      // Finalize streaming state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                content: accumulatedText || 'I processed your request, but received no text output.',
                modelUsed: actualModelUsed,
                isStreaming: false,
              }
            : msg
        )
      );

      // If a fallback model was used due to temporary upstream spikes, notify the user gently
      if (actualModelUsed && actualModelUsed !== selectedModel) {
        setToastNotification(`High demand on ${selectedModel}; smoothly served by ${actualModelUsed}.`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: msg.content + ' [Generation stopped by user]', isStreaming: false }
              : msg
          )
        );
      } else {
        const errMsg = err.message || 'Error communicating with Gemini.';
        setErrorMessage(errMsg);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: `⚠️ **Craftify Assistant Note**: ${errMsg}\n\n*Please ensure your GEMINI_API_KEY is configured in Settings > Secrets or choose a different model.*`,
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetryLast = () => {
    if (messages.length < 2 || isLoading) return;
    let lastUserPrompt = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserPrompt = messages[i].content;
        break;
      }
    }
    if (lastUserPrompt) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'model') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      sendMessage(lastUserPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Generate contextual follow-up chips based on the last response
  const getFollowUpSuggestions = (lastMsgContent: string) => {
    const text = lastMsgContent.toLowerCase();
    if (text.includes('escrow') || text.includes('fee') || text.includes('payout')) {
      return [
        "What happens if a campaign reaches 98% of its goal?",
        "Break down the 5% platform fee covenant in detail",
        "How do backers verify milestone releases?",
      ];
    }
    if (text.includes('pottery') || text.includes('silk') || text.includes('pashmina') || text.includes('gi')) {
      return [
        "How do I verify GI tags on Craftify items?",
        "Show ready-to-ship products from these master artisans",
        "What makes hand-spun pashmina superior to machine-made?",
      ];
    }
    if (text.includes('campaign') || text.includes('tier') || text.includes('reward')) {
      return [
        "How should an artisan calculate production timelines?",
        "Draft backer updates for our 50% milestone",
        "What is the optimal duration for a crowdfunding campaign?",
      ];
    }
    return [
      "Explain how Craftify ensures 100% authentic craft provenance",
      "How do crowdfunding rewards transition into the Shop catalog?",
      "Calculate platform fee breakdown for ₹1,00,000 in pledges",
    ];
  };

  const chatContainer = (
    <div
      id="gemini-chat-container"
      className={`flex flex-col bg-[#F8FAFC] text-[#212121] border border-[#E2E8F0] shadow-2xl transition-all duration-200 overflow-hidden relative ${
        isModal
          ? isExpanded
            ? 'w-full h-full max-w-6xl max-h-[96vh] rounded-[8px]'
            : 'w-full max-w-2xl h-[720px] max-h-[90vh] rounded-[8px]'
          : 'w-full h-full min-h-[620px] rounded-[6px]'
      }`}
    >
      {/* TOAST NOTIFICATION PILL */}
      {toastNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1E293B] text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* TOP HEADER: Professional Executive Assistant Bar */}
      <div className="bg-gradient-to-r from-[#1A56DB] via-[#2874F0] to-[#1E40AF] text-[#FFFFFF] px-4 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
        {/* Left: Identity & Back button */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {(onBack || onClose) && (
            <button
              id="gemini-header-back-btn"
              type="button"
              onClick={() => {
                if (showHistoryDrawer) {
                  setShowHistoryDrawer(false);
                } else if (showSystemInstructionModal) {
                  setShowSystemInstructionModal(false);
                } else if (onBack) {
                  onBack();
                } else if (onClose) {
                  onClose();
                }
              }}
              aria-label="Back"
              className="p-1.5 -ml-1 rounded-full hover:bg-white/15 text-[#FFFFFF] transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4.5 h-4.5 text-[#FFFFFF]" />
            </button>
          )}

          {/* Modern Professional Avatar */}
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 bg-white/10 border border-white/20 shadow-inner">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981] border-2 border-[#1A56DB]" />
            </span>
          </div>

          {/* Title & Assistant Role Tag */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-[#FFFFFF] tracking-tight truncate flex items-center gap-1.5">
                <span>Craftify Concierge</span>
              </h2>
              <span className="bg-[#FFE500] text-[#1E293B] text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-[2px] shrink-0 tracking-wider">
                AI Pro
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/85">
              <span className="truncate max-w-[130px] sm:max-w-[210px] font-medium">
                {selectedPersona.name}
              </span>
              <span className="opacity-60">•</span>
              <span className="font-mono text-[10px] text-white/90 bg-white/10 px-1 rounded">
                {selectedModel.replace('gemini-', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Controls */}
        <div className="flex items-center gap-1.5 shrink-0" ref={menuRef}>
          {/* PROMINENT "+ NEW CHAT" ACTION BUTTON */}
          <button
            id="gemini-new-chat-btn"
            type="button"
            onClick={handleStartNewConversation}
            className="bg-white text-[#1A56DB] hover:bg-white/95 px-2.5 py-1 sm:px-3 sm:py-1 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Start a fresh new conversation"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Role & Model Dropdown Toggle */}
          <div className="relative">
            <button
              id="gemini-role-dropdown-btn"
              type="button"
              onClick={() => {
                setShowPersonaMenu(!showPersonaMenu);
                setShowModelMenu(false);
                setShowMoreMenu(false);
              }}
              className="p-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Change Assistant Role"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 opacity-75" />
            </button>

            {/* Persona Dropdown Popover */}
            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFFFFF] text-[#212121] border border-[#E2E8F0] rounded-[6px] shadow-2xl z-50 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9] px-1">
                  <span className="font-bold text-xs text-[#0F172A]">Select Specialized AI Role</span>
                  <button
                    onClick={() => setShowPersonaMenu(false)}
                    className="p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto pr-0.5">
                  {PERSONAS.map((persona) => {
                    const isSelected = selectedPersona.id === persona.id;
                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => handleSelectPersona(persona)}
                        className={`w-full text-left p-2.5 rounded-[4px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-[#2874F0] text-[#1D4ED8]'
                            : 'bg-[#FFFFFF] hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs">{persona.name}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              isSelected ? 'bg-[#2874F0] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {persona.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-1 leading-snug line-clamp-2">
                          {persona.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Past Sessions History Toggle */}
          <button
            id="gemini-history-toggle-btn"
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="p-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer relative"
            title="Past Conversations & Archives"
          >
            <History className="w-4 h-4" />
            {savedSessions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFE500]" />
            )}
          </button>

          {/* Settings / Overflow Menu */}
          <div className="relative">
            <button
              id="gemini-overflow-menu-btn"
              type="button"
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowPersonaMenu(false);
                setShowModelMenu(false);
              }}
              className="p-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Overflow Dropdown */}
            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-[#FFFFFF] text-[#212121] border border-[#E2E8F0] rounded-[6px] shadow-2xl z-50 py-1 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={handleStartNewConversation}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] flex items-center gap-2 text-[#0F172A] transition-colors cursor-pointer font-medium"
                >
                  <RotateCcw className="w-4 h-4 text-[#FB641B]" />
                  <span>Start New Conversation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowModelMenu(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] flex items-center gap-2 text-[#0F172A] transition-colors cursor-pointer font-medium"
                >
                  <Bot className="w-4 h-4 text-[#2874F0]" />
                  <span>Select Gemini Model ({selectedModel})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSystemInstructionModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-[#F1F5F9] flex items-center gap-2 text-[#0F172A] transition-colors cursor-pointer font-medium"
                >
                  <Edit3 className="w-4 h-4 text-[#64748B]" />
                  <span>Custom System Instructions</span>
                </button>

                <div className="h-px bg-[#E2E8F0] my-1" />

                <div className="px-3.5 py-1.5 text-[10px] text-[#64748B]">
                  Powered by Gemini 3.8 Series API with full server-side key security.
                </div>
              </div>
            )}
          </div>

          {/* Model Selector Popover */}
          {showModelMenu && (
            <div className="absolute right-4 top-14 w-72 bg-[#FFFFFF] text-[#212121] border border-[#E2E8F0] rounded-[6px] shadow-2xl z-50 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#F1F5F9] px-1">
                <span className="font-bold text-xs text-[#0F172A]">Select Model Engine</span>
                <button
                  onClick={() => setShowModelMenu(false)}
                  className="p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {MODEL_OPTIONS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelMenu(false);
                        setToastNotification(`Engine set to ${m.label}`);
                      }}
                      className={`w-full text-left p-2 rounded-[4px] border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFF6FF] border-[#2874F0] text-[#1D4ED8]'
                          : 'bg-[#FFFFFF] hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                          <Icon className="w-3.5 h-3.5 text-[#2874F0]" />
                          <span>{m.label}</span>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-[#2874F0] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Maximize / Minimize toggle */}
          {isModal && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore window size' : 'Expand full screen'}
              className="p-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Close button */}
          {onClose && (
            <button
              id="gemini-close-btn"
              onClick={onClose}
              title="Close Assistant"
              className="p-1.5 rounded-[4px] bg-white/10 hover:bg-red-500 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* PAST SESSIONS DRAWER / OVERLAY */}
      {showHistoryDrawer && (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full sm:w-80 bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] animate-fadeInRight">
            <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#2874F0]" />
                <h3 className="text-xs font-bold text-[#0F172A]">Past Conversations</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#EFF6FF] border-b border-[#DBEAFE] flex items-center justify-between text-xs">
              <span className="text-[#1E40AF]">Start fresh anytime:</span>
              <button
                type="button"
                onClick={handleStartNewConversation}
                className="bg-[#2874F0] text-white px-2.5 py-1 rounded-[4px] font-bold text-xs flex items-center gap-1 hover:bg-[#1D4ED8] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {savedSessions.length === 0 ? (
                <div className="text-center py-12 text-[#94A3B8] space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-medium">No past conversations archived yet.</p>
                  <p className="text-[11px] max-w-[200px] mx-auto">
                    New conversations are started automatically every time you open the assistant.
                  </p>
                </div>
              ) : (
                savedSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleLoadSession(session)}
                    className="p-3 rounded-[6px] border border-[#E2E8F0] hover:border-[#2874F0] bg-white hover:bg-[#F8FAFC] transition-all cursor-pointer group space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2874F0] line-clamp-1">
                        {session.title}
                      </h4>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="text-[#94A3B8] hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5 transition-opacity"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.timestamp}</span>
                      </span>
                      <span className="bg-[#F1F5F9] px-1.5 py-0.5 rounded font-mono">
                        {session.messages.length} msgs
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {savedSessions.length > 0 && (
              <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all conversation history?')) {
                      setSavedSessions([]);
                      localStorage.removeItem(SESSIONS_STORAGE_KEY);
                    }
                  }}
                  className="w-full py-1.5 text-xs text-[#DC2626] hover:bg-red-50 rounded font-medium transition-colors cursor-pointer text-center"
                >
                  Clear All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SYSTEM INSTRUCTION DRAWER/MODAL */}
      {showSystemInstructionModal && (
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 text-xs space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
              <Info className="w-4 h-4 text-[#2874F0]" />
              <span>Active System Instruction ({selectedPersona.name})</span>
            </div>
            <button
              onClick={() => setShowSystemInstructionModal(false)}
              className="text-[#64748B] hover:text-[#0F172A] p-1 font-bold cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-[#64748B]">
            This prompt configures Gemini's persona, covenants knowledge base, and tone for Craftify multi-turn conversations.
          </p>
          <textarea
            value={customSystemInstruction}
            onChange={(e) => setCustomSystemInstruction(e.target.value)}
            rows={4}
            className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-2.5 font-mono text-[11px] text-[#0F172A] focus:outline-none focus:border-[#2874F0]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCustomSystemInstruction(selectedPersona.systemInstruction)}
              className="px-3 py-1 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] text-[#334155] hover:bg-[#F1F5F9] text-xs cursor-pointer font-medium"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setShowSystemInstructionModal(false)}
              className="px-3 py-1 bg-[#2874F0] text-[#FFFFFF] rounded-[4px] hover:bg-[#1D4ED8] text-xs font-bold cursor-pointer shadow-xs"
            >
              Apply Prompt
            </button>
          </div>
        </div>
      )}

      {/* ERROR ALERT BANNER */}
      {errorMessage && (
        <div className="bg-[#FFF1F2] border-b border-[#FECDD3] px-4 py-2.5 text-xs text-[#E11D48] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#E11D48] hover:underline font-bold text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SCROLLABLE CHAT THREAD */}
      <div
        id="gemini-chat-thread"
        ref={chatThreadRef}
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 bg-[#F8FAFC]"
      >
        {messages.length === 0 ? (
          /* EXECUTIVE WELCOME & PROMPT LAUNCHPAD */
          <div className="py-4 sm:py-6 max-w-2xl mx-auto space-y-4">
            {/* Header Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A56DB] to-[#2874F0] text-white shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'How can I assist your craft journey?'}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                Your dedicated intelligence engine for authentic Indian handcrafts, all-or-nothing escrow guarantees, and artisan campaigns.
              </p>
            </div>

            {/* Platform Covenants Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>₹0 Pre-Auth Escrow Protection</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Verified GI Provenance</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Direct Artisan Payout (92%)</span>
              </span>
            </div>

            {/* Role Selectors Tabs */}
            <div className="pt-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] mb-2 px-1">
                Choose Specialized Mode:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PERSONAS.map((persona) => {
                  const isSelected = selectedPersona.id === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleSelectPersona(persona)}
                      className={`p-2 rounded-[6px] border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#2874F0] shadow-xs text-[#1D4ED8] ring-1 ring-[#2874F0]/20'
                          : 'bg-[#FFFFFF] hover:bg-[#F1F5F9] border-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{persona.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-[#64748B] truncate">{persona.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Executive Quick Prompt Cards */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] px-1 flex items-center justify-between">
                <span>Suggested Questions for {selectedPersona.name}:</span>
                <span className="text-[10px] font-normal lowercase text-[#94A3B8]">click to send</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPersona.starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="p-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2874F0] rounded-[6px] text-left transition-all text-xs text-[#0F172A] flex flex-col justify-between group shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <span className="font-medium text-[#1E293B] group-hover:text-[#1D4ED8] transition-colors leading-relaxed">
                      "{prompt}"
                    </span>
                    <span className="text-[10px] text-[#2874F0] font-bold mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FB641B]" />
                      <span>Ask Concierge</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-banner note */}
            <div className="text-center pt-2">
              <span className="text-[11px] text-[#94A3B8] inline-flex items-center gap-1">
                <RotateCcw className="w-3 h-3 text-[#2874F0]" />
                <span>Every time you open the assistant, a fresh conversation is ready.</span>
              </span>
            </div>
          </div>
        ) : (
          /* ACTIVE MESSAGES THREAD */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isModel = msg.role === 'model';
            const feedback = feedbackMap[msg.id];

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {isModel && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1A56DB] to-[#2874F0] text-white p-0.5 shrink-0 shadow-xs mt-1 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[88%] sm:max-w-[82%] space-y-1.5 ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Metadata Bar */}
                  <div className={`flex items-center gap-2 text-[11px] px-1 ${isUser ? 'justify-end text-[#64748B]' : 'justify-start text-[#64748B]'}`}>
                    <span className="font-bold text-[#0F172A]">
                      {isUser ? (currentUser ? currentUser.name : 'You') : 'Craftify Concierge'}
                    </span>
                    {isModel && (
                      <span className="font-mono text-[9px] bg-[#E2E8F0] text-[#475569] px-1.5 py-0.2 rounded font-medium">
                        {msg.modelUsed || selectedModel}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed rounded-xl shadow-xs ${
                      isUser
                        ? 'bg-[#1A56DB] text-white rounded-tr-xs shadow-md'
                        : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {msg.content ? (
                          <div className="prose prose-sm max-w-none text-[#0F172A] leading-relaxed [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-[#0F172A] [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[#0F172A] [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-[#0F172A] [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_strong]:text-[#0F172A] [&_strong]:font-bold [&_code]:font-mono [&_code]:text-xs [&_code]:bg-[#F1F5F9] [&_code]:text-[#0F172A] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-[#0F172A] [&_pre]:text-white [&_pre]:p-3 [&_pre]:rounded-[6px] [&_pre]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:my-2 [&_th]:border [&_th]:border-[#E2E8F0] [&_th]:p-2 [&_th]:bg-[#F8FAFC] [&_th]:font-bold [&_th]:text-left [&_td]:border [&_td]:border-[#E2E8F0] [&_td]:p-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[#2874F0] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#475569]">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        ) : (
                          msg.isStreaming && (
                            <div className="flex items-center gap-2.5 text-xs text-[#2874F0] py-1 font-medium">
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2874F0] animate-ping" />
                              <span>Synthesizing response with Craftify Gemini engine...</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Assistant Footer Actions (Copy, Feedback, Retry) */}
                  {isModel && !msg.isStreaming && msg.content && (
                    <div className="flex flex-col gap-2 pt-0.5 px-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                        <button
                          onClick={() => handleCopyMessage(msg.content, index)}
                          className="px-2 py-1 hover:text-[#1A56DB] hover:bg-[#F1F5F9] rounded flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <span className="text-[#CBD5E1]">•</span>

                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded hover:text-[#1A56DB] hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                            feedback === 'up' ? 'text-emerald-600 font-bold' : ''
                          }`}
                          title="Helpful response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded hover:text-rose-600 hover:bg-[#F1F5F9] transition-colors cursor-pointer ${
                            feedback === 'down' ? 'text-rose-600 font-bold' : ''
                          }`}
                          title="Report inaccurate info"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        {index === messages.length - 1 && (
                          <>
                            <span className="text-[#CBD5E1]">•</span>
                            <button
                              onClick={handleRetryLast}
                              className="px-2 py-1 hover:text-[#1A56DB] hover:bg-[#F1F5F9] rounded flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Smart Contextual Follow-Up Suggestions for the Last Message */}
                      {index === messages.length - 1 && (
                        <div className="pt-1.5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                            Suggested follow-ups:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {getFollowUpSuggestions(msg.content).map((suggestion, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => sendMessage(suggestion)}
                                className="text-left text-[11px] bg-white hover:bg-[#EFF6FF] border border-[#CBD5E1] hover:border-[#2874F0] text-[#334155] hover:text-[#1D4ED8] px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-2xs"
                              >
                                {suggestion} →
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#FB641B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-xs">
                    {currentUser ? currentUser.avatarInitials : <UserIcon className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div id="gemini-chat-thread-bottom" />
      </div>

      {/* COMPOSER / INPUT FOOTER */}
      <div className="p-3 sm:p-4 bg-[#FFFFFF] border-t border-[#E2E8F0] shrink-0 space-y-2.5">
        {/* Context Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Escrow Protected</span>
            </span>
            <span className="hidden sm:inline text-[#CBD5E1]">•</span>
            <span className="hidden sm:inline">Role: {selectedPersona.name}</span>
          </div>

          {isLoading ? (
            <button
              onClick={handleStopStreaming}
              className="text-[#DC2626] font-bold hover:underline flex items-center gap-1.5 cursor-pointer bg-red-50 px-2 py-0.5 rounded border border-red-200"
            >
              <span className="w-2 h-2 rounded-xs bg-[#DC2626] animate-pulse" />
              <span>Stop Generating</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartNewConversation}
              className="text-[#2874F0] hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset & New Chat</span>
            </button>
          )}
        </div>

        {/* Real-time Language Detection Bar */}
        {(isListening || (detectedLang && detectedLang.code !== language)) && (
          <div className="flex items-center justify-between text-xs px-2.5 py-1 rounded-[4px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
            {isListening ? (
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span className="text-red-700">Listening... Speak in English, Hindi, or any Indian regional language</span>
              </div>
            ) : detectedLang ? (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Detected language: <strong>{detectedLang.name}</strong> ({detectedLang.nativeName})</span>
              </div>
            ) : null}

            {detectedLang && detectedLang.code !== language && (
              <button
                type="button"
                onClick={() => setLanguage(detectedLang.code as any)}
                className="text-[11px] font-bold text-[#1D4ED8] underline hover:text-[#1E40AF] cursor-pointer ml-auto"
              >
                Switch app language to {detectedLang.nativeName}
              </button>
            )}
          </div>
        )}

        {/* Composer Input Box */}
        <div className="relative flex items-end gap-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] p-2 focus-within:border-[#2874F0] focus-within:bg-[#FFFFFF] focus-within:ring-2 focus-within:ring-[#2874F0]/15 transition-all shadow-2xs">
          <textarea
            ref={inputRef}
            id="gemini-chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about escrow covenants, GI tags, artisan campaigns, or store items..."
            rows={2}
            disabled={isLoading}
            className="w-full bg-transparent resize-none focus:outline-none text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] min-h-[44px] max-h-32 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <button
                id="gemini-chat-voice-btn"
                type="button"
                onClick={() => (isListening ? stopListening() : startListening())}
                disabled={isLoading}
                className={`p-2 rounded-[4px] transition-all flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-sm font-bold'
                    : 'bg-white text-[#2874F0] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                }`}
                title={isListening ? 'Stop recording voice' : 'Voice input in your native language'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send Button */}
            <button
              id="gemini-send-btn"
              type="button"
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 sm:px-3 sm:py-2 rounded-[4px] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                inputValue.trim() && !isLoading
                  ? 'bg-[#1A56DB] hover:bg-[#1E40AF] text-white active:scale-95 cursor-pointer'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

        {/* Footer Meta Row */}
        <div className="flex justify-between items-center px-1 text-[10px] text-[#94A3B8]">
          <span>Craftify AI Assistant • All-or-nothing escrow covenants strictly upheld.</span>
          <span className="hidden sm:inline">Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for line break</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        id="gemini-chat-modal-overlay"
        className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4 md:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        {chatContainer}
      </div>
    );
  }

  return chatContainer;
};
