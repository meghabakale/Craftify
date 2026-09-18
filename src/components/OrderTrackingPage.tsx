import React, { useState } from 'react';
import { CustomerOrder, OrderTrackingStage } from '../types';
import { ORDER_STAGES, STAGE_DISPLAY_LABELS, CANCELLATION_REASONS, ORDER_TRACKING_FAQS } from '../data/mockOrders';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartTextarea } from './common/SmartTextarea';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Phone,
  RotateCcw,
  PlayCircle,
  Copy,
  Info,
  X,
  FileText,
  MessageCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface OrderTrackingPageProps {
  order: CustomerOrder;
  onBackToOrders: () => void;
  onAdvanceStatus: (orderId: string) => void;
  onResetStatus?: (orderId: string) => void;
  onCancelOrder?: (orderId: string, reason?: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  order,
  onBackToOrders,
  onAdvanceStatus,
  onResetStatus,
  onCancelOrder,
}) => {
  const { t } = useLanguage();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isCancellable =
    order.status === 'confirmed' ||
    (order.status as string) === 'order_placed' ||
    order.status === 'packed';
  const isCancelled = order.status === 'cancelled';

  const getStageLabel = (stageKey: OrderTrackingStage) => {
    switch (stageKey) {
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
        return STAGE_DISPLAY_LABELS[stageKey] || stageKey;
    }
  };

  const handleConfirmCancel = () => {
    setIsCancelling(true);
    const finalReason =
      cancelReason === 'Other reason' && customReason.trim()
        ? customReason.trim()
        : cancelReason;
    if (onCancelOrder) {
      onCancelOrder(order.id, finalReason);
    }
    setIsCancelling(false);
    setIsCancelModalOpen(false);
  };

  const currentStageIndex = ORDER_STAGES.indexOf(order.status);

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Check if any item is funded on Craftify
  const fundedCraftItem = order.items.find((item) => (item.isFundedOnCraftify ?? item.isFundedOnLaunchMart));

  return (
    <div id="order-tracking-detail-page" className="py-6 sm:py-8 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <button
            id="btn-back-to-orders"
            onClick={onBackToOrders}
            className="flex items-center gap-1.5 text-[#2874F0] font-semibold hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← {t('myOrders')}</span>
          </button>

          {/* Dev/Demo Status Simulation Panel (Subtly styled demo control) */}
          <div
            id="demo-status-simulation-panel"
            className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D5D5D5] rounded-[4px] px-2.5 py-1 shadow-2xs"
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#878787] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2874F0] animate-pulse"></span>
              Demo Simulation:
            </span>

            <button
              id="btn-simulate-advance-stage"
              onClick={() => onAdvanceStatus(order.id)}
              className="px-2 py-0.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Advance order to the next tracking stage"
            >
              <PlayCircle className="w-3 h-3" />
              <span>Advance Stage</span>
            </button>

            {onResetStatus && (
              <button
                id="btn-simulate-reset-stage"
                onClick={() => onResetStatus(order.id)}
                className="px-1.5 py-0.5 rounded-[2px] border border-[#E0E0E0] hover:bg-[#F1F3F6] text-[#666666] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset order back to Confirmed"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 mb-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0F0F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#878787] uppercase tracking-wider font-semibold">
                  Order ID:
                </span>
                <span className="text-sm font-bold font-mono text-[#212121]">
                  {order.id}
                </span>
                <span className="text-xs text-[#878787]">•</span>
                <span className="text-xs text-[#878787]">
                  Placed on {order.orderDate}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {isCancelled
                    ? t('orderCancelled')
                    : order.status === 'delivered'
                    ? 'Order Delivered'
                    : order.estimatedDeliveryRange}
                </h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-[2px] font-bold uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-[#FDECEA] text-[#D32F2F] border border-[#D32F2F]/20'
                      : order.status === 'delivered'
                      ? 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/20'
                      : 'bg-[#EBF2FE] text-[#2874F0] border border-[#2874F0]/20'
                  }`}
                >
                  {getStageLabel(order.status)}
                </span>
              </div>
            </div>

            {/* Courier & Tracking Reference + Cancel Order Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {!isCancelled && (
                <div className="bg-[#F9FBFD] border border-[#D8E6FA] rounded-[4px] p-3 text-xs flex flex-col gap-1">
                  <div className="text-[11px] text-[#666666] uppercase font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#2874F0]" />
                    <span>Logistics Partner: {order.carrierName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#878787]">Tracking ID:</span>
                    <span className="font-mono font-bold text-[#212121]">{order.trackingNumber}</span>
                    <button
                      onClick={handleCopyTracking}
                      className="p-1 text-[#2874F0] hover:bg-[#EBF2FE] rounded cursor-pointer transition-colors"
                      title="Copy tracking number"
                    >
                      {copiedTracking ? (
                        <span className="text-[10px] text-[#388E3C] font-bold">Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Order Button: visible only for 'Order Placed' or 'Packed' status */}
              {isCancellable && (
                <button
                  id="btn-cancel-order"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-3.5 py-2 rounded-[2px] border border-[#D32F2F] text-[#D32F2F] bg-[#FFFFFF] hover:bg-[#FDECEA] hover:border-[#B71C1C] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-center"
                  title="Cancel order and restore product inventory"
                >
                  <XCircle className="w-4 h-4 text-[#D32F2F]" />
                  <span>{t('cancelOrder')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Cancelled Alert Box */}
          {isCancelled && (
            <div
              id="order-cancelled-banner"
              className="mt-4 p-4 rounded-[4px] bg-[#FFF5F5] border border-[#FEB2B2] flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-[#D32F2F] shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-bold text-[#991B1B] text-sm mb-1">
                  {t('orderCancelled')}
                </h3>
                <p className="text-[#771D1D] leading-relaxed mb-2">
                  This order was cancelled prior to dispatch. A 100% refund of{' '}
                  <span className="font-bold text-[#212121]">{formatINR(order.total)}</span> has been credited back from patron escrow to your original payment method ({order.paymentMethod}).
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#FFFFFF] border border-[#FEB2B2] text-[#991B1B] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#388E3C]" />
                  <span>
                    Artisan stock replenished: {order.items.reduce((s, i) => s + i.quantity, 0)} item(s) restored to inventory.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Craftify Horizontal Step Tracker */}
          <div className="py-6 sm:py-8 px-2 sm:px-6">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#878787] mb-6">
              Delivery Progress
            </h2>

            {isCancelled ? (
              <div
                id="order-cancelled-timeline-notice"
                className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[4px] p-6 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#FDECEA] text-[#D32F2F] flex items-center justify-center mx-auto mb-2.5">
                  <XCircle className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#212121]">
                  Order Terminated Prior to Dispatch
                </h3>
                <p className="text-xs text-[#666666] max-w-md mx-auto mt-1 leading-relaxed">
                  This order was cancelled. 100% of the funds held in escrow have been refunded to your original payment method, and product inventory has been restored to the artisan workshop.
                </p>
              </div>
            ) : (
              <>
                {/* Tracker Bar */}
                <div className="relative">
                  {/* Connector line behind circles */}
                  <div className="absolute top-4 left-6 right-6 h-1 bg-[#E0E0E0] -translate-y-1/2 z-0 hidden sm:block">
                    <div
                      className="h-full bg-[#388E3C] transition-all duration-500 ease-in-out"
                      style={{
                        width: `${(Math.min(currentStageIndex, ORDER_STAGES.length - 1) / (ORDER_STAGES.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Horizontal Stages Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                    {ORDER_STAGES.map((stageKey, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isCurrent = idx === currentStageIndex;
                      const isPending = idx > currentStageIndex;

                      const historyEvent = order.history.find((h) => h.stage === stageKey);

                      return (
                        <div
                          key={stageKey}
                          className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 group"
                        >
                          {/* Step Circle Indicator */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#388E3C] text-white shadow-xs'
                                : isCurrent
                                ? 'bg-[#2874F0] text-white ring-4 ring-[#2874F0]/20 shadow-xs'
                                : 'bg-[#F1F3F6] border border-[#D5D5D5] text-[#878787]'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isCurrent ? (
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          {/* Stage Label & Timestamp */}
                          <div className="flex-1 sm:flex-none">
                            <div
                              className={`text-xs font-bold leading-tight ${
                                isCompleted
                                  ? 'text-[#388E3C]'
                                  : isCurrent
                                  ? 'text-[#2874F0]'
                                  : 'text-[#878787]'
                              }`}
                            >
                              {getStageLabel(stageKey)}
                            </div>

                            {/* Timestamp under stage */}
                            <div className="text-[11px] text-[#878787] mt-0.5 leading-tight">
                              {historyEvent ? historyEvent.timestamp : isPending ? 'Upcoming' : ''}
                            </div>

                            {/* Current stage badge on mobile */}
                            {isCurrent && (
                              <span className="sm:hidden inline-block text-[10px] font-bold text-[#2874F0] bg-[#EBF2FE] px-1.5 py-0.5 rounded-[2px] mt-0.5">
                                Current Stage
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Milestone Description */}
                {order.history[currentStageIndex] && (
                  <div className="mt-6 p-3 rounded-[4px] bg-[#F9FBFD] border border-[#E0EAF5] text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#2874F0] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#212121]">
                        Latest Status Update ({order.history[currentStageIndex].location || 'In Transit'}):
                      </span>{' '}
                      <span className="text-[#666666]">
                        {order.history[currentStageIndex].description}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Craftify Backing Acknowledgement Note (Requirement 3) */}
        {fundedCraftItem && (
          <div
            id="craftify-artisan-backing-note"
            className="mb-5 p-4 sm:p-5 rounded-[4px] bg-[#FFFBF0] border border-[#FFE8A3] shadow-xs flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE500]/30 text-[#B78103] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-[#B78103]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#B78103] bg-[#FFF3D1] px-2 py-0.5 rounded-[2px] border border-[#FFE8A3]">
                  Funded on Craftify Handcraft
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-[#664D03] mt-1">
                "This item was handcrafted after your campaign backing — thank you for supporting {fundedCraftItem.artisanName || 'our master artisan'}."
              </p>
              <p className="text-[11px] text-[#856404] mt-0.5">
                Your support directly funded the raw material purchase, kiln firing, and fair-wage labor at the local artisan cooperative.
              </p>
            </div>
          </div>
        )}

        {/* Two Column Section: Ordered Items & Shipping Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Items in this Order (2 columns) */}
          <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 shadow-xs">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#878787] pb-3 border-b border-[#F0F0F0] mb-3">
              Items in this shipment ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-[4px] bg-[#FAFAFA] border border-[#EAEAEA] text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-[2px] bg-white border border-[#E0E0E0] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#212121]">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <div className="text-[11px] text-[#878787] mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                      <div className="text-xs text-[#666666] mt-1">
                        Qty: <strong className="text-[#212121]">{item.quantity}</strong> × {formatINR(item.price)}
                      </div>
                      {(item.isFundedOnCraftify ?? item.isFundedOnLaunchMart) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#388E3C] bg-[#EAF8EB] px-1.5 py-0.2 rounded-[2px] border border-[#388E3C]/20 mt-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Funded on Craftify
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-[#212121]">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-3 border-t border-[#F0F0F0] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Items Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Logistics & Freight</span>
                <span className="text-[#388E3C] font-semibold">
                  {order.shipping === 0 ? 'FREE' : formatINR(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>GST & Artisan Welfare Cess (5%)</span>
                <span>{formatINR(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#212121] pt-2 border-t border-[#F0F0F0]">
                <span>Total Amount Paid</span>
                <span className="text-[#388E3C]">{formatINR(order.total)}</span>
              </div>
              <div className="text-[11px] text-[#878787] pt-1">
                Payment Method: <strong className="text-[#212121]">{order.paymentMethod}</strong>
              </div>
            </div>
          </div>

          {/* Delivery Address & Customer Info (1 column) */}
          <div className="space-y-4">
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 shadow-xs text-xs space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#878787] pb-2 border-b border-[#F0F0F0]">
                <MapPin className="w-4 h-4 text-[#2874F0]" />
                <span>Delivery Address</span>
              </div>

              <div>
                <strong className="text-sm font-bold text-[#212121] block">
                  {order.shippingAddress.fullName}
                </strong>
                <p className="text-[#666666] leading-relaxed mt-1">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <div className="text-[#878787] mt-2 flex items-center gap-1.5 text-[11px]">
                    <Phone className="w-3 h-3" />
                    <span>Phone: {order.shippingAddress.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Escrow Guarantee Card */}
            <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 shadow-xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-[#388E3C] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#388E3C]" />
                <span>Craftify Patron Protection</span>
              </div>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Your payment remains in protected escrow until the package is safely delivered to your doorstep and inspected.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Audit Log */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-5 sm:p-6 mb-5 shadow-xs">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#878787] mb-4 pb-2 border-b border-[#F0F0F0]">
            Activity Tracking Log
          </h2>

          <div className="space-y-4">
            {order.history.map((evt, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    evt.completed
                      ? 'bg-[#EAF8EB] text-[#388E3C]'
                      : 'bg-[#F1F3F6] text-[#878787]'
                  }`}
                >
                  {evt.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 pb-3 border-b border-[#F5F5F5] last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className={`font-bold ${evt.completed ? 'text-[#212121]' : 'text-[#878787]'}`}>
                      {evt.label}
                    </span>
                    <span className="text-[11px] text-[#878787] font-mono">
                      {evt.timestamp}
                    </span>
                  </div>
                  {evt.location && (
                    <div className="text-[11px] text-[#666666] mt-0.5">
                      Location: {evt.location}
                    </div>
                  )}
                  {evt.description && (
                    <p className="text-[11px] text-[#878787] mt-0.5">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Help & Support Action (Requirement 3) */}
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF2FE] text-[#2874F0] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#212121]">
                Need help with this order?
              </h3>
              <p className="text-xs text-[#878787]">
                Issues with delivery, replacement guarantee, or artisan workshop questions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isCancellable && (
              <button
                id="btn-cancel-order-bottom"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-[2px] border border-[#D32F2F] bg-[#FFFFFF] hover:bg-[#FDECEA] text-[#D32F2F] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                title="Cancel order and restore product inventory"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{t('cancelOrder')}</span>
              </button>
            )}

            <button
              id="btn-need-help-order"
              onClick={() => setIsHelpModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2 rounded-[2px] border border-[#2874F0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shrink-0"
            >
              Get Help & FAQs
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div
          id="cancel-order-modal"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              id="btn-close-cancel-modal"
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#878787] hover:text-[#212121] rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#F0F0F0]">
              <div className="w-8 h-8 rounded-full bg-[#FDECEA] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#D32F2F]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#212121]">
                  Cancel Order?
                </h3>
                <span className="text-[11px] font-mono text-[#878787]">
                  {order.id} • Status: {getStageLabel(order.status)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 text-xs">
              <p className="text-[#555555] leading-relaxed">
                Are you sure you want to cancel this order? Since this order has not yet been dispatched for shipping, cancellation is instantaneous with zero cancellation charges.
              </p>

              {/* Escrow & Stock Restoration Info */}
              <div className="p-3 bg-[#F9FBFD] border border-[#D8E6FA] rounded-[4px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Refund Amount:</span>
                  <span className="text-sm font-bold text-[#388E3C]">{formatINR(order.total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666]">Refund Destination:</span>
                  <span className="font-semibold text-[#212121]">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E8EFF8] pt-1.5">
                  <span className="text-[#666666]">Inventory Restoration:</span>
                  <span className="font-semibold text-[#2874F0]">
                    +{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s) restored to artisan stock
                  </span>
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="block font-bold text-[#212121] mb-2">
                  Please select a reason for cancellation:
                </label>
                <div className="space-y-1.5">
                  {CANCELLATION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2 rounded-[2px] border cursor-pointer transition-colors ${
                        cancelReason === reason
                          ? 'border-[#2874F0] bg-[#EBF2FE]/50 font-semibold text-[#212121]'
                          : 'border-[#EAEAEA] hover:bg-[#FAFAFA] text-[#555555]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="text-[#2874F0] focus:ring-[#2874F0]"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {cancelReason === 'Other reason' && (
                  <SmartTextarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    onValueChange={(val) => setCustomReason(val)}
                    placeholder="Tell us more about why you are cancelling (optional)..."
                    className="w-full mt-2 p-2.5 text-xs border border-[#CCCCCC] rounded-[2px] focus:outline-none focus:border-[#2874F0]"
                    rows={2}
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-end gap-2.5">
                <button
                  id="btn-dismiss-cancel-order"
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-3.5 py-2 border border-[#CCCCCC] hover:bg-[#F1F3F6] text-[#555555] font-semibold text-xs rounded-[2px] cursor-pointer transition-colors"
                >
                  {t('keepOrder')}
                </button>
                <button
                  id="btn-confirm-cancel-order"
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isCancelling ? 'Cancelling...' : t('confirmCancelOrder')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static Help Panel Modal */}
      {isHelpModalOpen && (
        <div
          id="order-help-modal-overlay"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] max-w-lg w-full p-5 sm:p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              id="btn-close-help-modal"
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-[#878787] hover:text-[#212121] rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F0F0F0]">
              <HelpCircle className="w-5 h-5 text-[#2874F0]" />
              <h3 className="text-lg font-bold text-[#212121]">
                Order Support: {order.id}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-[#666666]">
                Every Craftify item is dispatched under direct patron escrow protection with verified logistics tracking.
              </p>

              {/* Quick FAQs */}
              <div className="space-y-2">
                {ORDER_TRACKING_FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className="border border-[#EAEAEA] rounded-[2px] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full text-left p-2.5 bg-[#FAFAFA] font-bold text-[#212121] flex items-center justify-between hover:bg-[#F1F3F6] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-xs text-[#878787]">
                        {expandedFaq === i ? '−' : '+'}
                      </span>
                    </button>
                    {expandedFaq === i && (
                      <div className="p-2.5 bg-[#FFFFFF] text-[#666666] border-t border-[#EAEAEA] leading-relaxed">
                        {faq.q === 'Where is my parcel right now?'
                          ? `Your parcel is handled by ${order.carrierName} under Tracking ID ${order.trackingNumber}. You can expect delivery ${order.estimatedDeliveryRange}.`
                          : faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Direct Guild Contact */}
              <div className="p-3 bg-[#F9FBFD] border border-[#D8E6FA] rounded-[4px] space-y-1">
                <strong className="text-[#212121] block">Direct Artisan Helpline</strong>
                <p className="text-[#666666] text-[11px]">
                  Hours: Mon–Sat, 9:00 AM – 7:00 PM IST<br />
                  Email: support@craftify.in • Call: 1800-419-CRAFT
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0F0F0] flex justify-end">
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  className="px-4 py-2 bg-[#2874F0] text-white text-xs uppercase font-bold rounded-[2px] cursor-pointer"
                >
                  Close Help Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
