import React, { useState, useRef, useMemo } from 'react';
import { ActiveView, Campaign, Product, CartItem, User, UserPledgeRecord, RewardTier, BackerRecord, CampaignUpdate, CampaignComment, CustomerOrder, OrderTrackingStage, OrderTrackingHistoryEvent } from './types';
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS, MOCK_USER, MOCK_USER_PLEDGES, MOCK_CAMPAIGN_BACKERS, MOCK_CAMPAIGN_UPDATES, MOCK_CAMPAIGN_COMMENTS } from './data/mockData';
import { MOCK_CUSTOMER_ORDERS, createOrderFromConfirmation, advanceOrderStatus, buildDefaultHistory } from './data/mockOrders';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryStrip } from './components/CategoryStrip';
import { CampaignSection } from './components/CampaignSection';
import { ShopSection } from './components/ShopSection';
import { CartDrawer } from './components/CartDrawer';
import { PledgeModal } from './components/PledgeModal';
import { AuthModal } from './components/AuthModal';
import { AccountDashboard } from './components/AccountDashboard';
import { CreateCampaignForm } from './components/CreateCampaignForm';
import { CreatorDashboard } from './components/CreatorDashboard';
import { CampaignDetailPage } from './components/CampaignDetailPage';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage, OrderConfirmationData } from './components/CheckoutPage';
import { MyOrdersPage } from './components/MyOrdersPage';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { MyPledgesPage } from './components/MyPledgesPage';
import { AdminPanel } from './components/AdminPanel';
import { CompleteProfilePage } from './components/CompleteProfilePage';
import { Footer } from './components/Footer';
import { RecommendationsSection } from './components/RecommendationsSection';
import { GeminiChat } from './components/GeminiChat';
import { GeminiFloatingLauncher } from './components/GeminiFloatingLauncher';
import { GeminiPage } from './components/GeminiPage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CheckCircle2, ArrowRight, ShieldCheck, Compass, Store, Sparkles, PlusCircle, Layers, ShieldAlert } from 'lucide-react';
import { transformBackendCampaign, transformBackendProduct, transformBackendPledge, transformBackendOrder } from './utils/apiAdapters';
import { settleCampaign, isDeadlinePassed, formatDeadlineDate, calculateDaysRemaining } from './utils/settleCampaign';
import { campaignActivity } from './data/campaignActivity';

