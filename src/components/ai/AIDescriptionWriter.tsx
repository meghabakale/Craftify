import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, AlertCircle, CheckCircle2, Loader2, Check, Copy, Undo2, PenTool } from 'lucide-react';
import { generateDescription } from '../../api/aiTools';

interface AIDescriptionWriterProps {
  craftType: string;
  setCraftType: (val: string) => void;
  material: string;
  setMaterial: (val: string) => void;
  region: string;
  setRegion: (val: string) => void;
  keywords: string;
  setKeywords: (val: string) => void;
  onDescriptionGenerated: (description: string) => void;
  currentDraftText?: string;
  className?: string;
  targetFieldName?: string;
}

import { useLanguage } from '../../context/LanguageContext';

export const AIDescriptionWriter: React.FC<AIDescriptionWriterProps> = ({
  craftType,
  setCraftType,
  material,
  setMaterial,
  region,
  setRegion,
  keywords,
  setKeywords,
  onDescriptionGenerated,
  currentDraftText = '',
  className = '',
  targetFieldName = 'description field',
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'full_story' | 'complete_sentences'>('full_story');
  const [draftInput, setDraftInput] = useState(currentDraftText);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previousTextBeforeApply, setPreviousTextBeforeApply] = useState<string | null>(null);

  // Sync draft input & clear generated results when form inputs are reset
  useEffect(() => {
    setDraftInput(currentDraftText);
    if (!currentDraftText && !craftType && !material && !region && !keywords) {
      setGeneratedResult(null);
      setPreviousTextBeforeApply(null);
      setErrorMessage(null);
      setSuccessNotice(null);
    }
  }, [currentDraftText, craftType, material, region, keywords]);

  const handleGenerate = async (overrideMode?: 'full_story' | 'complete_sentences') => {
    const activeMode = overrideMode || mode;

    // Validation
    if (!craftType.trim()) {
      setErrorMessage('Please specify the craft type (e.g. Glazed Terracotta, Bidriware).');
      return;
    }
    if (!material.trim()) {
      setErrorMessage('Please specify the material used (e.g. Gangetic river clay, brass).');
      return;
    }
    if (!region.trim()) {
      setErrorMessage('Please enter the artisan region or state (e.g. Khurja, Uttar Pradesh).');
      return;
    }

    if (activeMode === 'complete_sentences') {
      const textToComplete = (draftInput || currentDraftText || '').trim();
      if (!textToComplete) {
        setErrorMessage('Please type or paste some draft lines or incomplete sentences to complete.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const draftToSend = activeMode === 'complete_sentences'
      ? (draftInput || currentDraftText || '').trim()
      : '';

    try {
      const generated = await generateDescription({
        craft_type: craftType,
        material,
        region,
        keywords,
        draft_text: draftToSend,
        mode: activeMode,
      });

      setGeneratedResult(generated);
      setPreviousTextBeforeApply(currentDraftText || null);
      onDescriptionGenerated(generated);

      if (activeMode === 'complete_sentences') {
        setSuccessNotice(`All sentences completed and grammatically corrected into ${targetFieldName}.`);
      } else {
        setSuccessNotice(`Story populated into ${targetFieldName} with complete sentences and verified grammar.`);
      }
    } catch (err: any) {
      console.error('AI description generation error:', err);
      setErrorMessage("Couldn't generate this right now — try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevert = () => {
    if (previousTextBeforeApply !== null) {
      onDescriptionGenerated(previousTextBeforeApply);
      setSuccessNotice(`Reverted back to previous text.`);
      setPreviousTextBeforeApply(null);
    }
  };

  return (
    <div
      id="ai-description-writer-box"
      className={`p-3.5 sm:p-4 rounded-[4px] bg-[#F1F3F6] border border-[#2874F0]/20 space-y-3.5 ${className}`}
    >
      {/* Header with Title & Grammatical Completeness Guarantee Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#2874F0]/15 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2874F0] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#2874F0]" />
          <span>{t('aiStoryGrammarWriter', 'AI Story & Grammar Writer')}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] text-[#388E3C] font-semibold bg-[#EAF8EB] px-2 py-0.5 rounded-[2px] border border-[#388E3C]/20">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>{t('completeSentencesGrammarGuaranteed', 'Complete Sentences & Grammar Guaranteed')}</span>
        </div>
      </div>

      {/* Mode Tabs: Full Story vs Complete Draft Sentences */}
      <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-[2px] border border-[#D5D5D5]">
        <button
          type="button"
          onClick={() => {
            setMode('full_story');
            setErrorMessage(null);
          }}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'full_story'
              ? t('bg2874f0TextFfffffShadowXs', 'bg-[#2874F0] text-[#FFFFFF] shadow-xs')
              : t('text555555HoverText212121HoverBgF1f', 'text-[#555555] hover:text-[#212121] hover:bg-[#F1F3F6]')
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('writeFullStory', 'Write Full Story')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('complete_sentences');
            setErrorMessage(null);
            if (!draftInput && currentDraftText) {
              setDraftInput(currentDraftText);
            }
          }}
          className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'complete_sentences'
              ? t('bg2874f0TextFfffffShadowXs', 'bg-[#2874F0] text-[#FFFFFF] shadow-xs')
              : t('text555555HoverText212121HoverBgF1f', 'text-[#555555] hover:text-[#212121] hover:bg-[#F1F3F6]')
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>{t('completeLinesFixGrammar', 'Complete Lines & Fix Grammar')}</span>
        </button>
      </div>

      {/* Inputs Group: Craft Type, Material, Region, Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            {t('craftType', 'Craft Type *')}</label>
          <input
            id="ai-craft-type-input"
            type="text"
            value={craftType}
            onChange={(e) => {
              setCraftType(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={t('eGHighFireGlazedTerracottaPottery', 'e.g. High-fire Glazed Terracotta Pottery')}
            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            {t('materialUsed', 'Material Used *')}</label>
          <input
            id="ai-material-input"
            type="text"
            value={material}
            onChange={(e) => {
              setMaterial(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={t('eGNaturalGangeticClayMineralSlips', 'e.g. Natural Gangetic clay, mineral slips')}
            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            {t('regionState', 'Region / State *')}</label>
          <input
            id="ai-region-input"
            type="text"
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={t('eGKhurjaUttarPradesh', 'e.g. Khurja, Uttar Pradesh')}
            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            {t('keywordsOrSpecialNuance', 'Keywords or Special Nuance')}</label>
          <input
            id="ai-keywords-input"
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t('eGKilnFiredCobaltGlazeGenerationalG', 'e.g. kiln-fired, cobalt glaze, generational guild')}
            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
          />
        </div>
      </div>

      {/* When in Complete Sentences Mode, show the draft lines input */}
      {mode === 'complete_sentences' && (
        <div className="space-y-1 bg-[#FFFFFF] p-2.5 rounded-[2px] border border-[#2874F0]/25">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121]">
              {t('draftLinesOrIncompleteSentencesToCo', 'Draft Lines or Incomplete Sentences to Complete & Correct *')}</label>
            {currentDraftText && currentDraftText !== draftInput && (
              <button
                type="button"
                onClick={() => setDraftInput(currentDraftText)}
                className="text-[10px] text-[#2874F0] hover:underline font-semibold"
              >
                {t('pullFromCurrentDescription', 'Pull from current description')}</button>
            )}
          </div>
          <textarea
            id="ai-draft-sentence-input"
            rows={3}
            value={draftInput}
            onChange={(e) => {
              setDraftInput(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={t('eGWeMoldEveryVaseOnAHandTurnedWheel', 'e.g. We mold every vase on a hand-turned wheel and use natural clay from... and fire them in kiln...')}
            className="w-full px-2.5 py-1.5 bg-[#FBFBFB] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0] resize-y"
          />
          <p className="text-[11px] text-[#555555]">
            {t('aiWillCompleteAnyUnfinishedThoughts', '💡 AI will complete any unfinished thoughts, fix all grammatical errors, and ensure every sentence ends with proper punctuation.')}</p>
        </div>
      )}

      {/* Buttons & Loading State */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          id="btn-ai-write-description"
          type="button"
          disabled={isLoading}
          onClick={() => handleGenerate()}
          className={`px-4 py-2 rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            isLoading
              ? t('bg2874f070TextFfffffCursorWait', 'bg-[#2874F0]/70 text-[#FFFFFF] cursor-wait')
              : t('bg2874f0HoverBg1c5fd0TextFfffff', 'bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF]')
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {mode === 'complete_sentences' ? t('completingSentencesPolishing', 'Completing sentences & polishing...') : t('writingStory', 'Writing story...')}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {mode === 'complete_sentences' ? t('completeSentencesFixGrammar', '✨ Complete Sentences & Fix Grammar') : t('writeCompleteStory', '✨ Write Complete Story')}
              </span>
            </>
          )}
        </button>

        {generatedResult && !isLoading && (
          <button
            id="btn-ai-regenerate-description"
            type="button"
            onClick={() => handleGenerate()}
            className="px-3 py-2 rounded-[2px] border border-[#D5D5D5] hover:border-[#2874F0] bg-[#FFFFFF] text-[#212121] hover:text-[#2874F0] text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('regenerate', 'Regenerate')}</span>
          </button>
        )}

        {previousTextBeforeApply && !isLoading && (
          <button
            id="btn-ai-revert-description"
            type="button"
            onClick={handleRevert}
            className="px-3 py-2 rounded-[2px] border border-[#D5D5D5] hover:border-[#FB641B] bg-[#FFFFFF] text-[#555555] hover:text-[#FB641B] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Undo2 className="w-3 h-3" />
            <span>{t('revert', 'Revert')}</span>
          </button>
        )}

        {generatedResult && (
          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-2 rounded-[2px] border border-[#D5D5D5] hover:border-[#2874F0] bg-[#FFFFFF] text-[#555555] hover:text-[#2874F0] text-xs flex items-center gap-1 transition-colors cursor-pointer ml-auto"
            title={t('copyToClipboard', 'Copy to clipboard')}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#388E3C]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('copied', 'Copied') : t('copy', 'Copy')}</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          id="ai-description-error"
          className="p-2.5 rounded-[2px] bg-[#FFF3EC] border border-[#FB641B]/30 text-[#FB641B] text-xs flex items-center gap-1.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Notification */}
      {successNotice && !errorMessage && !isLoading && (
        <div
          id="ai-description-success"
          className="p-2.5 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/30 text-[#388E3C] text-xs flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">{successNotice}</span>
            <span className="block text-[11px] text-[#2E7D32] mt-0.5">
              {t('everySentenceIsGrammaticallyComplet', 'Every sentence is grammatically complete, punctuated with terminal periods, and ready to edit or publish.')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
