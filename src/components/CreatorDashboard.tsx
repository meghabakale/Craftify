import React, { useState } from 'react';
import { Campaign, Product, RewardTier, BackerRecord, User, ActiveView } from '../types';
import { formatINR } from '../utils/format';
import {
  Sparkles,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Store,
  TrendingUp,
  Layers,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  ShieldCheck,
  RotateCcw,
  Check,
  ExternalLink,
  Users,
  Eye,
  Calendar,
  Compass,
} from 'lucide-react';
import { SmartInput } from './common/SmartInput';
import { SmartTextarea } from './common/SmartTextarea';
import { AIDescriptionWriter } from './ai/AIDescriptionWriter';
import { AIPriceSuggester } from './ai/AIPriceSuggester';
import { PRESET_CRAFT_IMAGES } from '../data/artisanAssets';
import { calculatePayoutBreakdown, calculateDaysRemaining, formatDeadlineDate } from '../utils/settleCampaign';
import { ImageUploadDropzone } from './common/ImageUploadDropzone';

interface CreatorDashboardProps {
  currentUser: User | null;
  campaigns: Campaign[];
  products: Product[];
  backersMap: Record<string, BackerRecord[]>;
  onNavigate: (view: ActiveView) => void;
  onOpenCampaignDetail: (campaign: Campaign) => void;
  onOpenProductDetail: (product: Product) => void;
  onCampaignCreated: (campaign: Campaign) => void;
  onSimulateSettlement: (campaignId: string, forceOutcome?: 'funded' | 'unsuccessful' | 'reset') => void;
  onPublishToShop: (campaign: Campaign) => void;
  onProductCreated?: (product: Product) => void;
  initialTab?: 'my-campaigns' | 'start-campaign' | 'list-product';
}

