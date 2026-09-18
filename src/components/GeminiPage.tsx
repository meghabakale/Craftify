import React from 'react';
import { GeminiChat } from './GeminiChat';
import { User } from '../types';
import { ArrowLeft, ShieldCheck, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';

interface GeminiPageProps {
  currentUser: User | null;
  onBack: () => void;
}

export const GeminiPage: React.FC<GeminiPageProps> = ({ currentUser, onBack }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-[6px] border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] rounded-[4px] transition-colors cursor-pointer"
            title="Return to marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                Craftify AI Concierge
              </h1>
              <span className="bg-[#1A56DB] text-[#FFFFFF] text-[10px] uppercase px-2 py-0.5 font-bold tracking-wider rounded">
                Multi-Turn Live
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Intelligent multi-model platform assistant for instant escrow queries, campaign strategy, artisan discovery, and order guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] bg-[#F8FAFC] px-3 py-1.5 rounded-[4px] border border-[#E2E8F0]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Connected to Gemini 3 Series Engine</span>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="h-[780px] max-h-[84vh] border border-[#E2E8F0] bg-[#FFFFFF] rounded-[8px] shadow-sm overflow-hidden">
        <GeminiChat currentUser={currentUser} onBack={onBack} isModal={false} />
      </div>

      {/* Capability Feature Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[6px] shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escrow & Covenant Transparency</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Instant clarification on Craftify’s ₹0 pre-authorization holds, 5% fee models, milestone payouts, and backer fund safety covenants.
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[6px] shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A]">
            <Rocket className="w-4 h-4 text-[#FB641B]" />
            <span>Creator Campaign Architect</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Collaborate with Gemini Pro to craft reward matrices, factory milestone schedules, prototyping narratives, and shop graduation roadmaps.
          </p>
        </div>

        <div className="p-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[6px] shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-[#0F172A]">
            <Sparkles className="w-4 h-4 text-[#2874F0]" />
            <span>Authentic Heritage Discovery</span>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Inspect authentic GI tags, master artisan pedigrees, and handcraft techniques from Khurja ceramics to Varanasi silks and Kashmir pashminas.
          </p>
        </div>
      </div>
    </div>
  );
};
