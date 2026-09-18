import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import { Filter, ArrowUpDown, Sparkles, Search, RotateCcw, ShieldCheck, Truck, Package, Heart } from 'lucide-react';

interface ShopPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onNavigateCampaigns?: () => void;
  wishlistProductIds?: string[];
  onToggleWishlist?: (product: Product) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'newest';

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onAddToCart,
  onProductClick,
  onNavigateCampaigns,
  wishlistProductIds = [],
  onToggleWishlist,
  searchQuery,
  onSearchChange,
}) => {
  const { t, localizeCategory } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyFunded, setOnlyFunded] = useState<boolean>(false);
  const [onlyWishlisted, setOnlyWishlisted] = useState<boolean>(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const activeSearchQuery = searchQuery !== undefined ? searchQuery : internalSearchQuery;
  const handleUpdateSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }
        if (onlyFunded && !(p.isFundedOnCraftify ?? p.isFundedOnLaunchMart)) {
          return false;
        }
        if (onlyWishlisted && !wishlistProductIds.includes(p.id)) {
          return false;
        }
        if (activeSearchQuery.trim()) {
          const q = activeSearchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.shortDescription.toLowerCase().includes(q);
          const matchCreator = p.creator.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCreator && !matchSku && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        if (sortBy === 'newest') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        // Default / featured: prioritize items funded on Craftify
        const aFunded = a.isFundedOnCraftify ?? a.isFundedOnLaunchMart;
        const bFunded = b.isFundedOnCraftify ?? b.isFundedOnLaunchMart;
        if (aFunded && !bFunded) return -1;
        if (!aFunded && bFunded) return 1;
        return 0;
      });
  }, [products, selectedCategory, onlyFunded, onlyWishlisted, wishlistProductIds, activeSearchQuery, sortBy]);

  const fundedCount = products.filter((p) => (p.isFundedOnCraftify ?? p.isFundedOnLaunchMart)).length;
  const wishlistedCount = products.filter((p) => wishlistProductIds.includes(p.id)).length;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setOnlyFunded(false);
    setOnlyWishlisted(false);
    handleUpdateSearch('');
    setSortBy('featured');
  };

  return (
    <div id="shop-listing-page" className="py-6 sm:py-8 bg-[#F1F3F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-[#878787] mb-2">
            <span className="hover:text-[#2874F0] cursor-pointer">{t('home', 'Home')}</span>
            <span>/</span>
            <span className="text-[#212121] font-semibold">{t('shopMarketplace', 'Artisan Marketplace')}</span>
          </div>

          <div className="p-5 sm:p-6 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#388E3C] inline-block"></span>
                <span className="text-xs uppercase tracking-widest text-[#388E3C] font-bold">
                  {t('directWorkshopDispatch', 'Direct Workshop Dispatch • Verified Artisans')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121] tracking-tight">
                {t('artisanMarketplaceTitle', 'Artisanal Goods & Handcrafted Catalog')}
              </h1>
              <p className="text-xs sm:text-sm text-[#878787] mt-1.5 font-normal leading-relaxed">
                {t('artisanMarketplaceSubtitle', 'Handmade pieces that graduated from successful artisan pre-order campaigns. Available for immediate dispatch across India with complete courier protection.')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 text-xs shrink-0">
              <div className="rounded-[2px] border border-[#388E3C]/30 bg-[#EBF7EE] px-3.5 py-2 flex items-center gap-2 text-[#388E3C]">
                <Sparkles className="w-3.5 h-3.5 text-[#388E3C]" />
                <span className="font-semibold">{fundedCount} {t('itemsFundedOnPlatform', 'Items Funded on Platform')}</span>
              </div>
              <div className="rounded-[2px] border border-[#EAEAEA] bg-[#F9F9F9] px-3.5 py-2 flex items-center gap-2 text-[#878787]">
                <Truck className="w-3.5 h-3.5 text-[#212121]" />
                <span>{t('ordersDispatched48h', 'Orders Dispatched in 48h')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar & Search */}
        <div className="rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-3 mb-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
            <SmartInput
              id="shop-search-input"
              type="text"
              placeholder={t('searchCatalogPlaceholder', 'Search products by title, creator, or craft technique...')}
              value={activeSearchQuery}
              onChange={(e) => handleUpdateSearch(e.target.value)}
              onValueChange={(val) => handleUpdateSearch(val)}
              className="w-full pl-9 pr-14 py-1.5 rounded-[2px] bg-[#F1F3F6] border border-[#E0E0E0] text-xs text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
              enableVoice={true}
              enableLanguageDetection={true}
              showLanguageSwitchPrompt={true}
            />
            {activeSearchQuery && (
              <button
                onClick={() => handleUpdateSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#878787] hover:text-[#212121] font-semibold cursor-pointer z-10"
              >
                {t('clearSearch', 'Clear')}
              </button>
            )}
          </div>

          {/* Quick toggle: Funded on Craftify & Wishlist */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="toggle-wishlist-only-btn"
              onClick={() => setOnlyWishlisted(!onlyWishlisted)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                onlyWishlisted
                  ? 'bg-[#FB641B] text-[#FFFFFF] border-[#FB641B] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:border-[#FB641B] hover:text-[#FB641B]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyWishlisted ? 'fill-[#FFFFFF] text-[#FFFFFF]' : 'text-[#FB641B]'}`} />
              <span>{t('wishlist', 'Wishlist')} ({wishlistedCount})</span>
            </button>

            <button
              id="toggle-funded-only-btn"
              onClick={() => setOnlyFunded(!onlyFunded)}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                onlyFunded
                  ? 'bg-[#388E3C] text-[#FFFFFF] border-[#388E3C] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:border-[#388E3C] hover:text-[#388E3C]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${onlyFunded ? 'text-[#FFFFFF]' : 'text-[#388E3C]'}`} />
              <span>{t('craftAssuredBadge', 'Craft-Assured')} ({fundedCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#878787] shrink-0" />
              <label htmlFor="shop-sort-select" className="text-xs text-[#878787]">
                {t('sortLabel', 'Sort:')}
              </label>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-[#212121] focus:outline-none cursor-pointer"
              >
                <option value="featured">{t('sortFeatured', 'Featured First')}</option>
                <option value="price-asc">{t('sortPriceLowHigh', 'Price: Low to High')}</option>
                <option value="price-desc">{t('sortPriceHighLow', 'Price: High to Low')}</option>
                <option value="rating-desc">{t('sortHighestRated', 'Highest Rated')}</option>
                <option value="newest">{t('sortNewest', 'Newest Arrivals')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Layout: Categories Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Category Filter Box */}
            <div className="rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0] mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#212121]" />
                  <span className="text-xs uppercase tracking-wider font-bold text-[#212121]">
                    {t('exploreCategories', 'Filters & Categories')}
                  </span>
                </div>
                {(selectedCategory !== 'All' || onlyFunded || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#2874F0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('clearSearch', 'Clear')}</span>
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {categories.map((cat) => {
                  const count = cat === 'All'
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                  const isSelected = selectedCategory === cat;
                  const displayName = cat === 'All' ? t('allCategories', 'All Categories') : localizeCategory(cat);

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-[2px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF2FE] text-[#2874F0] font-bold border-l-2 border-[#2874F0]'
                          : 'text-[#212121] hover:bg-[#F9F9F9]'
                      }`}
                    >
                      <span>{displayName}</span>
                      <span className={`text-[11px] ${isSelected ? 'text-[#2874F0]' : 'text-[#878787]'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Craftify Assurance Banner */}
            <div className="rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-4 text-xs text-[#212121] shadow-xs">
              <div className="flex items-center gap-2 font-bold text-[#388E3C] mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('heroEscrowBadge', '100% Genuine Handcrafted')}</span>
              </div>
              <p className="text-[#878787] text-xs leading-relaxed mb-3">
                {t('artisanProvenance', 'Direct from master weavers and artisans. Safe insured transit across all Indian pin codes.')}
              </p>
              {onNavigateCampaigns && (
                <button
                  onClick={onNavigateCampaigns}
                  className="text-[#2874F0] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  {t('discoverCampaigns', 'View Pre-Order Campaigns')} →
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {/* Header info count */}
            <div className="flex items-center justify-between text-xs text-[#878787] mb-3 pb-2 border-b border-[#EAEAEA] bg-white px-3 py-2 rounded-[2px]">
              <div>
                <span>Showing </span>
                <strong className="text-[#212121]">{filteredProducts.length}</strong>
                <span> of {products.length} {t('items', 'products')}</span>
                {selectedCategory !== 'All' && <span> in <strong className="text-[#2874F0]">{localizeCategory(selectedCategory)}</strong></span>}
                {onlyFunded && <span className="text-[#388E3C] font-semibold"> ({t('craftAssuredBadge', 'Craft-Assured')})</span>}
              </div>
              {(selectedCategory !== 'All' || onlyFunded || activeSearchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#2874F0] hover:underline font-bold cursor-pointer"
                >
                  {t('clearSearch', 'Clear all')}
                </button>
              )}
            </div>

            {/* Active search filter banner */}
            {activeSearchQuery && (
              <div className="mb-3 bg-[#EBF2FE] border border-[#2874F0]/30 rounded-[4px] px-3.5 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#2874F0]" />
                  <span className="text-xs text-[#212121]">
                    Search results for <strong className="text-[#2874F0]">"{activeSearchQuery}"</strong> ({filteredProducts.length} items found)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateSearch('')}
                  className="text-xs font-bold text-[#2874F0] hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] p-12 text-center shadow-xs">
                <Package className="w-12 h-12 text-[#878787]/40 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#212121] mb-2">
                  {t('noProductsFound', 'No products match your criteria')}
                </h3>
                <p className="text-xs text-[#878787] max-w-md mx-auto mb-6">
                  {t('howItWorksDesc', 'Try clearing your search query or loosening category filters to view other workshop inventory.')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs uppercase font-bold hover:bg-[#1C5FD0] transition-colors cursor-pointer shadow-xs"
                >
                  {t('resetFilters', 'Reset All Filters')}
                </button>
              </div>
            ) : (
              <div
                id="shop-product-grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredProducts.map((product) => (
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
