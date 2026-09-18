import React, { useState, useEffect } from 'react';
import { Campaign, RewardTier } from '../types';
import { DEFAULT_REWARD_TIERS } from '../data/mockData';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldAlert, CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { SmartInput } from './common/SmartInput';
import { formatDeadlineDate } from '../utils/settleCampaign';

interface PledgeModalProps {
  campaign: Campaign | null;
  initialTierId?: string;
  defaultUserName?: string;
  onClose: () => void;
  onNavigateToMyPledges?: () => void;
  onConfirmPledge: (
    campaign: Campaign,
    amount: number,
    tierTitle: string,
    backerName: string,
    tierId?: string
  ) => void;
}

export const PledgeModal: React.FC<PledgeModalProps> = ({
  campaign,
  initialTierId,
  defaultUserName = 'Aarav Sharma',
  onClose,
  onNavigateToMyPledges,
  onConfirmPledge,
}) => {
  const { t } = useLanguage();
  const tiers = campaign?.rewardTiers && campaign.rewardTiers.length > 0
    ? campaign.rewardTiers
    : DEFAULT_REWARD_TIERS;

  const initialIndex = initialTierId ? tiers.findIndex((t) => t.id === initialTierId) : 0;
  const [selectedTierIndex, setSelectedTierIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [backerName, setBackerName] = useState<string>(defaultUserName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [confirmedTierTitle, setConfirmedTierTitle] = useState<string>('');

  useEffect(() => {
    if (initialTierId) {
      const idx = tiers.findIndex((t) => t.id === initialTierId);
      if (idx >= 0) setSelectedTierIndex(idx);
    }
  }, [initialTierId, campaign?.id]);

  if (!campaign) return null;

  const currentTier = tiers[selectedTierIndex] ?? tiers[0];
  const finalAmount = customAmount ? parseFloat(customAmount) || currentTier.pledgeAmount : currentTier.pledgeAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backerName.trim()) {
      setNameError('Please enter your name to register your pledge.');
      return;
    }
    setNameError(null);
    setConfirmedAmount(finalAmount);
    setConfirmedTierTitle(currentTier.title);
    
    // Fire the confirmation handler in App.tsx (updates campaign, backers list, and user pledges)
    onConfirmPledge(
      campaign,
      finalAmount,
      currentTier.title,
      backerName.trim(),
      currentTier.id
    );

    // Show the required Kickstarter-style authorized escrow confirmation view
    setIsAuthorized(true);
  };

  return (
    <div
      id="pledge-modal-overlay"
      className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="pledge-modal-dialog"
        className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-[#212121]"
      >
        {/* POST-AUTHORIZATION ESCROW CONFIRMATION SCREEN */}
        {isAuthorized ? (
          <div id="pledge-authorized-confirmation" className="space-y-4">
            <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#388E3C] font-bold bg-[#EAF8EB] px-2 py-0.5 rounded-[2px] border border-[#388E3C]/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('authorizedBadge', 'Escrow Hold Active')}
                </span>
                <span className="text-xs text-[#878787] font-semibold">• {campaign.code}</span>
              </div>
              <button
                id="btn-close-authorized-modal"
                onClick={onClose}
                className="p-1 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#EAF8EB] text-[#388E3C] flex items-center justify-center border border-[#388E3C]/20 shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-1">
                {t('pledgeAuthorizedNotice', 'Pledge Authorization Confirmed')}
              </h2>
              {/* EXACT PROMPT MANDATED COPY */}
              <div className="p-4 bg-[#EAF8EB] border border-[#388E3C]/30 rounded-[4px] my-3 text-left">
                <p className="font-bold text-sm text-[#212121] leading-snug">
                  Your pledge is authorized for {formatINR(confirmedAmount)}. You'll only be charged if this campaign reaches its goal by {formatDeadlineDate(campaign.deadline, campaign.daysLeft)}.
                </p>
                <p className="text-xs text-[#666666] mt-2">
                  This is the Craftify all-or-nothing crowdfunding escrow model. No payment was charged today — you have authorized an escrow pledge hold.
                </p>
              </div>
            </div>

            {/* Escrow Transaction Summary */}
            <div className="bg-[#F1F3F6] border border-[#EAEAEA] rounded-[4px] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-2">
                <span className="text-[#878787] uppercase font-bold">{t('yourNameLabel', 'Backer Identity')}</span>
                <span className="font-bold text-[#212121]">{backerName}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-2">
                <span className="text-[#878787] uppercase font-bold">{t('totalAmount', 'Authorized Amount')}</span>
                <span className="font-bold text-[#212121] text-sm">{formatINR(confirmedAmount)}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-2">
                <span className="text-[#878787] uppercase font-bold">{t('rewardTiers', 'Selected Reward')}</span>
                <span className="font-bold text-[#212121]">{confirmedTierTitle}</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-[#EAEAEA] pb-2">
                <span className="text-[#878787] uppercase font-bold">Campaign Progress</span>
                <span className="font-bold text-[#388E3C]">Updated Live (+{formatINR(confirmedAmount)})</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#878787] uppercase font-bold">Immediate Charge</span>
                <span className="font-bold text-[#388E3C]">₹0 (Conditional Escrow Hold)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                id="btn-return-to-campaign"
                onClick={onClose}
                className="w-full py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>{t('viewAll', 'View Campaign')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-go-to-my-pledges"
                onClick={() => {
                  onClose();
                  if (onNavigateToMyPledges) {
                    onNavigateToMyPledges();
                  }
                }}
                className="w-full py-2.5 rounded-[2px] border border-[#2874F0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>View in My Pledges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* PLEDGE FORM */
          <form onSubmit={handleSubmit} id="form-pledge-authorization">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#2874F0] font-bold bg-[#F1F3F6] px-1.5 py-0.5 rounded-[2px]">
                    {t('escrowProtected', 'Authorization Escrow')}
                  </span>
                  <span className="text-[11px] text-[#878787]">• {campaign.code}</span>
                </div>
                <h2 className="text-xl font-bold text-[#212121]">
                  {t('backThisProject', 'Back')} {campaign.title}
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">by {campaign.creator}</p>
              </div>

              <button
                type="button"
                id="btn-close-pledge-modal"
                onClick={onClose}
                className="p-1 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conditional Escrow Notice */}
            <div className="p-3 bg-[#F1F3F6] border border-[#EAEAEA] rounded-[4px] mb-4 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#2874F0] shrink-0 mt-0.5" />
              <div className="text-xs text-[#212121]">
                <strong className="block font-bold text-[#2874F0]">{t('escrowProtected', 'All-or-Nothing Escrow Covenant')}</strong>
                {t('escrowGuaranteeDesc', "Your pledge is authorized today with zero upfront charge. You will only be charged if this artisan campaign reaches its goal.")}
              </div>
            </div>

            {/* 1. Enter Name */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                {t('yourNameLabel', 'Your Full Name (for artisan backer ledger & delivery)')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#878787] z-10">
                  <User className="w-4 h-4" />
                </span>
                <SmartInput
                  id="input-backer-name"
                  type="text"
                  value={backerName}
                  onChange={(e) => {
                    setBackerName(e.target.value);
                    if (e.target.value.trim()) setNameError(null);
                  }}
                  onValueChange={(val) => {
                    setBackerName(val);
                    if (val.trim()) setNameError(null);
                  }}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full pl-9 pr-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  required
                />
              </div>
              {nameError && (
                <p className="text-xs text-[#FB641B] mt-1 font-semibold">{nameError}</p>
              )}
            </div>

            {/* 2. Choose Reward Tier (3 Tiers) */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold">
                  {t('selectRewardTier', 'Choose a Reward Tier')}
                </label>
                <span className="text-[11px] text-[#878787]">3 tiers available</span>
              </div>

              {tiers.map((tier, idx) => {
                const isSelected = selectedTierIndex === idx && !customAmount;
                const isCapped = tier.maxBackers !== undefined;
                const isSoldOut = isCapped && tier.backersCount >= (tier.maxBackers ?? 0);

                return (
                  <div
                    key={tier.id || idx}
                    onClick={() => {
                      if (!isSoldOut) {
                        setSelectedTierIndex(idx);
                        setCustomAmount('');
                      }
                    }}
                    className={`p-3 rounded-[4px] border transition-colors ${
                      isSoldOut
                        ? 'opacity-60 bg-[#F1F3F6] border-[#EAEAEA] cursor-not-allowed'
                        : isSelected
                        ? 'border-[#2874F0] bg-[#F1F3F6] ring-1 ring-[#2874F0] cursor-pointer'
                        : 'border-[#EAEAEA] bg-[#FFFFFF] hover:border-[#2874F0]/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tier-choice"
                          checked={isSelected}
                          disabled={isSoldOut}
                          onChange={() => {
                            setSelectedTierIndex(idx);
                            setCustomAmount('');
                          }}
                          className="accent-[#2874F0]"
                        />
                        <span className="font-bold text-sm text-[#212121]">{tier.title}</span>
                      </div>
                      <span className="text-sm font-bold text-[#212121]">
                        {formatINR(tier.pledgeAmount)}
                      </span>
                    </div>

                    <p className="text-xs text-[#878787] mb-1.5 pl-5 leading-relaxed">
                      {tier.description}
                    </p>

                    <div className="text-[11px] text-[#878787] pl-5 flex flex-wrap justify-between gap-1">
                      <span>{t('estimatedDelivery', 'Est. Delivery')}: <strong className="text-[#212121]">{tier.estimatedDelivery}</strong></span>
                      {isCapped && (
                        <span className={isSoldOut ? 'text-[#FB641B] font-bold' : ''}>
                          {isSoldOut ? t('tierSoldOut', 'Sold out') : `${tier.backersCount} ${t('leftOf', 'of')} ${tier.maxBackers} ${t('claimed', 'claimed')}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. Custom Amount */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                {t('chooseRewardTierOrCustom', 'Or enter a custom pledge amount (₹ INR)')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1.5 text-xs text-[#878787]">₹</span>
                <input
                  id="input-custom-pledge-amount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Min ${formatINR(currentTier.pledgeAmount)}`}
                  min={1}
                  className="w-full pl-7 pr-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>
              <p className="text-[11px] text-[#878787] mt-0.5">
                Custom pledges still qualify for the selected reward tier.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#F0F0F0] pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-xs uppercase tracking-wider font-bold text-[#212121] transition-colors cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>

              <button
                id="btn-confirm-pledge-action"
                type="submit"
                className="px-5 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>{t('backThisProject', 'Authorize Pledge of')} {formatINR(finalAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
