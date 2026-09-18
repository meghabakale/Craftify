import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onViewFullCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onViewFullCart,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const productItems = items.filter((item) => item.type === 'product');
  const pledgeItems = items.filter((item) => item.type === 'pledge');

  const productSubtotal = productItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const pledgeAuthorizedTotal = pledgeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-[#000000]/50 backdrop-blur-xs flex justify-end"
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-[#FFFFFF] h-full flex flex-col border-l border-[#EAEAEA] shadow-2xl text-[#212121]"
      >
        {/* Header (Craftify Blue Header) */}
        <div className="p-4 bg-[#2874F0] text-[#FFFFFF] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FFFFFF]" />
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">{t('cart', 'My Cart & Backings')}</h3>
              <div className="text-[11px] text-[#FFFFFF]/80">
                {items.length} {items.length === 1 ? t('item', 'Item') : t('items', 'Items')}
              </div>
            </div>
          </div>
          <button
            id="btn-close-cart-drawer"
            onClick={onClose}
            className="p-1 rounded-[2px] text-[#FFFFFF] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F1F3F6]">
          {items.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-[4px] p-6 border border-[#EAEAEA]">
              <div className="w-12 h-12 rounded-full bg-[#F1F3F6] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-[#2874F0]" />
              </div>
              <div className="text-base font-bold text-[#212121] mb-1">
                {t('cartEmpty', 'Your cart is empty')}
              </div>
              <p className="text-xs text-[#878787] max-w-xs mx-auto leading-relaxed">
                {t('exploreCampaignsDesc', 'Back an artisan campaign in the funding section or buy authentic hand-crafted works directly from the shop.')}
              </p>
            </div>
          ) : (
            <>
              {/* Ready-to-Ship Products Section */}
              {productItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#388E3C] font-bold uppercase tracking-wider px-1">
                    <span>{t('inStock', 'Marketplace Items (Direct Stock)')}</span>
                    <span>{productItems.length} {t('items', 'items')}</span>
                  </div>

                  {productItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] flex gap-3 items-center shadow-xs"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 object-contain rounded-[2px] border border-[#F0F0F0] shrink-0 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#212121] truncate">
                          {item.title}
                        </h4>
                        <div className="text-xs text-[#878787]">
                          {formatINR(item.price)} each
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded-[2px] border border-[#D5D5D5] text-xs flex items-center justify-center hover:bg-[#F1F3F6] text-[#212121] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs px-1 text-[#212121] font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded-[2px] border border-[#D5D5D5] text-xs flex items-center justify-center hover:bg-[#F1F3F6] text-[#212121] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sm text-[#212121]">
                          {formatINR(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#878787] hover:text-[#FB641B] text-xs mt-2 cursor-pointer p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conditional Pledges Section */}
              {pledgeItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-[#2874F0] font-bold uppercase tracking-wider px-1">
                    <span>{t('pledge', 'Authorized Pledges (₹0 Charged Today)')}</span>
                    <span>{pledgeItems.length} active</span>
                  </div>

                  {pledgeItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[4px] bg-[#FFFFFF] border border-[#EAEAEA] flex gap-3 items-center shadow-xs"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 object-contain rounded-[2px] border border-[#F0F0F0] shrink-0 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#2874F0] uppercase font-bold">
                          {t('escrowProtected', 'Crowdfund Escrow')}
                        </div>
                        <h4 className="text-xs font-bold text-[#212121] truncate">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-[#878787]">
                          {item.subtitle}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-sm text-[#212121]">
                          {formatINR(item.price)}
                        </div>
                        <div className="text-[10px] text-[#388E3C] font-semibold">
                          {t('authorizedBadge', 'Hold authorized')}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-[#878787] hover:text-[#FB641B] text-xs mt-1 cursor-pointer p-1"
                          aria-label="Remove pledge"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer calculation & checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#EAEAEA] bg-[#FFFFFF] space-y-3">
            <div className="space-y-1.5 text-xs text-[#212121]">
              <div className="flex justify-between">
                <span className="text-[#878787]">{t('subtotal', 'Shop Items Subtotal (Immediate)')}:</span>
                <span className="font-bold">{formatINR(productSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#2874F0]">
                <span>{t('pledge', 'Conditional Pledges (Authorized Escrow)')}:</span>
                <span className="font-bold">{formatINR(pledgeAuthorizedTotal)}</span>
              </div>
              <div className="border-t border-[#F0F0F0] pt-2 flex justify-between text-sm font-bold">
                <span>{t('totalAmount', 'Total Due Right Now')}:</span>
                <span className="text-base text-[#212121]">{formatINR(productSubtotal)}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/20 text-[11px] text-[#388E3C] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#388E3C] shrink-0" />
              <span>{t('escrowGuaranteeDesc', 'Pledges are only billed if campaigns meet 100% funding goal.')}</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                id="btn-drawer-checkout"
                onClick={onCheckout}
                className="w-full py-3 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>{t('checkout', 'Place Order / Checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onViewFullCart && (
                <button
                  id="btn-drawer-view-full-cart"
                  onClick={() => {
                    onClose();
                    onViewFullCart();
                  }}
                  className="w-full py-2 rounded-[2px] bg-[#FFFFFF] hover:bg-[#F1F3F6] border border-[#D5D5D5] text-[#2874F0] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#2874F0]" />
                  <span>{t('cart', 'View Dedicated Cart Page')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
