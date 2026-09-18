import React from 'react';
import { Sparkles, Bot, MessageSquare } from 'lucide-react';

interface GeminiFloatingLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  messageCount?: number;
}

export const GeminiFloatingLauncher: React.FC<GeminiFloatingLauncherProps> = ({
  isOpen,
  onToggle,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        id="gemini-floating-launcher-btn"
        onClick={onToggle}
        aria-label="Open Craftify AI Concierge"
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer focus:outline-none transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(26,86,219,0.35)]"
      >
        {/* Subtle breathing aura */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#1A56DB] via-[#2874F0] to-[#10B981] opacity-40 blur-md animate-pulse pointer-events-none" />

        {/* Clean solid circle button */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#1A56DB] via-[#2874F0] to-[#1D4ED8] flex items-center justify-center border-2 border-white/30 shadow-lg">
          {/* Bot Icon with Sparkle */}
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-sm transition-transform group-hover:scale-110" />
            <Sparkles className="w-3 h-3 text-[#FFE500] absolute -top-1 -right-1.5 animate-pulse" />
          </div>
        </div>

        {/* Live Status Indicator Pulse Badge */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#10B981] border-2 border-white items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        </span>

        {/* Modern Hover Tooltip */}
        <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-full bg-[#0F172A] border border-white/10 text-white text-xs font-semibold shadow-2xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap pointer-events-none flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
          <span>Ask Craftify AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          {/* Tooltip Arrow */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#0F172A]" />
        </div>
      </button>
    </div>
  );
};
