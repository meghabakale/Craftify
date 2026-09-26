import React, { useState } from 'react';
import { User, CustomerOrder, ActiveView } from '../types';
import { STAGE_DISPLAY_LABELS } from '../data/mockOrders';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  PlayCircle,
  XCircle,
} from 'lucide-react';

interface MyOrdersPageProps {
  currentUser: User | null;
  orders: CustomerOrder[];
  onTrackOrder: (order: CustomerOrder) => void;
  onNavigate: (view: ActiveView) => void;
  onAdvanceStatus?: (orderId: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  currentUser,
  orders,
  onTrackOrder,
  onNavigate,
  onAdvanceStatus,
}) => {
  const { t, localizeOrder } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStageLabel = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'confirmed':
        return t('stageConfirmed');
      case 'packed':
        return t('stagePacked');
      case 'shipped':
        return t('stageShipped');
      case 'out_for_delivery':
        return t('stageOutForDelivery');
      case 'delivered':
        return t('stageDelivered');
      case 'cancelled':
        return t('stageCancelled');
      default:
        return STAGE_DISPLAY_LABELS[status] || status;
    }
  };

  // Filter orders strictly belonging to the currently logged in buyer
  const userOrders = orders.filter((order) => {
    if (!currentUser) return false;

    const currentUserIdStr = String(currentUser.id || '').trim();
    const orderBuyerIdStr = String(order.buyerId || '').trim();

    // 1. Direct ID match
    if (orderBuyerIdStr && currentUserIdStr && orderBuyerIdStr === currentUserIdStr) {
      return true;
    }

    // 2. Email match
    if (order.shippingAddress?.email && currentUser.email) {
      if (order.shippingAddress.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
        return true;
      }
    }

    // 3. Name match for seeded items
    const userNames = [currentUser.name, currentUser.legalName]
      .filter(Boolean)
      .map((s) => s!.toLowerCase().trim());

    if (userNames.length === 0) return false;

    const orderNames = [
      order.buyerId,
      order.backerName,
      order.shippingAddress?.fullName,
    ]
      .filter(Boolean)
      .map((s) => s!.toLowerCase().trim());

    return userNames.some((uName) => {
      if (uName.length < 3) return false;
      return orderNames.some((oName) => oName.includes(uName) || uName.includes(oName));
    });
  });

  const filteredOrders = userOrders.filter((order) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'delivered'
        ? order.status === 'delivered'
        : order.status !== 'delivered';

    const matchesSearch =
      searchQuery.trim() === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  return (
    <div id="my-orders-page" className="py-6 sm:py-8 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-[#878787] mb-3">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-[#2874F0] transition-colors cursor-pointer"
          >
            {t('home')}
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate('account')}
            className="hover:text-[#2874F0] transition-colors cursor-pointer"
          >
            {t('myAccount')}
          </button>
          <span>/</span>
          <span className="text-[#212121] font-semibold">{t('myOrders')}</span>
        </div>

        {/* Page Header */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2874F0]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#212121]">
                {t('myOrders')}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-[2px] bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20">
                {userOrders.length} {t('total', 'Total')}</span>
            </div>
            <p className="text-xs text-[#878787] mt-1">
              {t('trackRealTimeShipmentStatusArtisanB', 'Track real-time shipment status, artisan batch progress, and delivery verification.')}</p>
          </div>

          {/* Quick Action: Continue Shopping */}
          <button
            id="btn-orders-explore-shop"
            onClick={() => onNavigate('shop')}
            className="px-4 py-2 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('shop')}</span>
          </button>
        </div>

        {userOrders.length === 0 ? (
          <div id="my-orders-empty-state" className="p-8 sm:p-12 text-center bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EBF2FE] text-[#2874F0] flex items-center justify-center mx-auto border border-[#2874F0]/20">
              <Package className="w-8 h-8 text-[#2874F0]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                {t('noOrdersPlacedYet', 'No Orders Placed Yet')}</h2>
              <p className="text-xs sm:text-sm text-[#878787] max-w-md mx-auto leading-relaxed">
                {t('youHavenTPlacedAnyOrdersUnderYourAc', 'You haven\'t placed any orders under your account. Explore our marketplace for authentic handcrafted pieces from master artisans across India.')}</p>
            </div>
            <div className="pt-2">
              <button
                id="btn-empty-orders-start-shopping"
                onClick={() => onNavigate('shop')}
                className="px-6 py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('startShopping', 'Start Shopping')}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter Bar */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-3 mb-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  id="filter-orders-all"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                    filter === 'all'
                      ? t('bg2874f0TextWhite', 'bg-[#2874F0] text-white')
                      : t('bgF1f3f6Text666666HoverBgEaeaea', 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]')
                  }`}
                >
                  {t('allOrders', 'All Orders (')}{userOrders.length})
                </button>
                <button
                  id="filter-orders-in-transit"
                  onClick={() => setFilter('in_transit')}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                    filter === 'in_transit'
                      ? t('bg2874f0TextWhite', 'bg-[#2874F0] text-white')
                      : t('bgF1f3f6Text666666HoverBgEaeaea', 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]')
                  }`}
                >
                  {t('inTransit', 'In Transit (')}{userOrders.filter((o) => o.status !== 'delivered').length})
                </button>
                <button
                  id="filter-orders-delivered"
                  onClick={() => setFilter('delivered')}
                  className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                    filter === 'delivered'
                      ? t('bg2874f0TextWhite', 'bg-[#2874F0] text-white')
                      : t('bgF1f3f6Text666666HoverBgEaeaea', 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]')
                  }`}
                >
                  {t('delivered', 'Delivered (')}{userOrders.filter((o) => o.status === 'delivered').length})
                </button>
              </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <SmartInput
              id="input-search-orders"
              type="text"
              placeholder={t('searchByOrderIdOrItem', 'Search by Order ID or item...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onValueChange={(val) => setSearchQuery(val)}
              className="w-full bg-[#F1F3F6] text-xs text-[#212121] pl-8 pr-3 py-1.5 rounded-[2px] border border-[#E0E0E0] placeholder-[#878787] focus:outline-none focus:border-[#2874F0] focus:bg-white"
              enableVoice={true}
              enableLanguageDetection={true}
              showLanguageSwitchPrompt={true}
            />
          </div>
        </div>

        {/* Orders Cards List (Requirement 2) */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs">
            <Package className="w-12 h-12 text-[#878787]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#212121] mb-1">
              {t('noOrdersMatchYourCriteria', 'No orders match your criteria')}</h3>
            <p className="text-xs text-[#878787] mb-4 max-w-sm mx-auto">
              {searchQuery
                ? `No orders found matching "${searchQuery}". Try a different term or clear filters.`
                : t('youHaveNotPlacedAnyOrdersUnderThisF', 'You have not placed any orders under this filter.')}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 bg-[#F1F3F6] text-[#2874F0] font-bold text-xs rounded-[2px] cursor-pointer"
              >
                {t('clearSearch', 'Clear Search')}</button>
            ) : (
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2 bg-[#2874F0] text-white font-bold text-xs uppercase rounded-[2px] cursor-pointer"
              >
                {t('discoverHandcrafts', 'Discover Handcrafts')}</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((rawOrder) => {
              const order = localizeOrder(rawOrder);
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';
              const firstItem = order.items[0];
              const remainingCount = order.items.length - 1;

              return (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] shadow-xs hover:border-[#D0D0D0] transition-all overflow-hidden"
                >
                  {/* Card Top Metadata Bar */}
                  <div className="p-3.5 sm:p-4 bg-[#FAFAFA] border-b border-[#F0F0F0] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[10px] text-[#878787] uppercase font-bold block">
                          {t('orderPlaced', 'Order Placed')}</span>
                        <span className="font-semibold text-[#212121]">
                          {order.orderDate}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#878787] uppercase font-bold block">
                          {t('orderId', 'Order ID')}</span>
                        <span className="font-bold font-mono text-[#212121]">
                          {order.id}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#878787] uppercase font-bold block">
                          {order.isBackerReward ? t('pledgeStatus', 'Pledge Status') : t('totalPaid', 'Total Paid')}
                        </span>
                        <span className={`font-bold ${order.isBackerReward ? 'text-[#673AB7]' : 'text-[#388E3C]'}`}>
                          {order.isBackerReward ? t('includedWithPledge', 'Included with pledge') : formatINR(order.total)}
                        </span>
                      </div>

                      {order.isBackerReward && (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[2px] bg-[#EDE7F6] text-[#673AB7] border border-[#673AB7]/20">
                            <Sparkles className="w-3 h-3 text-[#673AB7]" />
                            {t('backerReward', 'Backer Reward')}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Short Label */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider ${
                          isCancelled
                            ? t('bgFdeceaTextD32f2fBorderBorderD32f2', 'bg-[#FDECEA] text-[#D32F2F] border border-[#D32F2F]/20')
                            : isDelivered
                            ? t('bgEaf8ebText388e3cBorderBorder388e3', 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/20')
                            : t('bgEbf2feText2874f0BorderBorder2874f', 'bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20')
                        }`}
                      >
                        {isCancelled ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : isDelivered ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#2874F0] animate-pulse" />
                        )}
                        <span>{getStageLabel(order.status)}</span>
                      </span>

                      {/* Optional subtle demo advance stage on card */}
                      {!isCancelled && onAdvanceStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvanceStatus(order.id);
                          }}
                          title={t('simulateAdvancingToNextStage', 'Simulate advancing to next stage')}
                          className="hidden md:flex items-center gap-1 text-[10px] text-[#878787] hover:text-[#2874F0] p-1 rounded hover:bg-[#EBF2FE] cursor-pointer transition-colors"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>{t('simulate', 'Simulate')}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Campaign Name Banner for Backer Rewards */}
                  {order.isBackerReward && (
                    <div className="px-4 py-1.5 bg-[#F3E5F5]/60 border-b border-[#E1BEE7]/40 text-xs text-[#4A148C] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#673AB7] shrink-0" />
                      <span>
                        <strong>{t('rewardFrom', 'Reward from:')}</strong> {order.originatingCampaignTitle || t('artisanCrowdfundingCampaign', 'Artisan Crowdfunding Campaign')}
                      </span>
                    </div>
                  )}

                  {/* Card Content: Products & Action Button */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Products summary */}
                    <div className="flex-1 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3.5 text-xs">
                          {/* Product Thumbnail */}
                          <div className="w-16 h-16 rounded-[2px] bg-white border border-[#EAEAEA] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-[#212121] truncate">
                              {item.title}
                            </h3>
                            <div className="text-[#878787] text-[11px] mt-0.5">
                              {t('qty', 'Qty:')}<strong className="text-[#212121]">{item.quantity}</strong> {t('price', '• Price:')}<strong className={order.isBackerReward || item.price === 0 ? t('text673ab7FontSemibold', 'text-[#673AB7] font-semibold') : "text-[#212121]"}>{order.isBackerReward || item.price === 0 ? t('includedWithPledge', 'Included with pledge') : formatINR(item.price)}</strong>
                            </div>

                            {(item.isFundedOnCraftify ?? item.isFundedOnLaunchMart) && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#B78103]">
                                <Sparkles className="w-3 h-3 text-[#B78103]" />
                                <span>{t('fundedOnCraftify', 'Funded on Craftify (')}{item.artisanName || t('artisanGuild', 'Artisan Guild')})</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-xs sm:text-sm font-bold ${order.isBackerReward || item.price === 0 ? "text-[#673AB7]" : "text-[#212121]"}`}>
                              {order.isBackerReward || item.price === 0 ? t('includedWithPledge', 'Included with pledge') : formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Card Actions: Track Order Button */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F0F0F0]">
                      <button
                        id={`btn-track-order-${order.id}`}
                        onClick={() => onTrackOrder(order)}
                        className="px-5 py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-white text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{t('trackOrder')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-center text-[10px] text-[#878787]">
                        {isDelivered ? (
                          <span className="text-[#388E3C] font-semibold">{t('deliveryComplete', 'Delivery Complete')}</span>
                        ) : (
                          <span>{order.estimatedDeliveryRange}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Delivery / Carrier Snippet */}
                  <div className="px-4 py-2 bg-[#F9FBFD] border-t border-[#EAEAEA] text-[11px] text-[#666666] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-[#2874F0]" />
                      <span>
                        {t('carrier', 'Carrier:')}<strong>{order.carrierName}</strong> {t('tracking', '(Tracking #')}{order.trackingNumber})
                      </span>
                    </div>
                    <div className="text-[#878787]">
                      {t('deliveringTo', 'Delivering to:')}{order.shippingAddress.fullName} ({order.shippingAddress.city})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
