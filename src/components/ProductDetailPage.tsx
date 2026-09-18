import React, { useState } from 'react';
import { Product, ProductReview, Campaign } from '../types';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import { SmartTextarea } from './common/SmartTextarea';
import { RecommendationsSection } from './RecommendationsSection';
import { MOCK_PRODUCTS, MOCK_CAMPAIGNS } from '../data/mockData';
import {
  Star,
  ShoppingBag,
  Zap,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  MessageSquarePlus,
  UserCheck,
  Share2,
  MapPin,
  Heart,
  Tag,
  Award,
  ShieldCheck,
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onBack: () => void;
  onNavigateCampaign?: (campaignId: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  allProducts?: Product[];
  allCampaigns?: Campaign[];
  onProductClick?: (product: Product) => void;
  onCampaignClick?: (campaign: Campaign) => void;
  onPledgeClick?: (campaign: Campaign) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onBack,
  isWishlisted = false,
  onToggleWishlist,
  allProducts = MOCK_PRODUCTS,
  allCampaigns = MOCK_CAMPAIGNS,
  onProductClick,
  onCampaignClick,
  onPledgeClick,
}) => {
  const { t, localizeCategory } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>(product.reviews || []);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  const images = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.imageUrl];

  const currentImage = images[selectedImageIndex] || product.imageUrl;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleIncreaseQuantity = () => {
    if (quantity < (product.stockCount || 99)) setQuantity((prev) => prev + 1);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim() || !newReviewTitle.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: 'Just now',
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim(),
      verifiedBuyer: true,
    };

    setReviews([newReview, ...reviews]);
    setReviewSubmitSuccess(true);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setTimeout(() => {
      setReviewSubmitSuccess(false);
      setIsWriteReviewOpen(false);
    }, 1800);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div id="product-detail-page" className="py-4 sm:py-6 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Navigation / Back Bar */}
        <div className="flex items-center justify-between py-2.5 px-4 mb-3 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs">
          <button
            id="product-back-to-shop-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#2874F0] hover:text-[#1C5FD0] font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToMarketplace', 'Back to Marketplace')}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-[#878787] hidden sm:inline">
              SKU: <strong className="text-[#212121]">{product.sku}</strong>
            </span>

            {onToggleWishlist && (
              <button
                id="btn-detail-wishlist-top"
                onClick={() => onToggleWishlist(product)}
                className={`px-3 py-1.5 rounded-[2px] border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'bg-[#FFF3EE] border-[#FB641B] text-[#FB641B]'
                    : 'bg-[#FFFFFF] border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121]'
                }`}
                title={isWishlisted ? t('wishlisted', 'Saved in your Wishlist') : t('saveWishlist', 'Save to Wishlist')}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#FB641B] text-[#FB641B]' : 'text-current'}`} />
                <span className="font-bold">{isWishlisted ? t('wishlisted', 'Wishlisted') : t('save', 'Save')}</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-xs text-[#212121] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#878787]" />
              <span>{copiedLink ? t('linkCopied', 'Link Copied!') : t('share', 'Share')}</span>
            </button>
          </div>
        </div>

        {/* Hero Section: Gallery & Purchase Actions */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Media Gallery (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Stage Image */}
              <div className="relative aspect-square rounded-[2px] bg-[#FFFFFF] border border-[#F0F0F0] overflow-hidden flex items-center justify-center p-4">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />

                {/* Badges on main image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#212121] text-[#FFFFFF]">
                    {product.sku}
                  </span>

                  {(product.isFundedOnCraftify ?? product.isFundedOnLaunchMart) && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#388E3C] text-[#FFFFFF] flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#FFE500]" />
                      <span>{t('craftAssuredBadge', 'Funded on Craftify')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail selector */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="btn-product-detail-add-to-cart"
                  onClick={() => onAddToCart(product, quantity)}
                  className="py-3 px-3 rounded-[2px] bg-[#FF9F00] hover:bg-[#F39700] text-[#FFFFFF] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('addToCart', 'Add to Cart')}</span>
                </button>

                <button
                  id="btn-product-detail-buy-now"
                  onClick={() => onBuyNow(product, quantity)}
                  className="py-3 px-3 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('buyNow', 'Buy Now')}</span>
                </button>
              </div>

              {/* "Funded on Craftify" Heritage Panel */}
              {(product.isFundedOnCraftify ?? product.isFundedOnLaunchMart) && (
                <div className="p-4 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] relative mt-4">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[#388E3C]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-bold">
                      {t('craftAssuredBadge', 'Platform Heritage Certificate')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#212121] mb-1">
                    {t('graduatedBadge', 'Graduated from Craftify Crowdfunding')}
                  </h4>
                  <p className="text-xs text-[#878787] leading-relaxed mb-3">
                    {t('howItWorksStep3Desc', 'This item was funded through platform patrons via all-or-nothing escrow authorization. It is now maintained in continuous artisan stock.')}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-[#EAEAEA]">
                    <div>
                      <span className="text-[10px] text-[#878787] uppercase tracking-wider block">{t('originCodeLabel', 'Origin Code')}</span>
                      <strong className="text-xs text-[#212121]">{product.graduatedFromCampaignId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#878787] uppercase tracking-wider block">{t('totalBackedLabel', 'Total Backed')}</span>
                      <strong className="text-xs text-[#388E3C]">
                        {formatINR(product.originalPledgedAmount)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#878787] uppercase tracking-wider block">{t('backers', 'Backers')}</span>
                      <strong className="text-xs text-[#212121]">
                        {product.campaignBackersCount ? `${product.campaignBackersCount} patrons` : 'Patrons'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#878787] uppercase tracking-wider block">{t('batchLabel', 'Batch')}</span>
                      <strong className="text-xs text-[#212121]">
                        {product.batchGraduated ? product.batchGraduated.split('•')[0].trim() : 'Phase 02'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Pricing & Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Category & Maker */}
                <div className="flex items-center justify-between text-xs text-[#878787] uppercase tracking-wider mb-1.5">
                  <span>{localizeCategory(product.category)}</span>
                  <span>{product.creatorLocation || 'Artisan Workshop'}</span>
                </div>

                {/* Provenance Badge */}
                <div className="flex items-center gap-1.5 text-xs text-[#388E3C] bg-[#EAF8EB] px-2.5 py-0.5 rounded-[2px] border border-[#388E3C]/20 w-fit mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#388E3C]" />
                  <span className="font-bold">Handmade in {product.artisanRegion || product.creatorLocation || 'India'}</span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-semibold text-[#212121] leading-tight mb-2">
                  {product.title}
                </h1>

                {/* Creator credit */}
                <div className="text-xs text-[#878787] mb-3 pb-2.5 border-b border-[#F0F0F0] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span>Artisan:</span>
                    <strong className="text-[#2874F0] underline underline-offset-2">
                      {product.creatorBusinessName || product.creator}
                    </strong>
                    {product.creatorBusinessName && (
                      <span className="text-[#666666]">({product.creator})</span>
                    )}
                  </span>
                  <span className="text-[#878787] shrink-0 ml-2">SKU: {product.sku}</span>
                </div>

                {/* Rating Badge & In-Stock Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 bg-[#388E3C] text-white text-xs font-bold px-2 py-0.5 rounded-[2px] leading-none">
                      <span>{averageRating}</span>
                      <Star className="w-3 h-3 fill-white text-white" />
                    </span>
                    <span className="text-xs text-[#878787] font-medium">
                      {reviews.length} {t('ratingsAndReviews', 'Ratings & Reviews')}
                    </span>
                    {(product.isFundedOnCraftify ?? product.isFundedOnLaunchMart) && (
                      <span className="text-xs font-bold text-[#2874F0] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FF9F00]" />
                        {t('craftAssuredBadge', 'Craft-Assured')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[#388E3C] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('inStock', 'In Stock')} ({product.stockCount} {t('leftInStock', 'available')})</span>
                  </div>
                </div>

                {/* Price Display */}
                {(() => {
                  const mrp = Math.round(product.price * 1.35);
                  const discount = Math.round(((mrp - product.price) / mrp) * 100);
                  return (
                    <div className="p-3.5 rounded-[2px] bg-[#F1F3F6] border border-[#EAEAEA] mb-4">
                      <div className="text-xs font-bold text-[#388E3C] mb-0.5">
                        {t('specialPrice', 'Special price')}
                      </div>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-bold text-[#212121]">
                          {formatINR(product.price)}
                        </span>
                        <span className="text-sm text-[#878787] line-through">
                          {formatINR(mrp)}
                        </span>
                        <span className="text-sm font-bold text-[#388E3C]">
                          {discount}% off
                        </span>
                      </div>
                      <div className="text-[11px] text-[#878787] mt-1">
                        {t('inclusiveTaxes', 'Inclusive of all taxes • Direct artisan price guarantee')}
                      </div>
                    </div>
                  );
                })()}

                {/* Available Offers Box */}
                <div className="p-3.5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] mb-4 space-y-1.5 text-xs text-[#212121]">
                  <h4 className="font-bold text-xs text-[#212121] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#388E3C]" />
                    <span>{t('availableOffers', 'Available Offers')}</span>
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#388E3C] shrink-0 mt-0.5" />
                      <span>{t('bankOfferTitle', 'Bank Offer: 10% Instant Discount on RuPay Cards')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#388E3C] shrink-0 mt-0.5" />
                      <span>{t('specialPriceOffer', 'Special Price: Extra ₹200 off with artisan direct checkout.')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#388E3C] shrink-0 mt-0.5" />
                      <span>{t('partnerOfferText', 'Partner Offer: Free GI Authenticity certificate & care guide included.')}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-xs sm:text-sm text-[#505050] leading-relaxed mb-4 space-y-2">
                  <p className="font-semibold text-[#212121]">{product.shortDescription}</p>
                  {product.longDescription && (
                    <div className="text-xs text-[#666666] whitespace-pre-line leading-relaxed">
                      {product.longDescription}
                    </div>
                  )}
                </div>

                {/* Features List */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-4 p-3.5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA]">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#212121] block mb-1.5">
                      {t('craftTechniqueDetails', 'Craft & Technique Details')}
                    </span>
                    <ul className="space-y-1 text-xs text-[#666666]">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#2874F0] font-bold">•</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-3 pt-2 border-t border-[#F0F0F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#212121] font-bold">
                      {t('quantityLabel', 'Quantity')}
                    </span>
                    <div className="flex items-center rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] overflow-hidden">
                      <button
                        id="btn-qty-minus"
                        onClick={handleDecreaseQuantity}
                        disabled={quantity <= 1}
                        className="p-1.5 text-[#212121] hover:bg-[#F1F3F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold text-[#212121]">
                        {quantity}
                      </span>
                      <button
                        id="btn-qty-plus"
                        onClick={handleIncreaseQuantity}
                        disabled={quantity >= (product.stockCount || 99)}
                        className="p-1.5 text-[#212121] hover:bg-[#F1F3F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#878787]">
                    <span>{t('itemSubtotalLabel', 'Item Subtotal')} ({quantity} {quantity === 1 ? t('item', 'item') : t('items', 'items')}):</span>
                    <strong className="text-sm text-[#212121]">{formatINR(product.price * quantity)}</strong>
                  </div>
                </div>
              </div>

              {/* Guarantee / Shipping Notes */}
              <div className="mt-6 pt-4 border-t border-[#F0F0F0] grid grid-cols-2 gap-3 text-xs text-[#878787]">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#212121] block">{t('dispatch48hTitle', '48-Hour Dispatch')}</strong>
                    <span>{t('dispatch48hDesc', 'Safely packed with India Post courier tracking.')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw className="w-4 h-4 text-[#388E3C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#212121] block">{t('replacement7dTitle', '7-Day Replacement')}</strong>
                    <span>{t('replacement7dDesc', 'Return guarantee if received damaged.')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About the Artisan Section */}
        <section id="product-artisan-profile-section" className="mb-6 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
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
              {product.creatorProfilePhoto ? (
                <img
                  src={product.creatorProfilePhoto}
                  alt={product.creatorBusinessName || product.creator}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-[4px] object-cover border border-[#EAEAEA] shadow-xs mb-3"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-[4px] bg-[#2874F0] text-[#FFFFFF] font-bold text-3xl flex items-center justify-center shadow-xs mb-3">
                  {product.creator.charAt(0)}
                </div>
              )}
              <h4 className="font-bold text-sm text-[#212121] leading-tight">
                {product.creator}
              </h4>
              {product.creatorBusinessName && (
                <p className="text-xs text-[#2874F0] font-medium mt-0.5">
                  {product.creatorBusinessName}
                </p>
              )}
              <div className="mt-2 text-xs text-[#878787] flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#388E3C]" />
                <span>
                  {product.creatorCity && product.creatorState
                    ? `${product.creatorCity}, ${product.creatorState}`
                    : product.artisanRegion || product.creatorLocation || 'India'}
                </span>
              </div>
              {product.creatorYearsOfExperience && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FB641B] bg-[#FFF3E0] px-2 py-0.5 rounded-[2px]">
                  <Award className="w-3 h-3" />
                  <span>{product.creatorYearsOfExperience} Years Experience</span>
                </div>
              )}
            </div>

            <div className="md:col-span-9 space-y-4">
              <div>
                <h4 className="text-base font-bold text-[#212121] mb-1">
                  Artisan Heritage & Craft Story
                </h4>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed whitespace-pre-line">
                  {product.creatorBio ?? product.shortDescription ?? 'Generational artisan committed to reviving authentic handmade craft traditions and creating heirloom pieces on Craftify.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#F0F0F0] text-xs">
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Craft Tradition</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">{product.craftHeritage || product.category || 'Handmade Craft'}</span>
                </div>
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Workshop / Studio</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">{product.creatorBusinessName || product.creator}</span>
                </div>
                <div className="p-3 bg-[#F1F3F6] rounded-[2px] border border-[#EAEAEA]">
                  <span className="text-[10px] uppercase font-bold text-[#878787] block">Regional Guild</span>
                  <span className="font-bold text-[#212121] mt-0.5 block">
                    {product.creatorCity && product.creatorState
                      ? `${product.creatorCity}, ${product.creatorState}`
                      : product.artisanRegion || product.creatorLocation || 'India'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specifications Table */}
        {product.specs && product.specs.length > 0 && (
          <div className="mb-6 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
            <h3 className="text-lg font-bold text-[#212121] mb-3 pb-2 border-b border-[#F0F0F0]">
              {t('productSpecsTitle', 'Product Specifications')}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {product.specs.map((spec, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-[#F0F0F0]">
                  <dt className="text-[#878787] uppercase tracking-wider">{spec.label}</dt>
                  <dd className="font-bold text-[#212121] text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Reviews Section */}
        <section id="product-reviews-section" className="rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#F0F0F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#2874F0] inline-block"></span>
                <span className="text-xs uppercase tracking-wider text-[#2874F0] font-bold">
                  {t('ratingsAndReviews', 'Ratings & Reviews')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#212121]">
                {t('customerReviewsTitle', 'Customer Reviews')} ({reviews.length})
              </h2>
            </div>

            <button
              id="btn-open-write-review"
              onClick={() => setIsWriteReviewOpen(!isWriteReviewOpen)}
              className="px-4 py-2 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold hover:bg-[#1C5FD0] transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{isWriteReviewOpen ? t('closeFormBtn', 'Close Form') : t('rateProductBtn', 'Rate Product')}</span>
            </button>
          </div>

          {/* Interactive Review Form */}
          {isWriteReviewOpen && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-6 p-4 sm:p-5 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] space-y-3"
            >
              <h3 className="text-base font-bold text-[#212121]">
                {t('rateReviewTitle', 'Rate & Review this Product')}
              </h3>
              <p className="text-xs text-[#878787]">
                {t('rateReviewSubtitle', 'Share your impressions on craftsmanship, quality, and appearance.')}
              </p>

              {reviewSubmitSuccess && (
                <div className="p-2.5 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/30 text-[#388E3C] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Review recorded! Thank you for rating this artisan.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('yourNameLabel', 'Your Name')} *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    placeholder="e.g. Rahul S."
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    onValueChange={(val) => setNewReviewAuthor(val)}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('starRatingLabel', 'Star Rating')} *
                  </label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0] cursor-pointer"
                  >
                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Average)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                  {t('reviewTitleLabel', 'Review Title')} *
                </label>
                <SmartInput
                  type="text"
                  required
                  placeholder="e.g. Stunning brass detailing and finish"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  onValueChange={(val) => setNewReviewTitle(val)}
                  className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                  {t('detailedFeedbackLabel', 'Detailed Feedback')} *
                </label>
                <SmartTextarea
                  required
                  rows={3}
                  placeholder="Describe what you liked or how the craft met your expectations..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  onValueChange={(val) => setNewReviewComment(val)}
                  className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="px-3.5 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#878787] hover:text-[#212121] cursor-pointer"
                >
                  {t('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[2px] bg-[#FB641B] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold hover:bg-[#E85D19] cursor-pointer shadow-xs"
                >
                  {t('submitReviewBtn', 'Submit Review')}
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-[4px] bg-[#FFFFFF] border border-[#F0F0F0] space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[2px]">
                      <span>{rev.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                    </span>
                    <strong className="text-sm text-[#212121] font-bold">
                      {rev.title}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#878787]">
                    <span>{rev.date}</span>
                    {rev.verifiedBuyer && (
                      <span className="text-[#388E3C] font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {t('certifiedBuyerBadge', 'Certified Buyer')}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {rev.comment}
                </p>

                <div className="text-xs text-[#878787] pt-0.5">
                  — <span className="font-semibold text-[#212121]">{rev.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended for You based on product category */}
        <RecommendationsSection
          viewedCategories={product.category ? [product.category] : []}
          products={allProducts}
          campaigns={allCampaigns}
          onAddToCart={onAddToCart ? (p) => onAddToCart(p, 1) : undefined}
          onProductClick={onProductClick}
          onCampaignClick={onCampaignClick}
          onPledgeClick={onPledgeClick}
          wishlistProductIds={isWishlisted ? [product.id] : []}
          onToggleWishlist={onToggleWishlist}
          className="mt-8 px-0"
        />
      </div>
    </div>
  );
};
