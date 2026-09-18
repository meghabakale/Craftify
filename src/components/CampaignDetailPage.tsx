import React, { useState } from 'react';
import { Campaign, RewardTier, BackerRecord, CampaignUpdate, CampaignComment, Product } from '../types';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import { RecommendationsSection } from './RecommendationsSection';
import { MOCK_PRODUCTS, MOCK_CAMPAIGNS } from '../data/mockData';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Share2,
  Bookmark,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
  Heart,
  Send,
  AlertCircle,
  RefreshCw,
  Award,
} from 'lucide-react';

interface CampaignDetailPageProps {
  campaign: Campaign;
  backers: BackerRecord[];
  updates: CampaignUpdate[];
  comments: CampaignComment[];
  onBack: () => void;
  onOpenPledgeModal: (campaign: Campaign, tier?: RewardTier) => void;
  onAddComment?: (campaignId: string, comment: string, authorName: string) => void;
  allProducts?: Product[];
  allCampaigns?: Campaign[];
  onAddToCart?: (product: Product, quantity?: number) => void;
  onProductClick?: (product: Product) => void;
  onCampaignClick?: (campaign: Campaign) => void;
  onSimulateSettlement?: (campaignId: string, forceOutcome?: 'funded' | 'unsuccessful' | 'reset') => void;
}

