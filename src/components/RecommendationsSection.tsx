import React, { useEffect, useState, useMemo } from 'react';
import { Product, Campaign } from '../types';
import { ProductCard } from './ProductCard';
import { CampaignCard } from './CampaignCard';
import { fetchRecommendations, RecommendationItem } from '../api/aiTools';
import { Compass, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface RecommendationsSectionProps {
  viewedCategories?: string[];
  products: Product[];
  campaigns: Campaign[];
  onAddToCart?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onCampaignClick?: (campaign: Campaign) => void;
  onPledgeClick?: (campaign: Campaign) => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

interface ResolvedRecommendation {
  id: string;
  type: 'product' | 'campaign';
  reason: string;
  data: Product | Campaign;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  viewedCategories = [],
  products,
  campaigns,
  onAddToCart,
  onProductClick,
  onCampaignClick,
  onPledgeClick,
  wishlistProductIds = [],
  onToggleWishlist,
  className = '',
  title,
  subtitle,
}) => {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<ResolvedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Default static trending fallback list from available products & campaigns
  const staticTrendingFallback = useMemo<ResolvedRecommendation[]>(() => {
    const list: ResolvedRecommendation[] = [];
    const availableProducts = products.filter((p) => p.inStock !== false);
    const topProducts = availableProducts.length > 0 ? availableProducts.slice(0, 2) : products.slice(0, 2);
    const topCampaigns = campaigns.slice(0, 2);

    topProducts.forEach((p) => {
      list.push({
        id: p.id,
        type: 'product',
        reason: `Popular in ${p.category}`,
        data: p,
      });
    });

    topCampaigns.forEach((c) => {
      list.push({
        id: c.id,
        type: 'campaign',
        reason: `Popular in ${c.category}`,
        data: c,
      });
    });

    return list;
  }, [products, campaigns]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadRecommendations = async () => {
      try {
        const rawRecs: RecommendationItem[] = await fetchRecommendations({
          viewed_categories: viewedCategories,
        });

        if (!isMounted) return;

        if (Array.isArray(rawRecs) && rawRecs.length > 0) {
          const resolved: ResolvedRecommendation[] = [];

          rawRecs.forEach((rec) => {
            if (rec.type === 'product') {
              const matchedProduct =
                products.find((p) => String(p.id) === String(rec.id) || p.sku === rec.id) ||
                products.find((p) => rec.reason.toLowerCase().includes(p.category.toLowerCase())) ||
                products[resolved.length % Math.max(products.length, 1)];

              if (matchedProduct && !resolved.some((r) => r.id === matchedProduct.id)) {
                resolved.push({
                  id: matchedProduct.id,
                  type: 'product',
                  reason: rec.reason,
                  data: matchedProduct,
                });
              }
            } else if (rec.type === 'campaign') {
              const matchedCampaign =
                campaigns.find((c) => String(c.id) === String(rec.id) || c.code === rec.id) ||
                campaigns.find((c) => rec.reason.toLowerCase().includes(c.category.toLowerCase())) ||
                campaigns[resolved.length % Math.max(campaigns.length, 1)];

              if (matchedCampaign && !resolved.some((r) => r.id === matchedCampaign.id)) {
                resolved.push({
                  id: matchedCampaign.id,
                  type: 'campaign',
                  reason: rec.reason,
                  data: matchedCampaign,
                });
              }
            }
          });

          if (resolved.length >= 2) {
            setRecommendations(resolved.slice(0, 4));
            setIsLoading(false);
            return;
          }
        }

        // Silent-fail-to-default fallback when API fails or returns insufficient items
        setRecommendations(staticTrendingFallback);
      } catch {
        // Silent failure: no error toast or banner, smoothly fall back to static trending
        if (isMounted) {
          setRecommendations(staticTrendingFallback);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [viewedCategories, products, campaigns, staticTrendingFallback]);

  const displayTitle = title || t('recommendedForYou', 'Recommended for You');
  const displaySubtitle =
    subtitle ||
    (viewedCategories.length > 0
      ? t('recommendedSubtitleBasedOnViews', 'Handpicked creations based on your recent craft browsing')
      : t('recommendedSubtitleTrending', 'Handpicked creations and trending craft traditions'));

  return (
    <section
      id="recommended-for-you-section"
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}
    >
      <div className="bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] p-4 sm:p-6 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2874F0] inline-block" />
              <h2 className="text-lg sm:text-xl font-bold text-[#212121]">
                {displayTitle}
              </h2>
            </div>
            <p className="text-xs text-[#878787] mt-0.5">
              {displaySubtitle}
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div
            id="recommendations-skeleton"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] p-3 animate-pulse space-y-3"
              >
                <div className="aspect-[4/3] bg-[#F1F3F6] rounded-[2px]" />
                <div className="h-3.5 bg-[#F1F3F6] rounded w-3/4" />
                <div className="h-3 bg-[#F1F3F6] rounded w-1/2" />
                <div className="h-6 bg-[#F1F3F6] rounded w-full mt-2" />
                <div className="h-7 bg-[#F1F3F6] rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Cards Grid */
          <div
            id="recommendations-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {recommendations.map((rec) => (
              <div key={`${rec.type}-${rec.id}`} className="flex flex-col">
                {/* Existing Card Component */}
                <div className="flex-1 flex flex-col">
                  {rec.type === 'product' ? (
                    <ProductCard
                      product={rec.data as Product}
                      onAddToCart={onAddToCart || (() => {})}
                      onCardClick={onProductClick}
                      isWishlisted={wishlistProductIds.includes(rec.data.id)}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ) : (
                    <CampaignCard
                      campaign={rec.data as Campaign}
                      onPledgeClick={onPledgeClick || (() => {})}
                      onCardClick={onCampaignClick}
                    />
                  )}
                </div>

                {/* Caption UI: Rule-based recommendation reason, truncates/wraps gracefully */}
                <div
                  id={`rec-caption-${rec.id}`}
                  className="mt-2 px-2.5 py-1.5 bg-[#F8F9FA] rounded-[3px] border border-[#EAEAEA] flex items-center gap-1.5 min-h-[34px]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#2874F0] shrink-0" />
                  <p
                    className="text-[11px] text-[#424242] font-medium leading-tight line-clamp-2 break-words"
                    title={rec.reason}
                  >
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