const PRESET_WORKSHOP_IMAGES = PRESET_CRAFT_IMAGES;

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  currentUser,
  campaigns,
  products,
  backersMap,
  onNavigate,
  onOpenCampaignDetail,
  onOpenProductDetail,
  onCampaignCreated,
  onSimulateSettlement,
  onPublishToShop,
  onProductCreated,
  initialTab = 'my-campaigns',
}) => {
  const [activeTab, setActiveTab] = useState<'my-campaigns' | 'start-campaign' | 'list-product'>(initialTab);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [showBackersForId, setShowBackersForId] = useState<string | null>(null);

  // Form State for "Start a Campaign"
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFullStory, setFormFullStory] = useState('');
  const [formCategory, setFormCategory] = useState('Handloom Textiles');
  const [formGoalAmount, setFormGoalAmount] = useState<number>(200000);
  const [formDeadlineDays, setFormDeadlineDays] = useState<number>(30);
  const [formDeadlineDate, setFormDeadlineDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formImageWarning, setFormImageWarning] = useState<string | null>(null);
  const [formImageNudgeShown, setFormImageNudgeShown] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // AI Inputs for Campaign Form
  const [aiCraftType, setAiCraftType] = useState('Dabu Mud Resist Block Printing');
  const [aiMaterial, setAiMaterial] = useState('Hand-spun Khadi Cotton & Forest Indigo');
  const [aiRegion, setAiRegion] = useState('Bagru, Rajasthan');
  const [aiKeywords, setAiKeywords] = useState('hand-carved teak wood blocks, sun-bleached river wash');

  // Form State for "List a Product" (Direct to Shop)
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState('Handloom Textiles');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(2450);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodGalleryImages, setProdGalleryImages] = useState<string[]>([]);
  const [prodImageWarning, setProdImageWarning] = useState<string | null>(null);
  const [prodImageNudgeShown, setProdImageNudgeShown] = useState<boolean>(false);
  const [prodAiCraftType, setProdAiCraftType] = useState('Chanderi Handloom Weaving');
  const [prodAiMaterial, setProdAiMaterial] = useState('Pure Chanderi Silk & Real Zari Weave');
  const [prodAiRegion, setProdAiRegion] = useState('Chanderi, Madhya Pradesh');
  const [prodAiKeywords, setProdAiKeywords] = useState('traditional pit-loom, gold floral zari butis');
  const [prodError, setProdError] = useState<string | null>(null);
  const [prodSuccess, setProdSuccess] = useState<string | null>(null);

  // Pledge Tier Builder State
  const [formTiers, setFormTiers] = useState<RewardTier[]>([
    {
      id: 'tier-builder-1',
      title: 'Patron Early Artisan Edition',
      pledgeAmount: 1800,
      description: 'First production run handcrafted unit with artisan signature seal and khadi pouch.',
      estimatedDelivery: 'Nov 2026',
      itemsIncluded: ['1x Handcrafted Artisan Unit', 'Khadi Protective Sleeve', 'Artisan Certificate of Provenance'],
      backersCount: 0,
      maxBackers: 50,
    },
    {
      id: 'tier-builder-2',
      title: 'Master Guild Batch',
      pledgeAmount: 3600,
      description: 'Standard handcrafted production unit in handmade archival craft box.',
      estimatedDelivery: 'Dec 2026',
      itemsIncluded: ['1x Handcrafted Masterpiece', 'Custom Wooden Box', 'Care & Heritage Manual'],
      backersCount: 0,
      maxBackers: 100,
    },
  ]);

  // Creator identity
  const creatorName = currentUser?.name ? `${currentUser.name} Guild` : 'Varanasi Master Weavers';

  // Filter campaigns belonging to this creator or display atelier campaigns for testing
  const creatorCampaigns = campaigns.filter((c) => {
    if (!currentUser) return true;
    const authorLower = c.creator.toLowerCase();
    const userLower = currentUser.name.toLowerCase();
    return authorLower.includes('atelier') || authorLower.includes('vance') || authorLower.includes(userLower) || true; // Show full catalog for easy testing
  });

  const totalEscrowPledged = creatorCampaigns.reduce((sum, c) => sum + c.pledgedAmount, 0);
  const fundedCampaignsCount = creatorCampaigns.filter((c) => c.status === 'funded').length;
  const graduatedShopProductsCount = products.filter((p) => (p.isFundedOnCraftify ?? p.isFundedOnLaunchMart)).length;

  // Handle Deadline Date Change
  const handleDeadlineDateChange = (dateStr: string) => {
    setFormDeadlineDate(dateStr);
    const target = new Date(dateStr);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setFormDeadlineDays(diffDays);
  };

  // Add / Remove / Update Tiers
  const handleAddTier = () => {
    const newTier: RewardTier = {
      id: `tier-${Date.now()}`,
      title: `Patron Tier #${formTiers.length + 1}`,
      pledgeAmount: 2500,
      description: 'Hand-inspected edition with studio archival packaging and artisan dispatch notes.',
      estimatedDelivery: 'Jan 2027',
      itemsIncluded: ['1x Handcrafted Edition', 'Artisan Guild Certificate'],
      backersCount: 0,
      maxBackers: 75,
    };
    setFormTiers([...formTiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    if (formTiers.length <= 1) {
      setFormError('A campaign must offer at least one pledge reward tier.');
      return;
    }
    setFormTiers(formTiers.filter((t) => t.id !== id));
  };

  const handleUpdateTier = (id: string, field: keyof RewardTier, value: any) => {
    setFormTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Fast demo filler
  const handleFillDemoCampaign = () => {
    setFormTitle('Pashmina Cashmere Loom Series');
    setFormDescription('Hand-spun Changthangi goat pashmina woven on century-old cedar looms by Srinagar master weavers.');
    setFormFullStory('Each shawl takes over 180 hours of meticulous hand-weaving. Sourced ethically from high-altitude nomadic Changpa herders of Ladakh. Spun on traditional wooden Charkhas and finished with natural plant dyes.');
    setFormCategory('Handloom Textiles');
    setFormGoalAmount(180000);
    setFormDeadlineDays(25);
    const d = new Date();
    d.setDate(d.getDate() + 25);
    setFormDeadlineDate(d.toISOString().split('T')[0]);
    setFormImageUrl('https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80');
    setFormTiers([
      {
        id: `tier-demo-1`,
        title: 'Apprentice Supporter Edition',
        pledgeAmount: 2400,
        description: 'First 50 handloom pashmina mufflers with certified GI-tag and artisan seal.',
        estimatedDelivery: 'Nov 2026',
        itemsIncluded: ['1x Handloom Pashmina Muffler', 'Khadi Protective Pouch', 'Weaver Certificate'],
        backersCount: 0,
        maxBackers: 50,
      },
      {
        id: `tier-demo-2`,
        title: 'Master Weaver Heirloom Shawl',
        pledgeAmount: 7500,
        description: 'Full-length hand-spun pure pashmina shawl in walnut presentation chest.',
        estimatedDelivery: 'Dec 2026',
        itemsIncluded: ['1x Full Handloom Pashmina Shawl', 'Carved Walnut Box', 'Heritage Documentation'],
        backersCount: 0,
        maxBackers: 100,
      },
    ]);
    setFormError(null);
  };

  // Submit New Campaign
  const handleSubmitCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Please provide a campaign title.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please enter a concise description of your creation.');
      return;
    }
    if (formGoalAmount < 10000) {
      setFormError('Minimum funding goal is ₹10,000 for artisan production covenants.');
      return;
    }
    if (formTiers.length === 0) {
      setFormError('Please create at least one reward tier for backers.');
      return;
    }

    // Friendly validation nudge for cover image (soft warning first, not a hard blocker)
    if (!formImageUrl.trim()) {
      if (!formImageNudgeShown) {
        setFormImageWarning('Add a cover image so backers can see your work');
        setFormImageNudgeShown(true);
        return;
      }
    }

    const finalCampaignImage = formImageUrl.trim() || PRESET_WORKSHOP_IMAGES[0].url;
    const finalGalleryImages = formGalleryImages.length > 0
      ? [finalCampaignImage, ...formGalleryImages]
      : [finalCampaignImage];

    const newCode = `CMP-${Math.floor(110 + Math.random() * 880)}`;
    const newCamp: Campaign = {
      id: `cmp-${Date.now().toString().slice(-6)}`,
      code: newCode,
      title: formTitle,
      creator: creatorName,
      creatorBio: `${creatorName} is an independent design and metallurgical studio crafting tools built for longevity.`,
      creatorLocation: 'Portland & Kyoto Workshop',
      category: formCategory,
      shortDescription: formDescription,
      fullStory: formFullStory || formDescription,
      goalAmount: formGoalAmount,
      pledgedAmount: 0,
      backersCount: 0,
      daysLeft: formDeadlineDays,
      status: 'pending_review',
      isApproved: false,
      creatorProfilePhoto: currentUser?.profilePhoto,
      creatorBusinessName: currentUser?.businessName || currentUser?.name || creatorName,
      creatorYearsOfExperience: currentUser?.yearsOfExperience,
      creatorCity: currentUser?.city,
      creatorState: currentUser?.state,
      imageUrl: finalCampaignImage,
      galleryImages: finalGalleryImages,
      specs: [
        { label: 'Category', value: formCategory },
        { label: 'Funding Method', value: 'Conditional Escrow 100% Threshold' },
        { label: 'Deadline', value: formDeadlineDate },
      ],
      rewardTiers: formTiers,
    };

    onCampaignCreated(newCamp);
    setFormSuccessMessage(`Campaign "${newCamp.title}" submitted for admin review (${newCamp.code})! It will appear publicly once approved.`);
    setActiveTab('my-campaigns');
    setExpandedCampaignId(newCamp.id);
  };

  // Submit Direct Product Listing
  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProdError(null);
    setProdSuccess(null);

    if (!prodTitle.trim()) {
      setProdError('Please enter a product name/title.');
      return;
    }
    if (!prodDescription.trim()) {
      setProdError('Please provide a product description.');
      return;
    }
    if (prodPrice <= 0) {
      setProdError('Please enter a valid price in ₹.');
      return;
    }

    // Friendly validation nudge for product image
    if (!prodImageUrl.trim()) {
      if (!prodImageNudgeShown) {
        setProdImageWarning('Add a product image so buyers can see your craftsmanship');
        setProdImageNudgeShown(true);
        return;
      }
    }

    const finalProductImage = prodImageUrl.trim() || PRESET_WORKSHOP_IMAGES[1].url;
    const finalProductGallery = prodGalleryImages.length > 0
      ? [finalProductImage, ...prodGalleryImages]
      : [finalProductImage];

    const newProduct: Product = {
      id: `prd-${Date.now().toString().slice(-6)}`,
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      title: prodTitle,
      creator: creatorName,
      creatorLocation: prodAiRegion || 'Artisan Workshop, India',
      category: prodCategory,
      shortDescription: prodDescription.slice(0, 160) + (prodDescription.length > 160 ? '...' : ''),
      longDescription: prodDescription,
      price: prodPrice,
      graduatedFromCampaignId: 'Direct Master Artisan Listing',
      originalPledgedAmount: prodPrice * (prodStock || 15),
      rating: 5.0,
      reviewsCount: 0,
      stockCount: prodStock || 15,
      inStock: true,
      imageUrl: finalProductImage,
      galleryImages: finalProductGallery,
      isFundedOnCraftify: true,
      isFundedOnLaunchMart: true,
      batchGraduated: 'Artisan Workshop Direct Listing',
    };

    if (onProductCreated) {
      onProductCreated(newProduct);
    }
    setProdSuccess(`Product "${newProduct.title}" (${formatINR(newProduct.price)}) successfully listed in the Craftify Shop!`);
    setFormSuccessMessage(`Product "${newProduct.title}" successfully listed in Craftify Shop!`);
    // Reset product title & description after successful listing
    setProdTitle('');
    setProdDescription('');
    setProdImageUrl('');
    setProdGalleryImages([]);
    setProdImageWarning(null);
    setProdImageNudgeShown(false);
  };

  return (
    <div id="creator-dashboard-view" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787] mb-3">
        <button onClick={() => onNavigate('home')} className="hover:text-[#2874F0]">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('account')} className="hover:text-[#2874F0]">
          Account
        </button>
        <span>/</span>
        <span className="text-[#212121] font-bold">Artisan Studio Console</span>
      </div>

      {/* Header Banner: The Bridge between Crowdfunding & Marketplace */}
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#2874F0]"></span>
              <span className="text-[11px] uppercase tracking-wider text-[#2874F0] font-bold">
                Artisan Studio & Escrow Settlement Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight">
              Creator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#878787] mt-1 max-w-2xl leading-relaxed">
              The direct bridge connecting conditional backer funding to permanent retail. Monitor escrow thresholds, simulate deadline settlements, and graduate funded campaigns to the Craftify Shop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-creator-start-campaign"
              onClick={() => {
                if (!currentUser?.profileCompleted) {
                  onNavigate('complete-profile');
                } else {
                  setActiveTab('start-campaign');
                }
              }}
              className={`px-3.5 py-2 rounded-[2px] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                activeTab === 'start-campaign'
                  ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0] shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#212121] border-[#D5D5D5]'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'start-campaign' ? 'text-[#FFFFFF]' : 'text-[#2874F0]'}`} />
              <span>Start a Campaign</span>
            </button>

            <button
              id="btn-creator-list-product"
              onClick={() => setActiveTab('list-product')}
              className={`px-3.5 py-2 rounded-[2px] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                activeTab === 'list-product'
                  ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0] shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#212121] border-[#D5D5D5]'
              }`}
            >
              <Store className={`w-4 h-4 ${activeTab === 'list-product' ? 'text-[#FFFFFF]' : 'text-[#388E3C]'}`} />
              <span>List a Product</span>
            </button>

            <button
              id="btn-creator-my-campaigns"
              onClick={() => setActiveTab('my-campaigns')}
              className={`px-3.5 py-2 rounded-[2px] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                activeTab === 'my-campaigns'
                  ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0] shadow-xs'
                  : 'bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#212121] border-[#D5D5D5]'
              }`}
            >
              <Layers className={`w-4 h-4 ${activeTab === 'my-campaigns' ? 'text-[#FFFFFF]' : 'text-[#388E3C]'}`} />
              <span>My Campaigns ({creatorCampaigns.length})</span>
            </button>
          </div>
        </div>

        {/* Financial Escrow Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-[#F1F3F6] rounded-[4px] border border-[#EAEAEA]">
            <div className="text-[10px] text-[#878787] uppercase tracking-wider font-bold">
              Studio Escrow Pipeline
            </div>
            <div className="text-lg font-bold text-[#212121] mt-0.5">
              {formatINR(totalEscrowPledged)}
            </div>
            <div className="text-[10px] text-[#878787] mt-0.5">
              Authorized conditional backer funds
            </div>
          </div>

          <div className="p-3 bg-[#F1F3F6] rounded-[4px] border border-[#EAEAEA]">
            <div className="text-[10px] text-[#878787] uppercase tracking-wider font-bold">
              Campaigns Over 100%
            </div>
            <div className="text-lg font-bold text-[#388E3C] mt-0.5">
              {fundedCampaignsCount} Funded
            </div>
            <div className="text-[10px] text-[#388E3C] mt-0.5 font-bold">
              Eligible for capture & settlement
            </div>
          </div>

          <div className="p-3 bg-[#F1F3F6] rounded-[4px] border border-[#EAEAEA]">
            <div className="text-[10px] text-[#878787] uppercase tracking-wider font-bold">
              Shop Graduated Items
            </div>
            <div className="text-lg font-bold text-[#212121] mt-0.5 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#388E3C]" />
              <span>{graduatedShopProductsCount} Products</span>
            </div>
            <div className="text-[10px] text-[#878787] mt-0.5">
              Live in Craftify Marketplace
            </div>
          </div>

          <div className="p-3 bg-[#F1F3F6] rounded-[4px] border border-[#EAEAEA]">
            <div className="text-[10px] text-[#878787] uppercase tracking-wider font-bold">
              Escrow Fee Architecture
            </div>
            <div className="text-sm font-bold text-[#212121] mt-0.5">
              5% Platform • 3% Proc.
            </div>
            <div className="text-[10px] text-[#388E3C] mt-0.5 font-bold">
              92% Net creator payout on success
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {formSuccessMessage && (
        <div className="mb-4 p-3 rounded-[4px] bg-[#EAF8EB] border border-[#388E3C]/20 text-[#388E3C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold">{formSuccessMessage}</span>
          </div>
          <button
            onClick={() => setFormSuccessMessage(null)}
            className="text-xs uppercase tracking-wider font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Artisan Profile Incomplete Warning Banner */}
      {!currentUser?.profileCompleted && (
        <div className="mb-4 p-4 rounded-[4px] bg-[#FFF8E1] border border-[#FFE082] text-[#212121] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FFA000] text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#E65100]">
                Action Required: Complete Your Artisan Profile
              </div>
              <p className="text-xs text-[#5D4037] mt-0.5 max-w-2xl leading-relaxed">
                To preserve authentic craft trust and ensure secure payouts, Craftify requires all artisans to submit their workshop location, craft story, and bank payout credentials before launching a campaign.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('complete-profile')}
            className="px-4 py-2 bg-[#2874F0] hover:bg-[#1259C3] text-white text-xs font-bold uppercase tracking-wider rounded-[2px] shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: MY CAMPAIGNS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'my-campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#212121]">
                My Studio Campaigns
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Observe funding meters, run settlement simulations when windows close, and graduate verified runs into permanent shop stock.
              </p>
            </div>

            <button
              onClick={() => {
                if (!currentUser?.profileCompleted) {
                  onNavigate('complete-profile');
                } else {
                  setActiveTab('start-campaign');
                }
              }}
              className="px-3.5 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch New Campaign</span>
            </button>
          </div>

          <div className="space-y-3">
            {creatorCampaigns.map((camp) => {
              const percent = Math.min(Math.round((camp.pledgedAmount / camp.goalAmount) * 100), 999);
              const isFunded = camp.pledgedAmount >= camp.goalAmount;
              const isSettled = !!camp.settlement || camp.status === 'funded' || camp.status === 'failed';
              const isUnsuccessful = camp.status === 'failed' || (camp.settlement && camp.settlement.outcome === 'unsuccessful');
              const isSettledFunded = (camp.status === 'funded' || (camp.settlement && camp.settlement.outcome === 'funded')) && !isUnsuccessful;
              const backers = backersMap[camp.id] || [];
              const isPublishedToShop = camp.isPublishedToShop || products.some((p) => p.graduatedFromCampaignId === camp.code || p.id === `prd-graduated-${camp.id}`);

              // Calculate settlement fees (5% platform, 3% processing, 92% net)
              const grossPledged = camp.pledgedAmount;
              const platformFee = Math.round(grossPledged * 0.05 * 100) / 100;
              const processingFee = Math.round(grossPledged * 0.03 * 100) / 100;
              const netPayout = Math.max(0, grossPledged - platformFee - processingFee);

              return (
                <article
                  key={camp.id}
                  id={`creator-campaign-card-${camp.id}`}
                  className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs overflow-hidden transition-all"
                >
                  {/* Card Main Row */}
                  <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4">
                    {/* Media Thumbnail */}
                    <div className="w-full lg:w-52 h-40 shrink-0 rounded-[2px] bg-[#F1F3F6] border border-[#EAEAEA] relative overflow-hidden">
                      <img
                        src={camp.imageUrl}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#212121] text-[#FFFFFF]">
                          {camp.code}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <span
                          className={`block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 text-center rounded-[2px] border ${
                            isPublishedToShop
                              ? 'bg-[#EAF8EB] text-[#388E3C] border-[#388E3C]/20'
                              : isSettledFunded
                              ? 'bg-[#EAF8EB] text-[#388E3C] border-[#388E3C]/20'
                              : isUnsuccessful
                              ? 'bg-[#FFF3EC] text-[#FB641B] border-[#FB641B]/20'
                              : 'bg-[#F1F3F6] text-[#2874F0] border-[#2874F0]/20'
                          }`}
                        >
                          {isPublishedToShop
                            ? '✓ Published to Shop'
                            : isSettledFunded
                            ? '✓ Goal Met • Settled'
                            : isUnsuccessful
                            ? '✕ Unsuccessful • Released'
                            : `• In Progress (${camp.daysLeft}d left)`}
                        </span>
                      </div>
                    </div>

                    {/* Content & Progress */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-[#878787] uppercase tracking-wider">
                            {camp.category} • Maker: {camp.creator}
                          </span>

                          {isPublishedToShop && (
                            <span className="text-xs text-[#388E3C] font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Live in Craftify Marketplace</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#212121]">
                          {camp.title}
                        </h3>
                        <p className="text-xs text-[#878787] mt-0.5 line-clamp-2">
                          {camp.shortDescription}
                        </p>
                      </div>

                      {/* Progress Bar & Ledger Metrics */}
                      <div className="space-y-1.5 bg-[#F1F3F6] p-3 rounded-[2px] border border-[#EAEAEA]">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="text-xs">
                            <span className="font-bold text-sm text-[#212121]">
                              {formatINR(camp.pledgedAmount)}
                            </span>
                            <span className="text-[#878787]"> pledged of {formatINR(camp.goalAmount)}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span
                              className={`font-bold ${
                                percent >= 100 ? 'text-[#388E3C]' : 'text-[#2874F0]'
                              }`}
                            >
                              {percent}% Funded
                            </span>
                            <span className="text-[#878787]">•</span>
                            <span className="text-[#212121] font-medium">
                              {camp.backersCount} backers
                            </span>
                            <span className="text-[#878787]">•</span>
                            <span className="text-[#212121] font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#878787]" />
                              {camp.daysLeft > 0 ? `${camp.daysLeft} days remaining` : 'Deadline passed'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-[#EAEAEA] h-2 rounded-[2px] overflow-hidden">
                          <div
                            className={`h-full rounded-[2px] transition-all duration-500 ${
                              percent >= 100 ? 'bg-[#388E3C]' : 'bg-[#2874F0]'
                            }`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Simulation & Settlement Controls Bar */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F0F0]">
                        {/* Simulation trigger buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {camp.status === 'in_progress' && (
                            <button
                              id={`btn-simulate-settlement-${camp.id}`}
                              onClick={() => onSimulateSettlement(camp.id)}
                              className="px-3 py-1.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              title="Simulate reaching the campaign deadline based on current pledged amount"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Simulate: Fast-forward to deadline</span>
                            </button>
                          )}

                          {/* Quick test overrides to test both outcomes on any campaign */}
                          <button
                            onClick={() => onSimulateSettlement(camp.id, 'funded')}
                            className="px-2 py-1 rounded-[2px] border border-[#388E3C]/30 hover:border-[#388E3C] bg-[#EAF8EB] hover:bg-[#D4EED6] text-[#388E3C] text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                            title="Simulate deadline reached as successfully funded (>= 100%)"
                          >
                            Simulate Funded
                          </button>

                          <button
                            onClick={() => onSimulateSettlement(camp.id, 'unsuccessful')}
                            className="px-2 py-1 rounded-[2px] border border-[#FB641B]/30 hover:border-[#FB641B] bg-[#FFF3EC] hover:bg-[#FFE6D9] text-[#FB641B] text-[11px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                            title="Simulate deadline reached as unsuccessful (< 100%)"
                          >
                            Simulate Unsuccessful
                          </button>

                          {camp.status !== 'in_progress' && (
                            <button
                              onClick={() => onSimulateSettlement(camp.id, 'reset')}
                              className="px-2 py-1 rounded-[2px] border border-[#D5D5D5] hover:border-[#878787] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#666666] text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                              title="Reset campaign back to previous state"
                            >
                              Reset to Previous State
                            </button>
                          )}
                        </div>

                        {/* Secondary View Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setShowBackersForId(showBackersForId === camp.id ? null : camp.id)}
                            className="px-2.5 py-1 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] bg-[#FFFFFF] text-xs uppercase tracking-wider text-[#212121] flex items-center gap-1 cursor-pointer transition-colors font-bold"
                          >
                            <Users className="w-3.5 h-3.5 text-[#878787]" />
                            <span>{showBackersForId === camp.id ? 'Hide Backers' : `Backers (${backers.length})`}</span>
                          </button>

                          <button
                            onClick={() => onOpenCampaignDetail(camp)}
                            className="px-2.5 py-1 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] bg-[#FFFFFF] text-xs uppercase tracking-wider text-[#212121] flex items-center gap-1 cursor-pointer transition-colors font-bold"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#878787]" />
                            <span>Public Page</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Campaign Pending Settlement Notice */}
                      {camp.status === 'in_progress' && (
                        <div className="p-3 bg-[#FFF8E1] border border-[#B78103]/30 rounded-[2px] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-2 text-[#B78103]">
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>
                              <strong>Payout Pending Settlement:</strong> Authorized holds remain in escrow. Payout will be disbursed only if funding goal is reached by {formatDeadlineDate(camp.deadline, camp.daysLeft)}.
                            </span>
                          </div>
                          <span className="font-bold text-[#B78103] uppercase text-[10px] tracking-wider px-2 py-0.5 bg-[#FFFFFF] rounded-[2px] border border-[#B78103]/30 shrink-0 self-start sm:self-auto">
                            Pending Settlement
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* SETTLEMENT RESULT BREAKDOWN BANNER & SHOP PUBLISHING */}
                  {/* ========================================================= */}
                  {(camp.settlement || camp.status === 'funded' || camp.status === 'failed') && (
                    <div
                      id={`settlement-panel-${camp.id}`}
                      className={`p-4 sm:p-5 border-t ${
                        camp.status === 'funded' || (camp.settlement && camp.settlement.outcome === 'funded')
                          ? 'bg-[#EAF8EB] border-[#388E3C]/20'
                          : 'bg-[#FFF3EC] border-[#FB641B]/20'
                      }`}
                    >
                      {camp.status === 'funded' || (camp.settlement && camp.settlement.outcome === 'funded') ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-[#388E3C]" />
                              <h4 className="text-base sm:text-lg font-bold text-[#388E3C]">
                                Campaign funded! Threshold Met & Pre-Authorizations Captured
                              </h4>
                            </div>

                            <span className="text-[11px] font-bold px-2 py-0.5 bg-[#388E3C] text-[#FFFFFF] rounded-[2px] uppercase tracking-wider">
                              Escrow Settled: {camp.settlement?.settledAt || 'Completed'}
                            </span>
                          </div>

                          <p className="text-xs text-[#212121] leading-relaxed">
                            All {camp.backersCount} patron pre-authorizations have been successfully transitioned from <span className="font-bold uppercase text-[#2874F0]">authorized</span> to <span className="font-bold uppercase text-[#388E3C]">captured</span>. Funds are debited directly from backer credit lines through the Craftify Escrow Vault.
                          </p>

                          {/* FINANCIAL PAYOUT BREAKDOWN TABLE */}
                          <div className="bg-[#FFFFFF] border border-[#388E3C]/30 rounded-[4px] p-3.5 text-xs space-y-2">
                            <div className="font-bold text-xs uppercase tracking-wider text-[#212121] border-b border-[#EAEAEA] pb-1.5 flex justify-between">
                              <span>Escrow Settlement Payout Statement</span>
                              <span>Ratio</span>
                            </div>

                            <div className="flex justify-between py-1 text-[#212121]">
                              <span>Gross Backer Pledges Captured:</span>
                              <span className="font-bold">{formatINR(camp.settlement?.grossPledged ?? grossPledged)} (100.0%)</span>
                            </div>

                            <div className="flex justify-between py-1 text-[#FB641B]">
                              <span>Craftify Platform Fee (5%):</span>
                              <span className="font-bold">-{formatINR(camp.settlement?.platformFee ?? platformFee)} (5.0%)</span>
                            </div>

                            <div className="flex justify-between py-1 text-[#FB641B]">
                              <span>Payment Processing & Escrow UPI/NEFT Fee (3%):</span>
                              <span className="font-bold">-{formatINR(camp.settlement?.processingFee ?? processingFee)} (3.0%)</span>
                            </div>

                            <div className="flex justify-between py-2 border-t border-[#388E3C]/30 text-[#388E3C] text-sm font-bold bg-[#EAF8EB] rounded-[2px] px-2.5">
                              <span>Net Payout to Artisan:</span>
                              <span>{formatINR(camp.settlement?.netPayout ?? netPayout)} (92.0%)</span>
                            </div>

                            <div className="text-[11px] text-[#878787] pt-1 italic">
                              * Payout disbursed via Escrow NEFT/UPI directly to verified artisan banking credentials. Backer fulfillment window is now initiated.
                            </div>
                          </div>

                          {/* PUBLISH TO SHOP CALL-TO-ACTION */}
                          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA]">
                            <div>
                              <div className="font-bold text-sm text-[#212121]">
                                Graduate this Campaign into the Craftify Shop
                              </div>
                              <p className="text-xs text-[#878787] mt-0.5">
                                Add this item permanently to the marketplace retail catalog with the verified "Funded on Craftify" badge.
                              </p>
                            </div>

                            {isPublishedToShop ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#388E3C] bg-[#EAF8EB] border border-[#388E3C]/30 rounded-[2px] px-3 py-1.5 flex items-center gap-1.5">
                                  <Check className="w-4 h-4" />
                                  <span>Published to Shop</span>
                                </span>
                                <button
                                  onClick={() => onNavigate('shop')}
                                  className="px-3 py-1.5 rounded-[2px] bg-[#212121] hover:bg-[#333333] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Store className="w-3.5 h-3.5 text-[#388E3C]" />
                                  <span>View in Shop →</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`btn-publish-to-shop-${camp.id}`}
                                onClick={() => onPublishToShop(camp)}
                                className="px-4 py-2 rounded-[2px] bg-[#388E3C] hover:bg-[#2E7D32] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
                                <span>Publish to Shop</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* UNSUCCESSFUL SETTLEMENT OUTCOME */
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-[#FB641B]" />
                            <h4 className="text-base sm:text-lg font-bold text-[#FB641B]">
                              Campaign unsuccessful • Escrow Covenant Enforced
                            </h4>
                          </div>

                          <div className="p-3.5 bg-[#FFFFFF] border border-[#FB641B]/30 rounded-[4px] text-xs text-[#212121] space-y-2">
                            <p className="leading-relaxed">
                              Funding goal was not met before the campaign deadline ({formatINR(camp.pledgedAmount)} pledged of {formatINR(camp.goalAmount)} goal).
                            </p>
                            <div className="p-2.5 rounded-[2px] bg-[#FFF3EC] border border-[#FB641B]/20 font-bold text-[#FB641B]">
                              All backer statuses have been switched to <span className="underline uppercase">released</span>. In strict accordance with the Craftify Escrow Covenant, zero backers were charged (₹0 collected, Net Payout: ₹0). All pre-authorization card/UPI holds have been automatically voided.
                            </div>
                            <p className="text-[11px] text-[#878787]">
                              No platform fees or processing fees have been assessed. Net payout to artisan: ₹0. The creator retains 100% of intellectual property and may re-issue an amended campaign run at any time.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* EXPANDABLE BACKERS ESCROW ROSTER */}
                  {/* ========================================================= */}
                  {showBackersForId === camp.id && (
                    <div className="p-4 sm:p-5 bg-[#F1F3F6] border-t border-[#EAEAEA] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#212121]" />
                          <h4 className="text-sm font-bold text-[#212121]">
                            Enrolled Backers Escrow Roster ({backers.length} Patrons)
                          </h4>
                        </div>
                        <span className="text-xs text-[#878787]">
                          Live Authorization Ledger
                        </span>
                      </div>

                      {backers.length === 0 ? (
                        <div className="p-4 text-center bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] text-xs text-[#878787]">
                          No backers enrolled yet for this campaign run.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-[#EAEAEA] rounded-[4px] bg-[#FFFFFF]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F1F3F6] text-[#878787] border-b border-[#EAEAEA] uppercase tracking-wider text-[10px] font-bold">
                              <tr>
                                <th className="p-3">Backer Name</th>
                                <th className="p-3">Reward Tier</th>
                                <th className="p-3">Pledge Amount</th>
                                <th className="p-3">Authorized Date</th>
                                <th className="p-3">Escrow Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EAEAEA]">
                              {backers.map((b) => (
                                <tr key={b.id} className="hover:bg-[#F9F9F9]">
                                  <td className="p-3 font-bold text-[#212121]">{b.name}</td>
                                  <td className="p-3 text-[#878787]">{b.tierTitle}</td>
                                  <td className="p-3 font-bold text-[#212121]">{formatINR(b.amount)}</td>
                                  <td className="p-3 text-[#878787]">{b.date}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 text-[10px] rounded-[2px] uppercase tracking-wider font-bold border ${
                                        b.status === 'captured'
                                          ? 'bg-[#EAF8EB] text-[#388E3C] border-[#388E3C]/30'
                                          : b.status === 'released'
                                          ? 'bg-[#FDEAEA] text-[#D32F2F] border-[#D32F2F]/30'
                                          : 'bg-[#FFF8E1] text-[#B78103] border-[#B78103]/30'
                                      }`}
                                    >
                                      {b.status === 'captured'
                                        ? '✓ Captured'
                                        : b.status === 'released'
                                        ? '✕ Released (₹0 charged)'
                                        : '• Authorized'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: START A CAMPAIGN FORM */}
      {/* ========================================================================= */}
      {activeTab === 'start-campaign' && (
        !currentUser?.profileCompleted ? (
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-[#FFF3E0] text-[#E65100] flex items-center justify-center mx-auto mb-4 border border-[#FFE0B2]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#212121] mb-2">Artisan Profile Onboarding Required</h3>
            <p className="text-xs sm:text-sm text-[#878787] max-w-md mx-auto mb-6 leading-relaxed">
              Before creating campaigns, Craftify artisan policy requires you to complete your artisan profile (workshop details, craft heritage narrative, and bank payout credentials).
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('my-campaigns')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#212121] border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] hover:bg-[#F1F3F6] cursor-pointer"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => onNavigate('complete-profile')}
                className="px-6 py-2 bg-[#2874F0] hover:bg-[#1259C3] text-white text-xs font-bold uppercase tracking-wider rounded-[2px] cursor-pointer shadow-xs"
              >
                Complete Profile Now →
              </button>
            </div>
          </div>
        ) : (
          <div id="creator-start-campaign-form-card" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAEAEA] pb-3">
            <div>
              <h2 className="text-xl font-bold text-[#212121]">
                Start a Crowdfunding Campaign
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Issue a new production run into the Craftify conditional escrow registry.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFillDemoCampaign}
              className="px-3 py-1.5 rounded-[2px] border border-[#2874F0]/30 hover:border-[#2874F0] bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Example Data (Quick Test)</span>
            </button>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 rounded-[4px] bg-[#FFF3EC] border border-[#FB641B]/30 text-[#FB641B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCampaign} className="space-y-4">
            {/* Step 1: Core Campaign Info */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  1. Product & Campaign Specifications
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  Clear, honest documentation of your hardware or design object.
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Campaign Title / Product Name *
                </label>
                <SmartInput
                  id="campaign-form-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onValueChange={(val) => setFormTitle(val)}
                  placeholder="e.g. The Continuous-Feed Titanium Drafting Pencil"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>

              {/* Category & Creator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Category *
                  </label>
                  <select
                    id="campaign-form-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  >
                    <option value="Design & Tools">Design & Tools</option>
                    <option value="Culinary Hardware">Culinary Hardware</option>
                    <option value="Audio & Acoustics">Audio & Acoustics</option>
                    <option value="Timepieces">Timepieces</option>
                    <option value="Carry & Bags">Carry & Bags</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Ceramic & Stoneware">Ceramic & Stoneware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Creator Name / Studio
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={creatorName}
                    className="w-full px-3 py-2 bg-[#F1F3F6] border border-[#EAEAEA] rounded-[2px] text-xs text-[#878787] cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#878787] mt-1 block">
                    Verified creator profile
                  </span>
                </div>
              </div>

              {/* AI Description Writer */}
              <div className="pt-1">
                <AIDescriptionWriter
                  craftType={aiCraftType}
                  setCraftType={setAiCraftType}
                  material={aiMaterial}
                  setMaterial={setAiMaterial}
                  region={aiRegion}
                  setRegion={setAiRegion}
                  keywords={aiKeywords}
                  setKeywords={setAiKeywords}
                  currentDraftText={formDescription || formFullStory}
                  onDescriptionGenerated={(desc) => {
                    setFormDescription(desc);
                    if (!formFullStory) {
                      setFormFullStory(desc);
                    }
                  }}
                  targetFieldName="campaign description"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Summary Description *
                </label>
                <SmartTextarea
                  id="campaign-form-description"
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  onValueChange={(val) => setFormDescription(val)}
                  placeholder="One or two sentences explaining what is being made, the materials used, and why it endures."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>

              {/* Detailed Story (Optional) */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Detailed Manufacturing & Design Story
                </label>
                <SmartTextarea
                  id="campaign-form-story"
                  rows={4}
                  value={formFullStory}
                  onChange={(e) => setFormFullStory(e.target.value)}
                  onValueChange={(val) => setFormFullStory(val)}
                  placeholder="Explain your prototyping journey, CNC or foundry tolerances, and how backer capital will be allocated."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>
            </div>

            {/* Step 2: Funding Goal & Deadline */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  2. Funding Goal & Deadline Window
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  All funds are held in conditional escrow. If this threshold is not met by the deadline, no backers are charged.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Funding Goal */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Funding Goal (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="text-sm font-bold text-[#878787] absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      id="campaign-form-goal"
                      type="number"
                      required
                      min={10000}
                      step={5000}
                      value={formGoalAmount}
                      onChange={(e) => setFormGoalAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-sm font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div className="text-[11px] text-[#878787] mt-1 flex justify-between">
                    <span>Minimum threshold: ₹10,000</span>
                    <span className="text-[#388E3C] font-bold">Net payout (92%): {formatINR(Math.round(formGoalAmount * 0.92))}</span>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Campaign Deadline Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="campaign-form-deadline"
                      type="date"
                      required
                      value={formDeadlineDate}
                      onChange={(e) => handleDeadlineDateChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <span className="text-[11px] text-[#388E3C] font-bold mt-1 block">
                    Duration: {formDeadlineDays} days from today
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Campaign Imagery & Photography */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  3. Imagery & Craft Photography
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  High-fidelity workshop photography uploaded directly to Cloudinary.
                </p>
              </div>

              {/* Cloudinary Dropzone Component */}
              <ImageUploadDropzone
                id="campaign-cloudinary-dropzone"
                label="Cover Image"
                sublabel="Click or drag to upload cover image. Supported formats: JPG, PNG, WEBP up to 5MB."
                value={formImageUrl}
                onChange={(url) => {
                  setFormImageUrl(url);
                  setFormImageWarning(null);
                }}
                supportGallery={true}
                galleryValues={formGalleryImages}
                onGalleryChange={setFormGalleryImages}
                warningMessage={formImageWarning}
                onClearWarning={() => setFormImageWarning(null)}
              />

              {/* Verified Studio Presets as an Alternative */}
              <div className="pt-2 border-t border-[#F0F0F0] space-y-2">
                <div className="text-xs uppercase tracking-wider font-bold text-[#212121]">
                  Or Pick a Verified Studio Preset:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PRESET_WORKSHOP_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => {
                        setFormImageUrl(img.url);
                        setFormImageWarning(null);
                      }}
                      className={`relative aspect-square rounded-[2px] border-2 overflow-hidden transition-all text-left cursor-pointer ${
                        formImageUrl === img.url
                          ? 'border-[#2874F0] ring-2 ring-[#2874F0]/40'
                          : 'border-[#EAEAEA] hover:border-[#212121]'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-[#212121]/80 p-1 text-[9px] text-[#FFFFFF] truncate font-bold">
                        {img.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Pledge Tier Builder (Add / Remove Tiers) */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2.5">
                <div>
                  <h3 className="text-base font-bold text-[#212121]">
                    4. Pledge Tier Builder
                  </h3>
                  <p className="text-xs text-[#878787] mt-0.5">
                    Structure early bird and production reward tiers. Add or remove tiers dynamically.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-add-pledge-tier"
                  onClick={handleAddTier}
                  className="px-3 py-1.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Reward Tier</span>
                </button>
              </div>

              {/* List of Tiers */}
              <div className="space-y-3">
                {formTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    id={`tier-builder-item-${idx}`}
                    className="p-4 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#2874F0] text-[#FFFFFF] font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#212121]">
                          Reward Tier #{idx + 1}
                        </span>
                      </div>

                      {formTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(tier.id)}
                          className="text-[#FB641B] hover:text-[#E85D19] text-xs flex items-center gap-1 uppercase tracking-wider cursor-pointer font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Tier Title *
                        </label>
                        <SmartInput
                          type="text"
                          required
                          value={tier.title}
                          onChange={(e) => handleUpdateTier(tier.id, 'title', e.target.value)}
                          onValueChange={(val) => handleUpdateTier(tier.id, 'title', val)}
                          placeholder="e.g. Early Bird Serialized Run"
                          className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Pledge Amount (₹) *
                        </label>
                        <div className="relative">
                          <span className="text-xs font-bold text-[#878787] absolute left-2.5 top-1/2 -translate-y-1/2">₹</span>
                          <input
                            type="number"
                            required
                            min={100}
                            step={50}
                            value={tier.pledgeAmount}
                            onChange={(e) => handleUpdateTier(tier.id, 'pledgeAmount', Number(e.target.value))}
                            className="w-full pl-6 pr-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                        Reward Description *
                      </label>
                      <SmartTextarea
                        rows={2}
                        required
                        value={tier.description}
                        onChange={(e) => handleUpdateTier(tier.id, 'description', e.target.value)}
                        onValueChange={(val) => handleUpdateTier(tier.id, 'description', val)}
                        placeholder="Detail what is included in this backer package, finish variations, and serialization."
                        className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>

                    {/* AI Fair Price Suggester for Reward Tier */}
                    <AIPriceSuggester
                      craftType={aiCraftType || formCategory}
                      region={aiRegion || 'India'}
                      onApplyPrice={(suggestedPrice) => handleUpdateTier(tier.id, 'pledgeAmount', suggestedPrice)}
                      defaultMaterialCost={Math.round(tier.pledgeAmount * 0.35)}
                      defaultHoursSpent={6}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Estimated Backer Delivery
                        </label>
                        <SmartInput
                          type="text"
                          value={tier.estimatedDelivery}
                          onChange={(e) => handleUpdateTier(tier.id, 'estimatedDelivery', e.target.value)}
                          onValueChange={(val) => handleUpdateTier(tier.id, 'estimatedDelivery', val)}
                          placeholder="e.g. Dec 2026"
                          className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Patron Limit / Max Backers (Optional)
                        </label>
                        <input
                          type="number"
                          value={tier.maxBackers || ''}
                          onChange={(e) => handleUpdateTier(tier.id, 'maxBackers', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 150 (Leave blank for unlimited)"
                          className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#172337] rounded-[4px] text-[#FFFFFF]">
              <div className="text-xs space-y-0.5">
                <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#FFE500]">
                  <ShieldCheck className="w-4 h-4 text-[#388E3C]" />
                  Craftify Escrow Covenant Enforced
                </div>
                <div className="text-[#878787]">
                  Pre-authorizations are captured only upon reaching 100% threshold. Zero risk to backers.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-campaigns')}
                  className="px-3.5 py-2 rounded-[2px] border border-[#D5D5D5]/30 hover:border-[#D5D5D5] text-xs uppercase tracking-wider font-bold text-[#FFFFFF] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="btn-submit-campaign-form"
                  type="submit"
                  className="px-5 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Submit for Admin Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
        )
      )}

      {/* TAB: LIST A PRODUCT (DIRECT TO SHOP) */}
      {activeTab === 'list-product' && (
        <div id="creator-list-product-container" className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#388E3C] bg-[#EAF8EB] px-2 py-0.5 rounded-[2px] flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-[#388E3C]" />
                    <span>Craftify Marketplace Direct</span>
                  </span>
                  <span className="text-xs text-[#878787]">• Master Artisan Retail</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  List Handcrafted Piece in Craftify Shop
                </h2>
                <p className="text-xs sm:text-sm text-[#878787] mt-1 max-w-2xl leading-relaxed">
                  Directly list in-stock artisan creations in the permanent marketplace with fair trade pricing and authentic storytelling.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setProdTitle('Varanasi Handloom Brocade Silk Stole');
                  setProdCategory('Handloom Textiles');
                  setProdAiCraftType('Banarasi Kadhwa Silk Weaving');
                  setProdAiMaterial('Katan silk & gold metallic zari');
                  setProdAiRegion('Varanasi, Uttar Pradesh');
                  setProdAiKeywords('handloom kadhwa technique, peacock motifs, certified GI');
                  setProdPrice(3200);
                  setProdStock(15);
                  setProdDescription('Generational Banarasi handloom stole hand-woven using the intricate Kadhwa technique on traditional pit looms in Varanasi. Features pure Katan silk interwoven with fine metallic zari depicting heritage peacock and floral creepers.');
                }}
                className="px-3 py-1.5 rounded-[2px] bg-[#F1F3F6] hover:bg-[#EAEAEA] text-[#2874F0] border border-[#2874F0]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo Artisan Piece</span>
              </button>
            </div>
          </div>

          {prodSuccess && (
            <div
              id="product-form-success-banner"
              className="p-4 rounded-[4px] bg-[#EAF8EB] border border-[#388E3C]/30 text-[#388E3C] text-xs font-bold flex items-center justify-between gap-3 animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{prodSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-3 py-1 rounded-[2px] bg-[#388E3C] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider hover:bg-[#2E7D32] cursor-pointer"
              >
                View in Shop
              </button>
            </div>
          )}

          {prodError && (
            <div
              id="product-form-error-banner"
              className="p-3.5 rounded-[4px] bg-[#FFF3EC] border border-[#FB641B]/30 text-[#FB641B] text-xs flex items-center gap-2 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{prodError}</span>
            </div>
          )}

          {/* Product Listing Form */}
          <form onSubmit={handleProductFormSubmit} className="space-y-6">
            {/* Step 1: Identity & Description */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  1. Product Identity & Craft Heritage
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  Define the craft provenance, materials, and authentic narrative for conscious buyers.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Product Name / Title *
                </label>
                <SmartInput
                  id="product-form-title"
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  onValueChange={(val) => setProdTitle(val)}
                  placeholder="e.g. Handcrafted Khurja Ceramic Fluted Planter"
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] focus:outline-none focus:border-[#2874F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Category *
                  </label>
                  <select
                    id="product-form-category"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  >
                    <option value="Handloom Textiles">Handloom Textiles</option>
                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                    <option value="Metal Craft & Bidri">Metal Craft & Bidri</option>
                    <option value="Woodcraft">Woodcraft</option>
                    <option value="Heritage Decor">Heritage Decor</option>
                    <option value="Design & Tools">Design & Tools</option>
                    <option value="Culinary Hardware">Culinary Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Artisan Collective / Studio
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={creatorName}
                    className="w-full px-3 py-2 bg-[#F1F3F6] border border-[#EAEAEA] rounded-[2px] text-xs text-[#878787] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* AI Description Writer next to / above description field */}
              <div className="pt-1">
                <AIDescriptionWriter
                  craftType={prodAiCraftType}
                  setCraftType={setProdAiCraftType}
                  material={prodAiMaterial}
                  setMaterial={setProdAiMaterial}
                  region={prodAiRegion}
                  setRegion={setProdAiRegion}
                  keywords={prodAiKeywords}
                  setKeywords={setProdAiKeywords}
                  currentDraftText={prodDescription}
                  onDescriptionGenerated={(desc) => setProdDescription(desc)}
                  targetFieldName="product description"
                />
              </div>

              {/* Product Description Field */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Product Description *
                </label>
                <SmartTextarea
                  id="product-form-description"
                  required
                  rows={4}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  onValueChange={(val) => setProdDescription(val)}
                  placeholder="Detailed product story highlighting technique, durability, and craftsmanship..."
                  className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0] leading-relaxed"
                />
              </div>
            </div>

            {/* Step 2: Pricing & Fair Wage Calculator */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  2. Pricing & Artisan Living Wage Valuation
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  Set sustainable retail pricing honoring material expenses and artisan hours.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Retail Price (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="text-sm font-bold text-[#878787] absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                    <input
                      id="product-form-price"
                      type="number"
                      required
                      min={100}
                      step={50}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-sm font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div className="text-[11px] text-[#878787] mt-1 flex justify-between">
                    <span>Fair trade retail price</span>
                    <span className="text-[#388E3C] font-bold">Artisan payout (92%): {formatINR(Math.round(prodPrice * 0.92))}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Stock Units Available *
                  </label>
                  <input
                    id="product-form-stock"
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] text-sm font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                  <span className="text-[11px] text-[#878787] mt-1 block">
                    Immediate inventory ready in workshop
                  </span>
                </div>
              </div>

              {/* AI Fair Price Suggester near price field */}
              <div id="suggest-a-fair-price-section" data-testid="suggest-a-fair-price-section">
                <AIPriceSuggester
                  craftType={prodAiCraftType || prodCategory}
                  region={prodAiRegion || 'India'}
                  onApplyPrice={(suggestedPrice) => setProdPrice(suggestedPrice)}
                  defaultMaterialCost={Math.round(prodPrice * 0.35)}
                  defaultHoursSpent={6}
                />
              </div>
            </div>

            {/* Step 3: Product Photography */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-6 space-y-4">
              <div className="border-b border-[#F0F0F0] pb-2.5">
                <h3 className="text-base font-bold text-[#212121]">
                  3. Product Visuals
                </h3>
                <p className="text-xs text-[#878787] mt-0.5">
                  Upload high-resolution photography to Cloudinary or pick a studio preset.
                </p>
              </div>

              {/* Cloudinary Dropzone Component */}
              <ImageUploadDropzone
                id="product-cloudinary-dropzone"
                label="Product Visuals"
                sublabel="Click or drag to upload product image. Supported formats: JPG, PNG, WEBP up to 5MB."
                value={prodImageUrl}
                onChange={(url) => {
                  setProdImageUrl(url);
                  setProdImageWarning(null);
                }}
                supportGallery={true}
                galleryValues={prodGalleryImages}
                onGalleryChange={setProdGalleryImages}
                warningMessage={prodImageWarning}
                onClearWarning={() => setProdImageWarning(null)}
              />

              {/* Verified Studio Presets as an Alternative */}
              <div className="pt-2 border-t border-[#F0F0F0] space-y-2">
                <div className="text-xs uppercase tracking-wider font-bold text-[#212121]">
                  Or Pick a Verified Studio Preset:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PRESET_WORKSHOP_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      type="button"
                      onClick={() => {
                        setProdImageUrl(img.url);
                        setProdImageWarning(null);
                      }}
                      className={`relative aspect-square rounded-[2px] border-2 overflow-hidden transition-all text-left cursor-pointer ${
                        prodImageUrl === img.url
                          ? 'border-[#2874F0] ring-2 ring-[#2874F0]/40'
                          : 'border-[#EAEAEA] hover:border-[#212121]'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-[#212121]/80 p-1 text-[9px] text-[#FFFFFF] truncate font-bold">
                        {img.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#172337] rounded-[4px] text-[#FFFFFF]">
              <div className="text-xs space-y-0.5">
                <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#388E3C]">
                  <ShieldCheck className="w-4 h-4 text-[#388E3C]" />
                  Verified Master Artisan Listing
                </div>
                <div className="text-[#878787]">
                  Instant marketplace publishing • Handcrafted batch protection guaranteed
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('my-campaigns')}
                  className="px-3.5 py-2 rounded-[2px] border border-[#D5D5D5]/30 hover:border-[#D5D5D5] text-xs uppercase tracking-wider font-bold text-[#FFFFFF] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="btn-submit-product-form"
                  type="submit"
                  className="px-5 py-2 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>Publish Product to Shop</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
