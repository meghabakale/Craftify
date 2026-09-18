import React from 'react';
import { ActiveView } from '../types';
import { HERO_BLUE_SHAWL_ELEPHANT_IMAGE } from '../data/artisanAssets';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Truck,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface HeroProps {
  onNavigate: (view: ActiveView) => void;
  onScrollToCampaigns: () => void;
  onScrollToShop: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigate,
  onScrollToCampaigns,
  onScrollToShop,
}) => {
  const { t } = useLanguage();

  return (
    <section id="hero-banner-section" className="pt-2 pb-2 sm:pt-3 sm:pb-3 bg-[#F1F3F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Craftify Heritage Hero Card */}
        <div className="relative overflow-hidden bg-[#FFFFFF] border border-[#E0E0E0] rounded-[4px] shadow-xs">
          {/* Carousel Left Arrow */}
          <button
            aria-label="Previous Slide"
            onClick={onScrollToCampaigns}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white border border-[#E0E0E0] shadow-sm flex items-center justify-center text-[#757575] hover:text-[#212121] cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Carousel Right Arrow */}
          <button
            aria-label="Next Slide"
            onClick={onScrollToShop}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white border border-[#E0E0E0] shadow-sm flex items-center justify-center text-[#757575] hover:text-[#212121] cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex flex-col lg:flex-row items-stretch min-h-[360px] sm:min-h-[400px] lg:min-h-[440px]">
            {/* Left Column: Text & Content (~50% width) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 z-10 bg-white">
              {/* Eyebrow with flanking subtle lines */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-[1px] bg-[#2874F0]/40"></span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] font-bold text-[#2874F0]">
                  {t('exploreCategories')}
                </span>
                <span className="w-7 h-[1px] bg-[#2874F0]/40"></span>
              </div>

              {/* Signature Headline */}
              <h1
                id="hero-main-title"
                className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-black tracking-tight text-[#111111] leading-[1.12] mb-4 sm:mb-6"
              >
                {t('heroTitleLine1')}<br />
                {t('heroTitleLine2')}
              </h1>

              {/* 3 Trust Badges (Craftify bright blue & neutral styling) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 border-y border-[#F0F0F0] mb-5 sm:mb-6">
                {/* Badge 1 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-[#2874F0]" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-[#212121]">{t('heroEscrowBadge')}</div>
                    <div className="text-[#878787]">{t('heroEscrowDesc')}</div>
                  </div>
                </div>

                {/* Badge 2 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-[#2874F0]" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-[#212121]">{t('heroDirectTradeBadge')}</div>
                    <div className="text-[#878787]">{t('heroDirectTradeDesc')}</div>
                  </div>
                </div>

                {/* Badge 3 */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4 text-[#2874F0]" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <div className="font-bold text-[#212121]">{t('heroGiCertifiedBadge')}</div>
                    <div className="text-[#878787]">{t('heroGiCertifiedDesc')}</div>
                  </div>
                </div>
              </div>

              {/* Primary & Secondary Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  id="btn-hero-shop-live"
                  onClick={() => {
                    onNavigate('shop');
                    onScrollToShop();
                  }}
                  className="px-6 py-3 rounded-[3px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>{t('heroExploreShopCta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onNavigate('campaigns');
                    onScrollToCampaigns();
                  }}
                  className="px-4 py-3 rounded-[3px] border border-[#D4D4D4] hover:border-[#2874F0] hover:text-[#2874F0] text-[#212121] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('heroBackCampaignCta')}
                </button>
              </div>
            </div>

            {/* Right Column: Handcrafted Indian Decor Image (~50% width) */}
            <div className="relative w-full lg:w-1/2 min-h-[280px] sm:min-h-[340px] lg:min-h-[440px] overflow-hidden bg-[#FBFBFB]">
              {/* Subtle gradient fade between text on the left and image on the right (desktop/tablet) */}
              <div
                className="hidden lg:block absolute inset-y-0 left-0 w-20 xl:w-28 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10"
                aria-hidden="true"
              />
              {/* Subtle gradient fade for stacked mobile view */}
              <div
                className="lg:hidden absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white via-white/70 to-transparent pointer-events-none z-10"
                aria-hidden="true"
              />

              {/* Handcrafted Indian Decor Hero Image */}
              <img
                src="/image.png"
                alt="Handcrafted Indian decor: Brass elephant figurine, Jaipur blue pottery vase, and draped royal blue silk textile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-[center_55%] transition-transform duration-700 hover:scale-102"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = HERO_BLUE_SHAWL_ELEPHANT_IMAGE;
                }}
              />

              {/* Verified Heritage Tag */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-[3px] border border-[#E0E0E0] shadow-xs flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-[#388E3C] animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#212121]">Varanasi Silk & Brass Guild</span>
                <span className="text-[10px] text-[#2874F0] font-semibold">GI Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
