import React, { useState } from 'react';
import { Sparkles, AlertCircle, Check, Loader2 } from 'lucide-react';
import { suggestPrice, SuggestPriceResponse, CraftComplexityLevel } from '../../api/aiTools';
import { formatINR } from '../../utils/format';

interface AIPriceSuggesterProps {
  craftType: string;
  region: string;
  onApplyPrice: (price: number) => void;
  className?: string;
  defaultMaterialCost?: number | string;
  defaultHoursSpent?: number | string;
  defaultComplexity?: CraftComplexityLevel;
}

const COMPLEXITY_DESCRIPTIONS: Record<CraftComplexityLevel, string> = {
  basic: 'Basic: straightforward techniques and simpler detail work.',
  skilled: 'Skilled: practiced techniques with moderate detail and experience.',
  master: 'Master: intricate detail work, years of specialized training.',
};

export const AIPriceSuggester: React.FC<AIPriceSuggesterProps> = ({
  craftType,
  region,
  onApplyPrice,
  className = '',
  defaultMaterialCost = '',
  defaultHoursSpent = '',
  defaultComplexity = 'skilled',
}) => {
  const [materialCost, setMaterialCost] = useState<string>(String(defaultMaterialCost || ''));
  const [hoursSpent, setHoursSpent] = useState<string>(String(defaultHoursSpent || ''));
  const [complexityLevel, setComplexityLevel] = useState<CraftComplexityLevel>(defaultComplexity);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestPriceResponse | null>(null);
  const [appliedPrice, setAppliedPrice] = useState<number | null>(null);

  const handleSuggest = async () => {
    const costNum = Number(materialCost);
    const hoursNum = Number(hoursSpent);

    if (isNaN(costNum) || costNum < 0 || !materialCost.trim()) {
      setErrorMessage('Please enter raw material cost in ₹.');
      return;
    }
    if (isNaN(hoursNum) || hoursNum < 0 || !hoursSpent.trim()) {
      setErrorMessage('Please enter the hours spent handcrafting this item.');
      return;
    }
    if (!craftType?.trim()) {
      setErrorMessage('Please specify the craft type above first.');
      return;
    }
    if (!region?.trim()) {
      setErrorMessage('Please specify the artisan region/state above first.');
      return;
    }
    if (!complexityLevel) {
      setErrorMessage('Please select craft complexity level.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAppliedPrice(null);

    try {
      const result = await suggestPrice({
        craft_type: craftType,
        material_cost: costNum,
        hours_spent: hoursNum,
        region,
        complexity_level: complexityLevel,
      });
      setSuggestion(result);
    } catch (err: any) {
      console.warn('Suggest price notice:', err?.message || err);
      setErrorMessage(err?.message || "Couldn't generate this right now — try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePrice = () => {
    if (!suggestion) return;
    const midpoint = Math.round((suggestion.price_range_min + suggestion.price_range_max) / 2);
    onApplyPrice(midpoint);
    setAppliedPrice(midpoint);
  };

  return (
    <div
      id="ai-price-suggester-container"
      data-testid="ai-price-suggester"
      aria-label="Suggest a fair price"
      className={`mt-2 p-3 sm:p-3.5 rounded-[4px] bg-[#F1F3F6] border border-[#388E3C]/20 space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[#388E3C]/15 pb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#388E3C] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#388E3C]" />
          <span>Suggest a fair price • Fair Artisan Pricing</span>
        </div>
        <span className="text-[10px] text-[#878787]">
          Cost & Margin Calculator
        </span>
      </div>

      {/* Input Group: Material Cost (₹) & Hours Spent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            Raw Material Cost (₹) *
          </label>
          <div className="relative">
            <span className="text-xs font-bold text-[#878787] absolute left-2.5 top-1/2 -translate-y-1/2">₹</span>
            <input
              id="ai-material-cost-input"
              type="number"
              min={0}
              step={50}
              value={materialCost}
              onChange={(e) => {
                setMaterialCost(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. 650"
              className="w-full pl-6 pr-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs font-bold text-[#212121] focus:outline-none focus:border-[#388E3C]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1">
            Labor Hours Spent *
          </label>
          <input
            id="ai-hours-spent-input"
            type="number"
            min={0}
            step={0.5}
            value={hoursSpent}
            onChange={(e) => {
              setHoursSpent(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. 8"
            className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs font-bold text-[#212121] focus:outline-none focus:border-[#388E3C]"
          />
        </div>
      </div>

      {/* Required Complexity Dropdown */}
      <div id="complexity-level-group">
        <label
          htmlFor="complexity_level"
          id="ai-complexity-label"
          className="block text-[10px] uppercase tracking-wider font-bold text-[#212121] mb-1"
        >
          Craft Complexity Level *
        </label>
        <select
          id="complexity_level"
          name="complexity_level"
          data-testid="complexity-level-select"
          aria-describedby="ai-complexity-helper"
          value={complexityLevel}
          onChange={(e) => {
            const nextLevel = e.target.value as CraftComplexityLevel;
            setComplexityLevel(nextLevel);
            if (errorMessage) setErrorMessage(null);
          }}
          className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs font-bold text-[#212121] focus:outline-none focus:border-[#388E3C]"
        >
          <option value="basic">Basic</option>
          <option value="skilled">Skilled</option>
          <option value="master">Master-level</option>
        </select>
        <p
          id="ai-complexity-helper"
          data-testid="complexity-helper-text"
          className="mt-1 text-[11px] text-[#555555] italic"
          aria-live="polite"
        >
          {COMPLEXITY_DESCRIPTIONS[complexityLevel]}
        </p>
      </div>

      {/* Action Button & Loading Indicator */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          id="btn-ai-suggest-price"
          type="button"
          disabled={isLoading}
          onClick={handleSuggest}
          className={`px-3 py-1.5 rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
            isLoading
              ? 'bg-[#388E3C]/70 text-[#FFFFFF] cursor-wait'
              : 'bg-[#388E3C] hover:bg-[#2E7D32] text-[#FFFFFF]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Suggesting a fair price...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest a fair price</span>
            </>
          )}
        </button>

        {isLoading && (
          <span className="text-xs text-[#388E3C] font-medium animate-pulse">
            Suggesting a fair price...
          </span>
        )}
      </div>

      {/* Inline Error State */}
      {errorMessage && (
        <div
          id="ai-price-error"
          className="p-2.5 rounded-[2px] bg-[#FFF3EC] border border-[#FB641B]/30 text-[#FB641B] text-xs flex items-center gap-1.5 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Suggestion Callout Box below price field */}
      {suggestion && !isLoading && (
        <div
          id="ai-price-suggestion-callout"
          className="mt-2 p-3 rounded-[4px] bg-[#FFFFFF] border-2 border-[#388E3C]/40 shadow-xs space-y-2 animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#878787] font-bold block">
                Recommended Fair Retail Range
              </span>
              <div className="text-base sm:text-lg font-bold text-[#388E3C]">
                {formatINR(suggestion.price_range_min)} – {formatINR(suggestion.price_range_max)}
              </div>
            </div>

            <button
              id="btn-ai-use-price"
              type="button"
              onClick={handleUsePrice}
              className="px-3.5 py-1.5 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use this price ({formatINR(Math.round((suggestion.price_range_min + suggestion.price_range_max) / 2))})</span>
            </button>
          </div>

          <div className="text-xs text-[#212121] leading-relaxed">
            <span className="font-bold text-[#388E3C]">Economics Reasoning: </span>
            {suggestion.reasoning}
          </div>

          {suggestion.market_reference_min != null && suggestion.market_reference_max != null && (
            <div
              id="ai-market-reference-note"
              data-testid="market-reference-note"
              className="text-[11px] text-[#878787] leading-normal pt-1.5 border-t border-[#F0F0F0]"
            >
              <span>
                Similar handmade items in this category typically sell for {formatINR(suggestion.market_reference_min)}–{formatINR(suggestion.market_reference_max)}.
              </span>
            </div>
          )}

          {appliedPrice && (
            <div className="text-[11px] font-bold text-[#388E3C] flex items-center gap-1 bg-[#EAF8EB] p-1.5 rounded-[2px]">
              <Check className="w-3.5 h-3.5" />
              <span>Price {formatINR(appliedPrice)} applied to price field.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

