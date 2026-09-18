import React, { useState } from 'react';
import { CartItem, User } from '../types';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import { SmartInput } from './common/SmartInput';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Truck,
  ArrowLeft,
  ShoppingBag,
  PackageCheck,
  Calendar,
  Lock,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

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

type PaymentMethodType = 'upi' | 'card' | 'balance' | 'wire';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  currentUser,
  onOrderPlaced,
  onBackToCart,
  onContinueShopping,
  onGoToAccount,
  onTrackOrder,
}) => {
  const { t } = useLanguage();

  // Shipping Form State
  const [fullName, setFullName] = useState(currentUser?.name || 'Aarav Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'aarav.sharma@craftify.in');
  const [street, setStreet] = useState(currentUser?.shippingAddress?.street || 'Flat 402, Lotus Court, Indiranagar');
  const [city, setCity] = useState(currentUser?.shippingAddress?.city || 'Bengaluru');
  const [state, setState] = useState(currentUser?.shippingAddress?.state || 'Karnataka');
  const [zip, setZip] = useState(currentUser?.shippingAddress?.zip || '560038');
  const [country, setCountry] = useState(currentUser?.shippingAddress?.country || 'India');
  const [phone, setPhone] = useState('+91 98765 43210');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('891');

  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const isFreeShipping = subtotal >= 2000 || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : 150;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

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
      paymentMethod:
        paymentMethod === 'upi'
          ? `UPI (${upiId})`
          : paymentMethod === 'card'
          ? 'RuPay / Credit Card (•••• 4242)'
          : paymentMethod === 'balance'
          ? 'Craftify Artisan Escrow Credit'
          : 'NEFT / RTGS Direct Bank Transfer',
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
                A verification record and tracking details have been sent to{' '}
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
                  {confirmedOrder.estimatedDelivery || 'Arriving between 18–22 Sept'}
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
                        <span className="text-[#878787]">Qty: {item.quantity} × {formatINR(item.price)}</span>
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
                <strong>{confirmedOrder.shippingAddress.fullName}</strong><br />
                {confirmedOrder.shippingAddress.street}<br />
                {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.zip}, {confirmedOrder.shippingAddress.country}
              </p>
              <div className="text-[11px] text-[#878787] pt-1.5 border-t border-[#388E3C]/20 flex items-center justify-between">
                <span>Payment: {confirmedOrder.paymentMethod}</span>
                <span className="text-[#388E3C] font-bold">Status: Order Confirmed</span>
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
        <div className="flex items-center justify-between py-2.5 px-4 mb-3 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs">
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

        {/* Layout: Form (7 cols) + Summary (5 cols) */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Shipping & Payment Form (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Step 1: Shipping Address */}
            <div className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                    {t('shippingAddress', 'Delivery Address')}
                  </h2>
                </div>
                <span className="text-[11px] text-[#388E3C] font-bold uppercase tracking-wider">
                  Insured Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Full Name *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onValueChange={(val) => setFullName(val)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Email Address *
                  </label>
                  <SmartInput
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onValueChange={(val) => setEmail(val)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Phone Number *
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
                    Street Address / Flat / Floor *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onValueChange={(val) => setStreet(val)}
                    placeholder="Flat / House no., building, apartment, street name"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    City *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onValueChange={(val) => setCity(val)}
                    placeholder="e.g. Pune / Varanasi"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    State *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onValueChange={(val) => setState(val)}
                    placeholder="e.g. Maharashtra / Uttar Pradesh"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    PIN Code *
                  </label>
                  <SmartInput
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    onValueChange={(val) => setZip(val)}
                    placeholder="e.g. 411001"
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0] cursor-pointer"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Payment Selection */}
            <div className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-[2px] bg-[#2874F0] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#212121]">
                    Payment Options
                  </h2>
                </div>
                <span className="text-[11px] text-[#388E3C] font-bold uppercase tracking-wider">
                  100% Protected
                </span>
              </div>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-[2px] border text-left text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-[#F1F3F6] border-[#2874F0] text-[#2874F0] ring-1 ring-[#2874F0]'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:bg-[#F1F3F6]'
                  }`}
                >
                  <Smartphone className={`w-4 h-4 mb-0.5 ${paymentMethod === 'upi' ? 'text-[#2874F0]' : 'text-[#878787]'}`} />
                  <span className="font-bold">UPI</span>
                  <span className="text-[10px] text-[#878787]">
                    GPay / PhonePe
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-[2px] border text-left text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-[#F1F3F6] border-[#2874F0] text-[#2874F0] ring-1 ring-[#2874F0]'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:bg-[#F1F3F6]'
                  }`}
                >
                  <CreditCard className={`w-4 h-4 mb-0.5 ${paymentMethod === 'card' ? 'text-[#2874F0]' : 'text-[#878787]'}`} />
                  <span className="font-bold">Credit/Debit</span>
                  <span className="text-[10px] text-[#878787]">
                    RuPay / Visa / MC
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('balance')}
                  className={`p-2.5 rounded-[2px] border text-left text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'balance'
                      ? 'bg-[#F1F3F6] border-[#2874F0] text-[#2874F0] ring-1 ring-[#2874F0]'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:bg-[#F1F3F6]'
                  }`}
                >
                  <Wallet className={`w-4 h-4 mb-0.5 ${paymentMethod === 'balance' ? 'text-[#2874F0]' : 'text-[#878787]'}`} />
                  <span className="font-bold">Wallet / Escrow</span>
                  <span className="text-[10px] text-[#878787]">
                    Artisan Credit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-2.5 rounded-[2px] border text-left text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                    paymentMethod === 'wire'
                      ? 'bg-[#F1F3F6] border-[#2874F0] text-[#2874F0] ring-1 ring-[#2874F0]'
                      : 'bg-[#FFFFFF] text-[#212121] border-[#D5D5D5] hover:bg-[#F1F3F6]'
                  }`}
                >
                  <Building2 className={`w-4 h-4 mb-0.5 ${paymentMethod === 'wire' ? 'text-[#2874F0]' : 'text-[#878787]'}`} />
                  <span className="font-bold">Net Banking</span>
                  <span className="text-[10px] text-[#878787]">
                    All Major Banks
                  </span>
                </button>
              </div>

              {/* UPI Inputs */}
              {paymentMethod === 'upi' && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                      UPI ID (e.g. mobile@upi or username@okaxis)
                    </label>
                    <SmartInput
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      onValueChange={(val) => setUpiId(val)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <p className="text-[11px] text-[#878787]">
                    A payment request will be sent to your UPI app for authorization.
                  </p>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                      Card Number
                    </label>
                    <SmartInput
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      onValueChange={(val) => setCardNumber(val)}
                      className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                        Valid Thru (MM/YY)
                      </label>
                      <SmartInput
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        onValueChange={(val) => setCardExpiry(val)}
                        className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1">
                        CVV
                      </label>
                      <SmartInput
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        onValueChange={(val) => setCardCvc(val)}
                        className="w-full px-3 py-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#D5D5D5] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'balance' && (
                <div className="p-3 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/20 text-xs text-[#388E3C]">
                  <strong>Craftify Escrow Patron Balance:</strong> Available balance ₹25,000. This purchase of {formatINR(total)} will be debited immediately upon confirmation.
                </div>
              )}

              {paymentMethod === 'wire' && (
                <div className="p-3 rounded-[2px] bg-[#F1F3F6] border border-[#EAEAEA] text-xs text-[#878787]">
                  <strong>Netbanking Transfer:</strong> Select your bank at the next screen or send via IMPS to the designated escrow virtual account.
                </div>
              )}

              <div className="p-2.5 rounded-[2px] bg-[#F1F3F6] border border-[#EAEAEA] text-[11px] text-[#878787] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#388E3C] shrink-0" />
                <span>Simulated Sandbox Payment: No real card or bank deduction will occur.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Craftify Price Details Card) (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-4 sm:p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 sticky top-24 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#878787] pb-3 border-b border-[#F0F0F0]">
                {t('priceDetails', 'Price Details')} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t('items', 'items')})
              </h2>

              {/* Items scroll */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-[#F0F0F0]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 pt-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-[2px] bg-[#FFFFFF] border border-[#F0F0F0] shrink-0 overflow-hidden p-0.5">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#212121] truncate block text-xs">
                          {item.title}
                        </span>
                        <span className="text-[#878787] text-[11px]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#212121] shrink-0">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial calculations */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#F0F0F0]">
                <div className="flex justify-between text-[#212121]">
                  <span>{t('subtotal', 'Price')} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t('items', 'items')})</span>
                  <span className="font-bold">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#212121]">
                  <span>{t('deliveryCharges', 'Delivery Charges')}</span>
                  <span>{isFreeShipping ? <strong className="text-[#388E3C] uppercase">{t('free', 'FREE')}</strong> : formatINR(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-[#212121]">
                  <span>{t('taxGST', 'GST & Platform Cess (5%)')}</span>
                  <span className="font-bold">{formatINR(tax)}</span>
                </div>
                <div className="pt-3 border-t border-dashed border-[#E0E0E0] flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-[#212121] block">
                      {t('totalAmount', 'Total Amount')}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[#212121]">{formatINR(total)}</span>
                </div>
              </div>

              {/* Craftify Signature Orange PLACE ORDER CTA */}
              <button
                id="btn-checkout-place-order"
                type="submit"
                className="w-full py-3.5 px-4 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-sm uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('placeOrder', 'Confirm & Pay')} {formatINR(total)}</span>
              </button>

              <div className="pt-3 border-t border-[#F0F0F0] text-[11px] text-[#878787] space-y-1">
                <div className="flex items-center gap-1.5 text-[#388E3C] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('safeAndSecurePayments', '100% Authentic Products • Safe Payments')}</span>
                </div>
                <p className="text-[10px]">
                  {t('artisanProvenance', 'All items are directly sourced from registered craft artisans with tracked delivery.')}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
