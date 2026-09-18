import React, { useState } from 'react';
import { Campaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { CAMPAIGN_CATEGORIES } from '../data/mockData';
import { Compass, Sparkles, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CampaignSectionProps {
  campaigns: Campaign[];
  onPledgeClick: (campaign: Campaign) => void;
  onCardClick?: (campaign: Campaign) => void;
  onViewAllClick?: () => void;
}

export const CampaignSection: React.FC<CampaignSectionProps> = ({
  campaigns,
  onPledgeClick,
  onCardClick,
  onViewAllClick,
}) => {
  const { t, localizeCategory } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = CAMPAIGN_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: t(cat.labelKey, cat.defaultLabel),
  }));

  const filteredCampaigns =
    selectedCategory === 'all'
      ? campaigns
      : campaigns.filter((c) => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <section id="trending-campaigns-section" className="py-6 sm:py-8 bg-[#F1F3F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 sm:p-6 shadow-xs">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FB641B] inline-block"></span>
                <span className="text-xs uppercase tracking-wider text-[#FB641B] font-bold">
                  {t('escrowProtected', 'Pre-Order Escrow Marketplace • 100% Backer Protection')}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                {t('trendingPreOrders', 'Trending Artisan Pre-Orders & Studio Projects')}
              </h2>
              <p className="text-xs sm:text-sm text-[#878787] mt-1 max-w-2xl font-normal">
                {t('preOrdersSubtitle', 'Back master craftspeople directly. Pledges are held in authorized escrow and only billed if 100% funded.')}
              </p>
            </div>

            {/* Quick Filter tabs & View All */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer border ${
                    selectedCategory === cat.key
                      ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0] shadow-xs font-bold'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:border-[#2874F0] hover:text-[#2874F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {onViewAllClick && (
                <button
                  id="btn-campaigns-view-all"
                  onClick={onViewAllClick}
                  className="bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-[2px] shadow-xs ml-2 cursor-pointer whitespace-nowrap"
                >
                  {t('viewAll', 'View All')}
                </button>
              )}
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div
            id="campaigns-cards-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5"
          >
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPledgeClick={onPledgeClick}
                onCardClick={onCardClick}
              />
            ))}
          </div>

          {/* Section Explainer Footer */}
          <div className="mt-5 p-3 rounded-[2px] border border-[#EAEAEA] bg-[#F9F9F9] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#878787]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FB641B]">{t('escrowProtected', 'CONDITIONAL ESCROW')}:</span>
              <span>{t('escrowGuaranteeDesc', 'All campaign authorizations remain pending until the creator hits their financial target.')}</span>
            </div>
            {onViewAllClick && (
              <button
                onClick={onViewAllClick}
                className="text-[#2874F0] font-bold hover:underline cursor-pointer shrink-0"
              >
                {t('exploreCategories', 'Explore all campaigns')} →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
