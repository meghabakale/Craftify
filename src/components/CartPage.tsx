import React from 'react';
import { CartItem } from '../types';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
  onDiscoverCampaigns: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  onDiscoverCampaigns,
}) => {
  const { t } = useLanguage();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 2000 || subtotal === 0;
  const shippingCost = isFreeShipping ? 0 : 150;
  const estimatedTax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + shippingCost + estimatedTax;

  if (items.length === 0) {
    return (
      <div id="cart-empty-view" className="py-12 sm:py-16 bg-[#F1F3F6] min-h-[70vh] text-[#212121]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center bg-[#FFFFFF] p-8 rounded-[4px] border border-[#EAEAEA] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F1F3F6] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-[#2874F0]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212121] mb-2">
            {t('cartEmpty', 'Your Cart is Empty!')}
          </h1>
          <p className="text-xs text-[#878787] max-w-md mx-auto mb-6 leading-relaxed">
            {t('exploreCampaignsDesc', 'Explore our artisan catalog and crowdfunding campaigns to discover unique handcrafted items.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="empty-cart-shop-btn"
              onClick={onContinueShopping}
              className="w-full sm:w-auto px-6 py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5FD0] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('shopMarketplace', 'Shop Now')}</span>
            </button>
            <button
              id="empty-cart-campaigns-btn"
              onClick={onDiscoverCampaigns}
              className="w-full sm:w-auto px-6 py-2.5 rounded-[2px] border border-[#2874F0] bg-[#FFFFFF] hover:bg-[#F1F3F6] text-[#2874F0] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FF9F00]" />
              <span>{t('discoverCampaigns', 'Explore Pre-Order Campaigns')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page" className="py-4 sm:py-6 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center justify-between py-2.5 px-4 mb-3 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#878787]">
            <button onClick={onContinueShopping} className="hover:underline hover:text-[#2874F0] cursor-pointer">
              {t('shopMarketplace', 'Artisan Shop')}
            </button>
            <span>/</span>
            <span className="text-[#212121] font-bold">{t('cart', 'Shopping Cart')}</span>
          </div>

          <button
            onClick={onContinueShopping}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#2874F0] hover:text-[#1C5FD0] font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('continueShopping', 'Continue Shopping')}</span>
          </button>
        </div>

        {/* Layout: Items Table (8 cols) + Summary Ledger (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-[#FFFFFF] p-3.5 rounded-[4px] border border-[#EAEAEA] shadow-xs flex items-center justify-between">
              <h1 className="text-base font-bold text-[#212121]">
                {t('cart', 'My Cart')} ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h1>
              <span className="text-xs text-[#878787]">
                Deliver to: <strong className="text-[#212121]">Standard Pincode (All-India)</strong>
              </span>
            </div>

            <div className="bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs divide-y divide-[#F0F0F0]">
              {items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-row-${item.id}`}
                  className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  {/* Image + Title */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-[2px] bg-[#FFFFFF] border border-[#F0F0F0] shrink-0 overflow-hidden flex items-center justify-center p-1">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#388E3C] font-bold block">
                        {item.type === 'pledge' ? t('pledge', 'Crowdfund Pledge') : t('inStock', 'Direct Artisan Stock')}
                      </span>
                      <h3 className="text-sm font-bold text-[#212121] truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#878787] truncate">
                        {item.subtitle}
                      </p>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-base font-bold text-[#212121]">
                          {formatINR(item.price)}
                        </span>
                        <span className="text-xs text-[#878787] line-through">
                          {formatINR(Math.round(item.price * 1.3))}
                        </span>
                        <span className="text-xs font-bold text-[#388E3C]">
                          23% off
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                    <div className="flex items-center rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 text-[#212121] hover:bg-[#F1F3F6] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-[#212121]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 text-[#212121] hover:bg-[#F1F3F6] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs font-bold uppercase tracking-wider text-[#212121] hover:text-[#FB641B] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#878787]" />
                      <span>{t('remove', 'Remove')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Free Shipping Note */}
            <div className="p-3.5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] flex items-center justify-between text-xs text-[#388E3C] shadow-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#388E3C]" />
                {isFreeShipping ? (
                  <span>
                    <strong>Free Delivery unlocked</strong> for your artisan order.
                  </span>
                ) : (
                  <span>
                    Add <strong>{formatINR(2000 - subtotal)}</strong> more to unlock Free Delivery.
                  </span>
                )}
              </div>
              <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-[2px] bg-[#EAF8EB] text-[#388E3C]">
                {isFreeShipping ? 'FREE' : formatINR(150)}
              </span>
            </div>
          </div>

          {/* Order Summary Box (4 cols) - Craftify PRICE DETAILS Card */}
          <div className="lg:col-span-4">
            <div className="p-5 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] space-y-4 sticky top-24 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#878787] pb-3 border-b border-[#F0F0F0]">
                {t('priceDetails', 'Price Details')}
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#212121]">
                  <span>{t('subtotal', 'Price')} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t('items', 'items')})</span>
                  <span className="font-semibold text-[#212121]">{formatINR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-[#212121]">
                  <span className="flex items-center gap-1">
                    <span>{t('deliveryCharges', 'Delivery Charges')}</span>
                  </span>
                  <span>{isFreeShipping ? <strong className="text-[#388E3C] font-semibold uppercase">{t('free', 'Free')}</strong> : formatINR(shippingCost)}</span>
                </div>

                <div className="flex justify-between text-[#212121]">
                  <span>{t('taxGST', 'GST & Artisan Cess (5%)')}</span>
                  <span className="font-semibold text-[#212121]">{formatINR(estimatedTax)}</span>
                </div>

                <div className="pt-3 border-t border-dashed border-[#E0E0E0] flex justify-between items-baseline text-sm font-bold text-[#212121]">
                  <span>{t('totalAmount', 'Total Amount')}</span>
                  <span className="text-xl font-bold text-[#212121]">{formatINR(total)}</span>
                </div>

                {isFreeShipping && (
                  <div className="pt-1 text-[#388E3C] font-semibold text-xs border-t border-[#F0F0F0]">
                    You will save {formatINR(150)} on delivery on this order
                  </div>
                )}
              </div>

              {/* Craftify Signature Orange "PLACE ORDER" Action Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-sm uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>{t('placeOrder', 'Place Order')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#F0F0F0] text-[11px] text-[#878787] space-y-2">
                <div className="flex items-center gap-1.5 text-[#388E3C] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('safeAndSecurePayments', 'Safe and Secure Payments • 100% Authentic Artisans')}</span>
                </div>
                <p className="leading-relaxed text-[10px]">
                  {t('artisanProvenance', 'Direct orders dispatched in 48h with live tracking. 30-day return window.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
