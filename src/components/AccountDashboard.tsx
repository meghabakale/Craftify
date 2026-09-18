import React, { useState } from 'react';
import { User, UserPledgeRecord, Campaign, ActiveView, Product, CustomerOrder } from '../types';
import { STAGE_DISPLAY_LABELS } from '../data/mockOrders';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import {
  Shield,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  LogOut,
  RefreshCw,
  Heart,
  ShoppingBag,
  Truck,
  PlayCircle,
} from 'lucide-react';

interface AccountDashboardProps {
  user: User;
  pledges: UserPledgeRecord[];
  campaigns: Campaign[];
  orders?: CustomerOrder[];
  wishlistProducts?: Product[];
  onNavigate: (view: ActiveView) => void;
  onOpenCampaignDetail: (campaign: Campaign) => void;
  onOpenProductDetail?: (product: Product) => void;
  onOpenStartCampaign: () => void;
  onLogout: () => void;
  onUpdateUser: (updated: User) => void;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onTrackOrder?: (order: CustomerOrder) => void;
  onAdvanceStatus?: (orderId: string) => void;
  initialTab?: 'pledges' | 'orders' | 'wishlist' | 'shipping' | 'creator';
}

export const AccountDashboard: React.FC<AccountDashboardProps> = ({
  user,
  pledges,
  campaigns,
  orders = [],
  wishlistProducts = [],
  onNavigate,
  onOpenCampaignDetail,
  onOpenProductDetail,
  onOpenStartCampaign,
  onLogout,
  onUpdateUser,
  onToggleWishlist,
  onAddToCart,
  onTrackOrder,
  onAdvanceStatus,
  initialTab,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pledges' | 'orders' | 'wishlist' | 'shipping' | 'creator'>(initialTab || 'pledges');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [street, setStreet] = useState(user.shippingAddress?.street ?? '');
  const [city, setCity] = useState(user.shippingAddress?.city ?? '');
  const [stateCode, setStateCode] = useState(user.shippingAddress?.state ?? '');
  const [zip, setZip] = useState(user.shippingAddress?.zip ?? '');
  const [country, setCountry] = useState(user.shippingAddress?.country ?? 'India');

  // Filter campaigns created by this user
  const userCreatedCampaigns = campaigns.filter(
    (c) => c.creator.toLowerCase().includes(user.name.toLowerCase()) || user.role === 'creator'
  );

  const totalAuthorized = pledges
    .filter((p) => p.status === 'authorized_pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCaptured = pledges
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      shippingAddress: {
        street,
        city,
        state: stateCode,
        zip,
        country,
      },
    });
    setIsEditingAddress(false);
  };

  return (
    <div id="account-dashboard-view" className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 text-[#212121]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#878787] mb-3">
        <button onClick={() => onNavigate('home')} className="hover:text-[#2874F0] transition-colors cursor-pointer">
          {t('home')}
        </button>
        <span>/</span>
        <span className="text-[#212121] font-semibold">{t('myAccount')}</span>
      </div>

      {/* Profile & Identity Banner */}
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs p-4 sm:p-5 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#2874F0] text-[#FFFFFF] flex items-center justify-center font-bold text-xl shadow-xs">
              {user.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {user.name}
                </h1>
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-[2px] border ${
                    user.role === 'creator'
                      ? 'bg-[#2874F0] text-[#FFFFFF] border-[#2874F0]'
                      : 'bg-[#EAF8EB] text-[#388E3C] border-[#388E3C]/20'
                  }`}
                >
                  {user.role === 'creator' ? 'Verified Artisan' : 'Active Patron'}
                </span>
              </div>
              <div className="text-xs text-[#878787] mt-1 flex flex-wrap items-center gap-2">
                <span>{user.email}</span>
                <span>•</span>
                <span>Member since {user.memberSince}</span>
                <span>•</span>
                <span className="text-[#388E3C] font-semibold">ID: {user.id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onUpdateUser({
                  ...user,
                  role: user.role === 'backer' ? 'creator' : 'backer',
                });
              }}
              className="px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] bg-[#FFFFFF] text-xs uppercase tracking-wider font-bold text-[#2874F0] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch to {user.role === 'backer' ? 'Creator' : 'Backer'} Mode</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-[2px] border border-[#FB641B]/40 hover:border-[#FB641B] bg-[#FFFFFF] hover:bg-[#FFF3EC] text-xs uppercase tracking-wider font-bold text-[#FB641B] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('signOut')}</span>
            </button>
          </div>
        </div>

        {/* Financial Escrow Monospace Ledger Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-4">
          <div className="p-3 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA]">
            <div className="text-[11px] text-[#878787] uppercase font-bold">
              Pending Holds
            </div>
            <div className="text-lg font-bold text-[#2874F0] mt-0.5">
              {formatINR(totalAuthorized)}
            </div>
            <div className="text-[10px] text-[#878787] mt-0.5">
              ₹0 billed until goals reached
            </div>
          </div>

          <div className="p-3 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA]">
            <div className="text-[11px] text-[#878787] uppercase font-bold">
              Captured / Funded
            </div>
            <div className="text-lg font-bold text-[#388E3C] mt-0.5">
              {formatINR(totalCaptured)}
            </div>
            <div className="text-[10px] text-[#878787] mt-0.5">
              {pledges.filter((p) => p.status === 'captured').length} campaigns in make
            </div>
          </div>

          <div className="p-3 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA]">
            <div className="text-[11px] text-[#878787] uppercase font-bold">
              {t('myOrders')}
            </div>
            <div className="text-lg font-bold text-[#212121] mt-0.5">
              {orders.length} {t('items')}
            </div>
            <div className="text-[10px] text-[#878787] mt-0.5">
              Express Courier
            </div>
          </div>

          <div
            onClick={() => setActiveTab('wishlist')}
            className="p-3 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] hover:border-[#FB641B]/40 hover:bg-[#FFFFFF] transition-all cursor-pointer group"
          >
            <div className="text-[11px] text-[#878787] uppercase font-bold flex items-center justify-between">
              <span>{t('wishlist')}</span>
              <Heart className="w-3.5 h-3.5 text-[#FB641B] fill-[#FB641B] group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-[#FB641B] mt-0.5">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'}
            </div>
            <div className="text-[10px] text-[#FB641B] mt-0.5">
              View saved items →
            </div>
          </div>

          <div className="p-3 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA]">
            <div className="text-[11px] text-[#878787] uppercase font-bold">
              Artisan Trust
            </div>
            <div className="text-sm font-bold text-[#388E3C] mt-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#388E3C]" />
              {t('escrowProtected')}
            </div>
            <div className="text-[10px] text-[#388E3C] mt-0.5">
              Strict money-back covenant
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#EAEAEA] bg-[#FFFFFF] rounded-[4px] px-2 mb-4 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('pledges')}
          className={`px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === 'pledges'
              ? 'border-[#2874F0] text-[#2874F0]'
              : 'border-transparent text-[#878787] hover:text-[#212121]'
          }`}
        >
          {t('myPledges')} ({pledges.length})
        </button>

        <button
          id="account-tab-orders"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#2874F0] text-[#2874F0]'
              : 'border-transparent text-[#878787] hover:text-[#212121]'
          }`}
        >
          {t('myOrders')} ({orders.length})
        </button>

        <button
          id="account-tab-wishlist"
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-[#2874F0] text-[#2874F0]'
              : 'border-transparent text-[#878787] hover:text-[#212121]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === 'wishlist' ? 'fill-[#2874F0] text-[#2874F0]' : 'text-current'}`} />
          <span>{t('wishlist')} ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] cursor-pointer ${
            activeTab === 'shipping'
              ? 'border-[#2874F0] text-[#2874F0]'
              : 'border-transparent text-[#878787] hover:text-[#212121]'
          }`}
        >
          {t('deliveryAddress')}
        </button>

        <button
          onClick={() => setActiveTab('creator')}
          className={`px-4 py-3 text-xs uppercase tracking-wider font-bold whitespace-nowrap transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'creator'
              ? 'border-[#2874F0] text-[#2874F0]'
              : 'border-transparent text-[#878787] hover:text-[#212121]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FB641B]" />
          <span>{t('creatorDashboard')}</span>
        </button>
      </div>

      {/* Tab 1: Authorized Pledges */}
      {activeTab === 'pledges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#212121]">
                Active Campaign Pledges
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Authorizations are captured only when the artisan meets 100% of the project target.
              </p>
            </div>
            <button
              onClick={() => onNavigate('campaigns')}
              className="text-xs text-[#2874F0] hover:underline uppercase tracking-wider font-bold cursor-pointer"
            >
              Browse more campaigns →
            </button>
          </div>

          {pledges.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
              <p className="text-base font-bold text-[#212121] mb-1">
                No active pledges in your ledger
              </p>
              <p className="text-xs text-[#878787] mb-4">
                Back an upcoming artisan project to receive verified production batch goods.
              </p>
              <button
                onClick={() => onNavigate('campaigns')}
                className="px-5 py-2 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold cursor-pointer shadow-xs hover:bg-[#1C5FD0] transition-colors"
              >
                Discover Campaigns
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pledges.map((p) => {
                const targetCampaign = campaigns.find((c) => c.id === p.campaignId);
                const isCaptured = p.status === 'captured';

                return (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2874F0] bg-[#F1F3F6] px-2 py-0.5 rounded-[2px] border border-[#EAEAEA]">
                          {p.campaignCode}
                        </span>
                        {isCaptured ? (
                          <span className="text-xs font-semibold text-[#388E3C] flex items-center gap-1 bg-[#EAF8EB] px-2 py-0.5 rounded-[2px] border border-[#388E3C]/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Goal Reached • Escrow Captured
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-[#2874F0] flex items-center gap-1 bg-[#F1F3F6] px-2 py-0.5 rounded-[2px] border border-[#2874F0]/20">
                            <Clock className="w-3.5 h-3.5" />
                            Authorized Hold • ₹0 Billed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#212121]">
                        {p.campaignTitle}
                      </h3>

                      <div className="text-xs text-[#878787] flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[#212121]">{p.tierTitle}</span>
                        <span>•</span>
                        <span>Authorized on {p.dateAuthorized}</span>
                        <span>•</span>
                        <span>Est. Delivery: {p.estimatedDelivery}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 border-[#F0F0F0] pt-2 md:pt-0">
                      <div className="text-right">
                        <span className="text-[11px] text-[#878787] uppercase block">
                          {isCaptured ? 'Captured Total' : 'Authorized Hold'}
                        </span>
                        <span className="text-xl font-bold text-[#212121]">
                          {formatINR(p.amount)}
                        </span>
                      </div>

                      {targetCampaign && (
                        <button
                          onClick={() => onOpenCampaignDetail(targetCampaign)}
                          className="px-3 py-1 rounded-[2px] border border-[#D5D5D5] hover:border-[#2874F0] hover:text-[#2874F0] text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Campaign</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Marketplace Receipts & Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#212121]">
                Marketplace Store Orders
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Authentic craft shipments dispatched with insured logistics from master artisan studios.
              </p>
            </div>

            <button
              onClick={() => onNavigate('my-orders')}
              className="text-xs text-[#2874F0] font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Full Orders Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
              <Package className="w-10 h-10 text-[#878787]/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#212121]">No past orders yet</p>
              <p className="text-xs text-[#878787] mt-1 mb-3">
                Explore handpicked creations crafted across India's premier artisan heritage clusters.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-4 py-2 bg-[#2874F0] text-white text-xs uppercase font-bold rounded-[2px] cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isDelivered = order.status === 'delivered';
                return (
                  <div
                    key={order.id}
                    id={`account-order-${order.id}`}
                    className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs space-y-3 hover:border-[#D0D0D0] transition-colors"
                  >
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#F0F0F0] gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div>
                          <span className="text-[#878787] text-[11px] block">ORDER ID</span>
                          <span className="font-bold font-mono text-[#212121]">{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[#878787] text-[11px] block">DATE</span>
                          <span className="font-semibold text-[#212121]">{order.orderDate}</span>
                        </div>
                        <div>
                          <span className="text-[#878787] text-[11px] block">TOTAL</span>
                          <span className="font-bold text-[#388E3C]">{formatINR(order.total)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider ${
                            isDelivered
                              ? 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/20'
                              : 'bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20'
                          }`}
                        >
                          {STAGE_DISPLAY_LABELS[order.status]}
                        </span>

                        {onAdvanceStatus && (
                          <button
                            onClick={() => onAdvanceStatus(order.id)}
                            title="Simulate advancing to next stage"
                            className="hidden sm:flex items-center gap-1 text-[10px] text-[#878787] hover:text-[#2874F0] p-1 rounded hover:bg-[#EBF2FE] cursor-pointer"
                          >
                            <PlayCircle className="w-3 h-3" />
                            <span>Simulate</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-14 h-14 rounded-[2px] object-contain border border-[#F0F0F0] p-1 shrink-0 bg-white"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-[#212121]">
                                {item.title}
                              </h4>
                              <div className="text-xs text-[#878787]">
                                Qty: <strong className="text-[#212121]">{item.quantity}</strong> × {formatINR(item.price)} • {item.artisanName || 'Artisan Guild'}
                              </div>
                              {(item.isFundedOnCraftify ?? item.isFundedOnLaunchMart) && (
                                <span className="inline-block text-[10px] text-[#B78103] font-bold bg-[#FFFBF0] px-1.5 py-0.2 rounded-[2px] border border-[#FFE8A3] mt-0.5">
                                  Funded on Craftify
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-[#212121]">
                            {formatINR(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions and Tracking Button */}
                    <div className="pt-3 border-t border-[#F0F0F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-[#878787] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#2874F0]" />
                        <span>
                          {order.carrierName} • Tracking #{order.trackingNumber} • {order.estimatedDeliveryRange}
                        </span>
                      </div>

                      {onTrackOrder && (
                        <button
                          id={`btn-account-track-${order.id}`}
                          onClick={() => onTrackOrder(order)}
                          className="px-4 py-2 bg-[#2874F0] hover:bg-[#1C5FD0] text-white text-xs uppercase font-bold rounded-[2px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FB641B] fill-[#FB641B]" />
                <h2 className="text-lg font-bold text-[#212121]">
                  My Wishlist
                </h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#FFF3EC] text-[#FB641B] border border-[#FB641B]/20">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-xs text-[#878787] mt-0.5">
                Authentic handcrafted products saved to your profile for later.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {wishlistProducts.length > 0 && onAddToCart && (
                <button
                  id="btn-wishlist-add-all-cart"
                  onClick={() => wishlistProducts.forEach((prod) => onAddToCart(prod))}
                  className="px-3 py-1.5 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add All to Cart</span>
                </button>
              )}
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs text-[#2874F0] hover:underline uppercase tracking-wider font-bold cursor-pointer"
              >
                Browse Catalog →
              </button>
            </div>
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FFF3EC] text-[#FB641B] border border-[#FB641B]/20 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-[#212121] mb-1">
                Your wishlist is empty
              </p>
              <p className="text-xs text-[#878787] max-w-md mx-auto mb-4">
                Explore our curated retail store and click the heart icon on any product to save it here.
              </p>
              <button
                id="btn-empty-wishlist-shop"
                onClick={() => onNavigate('shop')}
                className="px-5 py-2 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold cursor-pointer shadow-xs hover:bg-[#1C5FD0] transition-colors inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Explore Store</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  id={`wishlist-item-${prod.id}`}
                  className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image Stage */}
                    <div className="relative aspect-[16/10] bg-[#FFFFFF] overflow-hidden border-b border-[#F0F0F0] group p-2">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => onOpenProductDetail?.(prod)}
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#212121] text-[#FFFFFF]">
                        {prod.sku}
                      </span>
                      {onToggleWishlist && (
                        <button
                          onClick={() => onToggleWishlist(prod)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-[#FB641B] border border-[#EAEAEA] shadow-xs flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                          title="Remove from Wishlist"
                          aria-label="Remove from Wishlist"
                        >
                          <Heart className="w-3.5 h-3.5 fill-[#FB641B]" />
                        </button>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#878787]">
                        <span className="text-[#388E3C] font-semibold">{prod.category}</span>
                        <span>{prod.stockCount} in stock</span>
                      </div>

                      <h3
                        onClick={() => onOpenProductDetail?.(prod)}
                        className="text-xs font-bold text-[#212121] line-clamp-1 hover:text-[#2874F0] transition-colors cursor-pointer"
                      >
                        {prod.title}
                      </h3>

                      <p className="text-[11px] text-[#878787] line-clamp-2">
                        {prod.shortDescription}
                      </p>

                      <div className="pt-1 flex items-baseline justify-between">
                        <span className="text-sm font-bold text-[#212121]">
                          {formatINR(prod.price)}
                        </span>
                        {prod.artisanRegion && (
                          <span className="text-[10px] text-[#878787] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#388E3C]" />
                            {prod.artisanRegion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-3 pt-0 grid grid-cols-2 gap-2 border-t border-[#F0F0F0] mt-2 pt-2">
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(prod)}
                        className="py-1.5 px-2 rounded-[2px] bg-[#FF9F00] hover:bg-[#F29500] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenProductDetail?.(prod)}
                      className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Delivery & Payment Ledger */}
      {activeTab === 'shipping' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shipping Address */}
          <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2874F0]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                  Delivery Address
                </h3>
              </div>
              {!isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs text-[#2874F0] hover:underline uppercase tracking-wider font-bold cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#878787] uppercase font-bold mb-1">Street Address</label>
                  <SmartInput
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onValueChange={(val) => setStreet(val)}
                    placeholder="Street address / apartment"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#878787] uppercase font-bold mb-1">City</label>
                    <SmartInput
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onValueChange={(val) => setCity(val)}
                      placeholder="City"
                      className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#878787] uppercase font-bold mb-1">State / Pincode</label>
                    <div className="flex gap-1">
                      <SmartInput
                        type="text"
                        required
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                        onValueChange={(val) => setStateCode(val)}
                        placeholder="State"
                        className="w-20 px-2 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        containerClassName="w-24"
                      />
                      <SmartInput
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        onValueChange={(val) => setZip(val)}
                        placeholder="560038"
                        className="w-full px-2 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        containerClassName="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[#878787] uppercase font-bold mb-1">Country</label>
                  <SmartInput
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    onValueChange={(val) => setCountry(val)}
                    placeholder="India"
                    className="w-full px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-3 py-1.5 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs text-[#212121] space-y-1 bg-[#F1F3F6] p-3 rounded-[2px] border border-[#EAEAEA]">
                <div className="font-bold">{user.name}</div>
                <div>{user.shippingAddress?.street}</div>
                <div>
                  {user.shippingAddress?.city}, {user.shippingAddress?.state}{' '}
                  {user.shippingAddress?.zip}
                </div>
                <div>{user.shippingAddress?.country}</div>
              </div>
            )}
          </div>

          {/* Payment Card Authorization */}
          <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0F0F0]">
              <CreditCard className="w-4 h-4 text-[#2874F0]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                Saved Payment Method
              </h3>
            </div>

            <div className="p-4 rounded-[4px] bg-[#172337] text-[#FFFFFF] shadow-sm text-xs space-y-2.5">
              <div className="flex justify-between items-center text-[10px] text-[#FFFFFF]/70 uppercase tracking-widest">
                <span>Craftify Patron Card</span>
                <span className="text-[#388E3C] bg-[#EAF8EB] px-2 py-0.5 rounded-[2px] font-bold">Verified</span>
              </div>
              <div className="font-mono text-base tracking-widest text-[#FFFFFF]">•••• •••• •••• 4281</div>
              <div className="flex justify-between text-[11px] text-[#FFFFFF]/80">
                <span>{user.name.toUpperCase()}</span>
                <span>EXP 08/29</span>
              </div>
            </div>

            <p className="text-[11px] text-[#878787] leading-relaxed">
              Backing authorizations are queued conditionally. If a pledged campaign does not reach 100% of target by deadline, holds are released with 0% penalty.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Creator Workshop */}
      {activeTab === 'creator' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#212121]">
                Artisan Studio & Campaigns
              </h2>
              <p className="text-xs text-[#878787] mt-0.5">
                Manage crowdfunding runs, track escrow backings, and graduate completed crafts to retail.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-account-open-creator-dashboard"
                onClick={() => onNavigate('creator-dashboard')}
                className="px-3.5 py-1.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Creator Dashboard</span>
              </button>

              <button
                onClick={onOpenStartCampaign}
                className="px-3.5 py-1.5 rounded-[2px] border border-[#2874F0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Launch Campaign</span>
              </button>
            </div>
          </div>

          {/* Escrow Settlement Bridge Callout Banner */}
          <div className="p-4 rounded-[4px] bg-[#EAF8EB] border border-[#388E3C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#388E3C] flex items-center gap-2">
                <span>Escrow Settlement & Graduation Console</span>
              </div>
              <p className="text-xs text-[#878787] mt-0.5 max-w-2xl">
                Simulate reaching your campaign deadline, inspect the fee breakdown statement, capture backer authorizations, and graduate funded hardware directly into the Shop.
              </p>
            </div>
            <button
              onClick={() => onNavigate('creator-dashboard')}
              className="px-3.5 py-1.5 rounded-[2px] bg-[#388E3C] hover:bg-[#2E7D32] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold whitespace-nowrap self-start sm:self-auto transition-colors cursor-pointer shadow-xs"
            >
              Go to Settlement Console →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaigns.slice(0, 2).map((camp) => (
              <div
                key={camp.id}
                className="p-4 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2874F0]">{camp.code}</span>
                  <span
                    className={`font-bold uppercase text-[11px] ${
                      camp.status === 'funded' ? 'text-[#388E3C]' : 'text-[#FB641B]'
                    }`}
                  >
                    {camp.status === 'funded' ? '✓ Goal Achieved' : '• In Progress'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#212121]">
                  {camp.title}
                </h3>

                <div className="text-xs text-[#878787] space-y-1">
                  <div className="flex justify-between">
                    <span>Pledged to date:</span>
                    <span className="font-bold text-[#212121]">
                      {formatINR(camp.pledgedAmount)} of {formatINR(camp.goalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Backers enrolled:</span>
                    <span className="font-bold text-[#212121]">{camp.backersCount} patrons</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time remaining:</span>
                    <span className="font-bold text-[#212121]">{camp.daysLeft} days</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => onOpenCampaignDetail(camp)}
                    className="w-full py-1.5 rounded-[2px] border border-[#D5D5D5] hover:border-[#2874F0] hover:text-[#2874F0] bg-[#FFFFFF] text-xs uppercase tracking-wider font-bold text-center transition-colors cursor-pointer shadow-2xs"
                  >
                    Inspect Campaign Detail & Tiers →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
