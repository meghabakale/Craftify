import React, { useState } from 'react';
import { CustomerOrder, ActiveView } from '../types';
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
  orders: CustomerOrder[];
  onTrackOrder: (order: CustomerOrder) => void;
  onNavigate: (view: ActiveView) => void;
  onAdvanceStatus?: (orderId: string) => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  orders,
  onTrackOrder,
  onNavigate,
  onAdvanceStatus,
}) => {
  const { t } = useLanguage();
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

  const filteredOrders = orders.filter((order) => {
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
                {orders.length} Total
              </span>
            </div>
            <p className="text-xs text-[#878787] mt-1">
              Track real-time shipment status, artisan batch progress, and delivery verification.
            </p>
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

        {/* Search & Filter Bar */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-3 mb-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              id="filter-orders-all"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#2874F0] text-white'
                  : 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              id="filter-orders-in-transit"
              onClick={() => setFilter('in_transit')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                filter === 'in_transit'
                  ? 'bg-[#2874F0] text-white'
                  : 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]'
              }`}
            >
              In Transit ({orders.filter((o) => o.status !== 'delivered').length})
            </button>
            <button
              id="filter-orders-delivered"
              onClick={() => setFilter('delivered')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                filter === 'delivered'
                  ? 'bg-[#2874F0] text-white'
                  : 'bg-[#F1F3F6] text-[#666666] hover:bg-[#EAEAEA]'
              }`}
            >
              Delivered ({orders.filter((o) => o.status === 'delivered').length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <SmartInput
              id="input-search-orders"
              type="text"
              placeholder="Search by Order ID or item..."
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
              No orders match your criteria
            </h3>
            <p className="text-xs text-[#878787] mb-4 max-w-sm mx-auto">
              {searchQuery
                ? `No orders found matching "${searchQuery}". Try a different term or clear filters.`
                : 'You have not placed any orders under this filter.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 bg-[#F1F3F6] text-[#2874F0] font-bold text-xs rounded-[2px] cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2 bg-[#2874F0] text-white font-bold text-xs uppercase rounded-[2px] cursor-pointer"
              >
                Discover Handcrafts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
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
                          Order Placed
                        </span>
                        <span className="font-semibold text-[#212121]">
                          {order.orderDate}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#878787] uppercase font-bold block">
                          Order ID
                        </span>
                        <span className="font-bold font-mono text-[#212121]">
                          {order.id}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#878787] uppercase font-bold block">
                          Total Paid
                        </span>
                        <span className="font-bold text-[#388E3C]">
                          {formatINR(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Status Short Label */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-[#FDECEA] text-[#D32F2F] border border-[#D32F2F]/20'
                            : isDelivered
                            ? 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/20'
                            : 'bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20'
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
                          title="Simulate advancing to next stage"
                          className="hidden md:flex items-center gap-1 text-[10px] text-[#878787] hover:text-[#2874F0] p-1 rounded hover:bg-[#EBF2FE] cursor-pointer transition-colors"
                        >
                          <PlayCircle className="w-3 h-3" />
                          <span>Simulate</span>
                        </button>
                      )}
                    </div>
                  </div>

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
                              Qty: <strong className="text-[#212121]">{item.quantity}</strong> • Price: <strong className="text-[#212121]">{formatINR(item.price)}</strong>
                            </div>

                            {(item.isFundedOnCraftify ?? item.isFundedOnLaunchMart) && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#B78103]">
                                <Sparkles className="w-3 h-3 text-[#B78103]" />
                                <span>Funded on Craftify ({item.artisanName || 'Artisan Guild'})</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-[#212121]">
                              {formatINR(item.price * item.quantity)}
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
                          <span className="text-[#388E3C] font-semibold">Delivery Complete</span>
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
                        Carrier: <strong>{order.carrierName}</strong> (Tracking #{order.trackingNumber})
                      </span>
                    </div>
                    <div className="text-[#878787]">
                      Delivering to: {order.shippingAddress.fullName} ({order.shippingAddress.city})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
