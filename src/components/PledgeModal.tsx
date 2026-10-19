import React, { useState, useEffect, useRef } from 'react';
import { Campaign, RewardTier } from '../types';
import { DEFAULT_REWARD_TIERS } from '../data/mockData';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Layers,
} from 'lucide-react';
import { SmartInput } from './common/SmartInput';
import { formatDeadlineDate } from '../utils/settleCampaign';
import {
  StripePaymentElement,
  StripePaymentResult,
  StripePaymentElementRef,
} from './StripePaymentElement';

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
  const { t, localizeCampaign } = useLanguage();
  const displayCampaign = campaign ? localizeCampaign(campaign) : campaign;
  const tiers =
    displayCampaign?.rewardTiers && displayCampaign.rewardTiers.length > 0
      ? displayCampaign.rewardTiers
      : DEFAULT_REWARD_TIERS;

  const initialIndex = initialTierId ? tiers.findIndex((t) => t.id === initialTierId) : 0;
  const [selectedTierIndex, setSelectedTierIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Backer details state
  const [backerName, setBackerName] = useState<string>(defaultUserName);
  const [backerEmail, setBackerEmail] = useState<string>('aarav.sharma@craftify.in');
  const [backerPhone, setBackerPhone] = useState<string>('+91 98765 43210');
  const [backerStreet, setBackerStreet] = useState<string>('Flat 402, Lotus Court, Indiranagar');
  const [backerCity, setBackerCity] = useState<string>('Bengaluru');
  const [backerZip, setBackerZip] = useState<string>('560038');

  // Validation
  const [backerError, setBackerError] = useState<string | null>(null);

  // Stripe processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const stripeRef = useRef<StripePaymentElementRef>(null);

  // Confirmation state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [confirmedTierTitle, setConfirmedTierTitle] = useState<string>('');

  useEffect(() => {
    if (initialTierId) {
      const idx = tiers.findIndex((t) => t.id === initialTierId);
      if (idx >= 0) setSelectedTierIndex(idx);
    }
  }, [initialTierId, campaign?.id, tiers]);

  if (!campaign) return null;

  const currentTier = tiers[selectedTierIndex] ?? tiers[0];
  const finalAmount = customAmount
    ? parseFloat(customAmount) || currentTier.pledgeAmount
    : currentTier.pledgeAmount;

  const validateBackerDetails = (): boolean => {
    if (!backerName.trim()) {
      setBackerError('Please enter your full name for the backer register.');
      return false;
    }
    if (!backerEmail.trim() || !backerEmail.includes('@')) {
      setBackerError('Please enter a valid email address.');
      return false;
    }
    if (!backerStreet.trim()) {
      setBackerError('Please enter your street address for reward delivery.');
      return false;
    }
    if (!backerCity.trim()) {
      setBackerError('Please enter your city.');
      return false;
    }
    if (!backerZip.trim()) {
      setBackerError('Please enter your PIN code.');
      return false;
    }
    setBackerError(null);
    return true;
  };

  const handleAuthorizeClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBackerDetails()) {
      const el = document.getElementById('backer-details-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (stripeRef.current) {
      stripeRef.current.submit();
    }
  };

  const handleStripeSuccess = (paymentResult: StripePaymentResult) => {
    setConfirmedAmount(finalAmount);
    setConfirmedTierTitle(currentTier.title);

    // Fire confirmation handler in App.tsx (escrow authorization hold)
    onConfirmPledge(
      campaign,
      finalAmount,
      currentTier.title,
      backerName.trim(),
      currentTier.id
    );

    // Show the Kickstarter-style authorized escrow confirmation view
    setIsAuthorized(true);
  };

  const deadlineFormatted = formatDeadlineDate(campaign.deadline, campaign.daysLeft);

  return (
    <div
      id="pledge-modal-overlay"
      className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4"
    >
      <div
        id="pledge-modal-dialog"
        className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[6px] w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 text-[#212121]"
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
                aria-label={t('closeDialog', 'Close dialog')}
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
              {/* ESCROW GUARANTEE COPY */}
              <div className="p-4 bg-[#EAF8EB] border border-[#388E3C]/30 rounded-[4px] my-3 text-left">
                <p className="font-bold text-sm text-[#212121] leading-snug">
                  {t('yourPledgeIsAuthorizedFor', 'Your pledge is authorized for ')}
                  {formatINR(confirmedAmount)}
                  {t(
                    'youLlOnlyBeChargedIfThisCampaignRea',
                    ". You'll only be charged if this campaign reaches its goal by "
                  )}
                  {deadlineFormatted}.
                </p>
                <p className="text-xs text-[#666666] mt-2">
                  {t(
                    'thisIsTheCraftifyAllOrNothingCrowdf',
                    'This is the Craftify all-or-nothing crowdfunding escrow model. No payment was charged today — you have authorized an escrow pledge hold.'
                  )}
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
                <span className="text-[#878787] uppercase font-bold">{t('campaignProgress', 'Campaign Progress')}</span>
                <span className="font-bold text-[#388E3C]">
                  {t('updatedLive', 'Updated Live (+')}
                  {formatINR(confirmedAmount)})
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#878787] uppercase font-bold">{t('immediateCharge', 'Immediate Charge')}</span>
                <span className="font-bold text-[#388E3C]">{t('key_0ConditionalEscrowHold', '₹0 (Conditional Escrow Hold)')}</span>
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
                <span>{t('viewInMyPledges', 'View in My Pledges')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* PLEDGE FORM: SEQUENTIAL STRIPE-MATCHED FLOW */
          <form onSubmit={handleAuthorizeClick} id="form-pledge-authorization" className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#2874F0] font-bold bg-[#F1F3F6] px-1.5 py-0.5 rounded-[2px]">
                    {t('escrowProtected', 'Escrow Pre-Authorization')}
                  </span>
                  <span className="text-[11px] text-[#878787]">• {displayCampaign.code}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#212121]">
                  {t('backThisProject', 'Back')} {displayCampaign.title}
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  {t('by', 'by')} <strong className="text-[#212121]">{displayCampaign.creator}</strong>
                </p>
              </div>

              <button
                type="button"
                id="btn-close-pledge-modal"
                onClick={onClose}
                className="p-1 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121] transition-colors cursor-pointer"
                aria-label={t('closeModal', 'Close modal')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: TIER / CUSTOM AMOUNT SELECTION */}
            <div id="tier-selection-section" className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2874F0]" />
                    <span>{t('selectRewardTier', 'Select Reward Tier & Amount')}</span>
                  </h3>
                </div>
                <span className="text-[11px] text-[#878787]">{tiers.length} tiers available</span>
              </div>

              {/* Tiers List */}
              <div className="space-y-2">
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
                          <span className="font-bold text-xs sm:text-sm text-[#212121]">{tier.title}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-[#212121]">
                          {formatINR(tier.pledgeAmount)}
                        </span>
                      </div>

                      <p className="text-xs text-[#878787] mb-1.5 pl-5 leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="text-[11px] text-[#878787] pl-5 flex flex-wrap justify-between gap-1">
                        <span>
                          {t('estimatedDelivery', 'Est. Delivery')}:{' '}
                          <strong className="text-[#212121]">{tier.estimatedDelivery}</strong>
                        </span>
                        {isCapped && (
                          <span className={isSoldOut ? 'text-[#FB641B] font-bold' : ''}>
                            {isSoldOut
                              ? t('tierSoldOut', 'Sold out')
                              : `${tier.backersCount} ${t('leftOf', 'of')} ${tier.maxBackers} ${t('claimed', 'claimed')}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Field */}
              <div className="pt-1">
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
                  Selected amount: <strong className="text-[#212121]">{formatINR(finalAmount)}</strong> • {currentTier.title}
                </p>
              </div>
            </div>

            {/* STEP 2: BACKER DETAILS */}
            <div
              id="backer-details-section"
              className="p-3.5 sm:p-4 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-3"
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#2874F0]" />
                    <span>Backer Details</span>
                  </h3>
                </div>
                <span className="text-[11px] text-[#878787]">For artisan backer register & reward delivery</span>
              </div>

              {backerError && (
                <div className="p-2 rounded-[2px] bg-[#FFF2F4] border border-[#F8D7DA] text-[#DF1B41] text-xs font-medium">
                  {backerError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Full Name *
                  </label>
                  <SmartInput
                    id="input-backer-name"
                    type="text"
                    value={backerName}
                    onChange={(e) => {
                      setBackerName(e.target.value);
                      if (backerError) setBackerError(null);
                    }}
                    onValueChange={(val) => {
                      setBackerName(val);
                      if (backerError) setBackerError(null);
                    }}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Email Address *
                  </label>
                  <SmartInput
                    id="input-backer-email"
                    type="email"
                    value={backerEmail}
                    onChange={(e) => setBackerEmail(e.target.value)}
                    onValueChange={(val) => setBackerEmail(val)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Phone Number *
                  </label>
                  <SmartInput
                    id="input-backer-phone"
                    type="tel"
                    value={backerPhone}
                    onChange={(e) => setBackerPhone(e.target.value)}
                    onValueChange={(val) => setBackerPhone(val)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    City *
                  </label>
                  <SmartInput
                    id="input-backer-city"
                    type="text"
                    value={backerCity}
                    onChange={(e) => setBackerCity(e.target.value)}
                    onValueChange={(val) => setBackerCity(val)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Shipping Address (Street / Flat / Locality) *
                  </label>
                  <SmartInput
                    id="input-backer-street"
                    type="text"
                    value={backerStreet}
                    onChange={(e) => setBackerStreet(e.target.value)}
                    onValueChange={(val) => setBackerStreet(val)}
                    placeholder="Street, flat, apartment"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: STRIPE-STYLE PAYMENT ELEMENT */}
            <div id="stripe-pledge-payment-section" className="space-y-2">
              <div className="flex items-center gap-2 pb-1">
                <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#212121]">
                  Authorization Payment Method
                </h3>
                <span className="text-xs text-[#878787] font-normal">— Powered by Stripe Elements</span>
              </div>

              {/* Shared Stripe Payment Element without internal submit button */}
              <StripePaymentElement
                ref={stripeRef}
                amount={finalAmount}
                loadingText="Authorizing pledge..."
                defaultCardholderName={backerName}
                showButton={false}
                onSuccess={handleStripeSuccess}
                onProcessingChange={setIsProcessing}
              />
            </div>

            {/* STEP 4: PROMINENT BORDERED CALLOUT (EXACT PROMPT SPECIFICATION) */}
            <div
              id="escrow-authorization-callout"
              className="p-4 rounded-lg border-2 border-[#2874F0]/30 bg-[#F4F8FF] text-[#212121] shadow-2xs"
            >
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-[#2874F0] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-xs uppercase tracking-wider font-bold text-[#2874F0]">
                    Crowdfunding Escrow Covenant
                  </strong>
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-[#1E293B]">
                    You will only be charged {formatINR(finalAmount)} if this campaign reaches its goal by{' '}
                    {deadlineFormatted}. If it doesn&apos;t, you won&apos;t be charged anything, and this
                    authorization is automatically released.
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Authorized via Stripe simulated vault. ₹0 will be debited today.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 5: STRIPE-STYLED AUTHORIZATION BUTTON */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#F0F0F0]">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2.5 rounded-[4px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-xs uppercase tracking-wider font-bold text-[#212121] transition-colors cursor-pointer"
              >
                {t('cancel', 'Cancel')}
              </button>

              <button
                id="btn-confirm-pledge-action"
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto flex-1 max-w-md h-11 px-5 rounded-[6px] bg-[#635BFF] hover:bg-[#5851EA] active:bg-[#4F46E5] text-[#FFFFFF] text-sm font-semibold tracking-wide shadow-[0_2px_4px_rgba(99,91,255,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authorizing pledge...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize {formatINR(finalAmount)} Pledge</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