export const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({
  campaign,
  backers,
  updates,
  comments,
  onBack,
  onOpenPledgeModal,
  onAddComment,
  allProducts = MOCK_PRODUCTS,
  allCampaigns = MOCK_CAMPAIGNS,
  onAddToCart,
  onProductClick,
  onCampaignClick,
  onSimulateSettlement,
}) => {
  const { t, localizeCategory } = useLanguage();
  const [activeTab, setActiveTab] = useState<'story' | 'backers' | 'updates' | 'comments' | 'specs' | 'timeline'>('story');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Comment submission form state
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('Eleanor Vance');
  const [likedUpdates, setLikedUpdates] = useState<Record<string, boolean>>({});

  const percentFunded = Math.round((campaign.pledgedAmount / campaign.goalAmount) * 100);

  const isPendingApproval = campaign.isApproved === false || campaign.status === 'pending_review';

  // Status-based color mapping strictly as requested:
  let progressBarColor = 'bg-[#FB641B]';
  let statusText = t('statusActive', 'In Progress');
  let statusBadgeClass = 'bg-[#FFF3EE] text-[#FB641B] border-[#FB641B]/30';
  let statusIcon = <Clock className="w-3.5 h-3.5" />;

  if (isPendingApproval) {
    progressBarColor = 'bg-[#B78103]';
    statusText = 'Awaiting Admin Approval';
    statusBadgeClass = 'bg-[#FFF8E1] text-[#B78103] border-[#FFB300]';
    statusIcon = <AlertCircle className="w-3.5 h-3.5 text-[#B78103]" />;
  } else if (campaign.status === 'funded' || percentFunded >= 100) {
    progressBarColor = 'bg-[#388E3C]';
    statusText = t('statusFunded', 'Goal Reached • Funded');
    statusBadgeClass = 'bg-[#EAF8EB] text-[#388E3C] border-[#388E3C]/30';
    statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (campaign.status === 'failed') {
    progressBarColor = 'bg-[#D32F2F]';
    statusText = t('statusExpired', 'Funding Expired');
    statusBadgeClass = 'bg-[#FFEBEE] text-[#D32F2F] border-[#D32F2F]/30';
    statusIcon = <XCircle className="w-3.5 h-3.5" />;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(campaign.id, commentText.trim(), commenterName.trim() || 'Backer');
      setCommentText('');
    }
  };

  const toggleLikeUpdate = (updateId: string) => {
    setLikedUpdates((prev) => ({
      ...prev,
      [updateId]: !prev[updateId],
    }));
  };

  return (
    <div id="campaign-detail-page-container" className="bg-[#F1F3F6] min-h-screen py-4 sm:py-6 text-[#212121]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation & Top Tools */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            id="btn-back-to-campaigns"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#2874F0] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToCampaigns', 'Back to Discover Pre-Orders')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`px-3 py-1.5 rounded-[2px] border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSaved
                  ? 'border-[#2874F0] bg-[#2874F0] text-[#FFFFFF]'
                  : 'border-[#EAEAEA] bg-[#FFFFFF] text-[#212121] hover:bg-[#F1F3F6]'
              }`}
              title={isSaved ? t('saved', 'Saved') : t('save', 'Save')}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSaved ? t('saved', 'Saved') : t('save', 'Save')}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-[2px] border border-[#EAEAEA] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#212121] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copiedLink ? t('linkCopied', 'Copied Link!') : t('share', 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Pending Administrative Review Banner */}
        {isPendingApproval && (
          <div id="campaign-pending-review-banner" className="mb-4 p-4 rounded-[4px] bg-[#FFF8E1] border border-[#FFB300] flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-[#B78103] shrink-0 mt-0.5" />
            <div className="text-xs text-[#212121]">
              <div className="font-bold text-sm text-[#B78103] flex items-center gap-2">
                <span>Pending Administrative Approval</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#B78103] text-white font-bold">
                  Curator Review
                </span>
              </div>
              <p className="mt-1 text-[#666666] leading-relaxed">
                This artisan campaign has been submitted and is currently in review by the Craftify curation desk. It is not yet visible in public explore listings and backer pledge authorizations are temporarily locked until admin approval.
              </p>
            </div>
          </div>
        )}

        {/* Campaign Header: Title, Creator & Badges */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 mb-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#212121] bg-[#F1F3F6] px-2 py-0.5 rounded-[2px] border border-[#EAEAEA] uppercase">
              {campaign.code}
            </span>
            <span className="text-xs text-[#878787] uppercase font-semibold">
              {localizeCategory(campaign.category)}
            </span>
            <span className="text-[#EAEAEA]">•</span>
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-[2px] border flex items-center gap-1.5 ${statusBadgeClass}`}
            >
              {statusIcon}
              <span>{statusText}</span>
            </span>
          </div>

          <h1
            id="campaign-detail-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#212121] leading-tight mb-2 max-w-4xl"
          >
            {campaign.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#878787] max-w-3xl leading-relaxed">
            {campaign.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#878787]">
            <span>
              By <strong className="text-[#212121] font-bold">{campaign.creator}</strong>
            </span>
            {campaign.creatorLocation && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#878787]" />
                  {campaign.creatorLocation}
                </span>
              </>
            )}
          </div>

          {/* Provenance and Craft Heritage Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-[#388E3C] bg-[#EAF8EB] px-2.5 py-1 rounded-[2px] border border-[#388E3C]/20">
              <MapPin className="w-3.5 h-3.5 text-[#388E3C]" />
              <span className="font-semibold">Handmade in {campaign.artisanRegion || campaign.creatorLocation || 'India'}</span>
            </div>
            {campaign.craftHeritage && (
              <div className="flex items-center gap-1.5 text-xs text-[#2874F0] bg-[#EBF2FC] px-2.5 py-1 rounded-[2px] border border-[#2874F0]/20">
                <Sparkles className="w-3.5 h-3.5 text-[#2874F0]" />
                <span className="font-semibold">{campaign.craftHeritage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Hero Media + Funding Progress Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Main Hero Image (7 cols) */}
          <div className="lg:col-span-7">
            {(() => {
              const gallery = campaign.galleryImages && campaign.galleryImages.length > 0
                ? campaign.galleryImages
                : [campaign.imageUrl];
              const currentImg = gallery[selectedImageIndex] || campaign.imageUrl;

              return (
                <>
                  <div className="aspect-[16/10] rounded-[4px] overflow-hidden border border-[#EAEAEA] bg-[#FFFFFF] shadow-xs relative">
                    <img
                      src={currentImg}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>

                  {gallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                      {gallery.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative w-16 h-16 shrink-0 rounded-[2px] border overflow-hidden transition-all cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-[#2874F0] ring-2 ring-[#2874F0]/30'
                              : 'border-[#EAEAEA] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Creator Bio Callout */}
            <div className="mt-4 p-4 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] flex items-start gap-3 shadow-xs">
              {campaign.creatorProfilePhoto ? (
                <img
                  src={campaign.creatorProfilePhoto}
                  alt={campaign.creatorBusinessName || campaign.creator}
                  className="w-12 h-12 rounded-[2px] object-cover border border-[#EAEAEA] shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-lg flex items-center justify-center shrink-0">
                  {campaign.creator.charAt(0)}
                </div>
              )}
              <div className="text-xs flex-1 min-w-0">
                <div className="font-bold text-[#212121] text-sm truncate">
                  {campaign.creatorBusinessName || campaign.creator}
                </div>
                {campaign.creatorBusinessName && (
                  <div className="text-[11px] text-[#2874F0] font-medium">
                    Artisan: {campaign.creator}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#878787] mt-0.5">
                  {(campaign.creatorCity || campaign.creatorLocation || campaign.artisanRegion) && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-[#388E3C]" />
                      {campaign.creatorCity && campaign.creatorState
                        ? `${campaign.creatorCity}, ${campaign.creatorState}`
                        : campaign.artisanRegion || campaign.creatorLocation}
                    </span>
                  )}
                  {campaign.creatorYearsOfExperience && (
                    <span className="text-[#FB641B] font-semibold">
                      • {campaign.creatorYearsOfExperience}+ yrs exp.
                    </span>
                  )}
                </div>
                <p className="text-[#555555] mt-1.5 leading-relaxed line-clamp-3">
                  {campaign.creatorBio ??
                    'Independent maker studio committed to zero-waste craftsmanship, rigorous testing, and heirloom functional goods.'}
                </p>
              </div>
            </div>
          </div>

          {/* Funding Status Ledger (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs">
            <div className="space-y-5">
              {/* Amount Raised vs Goal */}
              <div>
                <span className="text-xs text-[#878787] uppercase tracking-wider block font-semibold">
                  {t('amountConditionallyRaised', 'Amount Conditionally Raised')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold text-[#212121]">
                    {formatINR(campaign.pledgedAmount)}
                  </span>
                  <span className="text-xs text-[#878787]">
                    {t('pledgedOf', 'pledged of')} {formatINR(campaign.goalAmount)} {t('goal', 'goal')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span
                    className={
                      campaign.status === 'funded' || percentFunded >= 100
                        ? 'text-[#388E3C]'
                        : campaign.status === 'failed'
                        ? 'text-[#D32F2F]'
                        : 'text-[#FB641B]'
                    }
                  >
                    {percentFunded}% {t('fundedStatus', 'Funded')}
                  </span>
                  <span className="text-[#878787] font-normal">
                    {campaign.goalAmount - campaign.pledgedAmount > 0
                      ? `${formatINR(campaign.goalAmount - campaign.pledgedAmount)} ${t('neededToHitGoal', 'needed to hit goal')}`
                      : t('targetReached', 'Campaign target reached!')}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-2 rounded-[2px] bg-[#F1F3F6] border border-[#EAEAEA] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${progressBarColor}`}
                    style={{ width: `${Math.min(percentFunded, 100)}%` }}
                  />
                </div>
              </div>

              {/* Metric stats grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#F0F0F0]">
                <div>
                  <span className="text-xs text-[#878787] uppercase block font-semibold">{t('numberOfBackers', 'Number of Backers')}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#212121]">
                    {campaign.backersCount}
                  </span>
                  <span className="text-[11px] text-[#878787] block">{t('registeredPatrons', 'Registered patrons')}</span>
                </div>

                <div>
                  <span className="text-xs text-[#878787] uppercase block font-semibold">{t('daysRemaining', 'Days Remaining')}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#212121]">
                    {campaign.daysLeft} {t('days', 'Days')}
                  </span>
                  <span className="text-[11px] text-[#878787] block">{t('untilDeadline', 'Until campaign deadline')}</span>
                </div>
              </div>

              {/* All-or-Nothing Escrow Covenant Details */}
              <div className="p-3.5 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/20 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#388E3C]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{t('escrowProtected', 'The Craftify Escrow Covenant')}</span>
                </div>
                <p className="text-[11px] text-[#666666] leading-relaxed">
                  {t('escrowGuaranteeDesc', 'Pledges are authorized holds. Your card is charged ₹0 today. Funds are captured only if this campaign reaches its goal by the deadline.')}
                </p>
              </div>
            </div>

            {/* Prominent "Back this project" Action Button */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-back-this-project"
                disabled={isPendingApproval}
                onClick={() => !isPendingApproval && onOpenPledgeModal(campaign)}
                className={`w-full py-3.5 px-6 rounded-[2px] text-sm uppercase tracking-wider font-bold shadow-xs flex items-center justify-center gap-2 transition-all ${
                  isPendingApproval
                    ? 'bg-[#FFF8E1] text-[#B78103] border border-[#FFB300] cursor-not-allowed'
                    : 'bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] cursor-pointer active:scale-[0.99]'
                }`}
              >
                {isPendingApproval ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-[#B78103]" />
                    <span>Awaiting Admin Approval (Pledges Paused)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
                    <span>{t('backThisProject', 'Back this project')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-[#878787]">
                {isPendingApproval
                  ? 'This campaign will open for patron pledges once verified by the platform admin'
                  : t('chooseRewardTierOrCustom', 'Choose a reward tier or enter a custom backing amount')}
              </p>

              {/* Escrow Covenant Simulation Sandbox */}
              {onSimulateSettlement && (
                <div className="pt-3 border-t border-[#F0F0F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#2874F0]" />
                      <span>Escrow Simulation Sandbox</span>
                    </span>
                    {campaign.status !== 'in_progress' && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] ${
                          campaign.status === 'funded'
                            ? 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/20'
                            : 'bg-[#FFF3EC] text-[#FB641B] border border-[#FB641B]/20'
                        }`}
                      >
                        {campaign.status === 'funded' ? 'Funded (100%+)' : 'Settled (Unsuccessful)'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {/* Primary Button: Simulate Fully Funded (Forces 100%+ & Captures Pledges) */}
                    <button
                      id="btn-simulate-funded-detail"
                      onClick={() => onSimulateSettlement(campaign.id, 'funded')}
                      className="w-full py-2 px-3 rounded-[2px] bg-[#EAF8EB] hover:bg-[#D4EED6] border border-[#388E3C]/40 text-[#2E7D32] hover:text-[#1B5E20] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Simulate 100%+ goal met: marks campaign funded and captures backer pledges"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#388E3C]" />
                      <span>Simulate: Fully Funded (Goal Met 100%+)</span>
                    </button>

                    {/* Secondary Simulation Buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        id="btn-simulate-settlement-detail"
                        onClick={() => onSimulateSettlement(campaign.id)}
                        className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] hover:border-[#878787] bg-[#F1F3F6] hover:bg-[#EAEAEA] text-[#666666] hover:text-[#212121] text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Simulate reaching deadline with current pledged amount"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline (Current %)</span>
                      </button>

                      <button
                        id="btn-simulate-unsuccessful-detail"
                        onClick={() => onSimulateSettlement(campaign.id, 'unsuccessful')}
                        className="py-1.5 px-2 rounded-[2px] border border-[#FB641B]/30 hover:border-[#FB641B] bg-[#FFF3EC] hover:bg-[#FFE6D9] text-[#FB641B] text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Simulate deadline ending under goal: releases holds (0 charged)"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Simulate Unsuccessful</span>
                      </button>
                    </div>

                    {/* Reset Button to return to previous state */}
                    {campaign.status !== 'in_progress' && (
                      <button
                        id="btn-reset-campaign-detail"
                        onClick={() => onSimulateSettlement(campaign.id, 'reset')}
                        className="w-full py-1.5 px-2 rounded-[2px] border border-dashed border-[#878787] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#666666] hover:text-[#212121] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Reset campaign back to previous state"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to Previous State</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-[#878787] leading-tight text-center">
                    Use simulation to test pledge transitions in <strong>My Pledges</strong> between <span className="text-[#B78103] font-semibold">Authorized Hold</span> and <span className="text-[#388E3C] font-semibold">Funded & Charged</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout: Below the Fold Tabs & Reward Tiers Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (8 cols): Below the fold Tabs (Story, Backers, Updates, Comments, Specs, Timeline) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Tabs Header */}
            <div className="flex border-b border-[#EAEAEA] bg-[#FFFFFF] rounded-[4px] px-2 overflow-x-auto shadow-xs">
              <button
                id="tab-btn-story"
                onClick={() => setActiveTab('story')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
                  activeTab === 'story'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                {t('storyTab', 'Story & Heritage')}
              </button>

              <button
                id="tab-btn-backers"
                onClick={() => setActiveTab('backers')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'backers'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                <span>{t('backersTab', 'Patron Ledger')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#EAF8EB] text-[#388E3C] text-[10px] font-bold border border-[#388E3C]/20">
                  {backers.length}
                </span>
              </button>

              <button
                id="tab-btn-updates"
                onClick={() => setActiveTab('updates')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'updates'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                <span>{t('updatesTab', 'Workshop Updates')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#F1F3F6] text-[#878787] border border-[#EAEAEA] text-[10px] font-bold">
                  {updates.length}
                </span>
              </button>

              <button
                id="tab-btn-comments"
                onClick={() => setActiveTab('comments')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'comments'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                <span>{t('commentsTab', 'Patron Discussions')}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[#F1F3F6] text-[#878787] border border-[#EAEAEA] text-[10px] font-bold">
                  {comments.length}
                </span>
              </button>

              <button
                id="tab-btn-specs"
                onClick={() => setActiveTab('specs')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
                  activeTab === 'specs'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                {t('specsTab', 'Specifications')}
              </button>

              <button
                id="tab-btn-timeline"
                onClick={() => setActiveTab('timeline')}
                className={`px-4 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'border-[#2874F0] text-[#2874F0]'
                    : 'border-transparent text-[#878787] hover:text-[#212121]'
                }`}
              >
                {t('timelineTab', 'Timeline')}
              </button>
            </div>

            {/* TAB: STORY */}
            {activeTab === 'story' && (
              <div id="tab-content-story" className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {t('whyWeCreated', 'Why We Created')} {campaign.title}
                </h2>

                <div className="text-[#212121] text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line">
                  {campaign.fullStory ?? campaign.shortDescription}
                </div>

                {/* Retail Graduation Callout */}
                <div className="p-4 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] space-y-2">
                  <div className="text-xs uppercase tracking-wider text-[#388E3C] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('craftAssuredBadge', 'Craftify Retail Graduation')}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#212121]">
                    {t('graduatedBadge', 'From Crowdfunding Escrow to General Marketplace')}
                  </h3>
                  <p className="text-xs text-[#878787] leading-relaxed">
                    {t('howItWorksStep3Desc', 'Once all backer reward commitments have shipped and tracking numbers are recorded, this product graduates directly into the Craftify Shop at standard retail pricing. Backers receive the permanent founder price tier and serialized edition markings.')}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: LIVE BACKERS LIST */}
            {activeTab === 'backers' && (
              <div id="tab-content-backers" className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                      {t('liveBackersRosterTitle', 'Live Backers Roster')}
                    </h2>
                    <p className="text-xs text-[#878787] mt-0.5">
                      {t('backersRosterDesc', 'Recent authorized pledges on this campaign. All pledges update live.')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#388E3C] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#388E3C] uppercase tracking-wider">
                      {t('liveEscrowSync', 'Live Escrow Sync')}
                    </span>
                  </div>
                </div>

                {/* Backers Disclaimer */}
                <div className="p-3 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/20 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#666666]">
                    {t('backersEscrowDisclaimer', 'All backers listed below hold active authorized commitments. Cards will only be charged when the campaign hits 100% of its target.')}
                  </p>
                </div>

                {/* Backers List Table/Cards */}
                <div className="divide-y divide-[#F0F0F0] border border-[#EAEAEA] rounded-[4px] bg-[#FFFFFF] overflow-hidden">
                  {backers.map((backer) => (
                    <div
                      key={backer.id}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F1F3F6]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center shrink-0">
                          {backer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#212121] text-xs sm:text-sm">
                              {backer.name}
                            </span>
                            {/* STATUS TAG: "authorized" / "captured" / "released" */}
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[2px] border ${
                                backer.status === 'captured'
                                  ? 'border-[#388E3C]/30 bg-[#EAF8EB] text-[#388E3C]'
                                  : backer.status === 'released'
                                  ? 'border-[#D32F2F]/30 bg-[#FDEAEA] text-[#D32F2F]'
                                  : 'border-[#B78103]/30 bg-[#FFF8E1] text-[#B78103]'
                              }`}
                            >
                              {backer.status === 'captured'
                                ? '✓ Captured'
                                : backer.status === 'released'
                                ? '✕ Released'
                                : '• Authorized'}
                            </span>
                          </div>
                          <span className="text-xs text-[#878787] block mt-0.5">
                            {backer.tierTitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs">
                        <span className="font-bold text-[#212121] text-sm">
                          {formatINR(backer.amount)}
                        </span>
                        <span className="text-[#878787] text-[11px]">{backer.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: UPDATES */}
            {activeTab === 'updates' && (
              <div id="tab-content-updates" className="space-y-4">
                <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 shadow-xs">
                  <div>
                    <h2 className="text-xl font-bold text-[#212121]">
                      {t('creatorUpdatesTitle', 'Creator Updates & Logs')}
                    </h2>
                    <p className="text-xs text-[#878787] mt-0.5">
                      Direct crafting dispatches from {campaign.creator}.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#878787] uppercase">
                    {updates.length} {t('updatesTab', 'Updates')}
                  </span>
                </div>

                <div className="space-y-3">
                  {updates.map((update) => (
                    <article
                      key={update.id}
                      className="p-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-[11px]">
                            Update #{update.updateNumber}
                          </span>
                          <span className="text-[#878787]">• {update.date}</span>
                        </div>
                        <span className="text-[#388E3C] font-semibold">{update.author}</span>
                      </div>

                      <h3 className="text-base font-bold text-[#212121]">
                        {update.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#878787] leading-relaxed whitespace-pre-line">
                        {update.content}
                      </p>

                      <div className="border-t border-[#F0F0F0] pt-2.5 flex items-center justify-between text-xs">
                        <button
                          onClick={() => toggleLikeUpdate(update.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-[2px] border transition-colors cursor-pointer text-xs font-semibold ${
                            likedUpdates[update.id]
                              ? 'border-[#D32F2F] bg-[#FFEBEE] text-[#D32F2F]'
                              : 'border-[#EAEAEA] hover:bg-[#F1F3F6] text-[#212121]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>
                            {update.likesCount + (likedUpdates[update.id] ? 1 : 0)} Applauded
                          </span>
                        </button>
                        <span className="text-[#878787]">Verified Workshop Dispatch</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COMMENTS */}
            {activeTab === 'comments' && (
              <div id="tab-content-comments" className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="border-b border-[#F0F0F0] pb-3">
                  <h2 className="text-xl font-bold text-[#212121]">
                    {t('backerCommunityTitle', 'Backer Community & Discussions')}
                  </h2>
                  <p className="text-xs text-[#878787] mt-0.5">
                    {t('backerCommunityDesc', 'Ask questions, share suggestions, and converse with fellow patrons.')}
                  </p>
                </div>

                {/* Comment Input Box */}
                <form
                  onSubmit={handleCommentSubmit}
                  className="p-4 bg-[#F1F3F6] border border-[#EAEAEA] rounded-[4px] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="sm:w-1/3">
                      <label className="block text-[11px] uppercase tracking-wider text-[#878787] font-bold mb-1">
                        {t('yourNameLabel', 'Your Name')}
                      </label>
                      <SmartInput
                        type="text"
                        value={commenterName}
                        onChange={(e) => setCommenterName(e.target.value)}
                        onValueChange={(val) => setCommenterName(val)}
                        placeholder="Your Name"
                        className="w-full px-3 py-1.5 text-xs rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>
                    <div className="sm:w-2/3">
                      <label className="block text-[11px] uppercase tracking-wider text-[#878787] font-bold mb-1">
                        {t('commentsTab', 'Comment or Question')}
                      </label>
                      <div className="flex gap-2">
                        <SmartInput
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onValueChange={(val) => setCommentText(val)}
                          placeholder="Ask the creator or backer community a question..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                          containerClassName="flex-1"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-[0.99] shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{t('postCommentBtn', 'Post')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 bg-[#FFFFFF] border border-[#F0F0F0] rounded-[4px] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#212121]">
                            {comment.authorName}
                          </span>
                          {comment.authorBadge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-[2px] border font-bold ${
                                comment.authorBadge === 'Creator'
                                  ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0]'
                                  : 'bg-[#FFF3EE] text-[#FB641B] border-[#FB641B]/30'
                              }`}
                            >
                              {comment.authorBadge}
                            </span>
                          )}
                        </div>
                        <span className="text-[#878787] text-[11px]">{comment.date}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SPECS */}
            {activeTab === 'specs' && (
              <div id="tab-content-specs" className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {t('engineeringSpecsTitle', 'Engineering Specifications')}
                </h2>
                <p className="text-xs text-[#878787]">
                  {t('specsDisclaimer', 'Every tolerance, metallurgical alloy, and component standard validated by the studio workshop.')}
                </p>

                <div className="border border-[#EAEAEA] rounded-[4px] bg-[#FFFFFF] overflow-hidden divide-y divide-[#F0F0F0]">
                  {(campaign.specs ?? [
                    { label: 'Primary Construction', value: 'High-tolerance engineering alloy' },
                    { label: 'Collet Tolerance', value: '±0.005 mm micro-machined' },
                    { label: 'Total Weight', value: 'Calibrated laboratory balance' },
                    { label: 'Origin', value: 'Studio Hand Assembly' },
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                    >
                      <span className="text-[#878787] uppercase tracking-wider font-semibold">
                        {item.label}
                      </span>
                      <span className="font-bold text-[#212121] text-xs sm:text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TIMELINE */}
            {activeTab === 'timeline' && (
              <div id="tab-content-timeline" className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {t('productionRoadmapTitle', 'Production Milestones & Roadmap')}
                </h2>

                <div className="space-y-3">
                  {(campaign.timeline ?? [
                    { phase: 'Tooling & Prototypes', date: 'August 2026', description: 'Workshop tooling verification.' },
                    { phase: 'Pledge Escrow', date: 'Sept 2026', description: 'Craftify funding drive.' },
                    { phase: 'Machining Run', date: 'Oct-Nov 2026', description: 'Volume workshop production.' },
                    { phase: 'Backer Dispatch', date: 'Dec 2026', description: 'Direct insured shipping.' },
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-[#F1F3F6] border border-[#EAEAEA] rounded-[4px] flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs font-bold flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-[#212121]">
                            {item.phase}
                          </h4>
                          <span className="text-xs text-[#388E3C] font-bold">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs text-[#878787] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Reward Tiers Section */}
          <div id="reward-tiers-list" className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#FB641B]"></span>
                  <span className="text-[11px] uppercase tracking-wider text-[#FB641B] font-bold">
                    {t('rewardTiers', 'Backer Rewards')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#212121]">
                  {t('selectRewardTier', 'Select a Reward Tier')}
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  {t('selectRewardTierDesc', 'Select a reward tier to authorize your pledge hold.')}
                </p>
              </div>

              {/* Reward Tiers List */}
              <div className="space-y-3 pt-1">
                {campaign.rewardTiers.map((tier) => {
                  const isCapped = tier.maxBackers !== undefined;
                  const isSoldOut = isCapped && tier.backersCount >= (tier.maxBackers ?? 0);

                  return (
                    <div
                      key={tier.id}
                      className="p-4 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] hover:border-[#FB641B]/60 shadow-xs transition-all space-y-3"
                    >
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-[#212121]">
                          {tier.title}
                        </h4>
                        <span className="text-lg font-bold text-[#212121]">
                          {formatINR(tier.pledgeAmount)}
                        </span>
                      </div>

                      <p className="text-xs text-[#878787] leading-relaxed">
                        {tier.description}
                      </p>

                      {/* Package Inclusions */}
                      {tier.itemsIncluded && tier.itemsIncluded.length > 0 && (
                        <div className="border-t border-[#F0F0F0] pt-2">
                          <span className="text-[10px] uppercase tracking-wider text-[#878787] font-bold block mb-1">
                            {t('includedInTier', 'Included in this tier:')}
                          </span>
                          <ul className="space-y-1 text-xs text-[#666666]">
                            {tier.itemsIncluded.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#388E3C] shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Delivery Date & Claimed Numbers */}
                      <div className="border-t border-[#F0F0F0] pt-2 flex items-center justify-between text-[11px] text-[#878787]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#878787]" />
                          <span>{t('estimatedDelivery', 'Est:')} <strong>{tier.estimatedDelivery}</strong></span>
                        </div>
                        <div>
                          {isCapped ? (
                            <span className={isSoldOut ? 'text-[#D32F2F] font-bold' : ''}>
                              {tier.backersCount} {t('leftOf', 'of')} {tier.maxBackers} {t('claimed', 'claimed')}
                            </span>
                          ) : (
                            <span>{tier.backersCount} {t('backers', 'patrons')}</span>
                          )}
                        </div>
                      </div>

                      {/* Pledge Action Button */}
                      <button
                        disabled={isSoldOut || isPendingApproval}
                        onClick={() => !isPendingApproval && onOpenPledgeModal(campaign, tier)}
                        className={`w-full py-2.5 px-4 rounded-[2px] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99] ${
                          isPendingApproval
                            ? 'bg-[#FFF8E1] text-[#B78103] border border-[#FFB300] cursor-not-allowed'
                            : isSoldOut
                            ? 'bg-[#EAEAEA] text-[#878787] cursor-not-allowed'
                            : 'bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] shadow-xs cursor-pointer'
                        }`}
                      >
                        <span>
                          {isPendingApproval
                            ? 'Awaiting Approval'
                            : isSoldOut
                            ? t('tierSoldOut', 'Tier Sold Out')
                            : `${t('selectTier', 'Select Tier')} • ${formatINR(tier.pledgeAmount)}`}
                        </span>
                        {!isSoldOut && !isPendingApproval && <ArrowRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Live Backers Snapshot on Sidebar */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#212121] font-bold">
                  {t('recentBackers', 'Recent Backers')}
                </span>
                <button
                  onClick={() => setActiveTab('backers')}
                  className="text-[11px] text-[#2874F0] hover:underline font-bold cursor-pointer"
                >
                  {t('viewAll', 'View All')} ({backers.length})
                </button>
              </div>

              <div className="space-y-2">
                {backers.slice(0, 3).map((backer) => (
                  <div
                    key={backer.id}
                    className="p-2.5 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#212121] block">{backer.name}</span>
                      <span className="text-[10px] text-[#878787]">{backer.tierTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#212121] block">{formatINR(backer.amount)}</span>
                      <span className="text-[10px] text-[#388E3C] uppercase font-bold">
                        {backer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full "About the Artisan" Section */}
        <section id="campaign-about-the-artisan-section" className="mt-8 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2874F0]"></span>
              <h3 className="text-lg font-bold text-[#212121]">About the Artisan & Workshop</h3>
            </div>
            <span className="text-xs font-semibold text-[#388E3C] bg-[#EAF8EB] px-2.5 py-0.5 rounded-[2px] border border-[#388E3C]/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Craftify Artisan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3 flex flex-col items-center text-center p-4 bg-[#F8F9FA] rounded-[4px] border border-[#EAEAEA]">
              {campaign.creatorProfilePhoto ? (
                <img
                  src={campaign.creatorProfilePhoto}
                  alt={campaign.creatorBusinessName || campaign.creator}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-[4px] object-cover border border-[#EAEAEA] shadow-xs mb-3"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-[4px] bg-[#2874F0] text-[#FFFFFF] font-bold text-3xl flex items-center justify-center shadow-xs mb-3">
                  {campaign.creator.charAt(0)}
                </div>
              )}
              <h4 className="font-bold text-sm text-[#212121] leading-tight">
                {campaign.creator}
              </h4>
              {campaign.creatorBusinessName && (
                <p className="text-xs text-[#2874F0] font-medium mt-0.5">
                  {campaign.creatorBusinessName}
                </p>
              )}
              <div className="mt-2 text-xs text-[#878787] flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#388E3C]" />
                <span>
                  {campaign.creatorCity && campaign.creatorState
                    ? `${campaign.creatorCity}, ${campaign.creatorState}`
                    : campaign.artisanRegion || campaign.creatorLocation || 'India'}
                </span>
              </div>
              {campaign.creatorYearsOfExperience && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FB641B] bg-[#FFF3E0] px-2 py-0.5 rounded-[2px]">
                  <Award className="w-3 h-3" />
                  <span>{campaign.creatorYearsOfExperience} Years Experience</span>
                </div>
              )}
            </div>

            <div className="md:col-span-9 space-y-4">
              <div>
                <h4 className="text-base font-bold text-[#212121] mb-1">
                  Artisan Story & Craft Heritage
                </h4>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed whitespace-pre-line">
                  {campaign.creatorBio ?? campaign.shortDescription ?? 'Generational artisan committed to reviving authentic handmade craft traditions and working directly with patrons on Craftify.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F0F0F0] text-xs">
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Craft Specialty</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">{campaign.craftHeritage || campaign.category || 'Handmade Craft'}</span>
                </div>
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Studio / Workshop</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">{campaign.creatorBusinessName || campaign.creator}</span>
                </div>
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Location & Guild</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">
                    {campaign.creatorCity && campaign.creatorState
                      ? `${campaign.creatorCity}, ${campaign.creatorState}`
                      : campaign.artisanRegion || campaign.creatorLocation || 'India'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended for You based on campaign craft category */}
        <RecommendationsSection
          viewedCategories={campaign.category ? [campaign.category] : []}
          products={allProducts}
          campaigns={allCampaigns}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
          onCampaignClick={onCampaignClick}
          onPledgeClick={(camp) => onOpenPledgeModal(camp)}
          className="mt-8 px-0"
        />
      </div>
    </div>
  );
};
