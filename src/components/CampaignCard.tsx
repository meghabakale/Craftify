import React from 'react';
import { Campaign } from '../types';
import { Clock, Users, ArrowUpRight, CheckCircle2, MapPin } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface CampaignCardProps {
  campaign: Campaign;
  onPledgeClick: (campaign: Campaign) => void;
  onCardClick?: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onPledgeClick,
  onCardClick,
}) => {
  const { t, localizeCategory } = useLanguage();
  const percentFunded = Math.round((campaign.pledgedAmount / campaign.goalAmount) * 100);
  const isFunded = campaign.status === 'funded' || percentFunded >= 100;
  const provenance = campaign.artisanRegion || campaign.creatorLocation || 'India';

  const handleCardSelect = () => {
    if (onCardClick) {
      onCardClick(campaign);
    } else {
      onPledgeClick(campaign);
    }
  };

  return (
    <article
      id={`campaign-card-${campaign.id}`}
      className="group bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] hover:shadow-[0_3px_16px_0_rgba(0,0,0,0.11)] transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden relative"
      onClick={handleCardSelect}
    >
      <div className="flex-1 flex flex-col">
        {/* Card Media Header */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-3 border-b border-[#F0F0F0]">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Floating Craftify-style Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] shadow-xs">
              {t('preOrderBadge')}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5">
            {isFunded ? (
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[#388E3C] text-[#FFFFFF] flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                {t('fundedBadge')} ({percentFunded}%)
              </span>
            ) : (
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-[#FFF8E7] text-[#FF9F00] border border-[#FF9F00]/40 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F00] animate-pulse"></span>
                {percentFunded}% {t('goal')}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Provenance and Category */}
            <div className="flex items-center justify-between text-[11px] text-[#878787] font-medium mb-1">
              <span>{localizeCategory(campaign.category)}</span>
              <span className="flex items-center gap-0.5 text-[#388E3C] font-semibold">
                <MapPin className="w-3 h-3" />
                <span>{provenance}</span>
              </span>
            </div>

            <h3 className="text-sm font-semibold text-[#212121] leading-tight line-clamp-2 group-hover:text-[#2874F0] transition-colors mb-1.5">
              {campaign.title}
            </h3>

            <p className="text-xs text-[#878787] leading-relaxed line-clamp-2 mb-3">
              {campaign.shortDescription}
            </p>

            {/* Campaign Metrics & Progress Bar */}
            <div className="border-t border-[#F0F0F0] pt-2.5 space-y-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-[#212121]">
                    {formatINR(campaign.pledgedAmount)}
                  </span>
                  <span className="text-xs text-[#878787] ml-1">
                    {t('pledgedOf')} {formatINR(campaign.goalAmount)}
                  </span>
                </div>
                <div
                  className={`text-xs font-bold ${
                    isFunded ? 'text-[#388E3C]' : 'text-[#2874F0]'
                  }`}
                >
                  {percentFunded}%
                </div>
              </div>

              {/* Craftify Blue / Green Progress Bar */}
              <div className="w-full h-1.5 bg-[#F1F2F4] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFunded ? 'bg-[#388E3C]' : 'bg-[#2874F0]'
                  }`}
                  style={{ width: `${Math.min(percentFunded, 100)}%` }}
                />
              </div>

              {/* Backers & Time Left */}
              <div className="flex justify-between items-center text-[11px] text-[#878787] pt-0.5">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#878787]" />
                  <span>{campaign.backersCount} {t('backers')}</span>
                </div>
                <div className="flex items-center gap-1 font-medium text-[#212121]">
                  <Clock className="w-3 h-3 text-[#FB641B]" />
                  <span>{campaign.daysLeft} {t('daysLeft')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Craftify Orange Action Button */}
      <div className="p-3 border-t border-[#F0F0F0] bg-[#FFFFFF]">
        <button
          id={`btn-pledge-${campaign.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onPledgeClick(campaign);
          }}
          className="w-full py-2 px-3 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <span>{t('backThisProject')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};

