import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Lock, AlertCircle, Check, ShieldCheck, ChevronDown, Building2 } from 'lucide-react';
import { formatINR } from '../utils/format';

export interface StripePaymentResult {
  method: 'card' | 'upi' | 'netbanking';
  summary: string;
  last4?: string;
  brand?: string;
  cardholderName?: string;
  upiId?: string;
  bankName?: string;
}

export interface StripePaymentElementRef {
  submit: () => void;
  isProcessing: boolean;
}

interface StripePaymentElementProps {
  amount: number;
  buttonText?: string;
  loadingText?: string;
  defaultCardholderName?: string;
  showButton?: boolean;
  onSuccess: (result: StripePaymentResult) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  className?: string;
}

type PaymentTab = 'card' | 'upi' | 'netbanking';
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'unknown';

// Purely cosmetic brand detection via card number prefix
const detectCardBrand = (number: string): CardBrand => {
  const clean = number.replace(/\s+/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(60|65|81|82|508)/.test(clean)) return 'rupay';
  return 'unknown';
};

// SVG brand icons styled cleanly
const BrandIcon: React.FC<{ brand: CardBrand }> = ({ brand }) => {
  if (brand === 'visa') {
    return (
      <svg className="w-8 h-5" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="3" fill="#0A2540" />
        <text x="5" y="16" fill="#FFFFFF" fontFamily="sans-serif" fontSize="11" fontWeight="bold" fontStyle="italic">
          VISA
        </text>
      </svg>
    );
  }
  if (brand === 'mastercard') {
    return (
      <svg className="w-8 h-5" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="3" fill="#2D3139" />
        <circle cx="14" cy="12" r="6" fill="#EB001B" />
        <circle cx="22" cy="12" r="6" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    );
  }
  if (brand === 'amex') {
    return (
      <svg className="w-8 h-5" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="3" fill="#006FCF" />
        <text x="4" y="16" fill="#FFFFFF" fontFamily="sans-serif" fontSize="8" fontWeight="900" letterSpacing="0.5">
          AMEX
        </text>
      </svg>
    );
  }
  if (brand === 'rupay') {
    return (
      <svg className="w-8 h-5" viewBox="0 0 36 24" fill="none">
        <rect width="36" height="24" rx="3" fill="#097938" />
        <text x="3" y="15" fill="#FFFFFF" fontFamily="sans-serif" fontSize="8" fontWeight="bold">
          RuPay
        </text>
      </svg>
    );
  }
  return (
    <svg className="w-7 h-5 text-[#8898AA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
};

export const StripePaymentElement = forwardRef<StripePaymentElementRef, StripePaymentElementProps>(
  (
    {
      amount,
      buttonText = `Pay ${formatINR(amount)}`,
      loadingText = 'Confirming payment...',
      defaultCardholderName = 'Aarav Sharma',
      showButton = true,
      onSuccess,
      onProcessingChange,
      className = '',
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState<PaymentTab>('card');

    // Card state
    const [cardholderName, setCardholderName] = useState(defaultCardholderName);
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [cardExpiry, setCardExpiry] = useState('12 / 28');
    const [cardCvc, setCardCvc] = useState('891');

    // UPI state
    const [upiId, setUpiId] = useState('aarav@okhdfcbank');

    // Net Banking state
    const [selectedBank, setSelectedBank] = useState('HDFC');

    // Validation & touched state
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [declineError, setDeclineError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const cardBrand = detectCardBrand(cardNumber);

    // Formatters
    const handleCardNumberChange = (val: string) => {
      setDeclineError(null);
      const digits = val.replace(/\D/g, '');
      const brand = detectCardBrand(digits);

      let formatted = '';
      if (brand === 'amex') {
        const limited = digits.slice(0, 15);
        const parts = [limited.slice(0, 4), limited.slice(4, 10), limited.slice(10, 15)].filter(Boolean);
        formatted = parts.join(' ');
      } else {
        const limited = digits.slice(0, 16);
        const parts = limited.match(/.{1,4}/g) || [];
        formatted = parts.join(' ');
      }
      setCardNumber(formatted);
    };

    const handleExpiryChange = (val: string) => {
      setDeclineError(null);
      const digits = val.replace(/\D/g, '').slice(0, 4);
      if (digits.length <= 2) {
        setCardExpiry(digits);
      } else {
        setCardExpiry(`${digits.slice(0, 2)} / ${digits.slice(2, 4)}`);
      }
    };

    const handleCvcChange = (val: string) => {
      setDeclineError(null);
      const maxDigits = cardBrand === 'amex' ? 4 : 3;
      const digits = val.replace(/\D/g, '').slice(0, maxDigits);
      setCardCvc(digits);
    };

    // Validation checkers
    const getCardNumberError = (): string | null => {
      const digits = cardNumber.replace(/\D/g, '');
      if (!digits) return 'Your card number is incomplete.';
      if (cardBrand === 'amex' && digits.length < 15) return 'Your card number is incomplete.';
      if (cardBrand !== 'amex' && digits.length < 16) return 'Your card number is incomplete.';
      return null;
    };

    const getExpiryError = (): string | null => {
      const digits = cardExpiry.replace(/\D/g, '');
      if (digits.length < 4) return "Your card's expiration date is incomplete.";
      const month = parseInt(digits.slice(0, 2), 10);
      const year = parseInt(`20${digits.slice(2, 4)}`, 10);
      if (month < 1 || month > 12) return "Your card's expiration month is invalid.";

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return "Your card's expiration year is in the past.";
      }
      return null;
    };

    const getCvcError = (): string | null => {
      const maxDigits = cardBrand === 'amex' ? 4 : 3;
      if (cardCvc.length < maxDigits) return "Your card's security code is incomplete.";
      return null;
    };

    const getNameError = (): string | null => {
      if (!cardholderName.trim()) return 'Please enter your cardholder name.';
      return null;
    };

    const getUpiError = (): string | null => {
      if (!upiId.trim()) return 'Please enter your UPI ID.';
      if (!upiId.includes('@') || upiId.endsWith('@') || upiId.startsWith('@')) {
        return 'Please enter a valid UPI ID (e.g. username@okhdfcbank).';
      }
      return null;
    };

    const getBankError = (): string | null => {
      if (!selectedBank) return 'Please select your bank.';
      return null;
    };

    // Mark single field touched on blur
    const handleBlur = (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    };

    // Trigger submission
    const handleFormSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (isProcessing) return;

      // Reset decline message
      setDeclineError(null);

      if (activeTab === 'card') {
        const nameErr = getNameError();
        const numErr = getCardNumberError();
        const expErr = getExpiryError();
        const cvcErr = getCvcError();

        setTouched({ name: true, number: true, expiry: true, cvc: true });

        if (nameErr || numErr || expErr || cvcErr) {
          return;
        }

        // Check for mock decline test card (ends with 0002)
        const digits = cardNumber.replace(/\D/g, '');
        setIsProcessing(true);
        if (onProcessingChange) onProcessingChange(true);

        setTimeout(() => {
          setIsProcessing(false);
          if (onProcessingChange) onProcessingChange(false);

          if (digits.endsWith('0002')) {
            setDeclineError("Your card was declined. Your request was in test mode, but the card was declined with code 'card_declined'.");
          } else {
            const last4 = digits.slice(-4) || '4242';
            onSuccess({
              method: 'card',
              summary: `${cardBrand.toUpperCase()} •••• ${last4}`,
              last4,
              brand: cardBrand,
              cardholderName: cardholderName.trim(),
            });
          }
        }, 1800);
      } else if (activeTab === 'upi') {
        const err = getUpiError();
        setTouched({ upi: true });
        if (err) return;

        setIsProcessing(true);
        if (onProcessingChange) onProcessingChange(true);

        setTimeout(() => {
          setIsProcessing(false);
          if (onProcessingChange) onProcessingChange(false);
          onSuccess({
            method: 'upi',
            summary: `UPI (${upiId.trim()})`,
            upiId: upiId.trim(),
          });
        }, 1800);
      } else if (activeTab === 'netbanking') {
        const err = getBankError();
        setTouched({ bank: true });
        if (err) return;

        setIsProcessing(true);
        if (onProcessingChange) onProcessingChange(true);

        setTimeout(() => {
          setIsProcessing(false);
          if (onProcessingChange) onProcessingChange(false);
          onSuccess({
            method: 'netbanking',
            summary: `Net Banking (${selectedBank})`,
            bankName: selectedBank,
          });
        }, 1800);
      }
    };

    useImperativeHandle(ref, () => ({
      submit: () => handleFormSubmit(),
      isProcessing,
    }));

    // Demo fill helpers
    const fillSuccessCard = () => {
      setDeclineError(null);
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12 / 28');
      setCardCvc('891');
      setCardholderName(defaultCardholderName || 'Aarav Sharma');
      setTouched({});
    };

    const fillDeclineCard = () => {
      setDeclineError(null);
      setCardNumber('4242 4242 4242 0002');
      setCardExpiry('12 / 28');
      setCardCvc('891');
      setCardholderName(defaultCardholderName || 'Aarav Sharma');
      setTouched({});
    };

    const isCardNumInvalid = touched.number && !!getCardNumberError();
    const isExpiryInvalid = touched.expiry && !!getExpiryError();
    const isCvcInvalid = touched.cvc && !!getCvcError();
    const isNameInvalid = touched.name && !!getNameError();
    const isUpiInvalid = touched.upi && !!getUpiError();

    return (
      <div
        id="stripe-payment-element-root"
        className={`bg-[#FFFFFF] border border-[#E0E6EB] rounded-lg shadow-[0px_2px_4px_rgba(50,50,93,0.06),0px_1px_1.5px_rgba(0,0,0,0.04)] p-4 sm:p-5 text-[#30313D] ${className}`}
      >
        {/* Stripe Sandbox Presentation Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#F0F3F7]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F5F8FA] text-[#4F566B] border border-[#E3E8EE]">
              Stripe Test Mode
            </span>
            <span className="text-[11px] text-[#697386]">Simulated payment sandbox</span>
          </div>
          {/* Quick preset chips for student demo */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={fillSuccessCard}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7FAFC] hover:bg-[#EEF2F7] text-[#4F566B] border border-[#E3E8EE] cursor-pointer transition-colors"
              title="Fill standard Stripe test card (ends in 4242)"
            >
              Fill 4242 (Success)
            </button>
            <button
              type="button"
              onClick={fillDeclineCard}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] cursor-pointer transition-colors"
              title="Fill Stripe decline test card (ends in 0002)"
            >
              Fill 0002 (Decline)
            </button>
          </div>
        </div>

        {/* Decline alert banner */}
        {declineError && (
          <div
            id="stripe-decline-banner"
            className="mb-4 p-3 rounded-[6px] bg-[#FFF2F4] border border-[#F8D7DA] text-[#DF1B41] flex items-start gap-2 text-xs animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DF1B41]" />
            <div className="flex-1">
              <strong className="block font-semibold">Your card was declined.</strong>
              <span>{declineError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeclineError(null)}
              className="text-[#DF1B41] hover:opacity-75 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stripe India Payment Method Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            id="tab-stripe-card"
            onClick={() => {
              setActiveTab('card');
              setDeclineError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[6px] text-xs font-semibold transition-all cursor-pointer border ${
              activeTab === 'card'
                ? 'bg-[#FFFFFF] text-[#30313D] border-[#635BFF] shadow-[0_1px_3px_rgba(99,91,255,0.18)] ring-1 ring-[#635BFF]'
                : 'bg-[#F8F9FA] text-[#697386] border-[#E0E6EB] hover:bg-[#F2F4F7]'
            }`}
          >
            <BrandIcon brand={cardBrand} />
            <span>Card</span>
          </button>

          <button
            type="button"
            id="tab-stripe-upi"
            onClick={() => {
              setActiveTab('upi');
              setDeclineError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[6px] text-xs font-semibold transition-all cursor-pointer border ${
              activeTab === 'upi'
                ? 'bg-[#FFFFFF] text-[#30313D] border-[#635BFF] shadow-[0_1px_3px_rgba(99,91,255,0.18)] ring-1 ring-[#635BFF]'
                : 'bg-[#F8F9FA] text-[#697386] border-[#E0E6EB] hover:bg-[#F2F4F7]'
            }`}
          >
            <span className="font-bold text-[11px] px-1 py-0.5 rounded bg-[#EEF2F6] text-[#0A2540] border border-[#D0D7DE]">
              UPI
            </span>
            <span>UPI</span>
          </button>

          <button
            type="button"
            id="tab-stripe-netbanking"
            onClick={() => {
              setActiveTab('netbanking');
              setDeclineError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[6px] text-xs font-semibold transition-all cursor-pointer border ${
              activeTab === 'netbanking'
                ? 'bg-[#FFFFFF] text-[#30313D] border-[#635BFF] shadow-[0_1px_3px_rgba(99,91,255,0.18)] ring-1 ring-[#635BFF]'
                : 'bg-[#F8F9FA] text-[#697386] border-[#E0E6EB] hover:bg-[#F2F4F7]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#697386]" />
            <span>Net Banking</span>
          </button>
        </div>

        {/* TAB 1: CARD PAYMENT ELEMENT */}
        {activeTab === 'card' && (
          <div className="space-y-3.5">
            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-medium text-[#4F566B] mb-1.5">Name on card</label>
              <input
                id="stripe-input-cardholder-name"
                type="text"
                value={cardholderName}
                onChange={(e) => {
                  setCardholderName(e.target.value);
                  if (touched.name) setTouched((prev) => ({ ...prev, name: false }));
                }}
                onBlur={() => handleBlur('name')}
                placeholder="Jane Doe"
                className={`w-full h-10 px-3 rounded-[6px] bg-[#FFFFFF] text-sm text-[#30313D] placeholder-[#A1A5B0] transition-shadow duration-150 focus:outline-none ${
                  isNameInvalid
                    ? 'border border-[#DF1B41] ring-1 ring-[#DF1B41]'
                    : 'border border-[#E0E6EB] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] shadow-[0_1px_1px_rgba(0,0,0,0.03)]'
                }`}
              />
              {isNameInvalid && (
                <p className="text-[11px] text-[#DF1B41] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{getNameError()}</span>
                </p>
              )}
            </div>

            {/* Compact Card Details Group (Stripe unified element) */}
            <div>
              <label className="block text-xs font-medium text-[#4F566B] mb-1.5">Card information</label>
              <div
                className={`rounded-[6px] bg-[#FFFFFF] border overflow-hidden transition-shadow duration-150 ${
                  isCardNumInvalid || isExpiryInvalid || isCvcInvalid
                    ? 'border-[#DF1B41] ring-1 ring-[#DF1B41]'
                    : 'border-[#E0E6EB] shadow-[0_1px_1px_rgba(0,0,0,0.03)] focus-within:border-[#635BFF] focus-within:ring-1 focus-within:ring-[#635BFF]'
                }`}
              >
                {/* Top: Card Number with brand icon */}
                <div className="relative flex items-center px-3 border-b border-[#E0E6EB] h-10 bg-white">
                  <input
                    id="stripe-input-card-number"
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    onBlur={() => handleBlur('number')}
                    placeholder="1234 1234 1234 1234"
                    className="w-full text-sm font-normal text-[#30313D] placeholder-[#A1A5B0] focus:outline-none bg-transparent tracking-wide"
                  />
                  <div className="shrink-0 pl-2">
                    <BrandIcon brand={cardBrand} />
                  </div>
                </div>

                {/* Bottom Row: Expiry & CVC side-by-side */}
                <div className="grid grid-cols-2 divide-x divide-[#E0E6EB] h-10 bg-white">
                  {/* Expiry */}
                  <div className="px-3 flex items-center">
                    <input
                      id="stripe-input-card-expiry"
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      onBlur={() => handleBlur('expiry')}
                      placeholder="MM / YY"
                      className="w-full text-sm text-[#30313D] placeholder-[#A1A5B0] focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* CVC */}
                  <div className="px-3 flex items-center justify-between">
                    <input
                      id="stripe-input-card-cvc"
                      type="text"
                      inputMode="numeric"
                      value={cardCvc}
                      onChange={(e) => handleCvcChange(e.target.value)}
                      onBlur={() => handleBlur('cvc')}
                      placeholder="CVC"
                      className="w-full text-sm text-[#30313D] placeholder-[#A1A5B0] focus:outline-none bg-transparent"
                    />
                    <div className="shrink-0 text-[#8898AA]" title="3 or 4 digit security code on back of card">
                      <Lock className="w-3.5 h-3.5 text-[#A1A5B0]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline errors displayed only after user leaves invalid field */}
              {isCardNumInvalid && (
                <p className="text-[11px] text-[#DF1B41] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{getCardNumberError()}</span>
                </p>
              )}
              {isExpiryInvalid && (
                <p className="text-[11px] text-[#DF1B41] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{getExpiryError()}</span>
                </p>
              )}
              {isCvcInvalid && (
                <p className="text-[11px] text-[#DF1B41] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{getCvcError()}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPI ELEMENT */}
        {activeTab === 'upi' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4F566B] mb-1.5">UPI ID / Virtual Address</label>
              <div className="relative">
                <input
                  id="stripe-input-upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (touched.upi) setTouched((prev) => ({ ...prev, upi: false }));
                  }}
                  onBlur={() => handleBlur('upi')}
                  placeholder="username@okhdfcbank"
                  className={`w-full h-10 px-3 rounded-[6px] bg-[#FFFFFF] text-sm text-[#30313D] placeholder-[#A1A5B0] transition-shadow duration-150 focus:outline-none ${
                    isUpiInvalid
                      ? 'border border-[#DF1B41] ring-1 ring-[#DF1B41]'
                      : 'border border-[#E0E6EB] focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] shadow-[0_1px_1px_rgba(0,0,0,0.03)]'
                  }`}
                />
              </div>

              {isUpiInvalid && (
                <p className="text-[11px] text-[#DF1B41] flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{getUpiError()}</span>
                </p>
              )}
            </div>

            {/* Quick test handle pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-[#697386]">Quick test handles:</span>
              <button
                type="button"
                onClick={() => setUpiId('aarav@okhdfcbank')}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F8F9FA] hover:bg-[#EEF2F6] text-[#4F566B] border border-[#E0E6EB] cursor-pointer"
              >
                aarav@okhdfcbank
              </button>
              <button
                type="button"
                onClick={() => setUpiId('patron@icici')}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F8F9FA] hover:bg-[#EEF2F6] text-[#4F566B] border border-[#E0E6EB] cursor-pointer"
              >
                patron@icici
              </button>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#F8F9FA] border border-[#E0E6EB] text-[11px] text-[#697386]">
              A payment authorization collect request will be sent to your UPI application.
            </div>
          </div>
        )}

        {/* TAB 3: NET BANKING ELEMENT */}
        {activeTab === 'netbanking' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4F566B] mb-1.5">Select your Bank</label>
              {/* Popular banks quick select pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {['HDFC', 'SBI', 'ICICI', 'Axis'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`py-2 px-2 text-xs font-semibold rounded-[4px] border text-center transition-all cursor-pointer ${
                      selectedBank === bank
                        ? 'border-[#635BFF] bg-[#F7F7FF] text-[#635BFF] ring-1 ring-[#635BFF]'
                        : 'border-[#E0E6EB] bg-[#FFFFFF] text-[#4F566B] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    {bank} Bank
                  </button>
                ))}
              </div>

              {/* Full bank dropdown */}
              <div className="relative">
                <select
                  id="stripe-select-bank"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-[6px] bg-[#FFFFFF] border border-[#E0E6EB] text-sm text-[#30313D] focus:outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF] cursor-pointer appearance-none shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
                >
                  <option value="HDFC">HDFC Bank</option>
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                  <option value="BOB">Bank of Baroda</option>
                  <option value="Canara">Canara Bank</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-[#8898AA]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-[4px] bg-[#F8F9FA] border border-[#E0E6EB] text-[11px] text-[#697386]">
              You will be securely redirected to your bank&apos;s net banking authentication portal.
            </div>
          </div>
        )}

        {/* Optional built-in Stripe Submit Button */}
        {showButton && (
          <div className="mt-5">
            <button
              id="stripe-submit-button"
              type="button"
              disabled={isProcessing}
              onClick={() => handleFormSubmit()}
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
                  <span>{loadingText}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{buttonText}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Stripe Real Checkout Branding Footer Badge */}
        <div className="mt-4 pt-3 border-t border-[#F0F3F7] flex items-center justify-center gap-1.5 text-xs text-[#697386]">
          <Lock className="w-3 h-3 text-[#697386]" />
          <span className="font-normal text-[11px]">Powered by</span>
          <span className="font-extrabold text-[12px] tracking-tight text-[#635BFF] font-sans lowercase italic">
            stripe
          </span>
        </div>
      </div>
    );
  }
);

StripePaymentElement.displayName = 'StripePaymentElement';
