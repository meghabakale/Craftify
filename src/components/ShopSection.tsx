import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Zap, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ShopSectionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onViewAllClick?: () => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product) => void;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  products,
  onAddToCart,
  onProductClick,
  onViewAllClick,
  wishlistProductIds = [],
  onToggleWishlist,
}) => {
  const { t } = useLanguage();
  // Show up to 6 products matching the Deals for Good showcase
  const displayProducts = products.slice(0, 6);

  return (
    <section id="deals-for-good-section" className="py-3 sm:py-4 bg-[#F1F3F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 sm:p-5 shadow-xs">
          {/* Header matching exact reference image */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#F0F0F0]">
            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-[#FFB800] text-[#FFB800]" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121] tracking-tight">
                  {t('dealsForGood', 'Deals for Good')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#757575] mt-0.5">
                {t('dealsSubtitle', 'Support artisan campaigns and grab in-stock handmade treasures')}
              </p>
            </div>

            {onViewAllClick && (
              <button
                id="btn-shop-view-all"
                onClick={onViewAllClick}
                className="text-[#2874F0] hover:text-[#1259C7] text-sm font-bold flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
              >
                <span>{t('viewAll', 'View All')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 6-Column Responsive Product Grid */}
          <div
            id="deals-products-grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-4"
          >
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onCardClick={onProductClick}
                isWishlisted={wishlistProductIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>

          {/* Assured direct fulfillment strip */}
          <div className="mt-4 pt-3 border-t border-[#F5F5F5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#757575]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#388E3C]">{t('escrowProtected', 'DIRECT ARTISAN ESCROW')}:</span>
              <span>{t('escrowGuaranteeDesc', 'Every purchase supports generational craft lineages with verified zero middlemen.')}</span>
            </div>
            {onViewAllClick && (
              <button
                onClick={onViewAllClick}
                className="text-[#2874F0] hover:underline font-semibold cursor-pointer"
              >
                {t('browseShop', 'Browse Full Catalog')} ({products.length * 12}+ items) →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
