export type ActiveView =
  | 'home'
  | 'campaigns'
  | 'shop'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'start-campaign'
  | 'campaign-detail'
  | 'account'
  | 'creator-dashboard'
  | 'gemini-chat'
  | 'my-orders'
  | 'order-tracking'
  | 'my-pledges'
  | 'complete-profile'
  | 'admin-panel';

export type GeminiModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite'
  | 'gemini-flash-latest'
  | 'gemini-3.1-pro-preview'
  | 'gemini-3.5-flash';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: GeminiModelId | string;
  isStreaming?: boolean;
}

export interface ChatPersona {
  id: string;
  name: string;
  badge: string;
  roleTitle: string;
  description: string;
  recommendedModel: GeminiModelId;
  systemInstruction: string;
  starterPrompts: string[];
}

export interface CampaignSettlement {
  settledAt: string;
  outcome: 'funded' | 'unsuccessful';
  grossPledged: number;
  platformFee: number; // 5%
  processingFee: number; // 3%
  netPayout: number; // 92%
  backersAffectedCount: number;
}

export interface RewardTier {
  id: string;
  title: string;
  pledgeAmount: number;
  description: string;
  estimatedDelivery: string;
  itemsIncluded: string[];
  backersCount: number;
  maxBackers?: number;
}

export interface CampaignSpec {
  label: string;
  value: string;
}

export interface CampaignTimelineItem {
  phase: string;
  date: string;
  description: string;
}

export interface CampaignPreSimulationState {
  status: 'in_progress' | 'funded' | 'failed' | 'pending_review' | 'rejected';
  daysLeft: number;
  pledgedAmount: number;
  amountRaised?: number;
  backersCount: number;
  isSettled?: boolean;
  settlement?: CampaignSettlement;
  deadline?: string;
}

export interface Campaign {
  id: string;
  title: string;
  creator: string;
  creatorBio?: string;
  creatorLocation?: string;
  artisanRegion?: string;
  craftHeritage?: string;
  category: string;
  shortDescription: string;
  fullStory?: string;
  goalAmount: number;
  fundingGoal?: number; // alias for goalAmount
  pledgedAmount: number;
  amountRaised?: number; // alias for pledgedAmount
  backersCount: number;
  daysLeft: number;
  deadline?: string; // ISO date or YYYY-MM-DD
  status: 'in_progress' | 'funded' | 'failed' | 'pending_review' | 'rejected';
  imageUrl: string;
  galleryImages?: string[];
  code: string; // e.g. CMP-842
  specs?: CampaignSpec[];
  timeline?: CampaignTimelineItem[];
  rewardTiers: RewardTier[];
  settlement?: CampaignSettlement;
  isPublishedToShop?: boolean;
  publishedProductId?: string;
  isApproved?: boolean;
  slug?: string;
  isSettled?: boolean;
  settlementDate?: string;
  previousState?: CampaignPreSimulationState;
  creatorProfilePhoto?: string;
  creatorBusinessName?: string;
  creatorYearsOfExperience?: number;
  creatorCity?: string;
  creatorState?: string;
  creatorLegalName?: string;
  creatorPhone?: string;
  rejectionReason?: string;
  rejectedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
}

export interface Product {
  id: string;
  title: string;
  creator: string;
  creatorLocation?: string;
  artisanRegion?: string;
  craftHeritage?: string;
  category: string;
  shortDescription: string;
  longDescription?: string;
  price: number;
  graduatedFromCampaignId: string;
  originalPledgedAmount: number;
  isFundedOnCraftify?: boolean;
  isFundedOnLaunchMart?: boolean;
  campaignBackersCount?: number;
  campaignGoalAmount?: number;
  batchGraduated?: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  badgeLabel?: string;
  badgeType?: 'in_stock' | 'pre_order' | 'limited_stock';
  imageUrl: string;
  galleryImages?: string[];
  sku: string; // e.g. LM-094
  features?: string[];
  specs?: { label: string; value: string }[];
  reviews?: ProductReview[];
  createdAt?: string;
  creatorProfilePhoto?: string;
  creatorBusinessName?: string;
  creatorYearsOfExperience?: number;
  creatorCity?: string;
  creatorState?: string;
  creatorBio?: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'pledge';
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtitle: string;
  campaignId?: string;
  tierId?: string;
}

export type UserRole = 'buyer' | 'artisan' | 'admin' | 'backer' | 'creator';

export interface ArtisanPayoutDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface User {
  id: string;
  name: string;
  legalName?: string;
  businessName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarInitials: string;
  memberSince: string;
  craftType?: string;
  state?: string;
  city?: string;
  yearsOfExperience?: number;
  bio?: string;
  profilePhoto?: string;
  payoutDetails?: ArtisanPayoutDetails;
  gstNumber?: string;
  profileCompleted?: boolean;
  isSuspended?: boolean;
  token?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  wishlistProductIds?: string[];
}

export interface BuyerPledge {
  id: string | number;
  campaignId: string | number;
  campaignTitle: string;
  campaignSlug?: string;
  campaignStatus: string;
  campaignImage?: string;
  tierTitle: string;
  amount: number;
  status: 'authorized' | 'captured' | 'released' | 'cancelled' | 'authorized_pending';
  createdAt: string;
  estimatedDelivery?: string;
  settlementDate?: string;
}

export interface AdminPlatformStats {
  total_campaigns: number;
  total_funded_amount: number;
  active_artisans_count: number;
  total_orders: number;
  pending_campaigns_count?: number;
  approved_campaigns_count?: number;
}

export interface AdminUserRecord {
  id: number | string;
  username: string;
  email: string;
  role: 'buyer' | 'artisan' | 'admin';
  craft_type?: string;
  is_suspended: boolean;
  is_active: boolean;
  date_joined?: string;
}

export interface UserPledgeRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignCode: string;
  tierTitle: string;
  amount: number;
  dateAuthorized: string;
  status: 'authorized' | 'authorized_pending' | 'captured' | 'released' | 'cancelled';
  estimatedDelivery: string;
  settlementDate?: string;
}

export interface BackerRecord {
  id: string;
  campaignId: string;
  name: string;
  amount: number;
  tierTitle: string;
  date: string;
  status: 'authorized' | 'captured' | 'released';
  settlementDate?: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  updateNumber: number;
  title: string;
  date: string;
  author: string;
  content: string;
  likesCount: number;
}

export interface CampaignComment {
  id: string;
  campaignId: string;
  authorName: string;
  authorBadge?: string;
  date: string;
  comment: string;
}

export type OrderTrackingStage = 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTrackingHistoryEvent {
  stage: OrderTrackingStage;
  label: string;
  timestamp: string;
  location?: string;
  description?: string;
  completed: boolean;
}

export interface CustomerOrderItem {
  id: string;
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  subtitle?: string;
  isFundedOnCraftify?: boolean;
  isFundedOnLaunchMart?: boolean;
  artisanName?: string;
}

export interface CustomerOrder {
  id: string; // e.g. "CRF-2026-00123"
  orderDate: string; // e.g. "12 Sept, 2026"
  estimatedDeliveryRange: string; // e.g. "Arriving between 18–22 Sept"
  status: OrderTrackingStage;
  carrierName: string; // e.g. "Blue Dart Express" or "Delhivery Surface"
  trackingNumber: string; // e.g. "IN0098234561"
  items: CustomerOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  history: OrderTrackingHistoryEvent[];
}
