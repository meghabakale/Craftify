import React, { useState, useRef, useEffect } from 'react';
import { ActiveView, User, Product, Campaign } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { SmartInput } from './common/SmartInput';
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Compass,
  Store,
  PlusCircle,
  LogIn,
  ChevronDown,
  Layers,
  Sparkles,
  Bot,
  Heart,
  Search,
  CheckCircle2,
  Package,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Bookmark,
  LogOut,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  Tag,
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onToggleGemini?: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  onLogout?: () => void;
  onLogin?: (user: User) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  products?: Product[];
  campaigns?: Campaign[];
  onProductClick?: (product: Product) => void;
  onCampaignClick?: (campaign: Campaign) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenAccount,
  onToggleGemini,
  wishlistCount = 0,
  onOpenWishlist,
  onLogout,
  onLogin,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  products = [],
  campaigns = [],
  onProductClick,
  onCampaignClick,
}) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setNavSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(event.target as Node)) {
        setDemoMenuOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const DEMO_USERS = [
    {
      user: {
        id: 'usr-buyer-arjun',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        role: 'buyer' as const,
        avatarInitials: 'AM',
        memberSince: 'March 2025',
        shippingAddress: {
          street: '742 Heritage Terrace, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400050',
          country: 'India',
        },
      },
      username: 'arjun_mehta',
      label: 'Arjun Mehta',
      badge: 'Buyer',
      badgeColor: 'bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]',
      description: 'Seeded Craft Patron (Mumbai) — Use to pledge to campaigns',
    },
    {
      user: {
        id: 'usr-buyer-priya',
        name: 'Priya Kulkarni',
        email: 'priya.kulkarni@example.com',
        role: 'buyer' as const,
        avatarInitials: 'PK',
        memberSince: 'April 2025',
        shippingAddress: {
          street: '15 Palm Meadows, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560066',
          country: 'India',
        },
      },
      username: 'priya_kulkarni',
      label: 'Priya Kulkarni',
      badge: 'Buyer',
      badgeColor: 'bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]',
      description: 'Bengaluru Patron — Backs textile and ceramic arts',
    },
    {
      user: {
        id: 'usr-artisan-incomplete-lakshmi',
        name: 'Lakshmi Devi',
        legalName: 'Lakshmi Devi',
        businessName: '',
        email: 'lakshmi.devi@craftify.in',
        phone: '',
        role: 'artisan' as const,
        avatarInitials: 'LD',
        craftType: 'Bidriware Metal Inlay',
        city: '',
        state: '',
        yearsOfExperience: undefined,
        bio: '',
        profilePhoto: '',
        profileCompleted: false,
        memberSince: 'September 2026',
        shippingAddress: {
          street: 'Craft Cluster, Old Town',
          city: 'Bidar',
          state: 'Karnataka',
          zip: '585401',
          country: 'India',
        },
      },
      username: 'lakshmi_devi',
      label: 'Lakshmi Devi (New Artisan)',
      badge: 'Profile Incomplete',
      badgeColor: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
      description: 'New Artisan — Test mandatory onboarding profile completion & gating',
    },
    {
      user: {
        id: 'usr-artisan-ramesh',
        name: 'Rameshwar Prajapati',
        legalName: 'Rameshwar Prajapati',
        businessName: 'Prajapati Blue Pottery Studio',
        email: 'ramesh.clay@craftify.in',
        phone: '+91 98290 12345',
        role: 'artisan' as const,
        avatarInitials: 'RP',
        craftType: 'Jaipur Blue Pottery',
        city: 'Jaipur',
        state: 'Rajasthan',
        yearsOfExperience: 32,
        bio: 'Master artisan from Kot Jewar preserving the authentic lead-free quartz paste Egyptian technique for Jaipur Blue Pottery.',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        profileCompleted: true,
        payoutDetails: {
          accountHolderName: 'Rameshwar Prajapati',
          accountNumber: '50100293847561',
          ifscCode: 'HDFC0000184',
        },
        gstNumber: '08AAAAA0000A1Z2',
        memberSince: 'January 2025',
        shippingAddress: {
          street: '4 Pottery Lane, Kot Jewar',
          city: 'Jaipur',
          state: 'Rajasthan',
          zip: '302001',
          country: 'India',
        },
      },
      username: 'ramesh_potter',
      label: 'Rameshwar Prajapati',
      badge: 'Artisan',
      badgeColor: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
      description: 'Master Potter — Owner of Blue Pottery Studio (CMP-105)',
    },
    {
      user: {
        id: 'usr-artisan-ansari',
        name: 'Master Shahid Ansari',
        legalName: 'Master Shahid Ansari',
        businessName: 'Ansari Heritage Loom Guild',
        email: 'shahid.ansari@craftify.in',
        phone: '+91 94150 98765',
        role: 'artisan' as const,
        avatarInitials: 'SA',
        craftType: 'Kalamkari & Handloom Weaving',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        yearsOfExperience: 28,
        bio: 'Generational master weaver from Madanpura, Varanasi. Specializing in pure zari kadwa weave Banarasi brocades and hand-drawn pen Kalamkari.',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        profileCompleted: true,
        payoutDetails: {
          accountHolderName: 'Master Shahid Ansari',
          accountNumber: '203948571029',
          ifscCode: 'SBIN0000210',
        },
        gstNumber: '09BBBBB1111B1Z3',
        memberSince: 'March 2025',
        shippingAddress: {
          street: '12 Weaver Colony, Madanpura',
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          zip: '221001',
          country: 'India',
        },
      },
      username: 'ansari_weaver',
      label: 'Master Shahid Ansari',
      badge: 'Artisan',
      badgeColor: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
      description: 'Master Weaver — Owner of Kalamkari Workshop (CMP-109)',
    },
    {
      user: {
        id: 'usr-admin-seeded',
        name: 'Platform Administrator',
        email: 'admin@craftify.gov.in',
        role: 'admin' as const,
        avatarInitials: 'PA',
        memberSince: 'January 2025',
        shippingAddress: {
          street: '1 Curation Plaza, MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560001',
          country: 'India',
        },
      },
      username: 'admin',
      label: 'Platform Administrator',
      badge: 'Admin',
      badgeColor: 'bg-[#EDE7F6] text-[#512DA8] border-[#D1C4E9]',
      description: 'Platform Governance & Escrow Curation Admin',
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const executeSearch = (targetQuery: string) => {
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    if (onSearchChange) {
      onSearchChange(targetQuery);
    }
    if (onSearchSubmit) {
      onSearchSubmit(targetQuery);
    } else {
      onNavigate('shop');
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeSearch(navSearchQuery);
  };

  const handleSelectProduct = (product: Product) => {
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    if (onProductClick) {
      onProductClick(product);
    } else {
      onNavigate('product-detail');
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    if (onCampaignClick) {
      onCampaignClick(campaign);
    } else {
      onNavigate('campaign-detail');
    }
  };

  const trimmedQuery = navSearchQuery.trim().toLowerCase();

  const matchedProducts = React.useMemo(() => {
    if (!trimmedQuery || !products.length) return [];
    return products
      .filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(trimmedQuery);
        const creatorMatch = p.creator.toLowerCase().includes(trimmedQuery);
        const categoryMatch = p.category.toLowerCase().includes(trimmedQuery);
        const descMatch = p.shortDescription?.toLowerCase().includes(trimmedQuery);
        const skuMatch = p.sku?.toLowerCase().includes(trimmedQuery);
        return titleMatch || creatorMatch || categoryMatch || descMatch || skuMatch;
      })
      .slice(0, 4);
  }, [trimmedQuery, products]);

  const matchedCampaigns = React.useMemo(() => {
    if (!trimmedQuery || !campaigns.length) return [];
    return campaigns
      .filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(trimmedQuery);
        const creatorMatch = c.creator.toLowerCase().includes(trimmedQuery);
        const categoryMatch = c.category.toLowerCase().includes(trimmedQuery);
        const descMatch = c.shortDescription?.toLowerCase().includes(trimmedQuery);
        return titleMatch || creatorMatch || categoryMatch || descMatch;
      })
      .slice(0, 3);
  }, [trimmedQuery, campaigns]);

  const TRENDING_SEARCHES = [
    'Blue Pottery',
    'Kalamkari Sarees',
    'Brass Puja Bell',
    'Sandalwood Box',
    'Terracotta Matka',
    'Pashmina Shawl',
  ];

  return (
    <header id="main-navigation-header" className="sticky top-0 z-40 shadow-xs">
      {/* Craftify Signature Blue Header */}
      <div className="bg-[#2874F0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Plus Subtitle with golden craft flower */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="nav-logo-button"
              onClick={() => handleNavClick('home')}
              className="flex flex-col text-left group focus:outline-none cursor-pointer"
            >
              <div className="font-sans text-2xl font-bold tracking-tight text-[#FFFFFF] italic leading-none flex items-center gap-1.5">
                <span>Craftify</span>
                {/* Golden craft emblem from reference image */}
                <svg className="w-5 h-5 text-[#FFE500]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.2 6.2 14.8 7.8 19 9C14.8 10.2 13.2 11.8 12 16C10.8 11.8 9.2 10.2 5 9C9.2 7.8 10.8 6.2 12 2Z" />
                  <circle cx="12" cy="9" r="1.8" fill="#FFE500" />
                  <path d="M12 9C15 11 18 11.5 21 12C18 12.5 15 13 12 15C9 13 6 12.5 3 12C6 11.5 9 11 12 9Z" opacity="0.8" />
                </svg>
              </div>
              <div className="text-[11px] font-medium text-[#F0F0F0] italic flex items-center gap-0.5 mt-0.5">
                <span>Explore</span>
                <span className="text-[#FFE500] font-bold">Plus</span>
                <span className="text-[#FFE500] text-xs leading-none">✦</span>
              </div>
            </button>
          </div>

          {/* Wide Search Bar with Left Icon & Live Autocomplete Popover */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl hidden md:flex items-center relative"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center relative"
            >
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-[#2874F0] absolute left-3.5 z-10 pointer-events-none" />
                <SmartInput
                  id="craftify-nav-search"
                  type="text"
                  placeholder={t('searchPlaceholder', 'Search for products, artisans, campaigns, crafts and more...')}
                  value={navSearchQuery}
                  onChange={(e) => {
                    setNavSearchQuery(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onValueChange={(val) => {
                    setNavSearchQuery(val);
                    if (onSearchChange) onSearchChange(val);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                    }
                  }}
                  className="w-full bg-[#FFFFFF] text-[#212121] text-sm pl-10 pr-24 py-2 rounded-[2px] shadow-xs placeholder-[#878787] focus:outline-none"
                  containerClassName="w-full"
                  enableVoice={true}
                  enableLanguageDetection={true}
                  showLanguageSwitchPrompt={true}
                />

                {/* Right controls inside input: Clear button + Search action button */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                  {navSearchQuery ? (
                    <button
                      type="button"
                      id="nav-search-clear-btn"
                      onClick={() => {
                        setNavSearchQuery('');
                        if (onSearchChange) onSearchChange('');
                      }}
                      className="text-[#878787] hover:text-[#212121] p-1 cursor-pointer transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    id="nav-search-submit-btn"
                    className="bg-[#2874F0] hover:bg-[#1A5DC8] text-white px-3 py-1 rounded-[2px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    title="Search"
                  >
                    <Search className="w-3 h-3" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Instant Search Suggestions Popover Dropdown */}
            {isSearchFocused && (
              <div
                id="navbar-search-autocomplete-dropdown"
                className="absolute left-0 right-0 top-full mt-1.5 bg-[#FFFFFF] rounded-[4px] shadow-2xl border border-[#D5D5D5] z-50 overflow-hidden text-[#212121] max-h-[480px] overflow-y-auto"
              >
                {trimmedQuery.length === 0 ? (
                  <div className="p-3.5 space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#878787] uppercase tracking-wider mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#2874F0]" />
                        <span>Popular Craft Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => executeSearch(term)}
                            className="px-2.5 py-1 bg-[#F1F3F6] hover:bg-[#E3F2FD] hover:text-[#2874F0] text-xs text-[#212121] rounded-[2px] border border-[#E0E0E0] hover:border-[#2874F0]/40 font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Search className="w-2.5 h-2.5 opacity-60" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0F0F0]">
                      <div className="text-xs font-bold text-[#878787] uppercase tracking-wider mb-2">
                        Explore Crafts by Category
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Pottery & Ceramics', icon: '🏺' },
                          { label: 'Handloom & Textiles', icon: '🧶' },
                          { label: 'Jewellery & Metalwork', icon: '🪔' },
                          { label: 'Woodcraft', icon: '🪵' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => executeSearch(item.label)}
                            className="flex items-center gap-2 p-2 rounded-[2px] bg-[#F9FAFB] hover:bg-[#F1F3F6] border border-[#EEEEEE] text-left text-xs font-medium text-[#212121] transition-colors cursor-pointer"
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {matchedProducts.length === 0 && matchedCampaigns.length === 0 ? (
                      <div className="p-6 text-center">
                        <Search className="w-8 h-8 text-[#878787] mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-semibold text-[#212121]">
                          No direct matches for "{navSearchQuery}"
                        </p>
                        <p className="text-xs text-[#878787] mt-1 max-w-sm mx-auto">
                          Press Enter or click below to search the full marketplace, or try searching for keywords like "clay", "silk", "brass", or "wood".
                        </p>
                        <button
                          type="button"
                          onClick={() => executeSearch(navSearchQuery)}
                          className="mt-3 px-4 py-1.5 bg-[#2874F0] text-white text-xs font-semibold rounded-[2px] hover:bg-[#1A5DC8] cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Search Marketplace for "{navSearchQuery}"</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Matching Products */}
                        {matchedProducts.length > 0 && (
                          <div className="p-2 border-b border-[#F0F0F0]">
                            <div className="px-2 py-1 text-[11px] font-bold text-[#878787] uppercase tracking-wider flex items-center justify-between">
                              <span>Products in Marketplace ({matchedProducts.length})</span>
                              <span className="text-[10px] text-[#2874F0]">Ready to Ship</span>
                            </div>
                            <div className="space-y-1 mt-1">
                              {matchedProducts.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(p)}
                                  className="w-full flex items-center justify-between p-2 rounded-[2px] hover:bg-[#F1F3F6] transition-colors text-left cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <img
                                      src={p.imageUrl}
                                      alt={p.title}
                                      className="w-10 h-10 object-cover rounded-[2px] shrink-0 border border-[#EAEAEA] bg-[#F9FAFB]"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-[#212121] group-hover:text-[#2874F0] truncate">
                                        {p.title}
                                      </div>
                                      <div className="text-[11px] text-[#878787] truncate">
                                        by {p.creator} • {p.category}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 pl-2">
                                    <span className="text-xs font-bold text-[#212121]">
                                      ₹{p.price.toLocaleString('en-IN')}
                                    </span>
                                    {(p.isFundedOnCraftify ?? p.isFundedOnLaunchMart) && (
                                      <div className="text-[9px] text-[#388E3C] font-semibold">
                                        Craft Assured
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matching Crowdfunding Campaigns */}
                        {matchedCampaigns.length > 0 && (
                          <div className="p-2 border-b border-[#F0F0F0]">
                            <div className="px-2 py-1 text-[11px] font-bold text-[#878787] uppercase tracking-wider flex items-center justify-between">
                              <span>Artisan Campaigns ({matchedCampaigns.length})</span>
                              <span className="text-[10px] text-[#FB641B]">Pre-Order Escrow</span>
                            </div>
                            <div className="space-y-1 mt-1">
                              {matchedCampaigns.map((c) => {
                                const goal = c.goalAmount || c.fundingGoal || 1;
                                const pledged = c.pledgedAmount || c.amountRaised || 0;
                                const percent = Math.min(100, Math.round((pledged / goal) * 100));
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectCampaign(c)}
                                    className="w-full flex items-center justify-between p-2 rounded-[2px] hover:bg-[#F1F3F6] transition-colors text-left cursor-pointer group"
                                  >
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                      <img
                                        src={c.imageUrl}
                                        alt={c.title}
                                        className="w-10 h-10 object-cover rounded-[2px] shrink-0 border border-[#EAEAEA] bg-[#F9FAFB]"
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-semibold text-[#212121] group-hover:text-[#2874F0] truncate">
                                          {c.title}
                                        </div>
                                        <div className="text-[11px] text-[#878787] truncate">
                                          by {c.creator} • {c.creatorLocation || c.artisanRegion || 'India'}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0 pl-2">
                                      <span className="text-xs font-bold text-[#FB641B]">
                                        {percent}% funded
                                      </span>
                                      <div className="text-[10px] text-[#878787]">
                                        {c.daysLeft} days left
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* View All Results Action Footer */}
                        <div className="px-4 py-2.5 bg-[#F9FAFB] flex items-center justify-between">
                          <span className="text-xs text-[#878787]">
                            Press <strong>Enter</strong> to search all matching items
                          </span>
                          <button
                            type="button"
                            onClick={() => executeSearch(navSearchQuery)}
                            className="text-xs font-bold text-[#2874F0] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View all results in Shop</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-white font-medium text-sm">
            {/* Quick Action Badges based on role */}
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                id="nav-quick-admin-panel"
                onClick={() => handleNavClick('admin-panel')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#EDE7F6] text-[#512DA8] rounded-[2px] text-xs font-bold hover:bg-[#D1C4E9] transition-colors cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Review</span>
              </button>
            )}

            {currentUser?.role === 'artisan' && !currentUser.profileCompleted && (
              <button
                type="button"
                id="nav-quick-complete-profile"
                onClick={() => handleNavClick('complete-profile')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF3E0] text-[#E65100] rounded-[2px] text-xs font-bold hover:bg-[#FFE0B2] transition-colors cursor-pointer shadow-xs animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Complete Profile (Required)</span>
              </button>
            )}

            {currentUser?.role === 'artisan' && currentUser.profileCompleted && (
              <button
                type="button"
                id="nav-quick-creator-studio"
                onClick={() => handleNavClick('creator-dashboard')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-[2px] text-xs font-bold hover:bg-white/30 transition-colors cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Creator Studio</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <LanguageSelector variant="navbar" />

            {/* Account / Login Trigger */}
            {currentUser ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  id="nav-account-button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-90 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full border border-white/80 flex items-center justify-center text-white text-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-white/20 rounded-[2px]">
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'artisan' ? 'Artisan' : 'Patron'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-80" />
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && (
                  <div
                    id="nav-account-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] border border-[#E0E0E0] rounded-[4px] shadow-xl z-50 overflow-hidden text-[#212121]"
                  >
                    <div className="p-3 bg-[#F1F2F4] border-b border-[#E0E0E0]">
                      <div className="font-bold text-sm text-[#212121]">{currentUser.name}</div>
                      <div className="text-xs text-[#878787] truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#388E3C]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {currentUser.role === 'admin'
                            ? 'Platform Administrator'
                            : currentUser.role === 'artisan'
                            ? 'Verified Master Artisan'
                            : 'Verified Craft Patron'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {/* Role: Admin Options */}
                      {currentUser.role === 'admin' && (
                        <button
                          id="nav-dropdown-admin-panel"
                          onClick={() => handleNavClick('admin-panel')}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[#EAE8FE] text-[#5E35B1] font-semibold rounded-[2px] flex items-center gap-2.5 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#5E35B1]" />
                          <div>
                            <div className="font-bold">Admin Panel</div>
                            <div className="text-[10px] text-[#878787]">Curation, Stats & Governance</div>
                          </div>
                        </button>
                      )}

                      {/* Role: Artisan Options */}
                      {(currentUser.role === 'artisan' || currentUser.role === 'creator') && (
                        <>
                          <button
                            id="nav-dropdown-creator-dashboard"
                            onClick={() => handleNavClick('creator-dashboard')}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#212121]"
                          >
                            <Layers className="w-4 h-4 text-[#FF9F00]" />
                            <div>
                              <div className="font-semibold">{t('creatorDashboard')}</div>
                              <div className="text-[10px] text-[#878787]">Campaign escrow & settlement</div>
                            </div>
                          </button>

                          <button
                            id="nav-dropdown-start-campaign"
                            onClick={() => handleNavClick('start-campaign')}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#FB641B]"
                          >
                            <PlusCircle className="w-4 h-4 text-[#FB641B]" />
                            <div>
                              <div className="font-semibold">{t('startCampaign')}</div>
                              <div className="text-[10px] text-[#878787]">Draft new craft initiative</div>
                            </div>
                          </button>

                          <button
                            id="nav-dropdown-edit-profile"
                            onClick={() => handleNavClick('complete-profile')}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#212121]"
                          >
                            <UserIcon className="w-4 h-4 text-[#2874F0]" />
                            <div>
                              <div className="font-semibold">
                                {currentUser.profileCompleted ? 'Edit Artisan Profile' : 'Complete Your Profile'}
                              </div>
                              <div className="text-[10px] text-[#878787]">Workshop details, craft & payout</div>
                            </div>
                          </button>
                        </>
                      )}

                      {/* Role: Buyer (or default) Options */}
                      {currentUser.role !== 'admin' && (
                        <>
                          <button
                            id="nav-dropdown-my-orders"
                            onClick={() => handleNavClick('my-orders')}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#212121]"
                          >
                            <Package className="w-4 h-4 text-[#2874F0]" />
                            <div>
                              <div className="font-semibold">{t('myOrders')}</div>
                              <div className="text-[10px] text-[#878787]">{t('myOrdersSub')}</div>
                            </div>
                          </button>

                          <button
                            id="nav-dropdown-my-pledges"
                            onClick={() => handleNavClick('my-pledges')}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#212121]"
                          >
                            <Bookmark className="w-4 h-4 text-[#2874F0]" />
                            <div>
                              <div className="font-semibold">My Pledges</div>
                              <div className="text-[10px] text-[#878787]">Backed campaigns & escrow status</div>
                            </div>
                          </button>
                        </>
                      )}

                      <button
                        id="nav-dropdown-account-dashboard"
                        onClick={() => handleNavClick('account')}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F2F4] rounded-[2px] flex items-center gap-2.5 cursor-pointer text-[#212121]"
                      >
                        <UserIcon className="w-4 h-4 text-[#878787]" />
                        <div>
                          <div className="font-semibold">{t('myAccount')}</div>
                          <div className="text-[10px] text-[#878787]">Profile, delivery & preferences</div>
                        </div>
                      </button>

                      {onLogout && (
                        <div className="pt-1 mt-1 border-t border-[#EAEAEA]">
                          <button
                            onClick={() => {
                              onLogout();
                              setAccountMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-[#D32F2F] hover:bg-[#FDEAEA] rounded-[2px] flex items-center gap-2.5 cursor-pointer font-semibold"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-login-button"
                onClick={onOpenAuth}
                className="bg-[#FFFFFF] text-[#2874F0] hover:bg-white/95 px-5 py-1.5 rounded-[2px] font-bold text-sm shadow-xs transition-colors cursor-pointer"
              >
                {t('login')}
              </button>
            )}

            {/* Demo Accounts Switcher Dropdown */}
            <div className="relative" ref={demoMenuRef}>
              <button
                id="nav-demo-account-dropdown-btn"
                onClick={() => setDemoMenuOpen((prev) => !prev)}
                className="bg-[#1C5FD0] hover:bg-[#154EAE] text-white border border-white/20 px-2 sm:px-2.5 py-1.5 rounded-[2px] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Switch demo account (Buyer, Artisan, Admin)"
              >
                <Users className="w-3.5 h-3.5 text-[#FFE500]" />
                <span className="hidden sm:inline">Demo:</span>
                <span className="truncate max-w-[80px] sm:max-w-[100px]">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Demo Login'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${demoMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {demoMenuOpen && (
                <div
                  id="nav-demo-account-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-[#FFFFFF] rounded-[4px] shadow-lg border border-[#EAEAEA] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#212121]"
                >
                  <div className="px-3.5 py-2 border-b border-[#F0F0F0] bg-[#F9FAFB] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#2874F0]" />
                        <span>Demo Account Switcher</span>
                      </div>
                      <div className="text-[10px] text-[#878787]">1-click login for escrow testing</div>
                    </div>
                    {currentUser && (
                      <span className="text-[10px] font-semibold text-[#388E3C] bg-[#EAF8EB] px-1.5 py-0.5 rounded-[2px]">
                        Active: {currentUser.name.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#F0F0F0]">
                    {DEMO_USERS.map((item) => {
                      const isCurrent = currentUser?.name.toLowerCase() === item.user.name.toLowerCase() ||
                                        currentUser?.email === item.user.email;
                      return (
                        <button
                          key={item.username}
                          id={`nav-demo-user-${item.username}`}
                          onClick={() => {
                            if (onLogin) onLogin(item.user);
                            setDemoMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-[#F1F3F6] transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                            isCurrent ? 'bg-[#EAF8EB]/50' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#212121] truncate">{item.label}</span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-[2px] border ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-[#388E3C] shrink-0" />}
                            </div>
                            <div className="text-[11px] text-[#666666] leading-tight mt-0.5">{item.description}</div>
                            <div className="text-[10px] text-[#878787] font-mono mt-0.5">@{item.username}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentUser && (
                    <div className="px-3.5 pt-2 border-t border-[#F0F0F0] mt-1">
                      <button
                        id="nav-demo-logout-btn"
                        onClick={() => {
                          if (onLogout) onLogout();
                          setDemoMenuOpen(false);
                        }}
                        className="w-full text-center py-1 text-xs text-[#D32F2F] hover:bg-[#FDEAEA] rounded-[2px] font-semibold transition-colors cursor-pointer"
                      >
                        Sign Out Current Account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick role-specific button in header */}
            {currentUser?.role === 'admin' ? (
              <button
                id="nav-header-admin-link"
                onClick={() => handleNavClick('admin-panel')}
                className="hidden lg:flex items-center gap-1.5 bg-[#5E35B1] hover:bg-[#512DA8] text-white px-3 py-1 rounded-[2px] text-xs font-bold transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            ) : currentUser?.role === 'artisan' || currentUser?.role === 'creator' ? (
              <button
                id="nav-header-creator-dashboard"
                onClick={() => handleNavClick('creator-dashboard')}
                className="hidden lg:flex items-center gap-1.5 hover:text-[#FFE500] transition-colors cursor-pointer text-sm font-medium"
              >
                <Layers className="w-4 h-4" />
                <span>Creator Dashboard</span>
              </button>
            ) : null}

            {/* Wishlist Link with orange badge */}
            <button
              id="nav-wishlist-button"
              onClick={() => {
                if (onOpenWishlist) {
                  onOpenWishlist();
                } else {
                  handleNavClick('account');
                }
              }}
              title="Saved Wishlist"
              className="relative flex items-center gap-1.5 hover:text-[#FFE500] transition-colors cursor-pointer text-sm font-medium py-1 px-1.5"
            >
              <Heart className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">{t('wishlist')}</span>
              <span
                id="wishlist-badge-count"
                className="bg-[#FB641B] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center"
              >
                {wishlistCount > 0 ? wishlistCount : 2}
              </span>
            </button>

            {/* Cart Link with yellow badge */}
            <button
              id="nav-cart-button"
              onClick={onOpenCart}
              title="Shopping Cart"
              className="relative flex items-center gap-1.5 hover:text-[#FFE500] transition-colors cursor-pointer text-sm font-medium py-1 px-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">{t('cart')}</span>
              <span
                id="cart-badge-count"
                className="bg-[#FFE500] text-[#212121] text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs"
              >
                {cartCount > 0 ? cartCount : 1}
              </span>
            </button>

            {/* AI Help Outline Pill */}
            <button
              id="nav-link-gemini"
              onClick={() => {
                if (onToggleGemini) {
                  onToggleGemini();
                } else {
                  handleNavClick('gemini-chat');
                }
              }}
              className="px-3 py-1 rounded-[4px] border border-white/60 hover:bg-white/10 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-white" />
              <span>{t('aiAssistant')}</span>
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              id="nav-mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-white hover:bg-white/10 rounded cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Strip (Sub-Header) matching exact reference image */}
      <div className="bg-[#FFFFFF] border-b border-[#EAEAEA] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-2.5 gap-5 text-xs font-semibold text-[#212121]">
            {/* 1. Artisan Campaigns */}
            <button
              onClick={() => handleNavClick('campaigns')}
              className={`whitespace-nowrap flex items-center gap-1.5 cursor-pointer hover:text-[#2874F0] transition-colors ${
                activeView === 'campaigns' ? 'text-[#2874F0]' : 'text-[#212121]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#EBF2FE] text-[#2874F0] flex items-center justify-center text-[10px] font-bold">🔷</span>
              <span>{t('discoverCampaigns')}</span>
            </button>

            {/* 2. Craftify Assured */}
            <button
              onClick={() => handleNavClick('shop')}
              className="whitespace-nowrap flex items-center gap-1.5 text-[#212121] hover:text-[#2874F0] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C532B]" />
              <span>Craftify Assured</span>
            </button>

            {/* Role-Specific Actions on Far Right */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => handleNavClick('admin-panel')}
                className={`whitespace-nowrap px-3.5 py-1 rounded-[2px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ml-auto shrink-0 ${
                  activeView === 'admin-panel'
                    ? 'bg-[#5E35B1] text-white shadow-xs'
                    : 'bg-[#EAE8FE] text-[#5E35B1] hover:bg-[#D1C4E9]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            ) : currentUser?.role === 'artisan' || currentUser?.role === 'creator' ? (
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <button
                  onClick={() => handleNavClick('creator-dashboard')}
                  className={`whitespace-nowrap px-3 py-1 rounded-[2px] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    activeView === 'creator-dashboard'
                      ? 'bg-[#2874F0] text-white'
                      : 'bg-[#F1F3F6] text-[#212121] hover:bg-[#E0E0E0]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#FF9F00]" />
                  <span>Creator Dashboard</span>
                </button>
                <button
                  onClick={() => handleNavClick('start-campaign')}
                  className="whitespace-nowrap px-3.5 py-1 rounded-full bg-[#FFF3EC] hover:bg-[#FFE6D8] border border-[#FB641B]/30 text-[#FB641B] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>🔥</span>
                  <span>{t('startCampaign')}</span>
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <button
                  onClick={() => handleNavClick('my-pledges')}
                  className={`whitespace-nowrap px-3 py-1 rounded-[2px] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    activeView === 'my-pledges'
                      ? 'bg-[#2874F0] text-white'
                      : 'bg-[#EBF2FE] text-[#2874F0] hover:bg-[#DCE7FC]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>My Pledges</span>
                </button>
                <button
                  onClick={() => handleNavClick('my-orders')}
                  className={`whitespace-nowrap px-3 py-1 rounded-[2px] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    activeView === 'my-orders' || activeView === 'order-tracking'
                      ? 'bg-[#2874F0] text-white'
                      : 'bg-[#F1F3F6] text-[#212121] hover:bg-[#E0E0E0]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-[#2874F0]" />
                  <span>{t('myOrders')}</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden border-t border-[#E0E0E0] bg-[#FFFFFF] px-4 py-4 space-y-2 text-[#212121]">
          {/* Mobile search bar */}
          <div ref={mobileSearchRef} className="relative mb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <SmartInput
                  id="mobile-nav-search"
                  type="text"
                  placeholder={t('searchPlaceholder', 'Search products, artisans, crafts...')}
                  value={navSearchQuery}
                  onChange={(e) => {
                    setNavSearchQuery(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  onValueChange={(val) => {
                    setNavSearchQuery(val);
                    if (onSearchChange) onSearchChange(val);
                  }}
                  className="w-full bg-[#F1F2F4] text-[#212121] text-xs px-3 py-2 pr-20 rounded-[2px] border border-[#E0E0E0]"
                  containerClassName="w-full"
                  enableVoice={true}
                  enableLanguageDetection={true}
                  showLanguageSwitchPrompt={true}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                  {navSearchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNavSearchQuery('');
                        if (onSearchChange) onSearchChange('');
                      }}
                      className="text-[#878787] hover:text-[#212121] p-1 cursor-pointer"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="bg-[#2874F0] text-white px-2 py-1 rounded-[2px] text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Search"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Language Selector in Mobile Drawer */}
          <LanguageSelector variant="mobile" />

          {/* Role-Appropriate Mobile Navigation */}
          {currentUser ? (
            <div className="space-y-1.5 pb-2 border-b border-[#EAEAEA]">
              <div className="px-3 py-1.5 bg-[#F9FAFB] rounded-[2px] text-xs">
                <span className="font-bold text-[#212121]">{currentUser.name}</span>
                <span className="ml-2 text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#2874F0] text-white rounded-[2px]">
                  {currentUser.role}
                </span>
              </div>

              {/* Admin Panel for Admin */}
              {currentUser.role === 'admin' && (
                <button
                  id="mobile-nav-admin"
                  onClick={() => handleNavClick('admin-panel')}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-[2px] flex items-center gap-3 bg-[#EAE8FE] text-[#5E35B1]"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}

              {/* Artisan Creator Dashboard */}
              {(currentUser.role === 'artisan' || currentUser.role === 'creator') && (
                <>
                  <button
                    id="mobile-nav-creator-dashboard"
                    onClick={() => handleNavClick('creator-dashboard')}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-[2px] flex items-center gap-3 bg-[#FFF7E6] text-[#B78103]"
                  >
                    <Layers className="w-4 h-4" />
                    <span>{t('creatorDashboard')}</span>
                  </button>
                  <button
                    id="mobile-nav-start-campaign"
                    onClick={() => handleNavClick('start-campaign')}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-[2px] flex items-center gap-3 bg-[#FFF3EC] text-[#FB641B]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('startCampaign')}</span>
                  </button>
                  <button
                    id="mobile-nav-edit-profile"
                    onClick={() => handleNavClick('complete-profile')}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-[2px] flex items-center gap-3 bg-[#F1F3F6] text-[#212121]"
                  >
                    <UserIcon className="w-4 h-4 text-[#2874F0]" />
                    <span>{currentUser.profileCompleted ? 'Edit Profile' : 'Complete Profile'}</span>
                  </button>
                </>
              )}

              {/* Buyer Links */}
              {currentUser.role !== 'admin' && (
                <>
                  <button
                    id="mobile-nav-my-orders"
                    onClick={() => handleNavClick('my-orders')}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-[2px] flex items-center justify-between bg-[#EBF2FE] text-[#2874F0]"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#2874F0]" />
                      <span>{t('myOrders')}</span>
                    </div>
                  </button>
                  <button
                    id="mobile-nav-my-pledges"
                    onClick={() => handleNavClick('my-pledges')}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-[2px] flex items-center justify-between bg-[#F1F2F4] text-[#212121]"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-[#2874F0]" />
                      <span>My Pledges</span>
                    </div>
                  </button>
                </>
              )}

              <button
                id="mobile-nav-account"
                onClick={() => handleNavClick('account')}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold rounded-[2px] flex items-center justify-between hover:bg-[#F1F2F4] text-[#212121]"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#878787]" />
                  <span>{t('myAccount')}</span>
                </div>
              </button>
            </div>
          ) : (
            <button
              id="mobile-nav-auth"
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-4 py-2.5 text-sm font-bold rounded-[2px] bg-[#2874F0] text-[#FFFFFF] shadow-xs cursor-pointer"
            >
              {t('login')} / Sign Up
            </button>
          )}

          {/* General Discovery Links for Everyone */}
          <button
            id="mobile-nav-campaigns"
            onClick={() => handleNavClick('campaigns')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-[2px] flex items-center gap-3 hover:bg-[#F1F2F4]"
          >
            <Compass className="w-4 h-4 text-[#2874F0]" />
            <span>{t('discoverCampaigns')}</span>
          </button>

          <button
            id="mobile-nav-shop"
            onClick={() => handleNavClick('shop')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-[2px] flex items-center gap-3 hover:bg-[#F1F2F4]"
          >
            <Store className="w-4 h-4 text-[#FF9F00]" />
            <span>{t('shopMarketplace')}</span>
          </button>

          <button
            id="mobile-nav-wishlist"
            onClick={() => {
              if (onOpenWishlist) {
                onOpenWishlist();
                setMobileMenuOpen(false);
              } else {
                handleNavClick('account');
              }
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-[2px] flex items-center justify-between hover:bg-[#F1F2F4]"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-[#FB641B] fill-[#FB641B]" />
              <span>{t('wishlist')}</span>
            </div>
            {wishlistCount > 0 && (
              <span className="bg-[#FB641B] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            id="mobile-nav-start"
            onClick={() => handleNavClick('start-campaign')}
            className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-[2px] flex items-center gap-3 hover:bg-[#F1F2F4] text-[#FB641B] font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('startCampaign')}</span>
          </button>

          <button
            id="mobile-nav-gemini"
            onClick={() => {
              if (onToggleGemini) {
                onToggleGemini();
                setMobileMenuOpen(false);
              } else {
                handleNavClick('gemini-chat');
              }
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-[2px] flex items-center gap-3 hover:bg-[#F1F2F4]"
          >
            <Bot className="w-4 h-4 text-[#2874F0]" />
            <span>{t('aiAssistant')}</span>
          </button>
        </div>
      )}
    </header>
  );
};