function CraftifyApp() {
  const {
    language,
    t,
    localizeProduct,
    localizeCampaign,
    localizeOrder,
    localizeProducts,
    localizeCampaigns,
    localizeOrders,
  } = useLanguage();

  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Live Backers, Updates, and Comments in React state
  const [campaignBackers, setCampaignBackers] = useState<Record<string, BackerRecord[]>>(MOCK_CAMPAIGN_BACKERS);
  const [campaignUpdates, setCampaignUpdates] = useState<Record<string, CampaignUpdate[]>>(MOCK_CAMPAIGN_UPDATES);
  const [campaignComments, setCampaignComments] = useState<Record<string, CampaignComment[]>>(MOCK_CAMPAIGN_COMMENTS);

  // Pre-simulation snapshots store to allow resetting back to exact previous state
  const preSimulationCampaignsRef = useRef<Map<string, Campaign>>(new Map());
  const preSimulationBackersRef = useRef<Map<string, BackerRecord[]>>(new Map());
  const preSimulationPledgesRef = useRef<Map<string, UserPledgeRecord[]>>(new Map());

  // Authentication & Patron Ledger Identity
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER);
  const [userPledges, setUserPledges] = useState<UserPledgeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('craftify_user_pledges');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return MOCK_USER_PLEDGES;
  });

  // Sync userPledges to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('craftify_user_pledges', JSON.stringify(userPledges));
    } catch {
      // ignore
    }
  }, [userPledges]);

  // Active Campaign & Product Detail
  const [selectedCampaignForDetail, setSelectedCampaignForDetail] = useState<Campaign>(MOCK_CAMPAIGNS[0]);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product>(MOCK_PRODUCTS[0]);

  // Global search query (synchronized across Navbar and Shop listing)
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const handleSearchSubmit = (query: string) => {
    setGlobalSearchQuery(query);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Orders State & Local/Session Storage Persistence
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = sessionStorage.getItem('craftify_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return MOCK_CUSTOMER_ORDERS;
  });

  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<CustomerOrder | null>(
    () => MOCK_CUSTOMER_ORDERS[0]
  );

  // 1. Live synchronization with backend seeded database: campaigns & marketplace products
  React.useEffect(() => {
    // Fetch live campaigns
    fetch('/api/campaigns/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const results = data?.results || (Array.isArray(data) ? data : []);
        if (results && results.length > 0) {
          const liveCampaigns = results.map(transformBackendCampaign);
          setCampaigns(liveCampaigns);
          setSelectedCampaignForDetail((prev) => {
            const found = liveCampaigns.find((c: Campaign) => c.id === prev?.id || c.slug === prev?.slug);
            return found || liveCampaigns[0];
          });
        }
      })
      .catch((err) => console.warn('Could not fetch backend campaigns:', err));

    // Fetch live products
    fetch('/api/products/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const results = data?.results || (Array.isArray(data) ? data : []);
        if (results && results.length > 0) {
          const liveProducts = results.map(transformBackendProduct);
          setProducts(liveProducts);
          setSelectedProductForDetail((prev) => {
            const found = liveProducts.find((p: Product) => p.id === prev?.id || p.sku === prev?.sku);
            return found || liveProducts[0];
          });
        }
      })
      .catch((err) => console.warn('Could not fetch backend products:', err));
  }, []);

  // 2. Sync with backend /api/auth/me/ if JWT token is stored
  React.useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('kaarigar_access_token');
    if (token) {
      fetch('/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then((data) => {
          if (data && data.username) {
            setCurrentUser((prev) => ({
              id: String(data.id || (prev ? prev.id : 'usr-1')),
              name: data.full_name || data.username || (prev ? prev.name : 'User'),
              email: data.email || (prev ? prev.email : ''),
              role: data.role || (prev ? prev.role : 'buyer'),
              token,
              avatarInitials: (data.first_name || data.username || 'U').slice(0, 2).toUpperCase(),
              memberSince: prev ? prev.memberSince : 'September 2026',
              craftType: data.craft_type,
              bio: data.bio,
            }));
          }
        })
        .catch(() => {
          // Token expired or server offline; keep current session state
        });
    }
  }, []);

  // Auto-run settlement logic on load for campaigns whose deadline has passed but haven't been settled yet
  React.useEffect(() => {
    campaigns.forEach((camp) => {
      if (camp.status === 'in_progress' && isDeadlinePassed(camp.deadline)) {
        const campPledges = campaignBackers[camp.id] || [];
        const result = settleCampaign(camp, campPledges);

        setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? result.campaign : c)));

        setCampaignBackers((prev) => ({
          ...prev,
          [camp.id]: result.pledges,
        }));

        setUserPledges((prev) =>
          prev.map((p) => {
            if (p.campaignId === camp.id) {
              return {
                ...p,
                status: result.isFunded ? 'captured' : 'released',
                settlementDate: result.settledAt,
              };
            }
            return p;
          })
        );

        campaignActivity.pledges = campaignActivity.pledges.map((p) => {
          if (p.campaignId === camp.id) {
            return {
              ...p,
              status: result.isFunded ? 'captured' : 'released',
              settlementDate: result.settledAt,
            };
          }
          return p;
        });
      }
    });
  }, []);

  // 3. Sync customer orders and pledges when authenticated
  React.useEffect(() => {
    const token = currentUser?.token || localStorage.getItem('access_token') || localStorage.getItem('kaarigar_access_token');
    if (token) {
      // Fetch orders
      fetch('/api/orders/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const list = data?.results || (Array.isArray(data) ? data : []);
          if (list && list.length > 0) {
            const liveOrders = list.map(transformBackendOrder);
            setOrders(liveOrders);
            setSelectedOrderForTracking(liveOrders[0]);
          }
        })
        .catch(() => {});

      // Fetch pledges and merge with local state
      fetch('/api/campaigns/my-pledges/', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.results || [];
          if (list && list.length > 0) {
            const livePledges = list.map(transformBackendPledge);
            setUserPledges((prev) => {
              const combined = [...prev];
              for (const lp of livePledges) {
                const existingIdx = combined.findIndex((p) => String(p.id) === String(lp.id));
                if (existingIdx >= 0) {
                  combined[existingIdx] = { ...combined[existingIdx], status: lp.status, settlementDate: lp.settlementDate || combined[existingIdx].settlementDate };
                } else {
                  // Only add if not already covered by a local pledge for the same campaign & amount
                  const matchingLocal = combined.find((p) => p.campaignId === lp.campaignId && p.amount === lp.amount);
                  if (!matchingLocal) {
                    combined.push(lp);
                  }
                }
              }
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.token, activeView]);

  // 4. Fetch live campaign detail (backers, updates, comments) when viewing campaign detail
  React.useEffect(() => {
    if (activeView === 'campaign-detail' && selectedCampaignForDetail?.slug) {
      fetch(`/api/campaigns/${selectedCampaignForDetail.slug}/`)
        .then((res) => (res.ok ? res.json() : null))
        .then((detail) => {
          if (!detail) return;
          const campId = String(detail.id);
          if (detail.recent_pledges && detail.recent_pledges.length > 0) {
            const liveBackers: BackerRecord[] = detail.recent_pledges.map((p: any, i: number) => ({
              id: String(p.id || `bk-${i}`),
              campaignId: campId,
              name: p.backer_name || 'Conscious Backer',
              tierTitle: p.tier_title || 'Heritage Patron Supporter',
              amount: parseFloat(p.amount) || 1200,
              date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              status: 'authorized',
            }));
            setCampaignBackers((prev) => ({ ...prev, [campId]: liveBackers }));
          }
          if (detail.updates && detail.updates.length > 0) {
            const liveUpdates: CampaignUpdate[] = detail.updates.map((u: any, i: number) => ({
              id: String(u.id || `up-${i}`),
              campaignId: campId,
              updateNumber: i + 1,
              title: u.title,
              date: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              author: detail.artisan?.full_name || 'Master Artisan',
              content: u.body,
              likesCount: 12 + i * 4,
            }));
            setCampaignUpdates((prev) => ({ ...prev, [campId]: liveUpdates }));
          }
          if (detail.comments && detail.comments.length > 0) {
            const liveComments: CampaignComment[] = detail.comments.map((c: any, i: number) => ({
              id: String(c.id || `cm-${i}`),
              campaignId: campId,
              authorName: c.user?.full_name || c.user?.username || 'Craft Supporter',
              authorBadge: c.user?.id === detail.artisan?.id ? 'Master Artisan' : 'Backer',
              date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
              comment: c.body,
            }));
            setCampaignComments((prev) => ({ ...prev, [campId]: liveComments }));
          }
        })
        .catch(() => {});
    }
  }, [activeView, selectedCampaignForDetail?.slug]);

  // Cart & Order state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'mock-cart-1',
      type: 'product',
      title: 'Solid Brass Hex Drafting Gauge',
      price: 48,
      quantity: 1,
      imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
      subtitle: 'SKU-086 • Graduated from CMP-055',
    },
  ]);

  const updateOrdersState = (updater: (prev: CustomerOrder[]) => CustomerOrder[]) => {
    setOrders((prev) => {
      const next = updater(prev);
      try {
        sessionStorage.setItem('craftify_orders', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Modals & Panels State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [selectedCampaignForPledge, setSelectedCampaignForPledge] = useState<Campaign | null>(null);
  const [initialTierIdForPledge, setInitialTierIdForPledge] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wishlist State & Local Storage Persistence
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('craftify_wishlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return ['prod-01', 'prod-03'];
  });

  const handleToggleWishlist = (product: Product) => {
    setWishlistProductIds((prev) => {
      const isAlreadySaved = prev.includes(product.id);
      let updated: string[];
      if (isAlreadySaved) {
        updated = prev.filter((id) => id !== product.id);
        showToast(`Removed "${product.title}" from your Saved Wishlist`);
      } else {
        updated = [...prev, product.id];
        showToast(`Saved "${product.title}" to your Wishlist`);
      }
      try {
        localStorage.setItem('craftify_wishlist', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleOpenWishlist = () => {
    if (currentUser) {
      setActiveView('account');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAuthModalOpen(true);
      showToast('Please sign in to view your profile wishlist');
    }
  };

  const localizedProducts = useMemo(() => localizeProducts(products), [products, localizeProducts, language]);
  const localizedCampaigns = useMemo(() => localizeCampaigns(campaigns), [campaigns, localizeCampaigns, language]);
  const publicCampaigns = useMemo(
    () => localizedCampaigns.filter((c) => c.isApproved !== false && c.status !== 'pending_review'),
    [localizedCampaigns]
  );
  const localizedOrders = useMemo(() => localizeOrders(orders), [orders, localizeOrders, language]);

  const activeLocalizedProduct = useMemo(
    () => localizeProduct(selectedProductForDetail),
    [selectedProductForDetail, localizeProduct, language]
  );
  const activeLocalizedCampaign = useMemo(
    () => localizeCampaign(selectedCampaignForDetail),
    [selectedCampaignForDetail, localizeCampaign, language]
  );
  const activeLocalizedOrder = useMemo(
    () => selectedOrderForTracking ? localizeOrder(selectedOrderForTracking) : null,
    [selectedOrderForTracking, localizeOrder, language]
  );

  const wishlistProducts = useMemo(() => {
    return localizedProducts.filter((p) => wishlistProductIds.includes(p.id));
  }, [localizedProducts, wishlistProductIds]);

  // Section references for smooth scrolling when on home
  const campaignsRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const handleNavigate = (view: ActiveView) => {
    // Route guards
    if (view === 'creator-dashboard' || view === 'start-campaign') {
      if (!currentUser) {
        showToast('Please sign in or register as an artisan to access the Creator Dashboard.');
        setIsAuthModalOpen(true);
        setActiveView('home');
        return;
      }
      if (currentUser.role !== 'artisan' && currentUser.role !== 'creator') {
        showToast('Access Restricted: Only verified Artisans can access the Creator Dashboard or launch campaigns.');
        setActiveView('home');
        return;
      }
      // Mandatory profile completion gating for starting a campaign
      if (view === 'start-campaign' && !currentUser.profileCompleted) {
        showToast('Mandatory Onboarding: Please complete your artisan profile before creating a campaign.');
        setActiveView('complete-profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (view === 'complete-profile') {
      if (!currentUser) {
        showToast('Please sign in to complete or manage your artisan profile.');
        setIsAuthModalOpen(true);
        setActiveView('home');
        return;
      }
    }

    if (view === 'admin-panel') {
      if (!currentUser || currentUser.role !== 'admin') {
        showToast('Access Denied: Platform Administrator role required.');
        setActiveView('home');
        return;
      }
    }

    if (view === 'my-pledges') {
      if (!currentUser) {
        showToast('Please sign in to view your backed pledges.');
        setIsAuthModalOpen(true);
        setActiveView('home');
        return;
      }
    }

    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [viewedCategories, setViewedCategories] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem('craftify_viewed_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addViewedCategory = (category?: string) => {
    if (!category) return;
    setViewedCategories((prev) => {
      const updated = [category, ...prev.filter((c) => c !== category)].slice(0, 10);
      try {
        sessionStorage.setItem('craftify_viewed_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleOpenCampaignDetail = (campaign: Campaign) => {
    if (campaign?.category) {
      addViewedCategory(campaign.category);
    }
    setSelectedCampaignForDetail(campaign);
    setActiveView('campaign-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductDetail = (product: Product) => {
    if (product?.category) {
      addViewedCategory(product.category);
    }
    setSelectedProductForDetail(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToCampaigns = () => {
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        campaignsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      campaignsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToShop = () => {
    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        shopRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      shopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add Product to Cart (Immediate Retail Store)
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.type === 'product');
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          type: 'product',
          title: product.title,
          price: product.price,
          quantity,
          imageUrl: product.imageUrl,
          subtitle: `${product.sku} • Verified In Stock`,
        },
      ];
    });

    showToast(`Added ${quantity > 1 ? `${quantity}x ` : ''}"${product.title}" to cart`);
  };

  // Buy Now: Add to cart and jump straight to Checkout
  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Pledge Modal with preselected campaign and tier
  const handleOpenPledge = (campaign: Campaign, tier?: RewardTier) => {
    setSelectedCampaignForPledge(campaign);
    setInitialTierIdForPledge(tier?.id);
  };

  // Confirm Pledge to Campaign (Authorized Escrow Hold)
  const handleConfirmPledge = (
    campaign: Campaign,
    amount: number,
    tierTitle: string,
    backerName: string,
    tierId?: string
  ) => {
    // 1. Add new backer to live campaign backers state
    const newBacker: BackerRecord = {
      id: `bkr-${Date.now()}`,
      campaignId: campaign.id,
      name: backerName || currentUser?.name || 'Anonymous Patron',
      amount,
      tierTitle,
      date: 'Just now',
      status: 'authorized',
    };

    setCampaignBackers((prev) => ({
      ...prev,
      [campaign.id]: [newBacker, ...(prev[campaign.id] || [])],
    }));

    // Add to campaignActivity.pledges
    campaignActivity.pledges = [
      {
        ...newBacker,
        campaignTitle: campaign.title,
        isCurrentUser: true,
      },
      ...campaignActivity.pledges,
    ];

    // 2. Add to cart drawer (showing ₹0 charged today, authorized hold on card)
    setCartItems((prev) => {
      const existingPledge = prev.find((item) => item.id === campaign.id && item.type === 'pledge');
      if (existingPledge) {
        return prev.map((item) =>
          item.id === campaign.id
            ? { ...item, price: amount, subtitle: `${tierTitle} (Authorized Hold • ₹0 charged today)` }
            : item
        );
      }
      return [
        ...prev,
        {
          id: campaign.id,
          type: 'pledge',
          title: campaign.title,
          price: amount,
          quantity: 1,
          imageUrl: campaign.imageUrl,
          subtitle: `${tierTitle} • ₹0 charged today`,
        },
      ];
    });

    // 3. Update campaign metrics in React state (progress bar, funds raised, backer count)
    const newAmount = (campaign.amountRaised ?? campaign.pledgedAmount) + amount;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaign.id) {
          return {
            ...c,
            pledgedAmount: newAmount,
            amountRaised: newAmount,
            backersCount: c.backersCount + 1,
            rewardTiers: c.rewardTiers.map((t) =>
              t.id === tierId ? { ...t, backersCount: t.backersCount + 1 } : t
            ),
          };
        }
        return c;
      })
    );

    // 4. Also update selected detail view so detail page updates live
    setSelectedCampaignForDetail((prev) => {
      if (prev.id === campaign.id) {
        return {
          ...prev,
          pledgedAmount: newAmount,
          amountRaised: newAmount,
          backersCount: prev.backersCount + 1,
          rewardTiers: prev.rewardTiers.map((t) =>
            t.id === tierId ? { ...t, backersCount: t.backersCount + 1 } : t
          ),
        };
      }
      return prev;
    });

    // 5. Add to active user pledges ledger with status "authorized"
    const newPledgeRecord: UserPledgeRecord = {
      id: `plg-${Date.now()}`,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignCode: campaign.code,
      tierTitle,
      amount,
      dateAuthorized: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'authorized',
      estimatedDelivery: 'Dec 2026',
    };
    setUserPledges((prev) => [newPledgeRecord, ...prev]);

    // Save immediately to localStorage
    try {
      const stored = localStorage.getItem('craftify_user_pledges');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('craftify_user_pledges', JSON.stringify([newPledgeRecord, ...list]));
    } catch {
      // ignore
    }

    // Persist to backend server
    const pledgePayload = {
      amount,
      backer_name: backerName || currentUser?.name || 'Conscious Patron',
      tier_title: tierTitle,
    };
    fetch(`/api/campaigns/${campaign.id}/pledge/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pledgePayload),
    }).catch(() => {});
    if (campaign.slug) {
      fetch(`/api/campaigns/${campaign.slug}/pledge/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pledgePayload),
      }).catch(() => {});
    }

    // 6. Show the exact confirmation message
    const formattedDeadline = formatDeadlineDate(campaign.deadline, campaign.daysLeft);
    showToast(`Your pledge is authorized for ₹${amount.toLocaleString('en-IN')}. You'll only be charged if this campaign reaches its goal by ${formattedDeadline}.`);
  };

  const handleAddComment = (campaignId: string, commentText: string, authorName: string) => {
    const newComment: CampaignComment = {
      id: `com-${Date.now()}`,
      campaignId,
      authorName: authorName || currentUser?.name || 'Backer',
      authorBadge: 'Backer',
      date: 'Just now',
      comment: commentText,
    };
    setCampaignComments((prev) => ({
      ...prev,
      [campaignId]: [newComment, ...(prev[campaignId] || [])],
    }));
    showToast('Comment posted to campaign discussions');
  };

  const handleUpdateCartQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleUpdateCartQuantityDelta = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setActiveView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (orderDetails: OrderConfirmationData) => {
    const newOrder = createOrderFromConfirmation(orderDetails, products);
    updateOrdersState((prev) => [newOrder, ...prev]);

    // Deduct stock count for ordered products in state
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const matchingItem = orderDetails.items.find(
          (item) => item.id === prod.id || item.title.toLowerCase().trim() === prod.title.toLowerCase().trim()
        );
        if (matchingItem && matchingItem.type === 'product') {
          const updatedStock = Math.max(0, prod.stockCount - matchingItem.quantity);
          return {
            ...prod,
            stockCount: updatedStock,
            inStock: updatedStock > 0,
          };
        }
        return prod;
      })
    );

    setCartItems([]);
    setSelectedOrderForTracking(newOrder);
    showToast(`Order ${newOrder.id} confirmed! Estimated delivery: ${newOrder.estimatedDeliveryRange}`);
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Check cancellation eligibility: 'Order Placed' (confirmed) or 'Packed'
    const isCancellable =
      targetOrder.status === 'confirmed' ||
      (targetOrder.status as string) === 'order_placed' ||
      targetOrder.status === 'packed';

    if (!isCancellable) {
      showToast(`Order #${orderId} cannot be cancelled as it has already progressed past packaging.`);
      return;
    }

    // 1. Restore product inventory count in products state
    let totalRestoredUnits = 0;
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        const matchingItem = targetOrder.items.find(
          (item) =>
            item.productId === product.id ||
            item.id === product.id ||
            item.title.toLowerCase().trim() === product.title.toLowerCase().trim()
        );

        if (matchingItem) {
          totalRestoredUnits += matchingItem.quantity;
          const restoredStock = product.stockCount + matchingItem.quantity;
          return {
            ...product,
            stockCount: restoredStock,
            inStock: true,
          };
        }
        return product;
      })
    );

    // 2. Also restore inventory in selectedProductForDetail if that product is open
    setSelectedProductForDetail((prevDetail) => {
      const matchingItem = targetOrder.items.find(
        (item) =>
          item.productId === prevDetail.id ||
          item.id === prevDetail.id ||
          item.title.toLowerCase().trim() === prevDetail.title.toLowerCase().trim()
      );

      if (matchingItem) {
        const restoredStock = prevDetail.stockCount + matchingItem.quantity;
        return {
          ...prevDetail,
          stockCount: restoredStock,
          inStock: true,
        };
      }
      return prevDetail;
    });

    // 3. Create cancellation tracking event
    const cancellationEvent: OrderTrackingHistoryEvent = {
      stage: 'cancelled',
      label: 'Order Cancelled',
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'Craftify Escrow Desk',
      description: `Order cancelled by patron (${reason || 'Customer request'}). Escrow refund of ₹${targetOrder.total.toLocaleString('en-IN')} initiated to ${targetOrder.paymentMethod}. Artisan workshop inventory replenished.`,
      completed: true,
    };

    // 4. Update orders state
    updateOrdersState((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled' as OrderTrackingStage,
            history: [cancellationEvent, ...o.history],
          };
        }
        return o;
      })
    );

    // 5. Update active tracking order
    setSelectedOrderForTracking((prev) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: 'cancelled' as OrderTrackingStage,
          history: [cancellationEvent, ...prev.history],
        };
      }
      return prev;
    });

    const itemsRestored =
      totalRestoredUnits ||
      targetOrder.items.reduce((sum, it) => sum + it.quantity, 0);

    showToast(`Order #${orderId} cancelled. Restored ${itemsRestored} item(s) to artisan inventory.`);
  };

  const handleTrackOrder = (order: CustomerOrder) => {
    setSelectedOrderForTracking(order);
    setActiveView('order-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackOrderById = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      handleTrackOrder(found);
    } else {
      setActiveView('my-orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    updateOrdersState((prev) =>
      prev.map((o) => (o.id === orderId ? advanceOrderStatus(o) : o))
    );
    setSelectedOrderForTracking((prev) => {
      if (prev && prev.id === orderId) {
        return advanceOrderStatus(prev);
      }
      return prev;
    });
    showToast(`Simulated status advance for order #${orderId}`);
  };

  const handleResetOrderStatus = (orderId: string) => {
    updateOrdersState((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'confirmed',
            history: buildDefaultHistory('confirmed', o.orderDate),
          };
        }
        return o;
      })
    );
    setSelectedOrderForTracking((prev) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: 'confirmed',
          history: buildDefaultHistory('confirmed', prev.orderDate),
        };
      }
      return prev;
    });
    showToast(`Reset order #${orderId} to Confirmed.`);
  };

  const handleCampaignCreated = (newCamp: Campaign) => {
    const pendingCamp: Campaign = {
      ...newCamp,
      status: 'pending_review',
      isApproved: false,
      creatorProfilePhoto: currentUser?.profilePhoto || newCamp.creatorProfilePhoto,
      creatorBusinessName: currentUser?.businessName || currentUser?.name || newCamp.creatorBusinessName || newCamp.creator,
      creatorYearsOfExperience: currentUser?.yearsOfExperience ?? newCamp.creatorYearsOfExperience,
      creatorCity: currentUser?.city || newCamp.creatorCity,
      creatorState: currentUser?.state || newCamp.creatorState,
    };
    setCampaigns((prev) => [pendingCamp, ...prev]);
    setSelectedCampaignForDetail(pendingCamp);
    setActiveView('campaign-detail');
    showToast(`Campaign "${pendingCamp.title}" submitted for curation review! An admin must approve it before it appears in the public marketplace.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (authenticatedUser: User) => {
    setCurrentUser(authenticatedUser);
    const roleLabel =
      authenticatedUser.role === 'admin'
        ? 'Platform Administrator'
        : authenticatedUser.role === 'artisan'
        ? 'Verified Artisan'
        : 'Craft Patron';
    showToast(`Welcome back, ${authenticatedUser.name}! (${roleLabel})`);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    if (activeView === 'account' || activeView === 'creator-dashboard' || activeView === 'admin-panel' || activeView === 'my-pledges') {
      setActiveView('home');
    }
    showToast('Signed out of Craftify session.');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    showToast('Patron fulfillment details updated.');
  };

  // Campaign Settlement Simulation Handler (All-or-Nothing Escrow Settlement)
  const handleSimulateSettlement = (campaignId: string, forceOutcome?: 'funded' | 'unsuccessful' | 'reset') => {
    const targetCamp = campaigns.find((c) => String(c.id) === String(campaignId) || c.slug === campaignId || c.code === campaignId);
    if (!targetCamp) return;

    const isMatchingPledge = (p: any) =>
      String(p.campaignId) === String(campaignId) ||
      String(p.campaignId) === String(targetCamp.id) ||
      p.campaignCode === targetCamp.code ||
      (p.campaignTitle && p.campaignTitle.toLowerCase().trim() === targetCamp.title.toLowerCase().trim());

    const campIdStr = String(targetCamp.id);

    // RESET TO PREVIOUS STATE (restores exact pre-simulation state rather than arbitrary 18 days)
    if (forceOutcome === 'reset') {
      const savedPrevCamp = targetCamp.previousState || preSimulationCampaignsRef.current.get(campIdStr);
      const mockFallback = MOCK_CAMPAIGNS.find((m) => String(m.id) === campIdStr || m.code === targetCamp.code || m.slug === targetCamp.slug);

      const restoredDaysLeft =
        savedPrevCamp?.daysLeft !== undefined
          ? savedPrevCamp.daysLeft
          : mockFallback?.daysLeft !== undefined
          ? mockFallback.daysLeft
          : calculateDaysRemaining(targetCamp.deadline, 14);

      const restoredPledgedAmount =
        savedPrevCamp?.pledgedAmount !== undefined
          ? savedPrevCamp.pledgedAmount
          : mockFallback?.pledgedAmount !== undefined
          ? mockFallback.pledgedAmount
          : targetCamp.pledgedAmount;

      const restoredAmountRaised =
        savedPrevCamp?.amountRaised !== undefined
          ? savedPrevCamp.amountRaised
          : mockFallback?.amountRaised !== undefined
          ? mockFallback.amountRaised
          : restoredPledgedAmount;

      const restoredBackersCount =
        savedPrevCamp?.backersCount !== undefined
          ? savedPrevCamp.backersCount
          : mockFallback?.backersCount !== undefined
          ? mockFallback.backersCount
          : targetCamp.backersCount;

      const restoredStatus =
        savedPrevCamp?.status && savedPrevCamp.status !== 'failed'
          ? savedPrevCamp.status
          : 'in_progress';

      const resetCamp: Campaign = {
        ...targetCamp,
        status: restoredStatus,
        daysLeft: restoredDaysLeft,
        pledgedAmount: restoredPledgedAmount,
        amountRaised: restoredAmountRaised,
        backersCount: restoredBackersCount,
        isSettled: false,
        settlement: undefined,
        previousState: undefined,
      };

      setCampaigns((prev) => prev.map((c) => (String(c.id) === String(targetCamp.id) ? resetCamp : c)));
      setSelectedCampaignForDetail((prev) => (String(prev.id) === String(targetCamp.id) ? resetCamp : prev));

      // Restore backer pledges for this campaign
      const savedBackers = preSimulationBackersRef.current.get(campIdStr);
      if (savedBackers && savedBackers.length > 0) {
        setCampaignBackers((prev) => ({
          ...prev,
          [targetCamp.id]: savedBackers,
        }));
      } else {
        setCampaignBackers((prev) => ({
          ...prev,
          [targetCamp.id]: (prev[targetCamp.id] || []).map((b) => ({
            ...b,
            status: 'authorized',
            settlementDate: undefined,
          })),
        }));
      }

      // Restore user pledges
      const savedUserPledges = preSimulationPledgesRef.current.get(campIdStr);
      if (savedUserPledges && savedUserPledges.length > 0) {
        setUserPledges((prev) =>
          prev.map((p) => {
            const matched = savedUserPledges.find((sp) => sp.id === p.id);
            if (matched) return { ...matched };
            if (isMatchingPledge(p)) {
              return {
                ...p,
                status: 'authorized',
                settlementDate: undefined,
              };
            }
            return p;
          })
        );
      } else {
        setUserPledges((prev) =>
          prev.map((p) => {
            if (isMatchingPledge(p)) {
              return {
                ...p,
                status: 'authorized',
                settlementDate: undefined,
              };
            }
            return p;
          })
        );
      }

      // Clean up pre-simulation records for this campaign
      preSimulationCampaignsRef.current.delete(campIdStr);
      preSimulationBackersRef.current.delete(campIdStr);
      preSimulationPledgesRef.current.delete(campIdStr);

      try {
        const stored = localStorage.getItem('craftify_user_pledges');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            const updated = list.map((p: any) => {
              if (isMatchingPledge(p)) {
                return {
                  ...p,
                  status: 'authorized',
                  settlementDate: undefined,
                };
              }
              return p;
            });
            localStorage.setItem('craftify_user_pledges', JSON.stringify(updated));
          }
        }
      } catch {}

      fetch(`/api/campaigns/${targetCamp.id}/settle/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: 'reset' }),
      }).catch(() => {});

      showToast(`Campaign "${targetCamp.title}" reset to previous state (${restoredDaysLeft} days remaining).`);
      return;
    }

    // Capture previous state snapshot before running settlement simulation
    if (!preSimulationCampaignsRef.current.has(campIdStr)) {
      preSimulationCampaignsRef.current.set(campIdStr, { ...targetCamp });
    }
    if (!preSimulationBackersRef.current.has(campIdStr)) {
      preSimulationBackersRef.current.set(
        campIdStr,
        (campaignBackers[targetCamp.id] || []).map((b) => ({ ...b }))
      );
    }
    if (!preSimulationPledgesRef.current.has(campIdStr)) {
      preSimulationPledgesRef.current.set(
        campIdStr,
        userPledges.filter(isMatchingPledge).map((p) => ({ ...p }))
      );
    }

    const previousState: Campaign['previousState'] = {
      status: targetCamp.status,
      daysLeft: targetCamp.daysLeft,
      pledgedAmount: targetCamp.pledgedAmount,
      amountRaised: targetCamp.amountRaised ?? targetCamp.pledgedAmount,
      backersCount: targetCamp.backersCount,
      isSettled: targetCamp.isSettled,
      settlement: targetCamp.settlement,
      deadline: targetCamp.deadline,
    };

    const currentBackers = campaignBackers[targetCamp.id] || [];
    let campToSettle = { ...targetCamp };
    if (forceOutcome === 'funded') {
      const goal = campToSettle.goalAmount || campToSettle.fundingGoal || 100000;
      const needed = Math.max(goal, campToSettle.pledgedAmount, 100000);
      campToSettle.pledgedAmount = needed;
      campToSettle.amountRaised = needed;
      campToSettle.backersCount = Math.max(campToSettle.backersCount, 12);
    } else if (forceOutcome === 'unsuccessful') {
      const goal = campToSettle.goalAmount || campToSettle.fundingGoal || 100000;
      const below = Math.min(campToSettle.pledgedAmount, Math.round(goal * 0.7));
      campToSettle.pledgedAmount = below;
      campToSettle.amountRaised = below;
    }

    const result = settleCampaign(campToSettle, currentBackers);
    const campaignWithPrev: Campaign = {
      ...result.campaign,
      previousState: targetCamp.previousState || previousState,
    };

    // Update campaigns in state
    setCampaigns((prev) => prev.map((c) => (String(c.id) === String(targetCamp.id) ? campaignWithPrev : c)));

    // Update selected detail view if currently open
    setSelectedCampaignForDetail((prev) => (String(prev.id) === String(targetCamp.id) ? campaignWithPrev : prev));

    // Update backer statuses for this campaign
    setCampaignBackers((prev) => ({
      ...prev,
      [targetCamp.id]: result.pledges,
    }));

    // Update user pledges
    setUserPledges((prev) =>
      prev.map((p) => {
        if (isMatchingPledge(p)) {
          return {
            ...p,
            status: result.isFunded ? 'captured' : 'released',
            settlementDate: result.settledAt,
          };
        }
        return p;
      })
    );

    // Update localStorage immediately
    try {
      const stored = localStorage.getItem('craftify_user_pledges');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          const updated = list.map((p: any) => {
            if (isMatchingPledge(p)) {
              return {
                ...p,
                status: result.isFunded ? 'captured' : 'released',
                settlementDate: result.settledAt,
              };
            }
            return p;
          });
          localStorage.setItem('craftify_user_pledges', JSON.stringify(updated));
        }
      }
    } catch {}

    // Update campaignActivity.pledges
    campaignActivity.pledges = campaignActivity.pledges.map((p) => {
      if (isMatchingPledge(p)) {
        return {
          ...p,
          status: result.isFunded ? 'captured' : 'released',
          settlementDate: result.settledAt,
        };
      }
      return p;
    });

    // Notify backend server
    fetch(`/api/campaigns/${targetCamp.id}/settle/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome: result.isFunded ? 'funded' : 'unsuccessful' }),
    }).catch(() => {});

    if (result.isFunded) {
      showToast(`Settlement reached for "${targetCamp.title}": 100%+ goal met! All backer pledges captured.`);
    } else {
      showToast(`Settlement reached for "${targetCamp.title}": Goal not reached. All backer holds released.`);
    }
  };

  // Publish to Shop Handler (Graduation from Crowdfunding to Marketplace)
  const handlePublishToShop = (campaign: Campaign) => {
    // Check if already in products catalog
    const existing = products.find(
      (p) => p.graduatedFromCampaignId === campaign.code || p.id === `prd-graduated-${campaign.id}`
    );
    if (existing) {
      showToast(`"${campaign.title}" is already published in the Craftify Shop.`);
      return;
    }

    const price = campaign.rewardTiers[0]?.pledgeAmount || 68;
    const newGraduatedProduct: Product = {
      id: `prd-graduated-${campaign.id}`,
      sku: `LM-${campaign.code.replace('CMP-', '')}`,
      title: campaign.title,
      creator: campaign.creator,
      creatorLocation: campaign.creatorLocation || 'Independent Studio Workshop',
      category: campaign.category,
      shortDescription: campaign.shortDescription,
      longDescription: campaign.fullStory || campaign.shortDescription,
      price,
      graduatedFromCampaignId: campaign.code,
      originalPledgedAmount: campaign.pledgedAmount,
      isFundedOnCraftify: true,
      isFundedOnLaunchMart: true,
      campaignBackersCount: campaign.backersCount,
      campaignGoalAmount: campaign.goalAmount,
      batchGraduated: 'First Production Batch • Graduated',
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      stockCount: 45,
      imageUrl: campaign.imageUrl,
      galleryImages: [campaign.imageUrl],
      features: [
        'Graduated from Craftify verified crowdfunding campaign',
        `Funded by ${campaign.backersCount} original patrons`,
        'Inspected and cleared for marketplace fulfillment',
        'Direct creator warranty and lifetime workshop support',
      ],
      specs: campaign.specs || [
        { label: 'Origin Heritage', value: `Graduated from Craftify ${campaign.code}` },
        { label: 'Production Batch', value: 'First Edition Graduated Run' },
        { label: 'Fulfillment Window', value: 'In Stock • Immediate Dispatch' },
      ],
      createdAt: new Date().toISOString().split('T')[0],
      reviews: [
        {
          id: `rev-initial-${campaign.id}`,
          productId: `prd-graduated-${campaign.id}`,
          author: 'Verified Escrow Backer',
          rating: 5,
          date: 'Recent Backer Dispatch',
          title: 'Flawless execution from the initial campaign',
          comment: 'Pre-authorized this during the early crowdfunding window. The final product exceeded expectations in tolerance, finish, and packaging.',
          verifiedBuyer: true,
        },
      ],
    };

    // Prepend to products state
    setProducts((prev) => [newGraduatedProduct, ...prev]);

    // Mark campaign as published to shop
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? { ...c, isPublishedToShop: true, publishedProductId: newGraduatedProduct.id }
          : c
      )
    );

    showToast(`"${campaign.title}" graduated to the Shop tagged with "Funded on Craftify"!`);
  };

  // Direct Product Created Handler
  const handleProductCreated = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    showToast(`"${newProd.title}" listed in Craftify Shop!`);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F6] text-[#212121]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="system-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#212121] text-[#FFFFFF] border-l-4 border-[#388E3C] px-4 py-3 rounded-[2px] shadow-xl text-xs flex items-center gap-3 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-[#388E3C] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#FFFFFF]/70 hover:text-[#FFFFFF] ml-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        cartCount={totalCartCount}
        onOpenCart={() => handleNavigate('cart')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onToggleGemini={() => setIsGeminiChatOpen((prev) => !prev)}
        wishlistCount={wishlistProductIds.length}
        onOpenWishlist={handleOpenWishlist}
        onOpenAccount={() => {
          if (currentUser) {
            setActiveView('account');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onLogout={handleLogout}
        onLogin={handleLogin}
        searchQuery={globalSearchQuery}
        onSearchChange={setGlobalSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        products={localizedProducts}
        campaigns={localizedCampaigns}
        onProductClick={handleOpenProductDetail}
        onCampaignClick={handleOpenCampaignDetail}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW: HOME */}
        {activeView === 'home' && (
          <>
            <Hero
              onNavigate={handleNavigate}
              onScrollToCampaigns={handleScrollToCampaigns}
              onScrollToShop={handleScrollToShop}
            />

            {/* Category Capsules Strip matching reference image */}
            <CategoryStrip
              onNavigate={handleNavigate}
              onSelectCategory={(_cat) => {
                handleNavigate('shop');
              }}
            />

            {/* Deals for Good 6-product row matching reference image */}
            <div ref={shopRef}>
              <ShopSection
                products={localizedProducts}
                onAddToCart={handleAddToCart}
                onProductClick={handleOpenProductDetail}
                onViewAllClick={() => handleNavigate('shop')}
                wishlistProductIds={wishlistProductIds}
                onToggleWishlist={handleToggleWishlist}
              />
            </div>

            <div ref={campaignsRef}>
              <CampaignSection
                campaigns={publicCampaigns}
                onPledgeClick={(camp) => handleOpenPledge(camp)}
                onCardClick={(camp) => handleOpenCampaignDetail(camp)}
                onViewAllClick={() => handleNavigate('campaigns')}
              />
            </div>

            {/* Recommended for You Section */}
            <RecommendationsSection
              viewedCategories={viewedCategories}
              products={localizedProducts}
              campaigns={localizedCampaigns}
              onAddToCart={handleAddToCart}
              onProductClick={handleOpenProductDetail}
              onCampaignClick={handleOpenCampaignDetail}
              onPledgeClick={(camp) => handleOpenPledge(camp)}
              wishlistProductIds={wishlistProductIds}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* How It Works Explainer Banner */}
            <section className="py-8 sm:py-12 bg-[#F1F3F6]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-6 sm:p-8 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
                  <div className="text-center max-w-2xl mx-auto mb-8">
                    <span className="text-xs uppercase tracking-widest text-[#2874F0] font-bold">
                      {t('howItWorksSubtitle')}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] mt-1.5">
                      {t('howItWorksTitle')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#878787] mt-1">
                      {t('howItWorksDesc')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-5 bg-[#FBFBFB] rounded-[4px] border border-[#EAEAEA]">
                      <div className="text-xs font-bold text-[#2874F0] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#EBF2FE] text-[#2874F0] flex items-center justify-center font-bold text-xs">1</span>
                        <span>{t('howItWorksStep1Title')}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#212121] mb-2">
                        {t('howItWorksStep1Title')}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {t('howItWorksStep1Desc')}
                      </p>
                    </div>

                    <div className="p-5 bg-[#FBFBFB] rounded-[4px] border border-[#EAEAEA]">
                      <div className="text-xs font-bold text-[#FB641B] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FFF2EE] text-[#FB641B] flex items-center justify-center font-bold text-xs">2</span>
                        <span>{t('howItWorksStep2Title')}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#212121] mb-2">
                        {t('howItWorksStep2Title')}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {t('howItWorksStep2Desc')}
                      </p>
                    </div>

                    <div className="p-5 bg-[#FBFBFB] rounded-[4px] border border-[#EAEAEA]">
                      <div className="text-xs font-bold text-[#388E3C] uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#EBF7EE] text-[#388E3C] flex items-center justify-center font-bold text-xs">3</span>
                        <span>{t('howItWorksStep3Title')}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#212121] mb-2">
                        {t('howItWorksStep3Title')}
                      </h3>
                      <p className="text-xs text-[#666666] leading-relaxed">
                        {t('howItWorksStep3Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* VIEW: DISCOVER CAMPAIGNS */}
        {activeView === 'campaigns' && (
          <div className="py-6 bg-[#F1F3F6] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
              <div className="flex items-center gap-2 text-xs text-[#878787] mb-2">
                <button onClick={() => handleNavigate('home')} className="hover:text-[#2874F0] cursor-pointer">{t('home')}</button>
                <span>/</span>
                <span className="text-[#212121] font-semibold">{t('campaigns')}</span>
              </div>
              <div className="p-5 sm:p-6 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#FB641B] inline-block"></span>
                    <span className="text-xs uppercase tracking-wider text-[#FB641B] font-bold">
                      {t('escrowProtected')}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121]">
                    {t('activeCampaigns')}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#878787] mt-1 max-w-2xl leading-relaxed">
                    {t('howItWorksStep1Desc')}
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('start-campaign')}
                  className="px-5 py-2.5 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('startCampaign')}</span>
                </button>
              </div>
            </div>

            <CampaignSection
              campaigns={publicCampaigns}
              onPledgeClick={(camp) => handleOpenPledge(camp)}
              onCardClick={(camp) => handleOpenCampaignDetail(camp)}
            />
          </div>
        )}

        {/* VIEW: SHOP LISTING */}
        {activeView === 'shop' && (
          <ShopPage
            products={localizedProducts}
            onAddToCart={handleAddToCart}
            onProductClick={handleOpenProductDetail}
            onNavigateCampaigns={() => handleNavigate('campaigns')}
            wishlistProductIds={wishlistProductIds}
            onToggleWishlist={handleToggleWishlist}
            searchQuery={globalSearchQuery}
            onSearchChange={setGlobalSearchQuery}
          />
        )}

        {/* VIEW: PRODUCT DETAIL */}
        {activeView === 'product-detail' && activeLocalizedProduct && (
          <ProductDetailPage
            product={activeLocalizedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onBack={() => handleNavigate('shop')}
            isWishlisted={wishlistProductIds.includes(activeLocalizedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            allProducts={localizedProducts}
            allCampaigns={localizedCampaigns}
            onProductClick={handleOpenProductDetail}
            onCampaignClick={handleOpenCampaignDetail}
            onPledgeClick={(camp) => handleOpenPledge(camp)}
            onNavigateCampaign={(campaignCode) => {
              const foundCamp = campaigns.find(
                (c) => c.code === campaignCode || c.id === campaignCode
              );
              if (foundCamp) {
                handleOpenCampaignDetail(foundCamp);
              } else {
                handleNavigate('campaigns');
              }
            }}
          />
        )}

        {/* VIEW: CART PAGE */}
        {activeView === 'cart' && (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantityDelta}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={() => handleNavigate('checkout')}
            onContinueShopping={() => handleNavigate('shop')}
            onDiscoverCampaigns={() => handleNavigate('campaigns')}
          />
        )}

        {/* VIEW: CHECKOUT PAGE */}
        {activeView === 'checkout' && (
          <CheckoutPage
            items={cartItems}
            currentUser={currentUser}
            onOrderPlaced={handleOrderPlaced}
            onBackToCart={() => handleNavigate('cart')}
            onContinueShopping={() => handleNavigate('shop')}
            onGoToAccount={() => handleNavigate('account')}
            onTrackOrder={handleTrackOrderById}
          />
        )}

        {/* VIEW: DETAILED CAMPAIGN PAGE */}
        {activeView === 'campaign-detail' && activeLocalizedCampaign && (
          <CampaignDetailPage
            campaign={activeLocalizedCampaign}
            backers={campaignBackers[activeLocalizedCampaign.id] || []}
            updates={campaignUpdates[activeLocalizedCampaign.id] || []}
            comments={campaignComments[activeLocalizedCampaign.id] || []}
            onBack={() => handleNavigate('campaigns')}
            onOpenPledgeModal={(camp, tier) => handleOpenPledge(camp, tier)}
            onAddComment={handleAddComment}
            allProducts={localizedProducts}
            allCampaigns={localizedCampaigns}
            onAddToCart={handleAddToCart}
            onProductClick={handleOpenProductDetail}
            onCampaignClick={handleOpenCampaignDetail}
            onSimulateSettlement={handleSimulateSettlement}
          />
        )}

        {/* VIEW: MULTI-STEP CAMPAIGN CREATION FORM */}
        {activeView === 'start-campaign' && (
          (!currentUser || (currentUser.role !== 'artisan' && currentUser.role !== 'creator')) ? (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF3EC] text-[#FB641B] flex items-center justify-center mx-auto mb-3 border border-[#FB641B]/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#212121] mb-2">Artisan Account Required</h2>
              <p className="text-xs text-[#878787] max-w-md mx-auto mb-5 leading-relaxed">
                Only verified artisan accounts can launch crowdfunding campaigns and list handcrafted items. Please sign up or switch to an artisan account.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-xs font-bold uppercase tracking-wider text-[#212121] cursor-pointer"
                >
                  Return to Store
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-xs font-bold uppercase tracking-wider text-[#FFFFFF] cursor-pointer"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          ) : !currentUser.profileCompleted ? (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF3E0] text-[#E65100] flex items-center justify-center mx-auto mb-3 border border-[#FFE0B2]">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#212121] mb-2">Artisan Profile Incomplete</h2>
              <p className="text-xs text-[#878787] max-w-md mx-auto mb-5 leading-relaxed">
                Before launching a crowdfunding campaign, Craftify seller onboarding requires verified workshop information, craft heritage documentation, and bank payout credentials.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-xs font-bold uppercase tracking-wider text-[#212121] cursor-pointer"
                >
                  Return to Store
                </button>
                <button
                  onClick={() => handleNavigate('complete-profile')}
                  className="px-5 py-2 rounded-[2px] bg-[#2874F0] hover:bg-[#1259C3] text-xs font-bold uppercase tracking-wider text-[#FFFFFF] cursor-pointer shadow-xs"
                >
                  Complete Profile Now →
                </button>
              </div>
            </div>
          ) : (
            <CreateCampaignForm
              onCancel={() => handleNavigate('home')}
              onCampaignCreated={handleCampaignCreated}
              defaultCreatorName={currentUser?.name ?? 'Atelier Monolith'}
            />
          )
        )}

        {/* VIEW: CREATOR DASHBOARD (Bridging Crowdfunding to Marketplace) */}
        {activeView === 'creator-dashboard' && (
          (!currentUser || (currentUser.role !== 'artisan' && currentUser.role !== 'creator')) ? (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FFF3EC] text-[#FB641B] flex items-center justify-center mx-auto mb-3 border border-[#FB641B]/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#212121] mb-2">Artisan Access Only</h2>
              <p className="text-xs text-[#878787] max-w-md mx-auto mb-5 leading-relaxed">
                The Creator Dashboard is reserved for verified master artisans. Please sign in or register as an artisan to view sales metrics and manage production.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-xs font-bold uppercase tracking-wider text-[#212121] cursor-pointer"
                >
                  Return to Store
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-xs font-bold uppercase tracking-wider text-[#FFFFFF] cursor-pointer"
                >
                  Sign In as Artisan
                </button>
              </div>
            </div>
          ) : (
            <CreatorDashboard
              currentUser={currentUser}
              campaigns={localizedCampaigns}
              products={localizedProducts}
              backersMap={campaignBackers}
              onNavigate={handleNavigate}
              onOpenCampaignDetail={handleOpenCampaignDetail}
              onOpenProductDetail={handleOpenProductDetail}
              onCampaignCreated={handleCampaignCreated}
              onSimulateSettlement={handleSimulateSettlement}
              onPublishToShop={handlePublishToShop}
              onProductCreated={handleProductCreated}
            />
          )
        )}

        {/* VIEW: MY PLEDGES (Buyer specific backed campaigns ledger) */}
        {activeView === 'my-pledges' && (
          <MyPledgesPage
            currentUser={currentUser}
            campaigns={localizedCampaigns}
            localPledges={userPledges}
            onNavigate={handleNavigate}
            onOpenCampaignDetail={handleOpenCampaignDetail}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSimulateSettlement={handleSimulateSettlement}
          />
        )}

        {/* VIEW: ADMIN PANEL (Curation, user management & platform analytics) */}
        {activeView === 'admin-panel' && (
          (!currentUser || currentUser.role !== 'admin') ? (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FBE9E7] text-[#D32F2F] flex items-center justify-center mx-auto mb-3 border border-[#D32F2F]/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#212121] mb-2">Access Denied: Platform Administrator Required</h2>
              <p className="text-xs text-[#878787] max-w-md mx-auto mb-5 leading-relaxed">
                You do not have administrative clearance to access the curation desk. Only designated admin accounts can review campaigns and oversee platform trust.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-4 py-2 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-xs font-bold uppercase tracking-wider text-[#212121] cursor-pointer"
                >
                  Return Home
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-[2px] bg-[#2874F0] hover:bg-[#1259C3] text-xs font-bold uppercase tracking-wider text-[#FFFFFF] cursor-pointer"
                >
                  Switch Account
                </button>
              </div>
            </div>
          ) : (
            <AdminPanel
              currentUser={currentUser}
              campaigns={localizedCampaigns}
              onNavigate={handleNavigate}
              onOpenCampaignDetail={handleOpenCampaignDetail}
              onCampaignApproved={(slug) => {
                setCampaigns((prev) =>
                  prev.map((c) =>
                    c.slug === slug || c.id === slug
                      ? { ...c, isApproved: true, status: 'in_progress' }
                      : c
                  )
                );
                showToast('Campaign successfully approved and published to public discovery!');
              }}
              showToast={showToast}
            />
          )
        )}

        {/* VIEW: ARTISAN ONBOARDING - COMPLETE YOUR PROFILE */}
        {activeView === 'complete-profile' && (
          <CompleteProfilePage
            currentUser={currentUser}
            onSaveProfile={(updatedUser) => {
              setCurrentUser(updatedUser);
              showToast(
                updatedUser.profileCompleted
                  ? 'Artisan profile completed & verified! You can now launch campaigns.'
                  : 'Profile draft saved.'
              );
              handleNavigate('creator-dashboard');
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}

        {/* VIEW: ACCOUNT DASHBOARD */}
        {activeView === 'account' && (
          currentUser ? (
            <AccountDashboard
              user={currentUser}
              pledges={userPledges}
              campaigns={localizedCampaigns}
              orders={localizedOrders}
              wishlistProducts={wishlistProducts}
              onNavigate={handleNavigate}
              onOpenCampaignDetail={handleOpenCampaignDetail}
              onOpenProductDetail={handleOpenProductDetail}
              onOpenStartCampaign={() => handleNavigate('start-campaign')}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onTrackOrder={handleTrackOrder}
              onAdvanceStatus={handleAdvanceOrderStatus}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
              <h2 className="font-display text-2xl font-bold text-[#1B2430] mb-2">
                Authentication Required
              </h2>
              <p className="text-xs font-ledger text-[#1B2430]/70 mb-6">
                Please sign in to view your authorized pledges and delivery ledger.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 bg-[#1B2430] text-[#ECE9E2] font-ledger text-xs uppercase tracking-wider font-semibold"
              >
                Sign In / Create Account
              </button>
            </div>
          )
        )}

        {/* VIEW: MY ORDERS LIST */}
        {activeView === 'my-orders' && (
          <MyOrdersPage
            orders={localizedOrders}
            onTrackOrder={handleTrackOrder}
            onNavigate={handleNavigate}
            onAdvanceStatus={handleAdvanceOrderStatus}
          />
        )}

        {/* VIEW: ORDER TRACKING DETAIL */}
        {activeView === 'order-tracking' && (activeLocalizedOrder || selectedOrderForTracking) && (
          <OrderTrackingPage
            order={activeLocalizedOrder || selectedOrderForTracking}
            onBackToOrders={() => handleNavigate('my-orders')}
            onAdvanceStatus={handleAdvanceOrderStatus}
            onResetStatus={handleResetOrderStatus}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {/* VIEW: FULL PAGE GEMINI AI STUDIO */}
        {activeView === 'gemini-chat' && (
          <GeminiPage
            currentUser={currentUser}
            onBack={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Cart & Ledger Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleCheckout}
          onViewFullCart={() => {
            setIsCartOpen(false);
            handleNavigate('cart');
          }}
        />
      )}

      {/* Interactive Backer Pledge Modal */}
      {selectedCampaignForPledge && (
        <PledgeModal
          campaign={selectedCampaignForPledge}
          initialTierId={initialTierIdForPledge}
          defaultUserName={currentUser?.name || 'Eleanor Vance'}
          onClose={() => {
            setSelectedCampaignForPledge(null);
            setInitialTierIdForPledge(undefined);
          }}
          onNavigateToMyPledges={() => {
            setSelectedCampaignForPledge(null);
            setInitialTierIdForPledge(undefined);
            handleNavigate('my-pledges');
          }}
          onConfirmPledge={handleConfirmPledge}
        />
      )}

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      {/* Floating Gemini Chat Launcher Button */}
      <GeminiFloatingLauncher
        isOpen={isGeminiChatOpen || activeView === 'gemini-chat'}
        onToggle={() => setIsGeminiChatOpen((prev) => !prev)}
      />

      {/* Floating Gemini Chat Drawer / Modal */}
      {isGeminiChatOpen && activeView !== 'gemini-chat' && (
        <GeminiChat
          currentUser={currentUser}
          isModal={true}
          onClose={() => setIsGeminiChatOpen(false)}
          onBack={() => setIsGeminiChatOpen(false)}
        />
      )}

      {/* Ledger Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CraftifyApp />
    </LanguageProvider>
  );
}
