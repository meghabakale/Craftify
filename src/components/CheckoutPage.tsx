import React, { useState, useRef } from 'react';
import { CartItem, User } from '../types';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowLeft,
  ShoppingBag,
  Lock,
  ExternalLink,
  MapPin,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import {
  StripePaymentElement,
  StripePaymentResult,
  StripePaymentElementRef,
} from './StripePaymentElement';

interface CheckoutPageProps {
  items: CartItem[];
  currentUser: User | null;
  onOrderPlaced: (orderDetails: OrderConfirmationData) => void;
  onBackToCart: () => void;
  onContinueShopping: () => void;
  onGoToAccount: () => void;
  onTrackOrder?: (orderId: string) => void;
}

export interface OrderConfirmationData {
  orderId: string;
  orderDate: string;
  estimatedDelivery?: string;
  items: CartItem[];
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
  };
  paymentMethod: string;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  currentUser,
  onOrderPlaced,
  onBackToCart,
  onContinueShopping,
  onGoToAccount,
  onTrackOrder,
}) => {
  const { t, localizeCartItem } = useLanguage();
  const stripePaymentRef = useRef<StripePaymentElementRef>(null);

  // Shipping Form State
  const [fullName, setFullName] = useState(currentUser?.name || 'Aarav Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'aarav.sharma@craftify.in');
  const [street, setStreet] = useState(
    currentUser?.shippingAddress?.street || 'Flat 402, Lotus Court, Indiranagar'
  );
  const [city, setCity] = useState(currentUser?.shippingAddress?.city || 'Bengaluru');
  const [state, setState] = useState(currentUser?.shippingAddress?.state || 'Karnataka');
  const [zip, setZip] = useState(currentUser?.shippingAddress?.zip || '560038');
  const [country, setCountry] = useState(currentUser?.shippingAddress?.country || 'India');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [addressError, setAddressError] = useState<string | null>(null);

  // Processing state from Stripe element
  const [isProcessing, setIsProcessing] = useState(false);

  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const isFreeShipping = subtotal >= 2000 || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : 150;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const validateAddress = (): boolean => {
    if (!fullName.trim()) {
      setAddressError('Please enter your full name for delivery.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setAddressError('Please enter a valid email address.');
      return false;
    }
    if (!street.trim()) {
      setAddressError('Please enter your street address.');
      return false;
    }
    if (!city.trim()) {
      setAddressError('Please enter your city.');
      return false;
    }
    if (!zip.trim()) {
      setAddressError('Please enter your PIN code.');
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handlePayClick = () => {
    if (!validateAddress()) {
      const el = document.getElementById('delivery-address-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (stripePaymentRef.current) {
      stripePaymentRef.current.submit();
    }
  };

  const handlePaymentSuccess = (paymentDetails: StripePaymentResult) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `CRF-2026-${randomNum}`;

    const now = new Date();
    const startEst = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    const endEst = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const startDay = startEst.getDate();
    const endDay = endEst.getDate();
    const endMonth = endEst.toLocaleDateString('en-IN', { month: 'short' });
    const estimatedDelivery = `Arriving between ${startDay}–${endDay} ${endMonth}`;

    const orderData: OrderConfirmationData = {
      orderId,
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      estimatedDelivery,
      items: [...items],
      subtotal,
      shipping: shippingCost,
      tax,
      total,
      shippingAddress: {
        fullName,
        email,
        street,
        city,
        state,
        zip,
        country,
      },
      paymentMethod: paymentDetails.summary,
    };

    setConfirmedOrder(orderData);
    onOrderPlaced(orderData);
  };

  // If order was placed, display the Order Confirmation Screen
  if (confirmedOrder) {
    return (
      <div id="order-confirmation-screen" className="py-8 sm:py-12 bg-[#F1F3F6] min-h-screen text-[#212121]">
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <div className="p-6 sm:p-8 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-6 shadow-xs">
            {/* Header Badge */}
            <div className="text-center space-y-2 pb-5 border-b border-[#F0F0F0]">
              <div className="w-14 h-14 rounded-full bg-[#388E3C] text-[#FFFFFF] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[#388E3C] text-xs uppercase tracking-wider font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('orderPlacedSuccess', 'Order Placed Successfully!')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#212121]">
                {t('thankYouOrder', 'Thank You for Ordering')}
              </h1>
              <p className="text-xs sm:text-sm text-[#878787] max-w-md mx-auto">
                {t('aVerificationRecordAndTrackingDetai', 'A verification record and tracking details have been sent to')}{' '}
                <strong className="text-[#212121]">{confirmedOrder.shippingAddress.email}</strong>.
              </p>
            </div>

            {/* Order Reference Box */}
            <div className="p-4 rounded-[4px] bg-[#F1F3F6] border border-[#EAEAEA] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#878787] uppercase tracking-wider block text-[11px]">{t('orderId', 'Order ID')}</span>
                <strong className="text-xs text-[#212121] font-bold">{confirmedOrder.orderId}</strong>
              </div>
              <div>
                <span className="text-[#878787] uppercase tracking-wider block text-[11px]">{t('orderDate', 'Order Date')}</span>
                <strong className="text-xs text-[#212121]">{confirmedOrder.orderDate}</strong>
              </div>
              <div>
                <span className="text-[#878787] uppercase tracking-wider block text-[11px]">{t('totalAmount', 'Total Paid')}</span>
                <strong className="text-xs text-[#388E3C] font-bold">{formatINR(confirmedOrder.total)}</strong>
              </div>
              <div>
                <span className="text-[#878787] uppercase tracking-wider block text-[11px]">{t('estimatedDelivery', 'Estimated Delivery')}</span>
                <strong className="text-xs text-[#212121] font-bold">
                  {confirmedOrder.estimatedDelivery || t('arrivingBetween1822Sept', 'Arriving between 18–22 Sept')}
                </strong>
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <h3 className="text-sm font-bold text-[#212121] mb-2 pb-2 border-b border-[#F0F0F0] uppercase tracking-wider">
                {t('items', 'Items in this Order')} ({confirmedOrder.items.length})
              </h3>
              <div className="space-y-2">
                {confirmedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-[2px] bg-[#FFFFFF] border border-[#F0F0F0] text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[2px] bg-[#FFFFFF] shrink-0 overflow-hidden border border-[#F0F0F0] p-0.5">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <strong className="text-[#212121] block text-xs">{item.title}</strong>
                        <span className="text-[#878787]">
                          {t('qty', 'Qty:')}{item.quantity} × {formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                    <strong className="text-[#212121] text-xs">
                      {formatINR(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Recap */}
            <div className="p-4 rounded-[4px] bg-[#EAF8EB] border border-[#388E3C]/20 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#388E3C] font-bold uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>{t('shippingAddress', 'Delivery Address')}</span>
              </div>
              <p className="text-[#212121]">
                <strong>{confirmedOrder.shippingAddress.fullName}</strong>
                <br />
                {confirmedOrder.shippingAddress.street}
                <br />
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}{' '}
                {confirmedOrder.shippingAddress.zip}, {confirmedOrder.shippingAddress.country}
              </p>
              <div className="text-[11px] text-[#878787] pt-1.5 border-t border-[#388E3C]/20 flex items-center justify-between">
                <span>{t('payment', 'Payment:')} {confirmedOrder.paymentMethod}</span>
                <span className="text-[#388E3C] font-bold">{t('statusOrderConfirmed', 'Status: Order Confirmed')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#F0F0F0]">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  id="btn-conf-track-order"
                  onClick={() => {
                    if (onTrackOrder) {
                      onTrackOrder(confirmedOrder.orderId);
                    } else {
                      onGoToAccount();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('trackOrder', 'Track Order')}</span>
                </button>

                <button
                  id="btn-conf-view-account"
                  onClick={onGoToAccount}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-[2px] border border-[#2874F0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#2874F0] text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>{t('myOrders', 'View in My Orders')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                id="btn-conf-continue-shopping"
                onClick={onContinueShopping}
                className="w-full sm:w-auto px-5 py-2.5 rounded-[2px] border border-[#E0E0E0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#666666] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('continueShopping', 'Continue Shopping')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-page" className="py-4 sm:py-6 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Navigation bar */}
        <div className="flex items-center justify-between py-2.5 px-4 mb-4 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs">
          <button
            onClick={onBackToCart}
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#2874F0] hover:text-[#1C5FD0] font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToCart', 'Back to Cart')}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#388E3C] font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('safeAndSecurePayments', '100% Safe & Secure Checkout')}</span>
          </div>
        </div>

        {/* Layout: Main Sequential Flow (8 cols) + Sticky Order Total Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Flow: Delivery Address -> Order Summary -> Stripe Payment Element */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. DELIVERY ADDRESS SECTION */}
            <div
              id="delivery-address-section"
              className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#2874F0]" />
                    <span>{t('shippingAddress', 'Delivery Address')}</span>
                  </h2>
                </div>
                <span className="text-[11px] text-[#388E3C] font-bold uppercase tracking-wider">
                  {t('insuredDelivery', 'Insured Delivery')}
                </span>
              </div>

              {addressError && (
                <div className="p-2.5 rounded-[4px] bg-[#FFF2F4] border border-[#F8D7DA] text-[#DF1B41] text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('fullName', 'Full Name *')}
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (addressError) setAddressError(null);
                    }}
                    onValueChange={(val) => {
                      setFullName(val);
                      if (addressError) setAddressError(null);
                    }}
                    placeholder={t('eGAnandKumar', 'e.g. Anand Kumar')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('emailAddress', 'Email Address *')}
                  </label>
                  <SmartInput
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onValueChange={(val) => setEmail(val)}
                    placeholder={t('nameExampleCom', 'name@example.com')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('phoneNumber', 'Phone Number *')}
                  </label>
                  <SmartInput
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onValueChange={(val) => setPhone(val)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('streetAddressFlatFloor', 'Street Address / Flat / Floor *')}
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onValueChange={(val) => setStreet(val)}
                    placeholder={t('flatHouseNoBuildingApartmentStreetN', 'Flat / House no., building, apartment, street name')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('city', 'City *')}
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onValueChange={(val) => setCity(val)}
                    placeholder={t('eGPuneVaranasi', 'e.g. Pune / Varanasi')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('state', 'State *')}
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onValueChange={(val) => setState(val)}
                    placeholder={t('eGMaharashtraUttarPradesh', 'e.g. Maharashtra / Uttar Pradesh')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('pinCode', 'PIN Code *')}
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onValueChange={(val) => setZip(val)}
                    placeholder={t('eG411001', 'e.g. 411001')}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    {t('country', 'Country *')}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0] cursor-pointer"
                  >
                    <option value="India">{t('india', 'India')}</option>
                    <option value="United States">{t('unitedStates', 'United States')}</option>
                    <option value="United Kingdom">{t('unitedKingdom', 'United Kingdom')}</option>
                    <option value="United Arab Emirates">{t('unitedArabEmirates', 'United Arab Emirates')}</option>
                    <option value="Singapore">{t('singapore', 'Singapore')}</option>
                    <option value="Canada">{t('canada', 'Canada')}</option>
                    <option value="Australia">{t('australia', 'Australia')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. ORDER SUMMARY SECTION */}
            <div
              id="order-summary-section"
              className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121] flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-[#2874F0]" />
                    <span>{t('orderSummary', 'Order Summary')} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t('items', 'items')})</span>
                  </h2>
                </div>
                <span className="text-xs text-[#878787] font-semibold">
                  Subtotal: <strong className="text-[#212121]">{formatINR(subtotal)}</strong>
                </span>
              </div>

              {/* Line items list */}
              <div className="divide-y divide-[#F0F0F0] max-h-60 overflow-y-auto pr-1">
                {items.map((rawItem) => {
                  const item = localizeCartItem(rawItem);
                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-[2px] bg-[#FFFFFF] border border-[#F0F0F0] shrink-0 overflow-hidden p-0.5">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-[#212121] block truncate text-xs">{item.title}</strong>
                          <span className="text-[#878787] text-[11px]">
                            {t('qty', 'Qty:')} {item.quantity} × {formatINR(item.price)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-[#212121] shrink-0">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal & calculations breakdown */}
              <div className="pt-3 border-t border-[#F0F0F0] space-y-1.5 text-xs text-[#666666]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#212121]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span>
                    {isFreeShipping ? (
                      <strong className="text-[#388E3C] uppercase">FREE</strong>
                    ) : (
                      formatINR(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Platform Cess (5%)</span>
                  <span className="font-semibold text-[#212121]">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-[#E0E0E0] text-sm font-bold text-[#212121]">
                  <span>Total Payable:</span>
                  <span className="text-base text-[#212121]">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            {/* 3. STRIPE-STYLE PAYMENT ELEMENT */}
            <div id="stripe-payment-section" className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                  Payment Method
                </h2>
                <span className="text-xs text-[#878787] font-normal">
                  — Powered by Stripe Elements
                </span>
              </div>

              {/* Reusable Stripe Payment Element */}
              <StripePaymentElement
                ref={stripePaymentRef}
                amount={total}
                buttonText={`Pay ${formatINR(total)}`}
                loadingText="Confirming payment..."
                defaultCardholderName={fullName}
                showButton={true}
                onSuccess={handlePaymentSuccess}
                onProcessingChange={setIsProcessing}
              />
            </div>
          </div>

          {/* Sticky Sidebar: Order Total + Stripe Pay Button */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#878787] pb-2.5 border-b border-[#F0F0F0]">
                Payment Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#666666]">
                  <span>Items Total ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                  <span className="font-semibold text-[#212121]">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Delivery Charges</span>
                  <span>
                    {isFreeShipping ? (
                      <strong className="text-[#388E3C] uppercase">FREE</strong>
                    ) : (
                      formatINR(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-[#212121]">{formatINR(tax)}</span>
                </div>

                <div className="pt-3 border-t border-dashed border-[#E0E0E0] flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase font-bold text-[#878787] block">Order Total</span>
                    <span className="text-[11px] text-[#388E3C] font-semibold">Includes all taxes</span>
                  </div>
                  <span className="text-2xl font-bold text-[#212121]">{formatINR(total)}</span>
                </div>
              </div>

              {/* Stripe-Styled Pay Button */}
              <button
                id="btn-sticky-stripe-pay"
                type="button"
                disabled={isProcessing}
                onClick={handlePayClick}
                className="w-full h-11 px-4 rounded-[6px] bg-[#635BFF] hover:bg-[#5851EA] active:bg-[#4F46E5] text-[#FFFFFF] text-sm font-semibold tracking-wide shadow-[0_2px_4px_rgba(99,91,255,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Confirming payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay {formatINR(total)}</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-[#F0F0F0] space-y-2 text-[11px] text-[#878787]">
                <div className="flex items-center gap-1.5 text-[#388E3C] font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Authentic Products • Escrow Guarantee</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Payments are processed securely via Stripe simulated test gateway. No actual card or bank deduction will occur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
