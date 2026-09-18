import React from 'react';
import { Product } from '../types';
import { Star, ShoppingBag, MapPin, Heart } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCardClick?: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onCardClick,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const { t } = useLanguage();
  const provenance = product.artisanRegion || product.creatorLocation || 'India';
  // Simulated MRP for discount display
  const mrp = Math.round(product.price * 1.35);
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  // Determine badge type based on product data
  const badgeType = product.badgeType || (
    !product.inStock || product.category === 'Campaign'
      ? 'pre_order'
      : product.stockCount < 12
      ? 'limited_stock'
      : 'in_stock'
  );

  return (
    <article
      id={`product-card-${product.id}`}
      className="group bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] hover:shadow-[0_3px_16px_0_rgba(0,0,0,0.11)] transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
    >
      <div
        onClick={() => onCardClick?.(product)}
        className={onCardClick ? 'cursor-pointer flex-1 flex flex-col' : 'flex-1 flex flex-col'}
        role={onCardClick ? 'button' : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onCardClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onCardClick(product);
          }
        }}
      >
        {/* Card Media Area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAFA] flex items-center justify-center p-3 border-b border-[#F0F0F0]">
          <img
            src={product.imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-[2px]"
            loading="lazy"
          />

          {/* Wishlist Heart Button (Top Right) */}
          {onToggleWishlist && (
            <button
              id={`btn-wishlist-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              aria-label={isWishlisted ? `Remove ${product.title} from Wishlist` : `Save ${product.title} to Wishlist`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-xs border border-[#E0E0E0] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isWishlisted ? 'fill-[#FB641B] text-[#FB641B]' : 'text-[#878787] hover:text-[#FB641B]'
                }`}
              />
            </button>
          )}

          {/* Status Badge (Top Left, exactly matching reference image) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {badgeType === 'pre_order' ? (
              <span
                id={`badge-status-${product.id}`}
                className="inline-flex items-center gap-1.5 bg-[#FB641B] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>{t('preOrderBadge')}</span>
              </span>
            ) : badgeType === 'limited_stock' ? (
              <span
                id={`badge-status-${product.id}`}
                className="inline-flex items-center gap-1.5 bg-[#FF9F00] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>{t('limitedStockBadge')}</span>
              </span>
            ) : (
              <span
                id={`badge-status-${product.id}`}
                className="inline-flex items-center gap-1.5 bg-[#388E3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>{t('inStockBadge')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Content Body */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
          <div>
            {/* Artisan & Region */}
            <div className="flex items-center justify-between text-[11px] text-[#878787] font-medium mb-1">
              <span className="truncate max-w-[130px]">{product.creator}</span>
              <span className="flex items-center gap-0.5 text-[#388E3C] font-semibold text-[10px]">
                <MapPin className="w-2.5 h-2.5" />
                <span>{provenance}</span>
              </span>
            </div>

            {/* Product Title */}
            <h3 className="text-xs sm:text-sm font-semibold text-[#212121] leading-tight line-clamp-2 group-hover:text-[#2874F0] transition-colors mb-1.5 h-9">
              {product.title}
            </h3>

            {/* Craftify Green Rating Badge & Review Count */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="inline-flex items-center gap-1 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] leading-none">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-2.5 h-2.5 fill-white text-white" />
              </span>
              <span className="text-[11px] text-[#878787] font-medium">
                ({product.reviewsCount})
              </span>
              {(product.isFundedOnCraftify ?? product.isFundedOnLaunchMart) && (
                <span className="text-[10px] text-[#2874F0] font-bold italic ml-auto">
                  ✓ Assured
                </span>
              )}
            </div>

            {/* Craftify Price Block: Selling Price + Strikethrough MRP + % Off */}
            <div className="flex items-baseline gap-1.5 flex-wrap my-0.5">
              <span className="text-base font-bold text-[#212121]">
                {formatINR(product.price)}
              </span>
              <span className="text-xs text-[#878787] line-through">
                {formatINR(mrp)}
              </span>
              <span className="text-xs font-bold text-[#388E3C]">
                {discountPercent}% off
              </span>
            </div>

            {/* Free Delivery / Stock */}
            <div className="text-[10px] text-[#212121] flex items-center justify-between mt-1">
              <span className="text-[#388E3C] font-semibold">{t('freeDelivery')}</span>
              <span className="text-[#878787]">{product.stockCount} {t('leftInStock')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-2.5 pt-0 bg-[#FFFFFF]">
        <button
          id={`btn-add-to-cart-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full py-1.5 px-3 rounded-[2px] bg-[#FF9F00] hover:bg-[#F39700] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t('addToCart')}</span>
        </button>
      </div>
    </article>
  );
};
