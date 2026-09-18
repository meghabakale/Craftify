import React, { useState } from 'react';
import { Campaign, RewardTier } from '../types';
import { SmartInput } from './common/SmartInput';
import { SmartTextarea } from './common/SmartTextarea';
import { formatINR } from '../utils/format';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  AlertCircle,
  Award,
  CheckCircle2,
  ShoppingBag,
  FileText,
  DollarSign,
  Tag,
  Eye,
} from 'lucide-react';
import { AIDescriptionWriter } from './ai/AIDescriptionWriter';
import { AIPriceSuggester } from './ai/AIPriceSuggester';
import { PRESET_CRAFT_IMAGES } from '../data/artisanAssets';
import { ImageUploadDropzone } from './common/ImageUploadDropzone';

interface CreateCampaignFormProps {
  onCancel: () => void;
  onCampaignCreated: (newCampaign: Campaign) => void;
  defaultCreatorName?: string;
}

const PRESET_INDIAN_CRAFT_IMAGES = PRESET_CRAFT_IMAGES;

export const CreateCampaignForm: React.FC<CreateCampaignFormProps> = ({
  onCancel,
  onCampaignCreated,
  defaultCreatorName = 'Varanasi Heritage Guild',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Basics & Imagery
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('Pottery & Ceramics');
  const [creator, setCreator] = useState(defaultCreatorName);
  const [creatorLocation, setCreatorLocation] = useState('Khurja, Uttar Pradesh');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [imageNudgeShown, setImageNudgeShown] = useState<boolean>(false);

  // Step 2: Story & Specifications
  const [fullStory, setFullStory] = useState(
    'Handcrafted by generational master artisans using natural local clay, mineral pigments, and high-temperature kiln firing. Every piece requires over 14 days of careful molding, sun-drying, glaze application, and inspection to guarantee lifelong durability and authentic artisanal character.'
  );
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>([
    { label: 'Craft Technique', value: 'High-fire Studio Glazed Terracotta' },
    { label: 'Material & Origin', value: 'Natural Indo-Gangetic River Clay & Food-safe Mineral Glaze' },
    { label: 'Dimensions', value: '26cm Height × 16cm Diameter' },
    { label: 'Artisan Workshop', value: 'Khurja Heritage Guild, Uttar Pradesh, India' },
  ]);

  // Step 3: Funding & Duration (INR Currency)
  const [goalAmount, setGoalAmount] = useState<number>(150000);
  const [daysLeft, setDaysLeft] = useState<number>(30);
  const [agreedToEscrow, setAgreedToEscrow] = useState<boolean>(true);

  // Step 4: Reward Tiers
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([
    {
      id: 'tier-init-1',
      title: 'Early Bird Artisan Batch',
      pledgeAmount: 1499,
      description: 'First production run piece with numbered authenticity seal, artisan signature card, and secure foam packing.',
      estimatedDelivery: 'Nov 2026',
      itemsIncluded: ['1x Handcrafted Studio Creation', 'Certificate of Origin & GI Authenticity', 'Care Guide'],
      backersCount: 0,
      maxBackers: 150,
    },
    {
      id: 'tier-init-2',
      title: 'Collector Master Set (Pair)',
      pledgeAmount: 2799,
      description: 'Two matched studio creations with custom monogram inscription and studio dispatch notes.',
      estimatedDelivery: 'Dec 2026',
      itemsIncluded: ['2x Matched Studio Pieces', 'Handmade Recycled Box', 'Direct Artisan Note'],
      backersCount: 0,
      maxBackers: 75,
    },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  // AI Tools State
  const [aiCraftType, setAiCraftType] = useState('High-fire Glazed Terracotta Pottery');
  const [aiMaterial, setAiMaterial] = useState('Natural Gangetic River Clay & Food-safe Mineral Slips');
  const [aiRegion, setAiRegion] = useState('Khurja, Uttar Pradesh');
  const [aiKeywords, setAiKeywords] = useState('kiln-fired, cobalt glaze, generational guild');

  const handleFillDemoData = () => {
    setTitle('Khurja Imperial Cobalt Blue Fluted Vase');
    setShortDescription('Generational high-fired glazed ceramic crafted in Khurja potteries with lead-free mineral slips and traditional kiln firing.');
    setCategory('Pottery & Ceramics');
    setCreator('Khurja Master Potters Guild');
    setCreatorLocation('Khurja, Uttar Pradesh');
    setImageUrl(PRESET_INDIAN_CRAFT_IMAGES[0].url);
    setGoalAmount(185000);
    setDaysLeft(30);
    setAgreedToEscrow(true);
    setFormError(null);
  };

  const validateCurrentStep = (): boolean => {
    setFormError(null);
    if (currentStep === 1) {
      if (!title.trim()) {
        setFormError('Please enter a product / campaign title.');
        return false;
      }
      if (!shortDescription.trim()) {
        setFormError('Please provide a concise product pitch.');
        return false;
      }
      if (!imageUrl.trim()) {
        if (!imageNudgeShown) {
          setImageWarning('Add a cover image so backers can see your work');
          setImageNudgeShown(true);
          return false;
        }
      }
    } else if (currentStep === 2) {
      if (!fullStory.trim() || fullStory.length < 30) {
        setFormError('Please write a detailed story (at least 30 characters) explaining your artisan process.');
        return false;
      }
    } else if (currentStep === 3) {
      if (goalAmount < 10000) {
        setFormError('Funding goal must be at least ₹10,000 to cover minimum artisan production batches.');
        return false;
      }
      if (!agreedToEscrow) {
        setFormError('You must accept the Craftify Escrow Covenant to proceed.');
        return false;
      }
    } else if (currentStep === 4) {
      if (rewardTiers.length === 0) {
        setFormError('Please provide at least one reward tier for backers to pledge.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSpecRow = () => {
    setSpecs([...specs, { label: 'Specification', value: 'Details' }]);
  };

  const handleUpdateSpec = (index: number, field: 'label' | 'value', text: string) => {
    const updated = [...specs];
    updated[index][field] = text;
    setSpecs(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleAddTier = () => {
    const newTier: RewardTier = {
      id: `tier-${Date.now()}`,
      title: 'Artisan Patron Tier',
      pledgeAmount: 1999,
      description: 'Exclusive batch edition with hand-numbered certificate and studio documentation.',
      estimatedDelivery: 'Dec 2026',
      itemsIncluded: ['1x Handcrafted Creation', 'Patron Authenticity Card'],
      backersCount: 0,
      maxBackers: 50,
    };
    setRewardTiers([...rewardTiers, newTier]);
  };

  const handleUpdateTier = (index: number, field: keyof RewardTier, value: any) => {
    const updated = [...rewardTiers];
    updated[index] = { ...updated[index], [field]: value };
    setRewardTiers(updated);
  };

  const handleRemoveTier = (index: number) => {
    if (rewardTiers.length <= 1) {
      setFormError('Campaigns must have at least one reward tier.');
      return;
    }
    setRewardTiers(rewardTiers.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    if (!validateCurrentStep()) return;

    const finalImageUrl = imageUrl.trim() || PRESET_INDIAN_CRAFT_IMAGES[0].url;
    const finalGalleryImages = galleryImages.length > 0 ? [finalImageUrl, ...galleryImages] : [finalImageUrl];

    const newCampaign: Campaign = {
      id: `cmp-${Date.now().toString().slice(-6)}`,
      code: `CMP-${Math.floor(108 + Math.random() * 890)}`,
      title,
      creator: creator || defaultCreatorName,
      creatorBio: `${creator} is an artisan collective based in ${creatorLocation}, dedicated to preserving timeless Indian craftsmanship and sustainable handmade techniques.`,
      creatorLocation,
      category,
      shortDescription,
      fullStory,
      goalAmount,
      pledgedAmount: 0,
      backersCount: 0,
      daysLeft,
      status: 'pending_review',
      isApproved: false,
      imageUrl: finalImageUrl,
      galleryImages: finalGalleryImages,
      specs,
      timeline: [
        { phase: 'Material Sourcing & Clay Prep', date: 'Oct 2026', description: 'Procuring GI-certified materials and preparing master molds.' },
        { phase: 'Escrow Funding Window', date: 'Nov 2026', description: 'Conditional backer authorization via Craftify Escrow.' },
        { phase: 'Kiln Firing & Hand-painting', date: 'Dec 2026', description: 'Artisan hand-glazing and precision batch firing.' },
        { phase: 'Dispatch to Backers', date: 'Jan 2027', description: 'Zero-breakage secure courier dispatch with tracking.' },
        { phase: 'Craftify Shop Graduation', date: 'Feb 2027', description: 'Permanent listing in Craftify Marketplace.' },
      ],
      rewardTiers,
    };

    onCampaignCreated(newCampaign);
  };

  const stepMeta = [
    { num: 1, title: 'Basics & Media', icon: Tag },
    { num: 2, title: 'Story & Specs', icon: FileText },
    { num: 3, title: 'Funding & Window', icon: DollarSign },
    { num: 4, title: 'Reward Tiers', icon: Layers },
    { num: 5, title: 'Review & Launch', icon: Eye },
  ];

  return (
    <div id="create-campaign-form-container" className="min-h-screen bg-[#F1F3F6] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-4 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#878787]">Craftify Creator Hub</span>
            <span className="text-[#878787]">/</span>
            <span className="font-semibold text-[#2874F0]">Launch Crowdfunding Campaign</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="fill-demo-campaign-data"
              onClick={handleFillDemoData}
              className="px-3 py-1.5 bg-[#F1F3F6] hover:bg-[#EAEAEA] text-[#2874F0] border border-[#2874F0]/30 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Data</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#878787] hover:text-[#212121] font-medium transition-colors cursor-pointer"
            >
              Cancel Draft
            </button>
          </div>
        </div>

        {/* Header Hero Card */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 mb-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#EBF3FE] text-[#2874F0] text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Craftify Creator Escrow Pipeline</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight">
                Start an Artisan Crowdfunding Campaign
              </h1>
              <p className="text-sm text-[#878787] mt-1.5 max-w-2xl leading-relaxed">
                Raise production capital directly from conscious buyers across India. Reach 100% of your escrow target to manufacture your batch and graduate into the permanent Craftify Shop.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 bg-[#F8FAFC] border border-[#E0E0E0] rounded-[4px] p-2 text-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-[#2874F0] mb-1" />
              <span className="text-[10px] font-bold text-[#212121] leading-tight">100% Escrow Protection</span>
            </div>
          </div>

          {/* Craftify Stepper Progress Bar */}
          <div className="mt-6 pt-5 border-t border-[#F0F0F0]">
            <div className="grid grid-cols-5 gap-2">
              {stepMeta.map((s) => {
                const isCurrent = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                const StepIcon = s.icon;

                return (
                  <button
                    key={s.num}
                    type="button"
                    disabled={!isCompleted && !isCurrent}
                    onClick={() => isCompleted && setCurrentStep(s.num)}
                    className={`text-left p-2.5 rounded-[3px] border transition-all ${
                      isCurrent
                        ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0] shadow-xs'
                        : isCompleted
                        ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9] hover:bg-[#C8E6C9]/40 cursor-pointer'
                        : 'bg-[#F9FAFB] text-[#878787] border-[#E5E7EB] cursor-not-allowed opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-[#FFFFFF]' : isCompleted ? 'text-[#2E7D32]' : 'text-[#878787]'}`}>
                        Step {s.num}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5 opacity-70" />
                      )}
                    </div>
                    <div className="text-xs font-bold truncate">
                      {s.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="mb-5 p-3.5 bg-[#FFF3EC] border border-[#FB641B]/40 text-[#FB641B] rounded-[4px] text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Main Step Form Card */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-6 sm:p-8 shadow-xs">
          {/* STEP 1: Basics & Imagery */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h2 className="text-lg font-bold text-[#212121]">
                  1. Product Essentials & Cover Imagery
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  Define the name, category, artisan collective, and media representing your creation.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Product / Campaign Title *
                </label>
                <SmartInput
                  id="campaign-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onValueChange={(val) => setTitle(val)}
                  placeholder="e.g. Khurja Imperial Cobalt Blue Fluted Vase"
                  className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
                  enableVoice={true}
                  enableLanguageDetection={true}
                />
                <span className="text-[11px] text-[#878787] mt-1 block">
                  Give your product a clear, descriptive title showcasing the craft technique and origin.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Product Category *
                  </label>
                  <select
                    id="campaign-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] focus:outline-none focus:border-[#2874F0] bg-[#FFFFFF]"
                  >
                    <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                    <option value="Handloom Textiles">Handloom Textiles</option>
                    <option value="Metal Craft & Bidri">Metal Craft & Bidri</option>
                    <option value="Woodcraft">Woodcraft</option>
                    <option value="Heritage Decor">Heritage Decor</option>
                    <option value="Design & Tools">Design & Tools</option>
                    <option value="Culinary Hardware">Culinary Hardware</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Artisan / Collective Name *
                  </label>
                  <SmartInput
                    id="campaign-creator-input"
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    onValueChange={(val) => setCreator(val)}
                    placeholder="e.g. Khurja Master Potters Guild"
                    className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
                    enableVoice={true}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Artisan Workshop Location *
                </label>
                <SmartInput
                  id="campaign-location-input"
                  type="text"
                  value={creatorLocation}
                  onChange={(e) => setCreatorLocation(e.target.value)}
                  onValueChange={(val) => setCreatorLocation(val)}
                  placeholder="e.g. Khurja, Uttar Pradesh"
                  className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
                  enableVoice={true}
                />
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
                  currentDraftText={fullStory || shortDescription}
                  onDescriptionGenerated={(desc) => {
                    setShortDescription(desc.slice(0, 160) + (desc.length > 160 ? '...' : ''));
                    setFullStory(desc);
                  }}
                  targetFieldName="campaign pitch & story"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Concise One-Line Pitch *
                </label>
                <SmartTextarea
                  id="campaign-pitch-input"
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  onValueChange={(val) => setShortDescription(val)}
                  placeholder="A brief summary highlighting utility, handcrafted materials, and artisan tradition."
                  className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
                  enableVoice={true}
                />
              </div>

              {/* Cover Imagery via Cloudinary */}
              <div className="space-y-3">
                <ImageUploadDropzone
                  id="create-campaign-cover-uploader"
                  label="Cover Image"
                  sublabel="Click or drag to upload cover image. Supported formats: JPG, PNG, WEBP up to 5MB."
                  value={imageUrl}
                  onChange={(url) => {
                    setImageUrl(url);
                    setImageWarning(null);
                  }}
                  warningMessage={imageWarning}
                  onClearWarning={() => setImageWarning(null)}
                  supportGallery={true}
                  galleryValues={galleryImages}
                  onGalleryChange={setGalleryImages}
                />

                <div className="pt-2 border-t border-[#F0F0F0]">
                  <div className="text-xs text-[#878787] font-medium flex items-center gap-1.5 mb-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#2874F0]" />
                    <span>Or select a verified Indian artisan craft photo preset:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRESET_INDIAN_CRAFT_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setImageUrl(preset.url);
                          setCategory(preset.category);
                          setImageWarning(null);
                        }}
                        className={`relative aspect-[16/10] overflow-hidden rounded-[3px] border transition-all text-left ${
                          imageUrl === preset.url
                            ? 'border-2 border-[#2874F0] ring-2 ring-[#2874F0]/20'
                            : 'border-[#E0E0E0] opacity-80 hover:opacity-100 hover:border-[#2874F0]/60'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-[#212121]/80 text-[#FFFFFF] text-[10px] p-1 truncate font-medium">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Story & Specifications */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h2 className="text-lg font-bold text-[#212121]">
                  2. Artisan Heritage & Technical Specifications
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  Share the authentic story behind your creation, sustainable materials, and precise dimensions.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Full Craft Narrative & Artisan Philosophy *
                </label>
                <SmartTextarea
                  id="campaign-story-input"
                  rows={5}
                  value={fullStory}
                  onChange={(e) => setFullStory(e.target.value)}
                  onValueChange={(val) => setFullStory(val)}
                  placeholder="Explain why this handcrafted creation is unique, how raw materials are prepared, and how it impacts rural artisan livelihoods."
                  className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] focus:outline-none focus:border-[#2874F0] leading-relaxed"
                  enableVoice={true}
                  enableLanguageDetection={true}
                />
              </div>

              {/* Specifications List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider text-[#212121] font-bold">
                    Technical Specifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs text-[#2874F0] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2.5 items-center">
                      <SmartInput
                        type="text"
                        value={spec.label}
                        onChange={(e) => handleUpdateSpec(i, 'label', e.target.value)}
                        onValueChange={(val) => handleUpdateSpec(i, 'label', val)}
                        placeholder="Parameter (e.g. Material)"
                        className="w-1/3 px-3 py-2 border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                      <SmartInput
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleUpdateSpec(i, 'value', e.target.value)}
                        onValueChange={(val) => handleUpdateSpec(i, 'value', val)}
                        placeholder="Value (e.g. Khurja River Clay & Lead-free Glaze)"
                        className="flex-1 px-3 py-2 border border-[#D5D5D5] rounded-[2px] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="p-2 text-[#FB641B] hover:bg-[#FFF3EC] rounded-[2px] text-xs transition-colors cursor-pointer"
                        aria-label="Remove spec"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Funding & Duration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h2 className="text-lg font-bold text-[#212121]">
                  3. Escrow Funding Goal & Campaign Duration
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  Set a realistic INR target. Backers authorize funds today; money is transferred into production escrow ONLY upon reaching 100%.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Funding Target Threshold (₹ INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-base font-bold text-[#2874F0]">₹</span>
                    <input
                      id="campaign-goal-input"
                      type="number"
                      min={10000}
                      step={5000}
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-8 pr-4 py-2.5 border border-[#D5D5D5] rounded-[2px] text-base font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <span className="text-[11px] text-[#878787] mt-1 block">
                    Current value: <strong className="text-[#212121]">{formatINR(goalAmount)}</strong>. Must cover kiln batches, raw materials, and insured dispatch.
                  </span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                    Campaign Duration (Days) *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 45, 60].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDaysLeft(days)}
                        className={`py-2.5 rounded-[2px] border text-xs font-bold text-center transition-all cursor-pointer ${
                          daysLeft === days
                            ? 'border-[#2874F0] bg-[#2874F0] text-[#FFFFFF] shadow-xs'
                            : 'border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] hover:border-[#2874F0]'
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#878787] mt-1 block">
                    Recommended: 30 days generates optimal discovery on Craftify.
                  </span>
                </div>
              </div>

              {/* Craftify Escrow Covenant Card */}
              <div className="p-5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-[4px] space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#212121]">
                  <ShieldCheck className="w-5 h-5 text-[#2E7D32]" />
                  <span>The Craftify Escrow Covenant</span>
                </div>

                <ul className="text-xs text-[#535766] space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>0% Financial Risk for Backers:</strong> Cards and UPI authorizations are conditional. Backers are charged zero upfront until the campaign reaches 100%.
                  </li>
                  <li>
                    <strong>Milestone-Based Release:</strong> Pledged funds are unlocked in milestones: 50% upon reaching target for raw material acquisition, and 50% upon shipment proof.
                  </li>
                  <li>
                    <strong>Guaranteed Marketplace Graduation:</strong> Fulfilling backer rewards unlocks automatic verified seller placement on Craftify Shop.
                  </li>
                </ul>

                <label className="flex items-start gap-2.5 pt-2 cursor-pointer border-t border-[#EAEAEA]">
                  <input
                    type="checkbox"
                    checked={agreedToEscrow}
                    onChange={(e) => setAgreedToEscrow(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#2874F0] rounded-[2px] focus:ring-0"
                  />
                  <span className="text-xs text-[#212121] font-medium">
                    I agree to the Craftify Escrow Covenant and certify that all rewards will be fulfilled before commercial marketplace sales.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Reward Tiers Builder */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#212121]">
                    4. Backer Reward Packages & Pledge Tiers
                  </h2>
                  <p className="text-xs text-[#878787] mt-0.5">
                    Structure early bird tiers with compelling pricing in Indian Rupees.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-3 py-1.5 bg-[#2874F0] hover:bg-[#1259C3] text-[#FFFFFF] text-xs font-bold rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Reward Tier</span>
                </button>
              </div>

              <div className="space-y-4">
                {rewardTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="p-5 bg-[#F9FAFB] border border-[#E0E0E0] rounded-[4px] space-y-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                      <span className="text-xs font-bold text-[#2874F0] uppercase tracking-wider">
                        Reward Tier {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-[#FB641B] hover:text-[#D84A05] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Tier</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Reward Title *
                        </label>
                        <SmartInput
                          type="text"
                          value={tier.title}
                          onChange={(e) => handleUpdateTier(idx, 'title', e.target.value)}
                          onValueChange={(val) => handleUpdateTier(idx, 'title', val)}
                          placeholder="e.g. Early Bird Single Unit"
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                          enableVoice={true}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Pledge Amount (₹ INR) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-xs font-bold text-[#2874F0]">₹</span>
                          <input
                            type="number"
                            min={99}
                            value={tier.pledgeAmount}
                            onChange={(e) =>
                              handleUpdateTier(idx, 'pledgeAmount', Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-full pl-6 pr-3 py-1.5 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-xs font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                        Reward Package Description
                      </label>
                      <SmartTextarea
                        rows={2}
                        value={tier.description}
                        onChange={(e) => handleUpdateTier(idx, 'description', e.target.value)}
                        onValueChange={(val) => handleUpdateTier(idx, 'description', val)}
                        placeholder="What exclusive items or craft finishes are bundled in this package?"
                        className="w-full px-3 py-2 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        enableVoice={true}
                      />
                    </div>

                    {/* AI Fair Price Suggester for Reward Tier */}
                    <AIPriceSuggester
                      craftType={aiCraftType || category}
                      region={aiRegion || creatorLocation}
                      onApplyPrice={(suggestedPrice) => handleUpdateTier(idx, 'pledgeAmount', suggestedPrice)}
                      defaultMaterialCost={Math.round(tier.pledgeAmount * 0.35)}
                      defaultHoursSpent={6}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Estimated Delivery Month
                        </label>
                        <SmartInput
                          type="text"
                          value={tier.estimatedDelivery}
                          onChange={(e) => handleUpdateTier(idx, 'estimatedDelivery', e.target.value)}
                          onValueChange={(val) => handleUpdateTier(idx, 'estimatedDelivery', val)}
                          placeholder="e.g. Dec 2026"
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                          Backer Quantity Limit (Optional)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={tier.maxBackers ?? ''}
                          onChange={(e) =>
                            handleUpdateTier(
                              idx,
                              'maxBackers',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                          placeholder="Unlimited if blank"
                          className="w-full px-3 py-2 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Launch */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#F0F0F0] pb-3">
                <h2 className="text-lg font-bold text-[#212121]">
                  5. Review Campaign Card & Launch to Live Escrow
                </h2>
                <p className="text-xs text-[#878787] mt-0.5">
                  Verify how your crowdfunding listing will appear to shoppers and backers across Craftify.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="p-5 bg-[#F9FAFB] border border-[#E0E0E0] rounded-[4px] space-y-4">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="w-full sm:w-48 aspect-[16/10] sm:aspect-square overflow-hidden rounded-[3px] border border-[#E0E0E0] shrink-0 bg-[#FFFFFF]">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-bold bg-[#EBF3FE] text-[#2874F0] px-2 py-0.5 rounded-[2px]">
                        Funding Live (0% Raised)
                      </span>
                      <span className="text-xs text-[#878787]">
                        {category} • by <strong className="text-[#212121]">{creator}</strong> ({creatorLocation})
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#212121]">{title}</h3>
                    <p className="text-xs text-[#878787] line-clamp-2 leading-relaxed">{shortDescription}</p>

                    <div className="pt-3 border-t border-[#EAEAEA] grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-[#878787] uppercase font-bold">Escrow Target</div>
                        <div className="text-sm font-bold text-[#2874F0]">{formatINR(goalAmount)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#878787] uppercase font-bold">Campaign Window</div>
                        <div className="text-sm font-bold text-[#212121]">{daysLeft} Days</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#878787] uppercase font-bold">Pledge Tiers</div>
                        <div className="text-sm font-bold text-[#212121]">{rewardTiers.length} Options</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready Confirmation */}
              <div className="p-4 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[4px] text-xs text-[#2E7D32] flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#2E7D32]" />
                <div>
                  <strong className="block text-sm font-bold">Ready to publish on Craftify Live Escrow:</strong>
                  Your campaign will be assigned a unique tracking code and indexed on the discovery feed. Buyers can immediately begin placing conditional pledges with 0% upfront charges.
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="mt-8 pt-5 border-t border-[#F0F0F0] flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                id="btn-campaign-prev-step"
                onClick={handlePrev}
                className="px-5 py-2.5 border border-[#D5D5D5] hover:border-[#212121] rounded-[2px] text-[#212121] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Step {currentStep - 1}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-[#E0E0E0] rounded-[2px] text-xs text-[#878787] hover:text-[#212121] font-semibold transition-colors cursor-pointer"
              >
                Cancel Draft
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                id="btn-next-campaign-step"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#2874F0] hover:bg-[#1259C3] text-[#FFFFFF] rounded-[2px] text-xs font-bold flex items-center gap-2 transition-colors ml-auto cursor-pointer shadow-xs"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-publish-campaign-final"
                onClick={handleFinalSubmit}
                className="px-8 py-3 bg-[#FB641B] hover:bg-[#D84A05] text-[#FFFFFF] rounded-[2px] text-sm font-bold flex items-center gap-2 transition-colors ml-auto cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit for Admin Approval</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
