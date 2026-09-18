import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SupportedLanguageCode, LanguageMeta } from '../i18n/types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../i18n/languages';
import { TRANSLATIONS, Translations } from '../i18n/translations';
import {
  localizeProduct,
  localizeCampaign,
  localizeOrder,
  localizePledge,
  localizeCartItem,
  localizeCategoryName,
} from '../i18n/dataTranslations';
import { Product, Campaign, CustomerOrder, UserPledgeRecord, CartItem } from '../types';

interface LanguageContextValue {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  currentLanguageMeta: LanguageMeta;
  languages: LanguageMeta[];
  t: (key: keyof Translations | string, fallback?: string) => string;
  localizeProduct: (product: Product) => Product;
  localizeCampaign: (campaign: Campaign) => Campaign;
  localizeOrder: (order: CustomerOrder) => CustomerOrder;
  localizePledge: (pledge: UserPledgeRecord) => UserPledgeRecord;
  localizeCartItem: (item: CartItem) => CartItem;
  localizeCategory: (categoryName: string) => string;
  localizeProducts: (products: Product[]) => Product[];
  localizeCampaigns: (campaigns: Campaign[]) => Campaign[];
  localizeOrders: (orders: CustomerOrder[]) => CustomerOrder[];
  localizePledges: (pledges: UserPledgeRecord[]) => UserPledgeRecord[];
  localizeCartItems: (items: CartItem[]) => CartItem[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'craftify_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as SupportedLanguageCode;
      }
    } catch {
      // ignore
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (lang: SupportedLanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const currentLanguageMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = (key: keyof Translations | string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const fallbackDict = TRANSLATIONS[DEFAULT_LANGUAGE];
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return fallback || (key as string);
  };

  const localizeProductItem = (product: Product): Product => {
    return localizeProduct(product, language);
  };

  const localizeCampaignItem = (campaign: Campaign): Campaign => {
    return localizeCampaign(campaign, language);
  };

  const localizeOrderItem = (order: CustomerOrder): CustomerOrder => {
    return localizeOrder(order, language);
  };

  const localizePledgeItem = (pledge: UserPledgeRecord): UserPledgeRecord => {
    return localizePledge(pledge, language);
  };

  const localizeCartItemFn = (item: CartItem): CartItem => {
    return localizeCartItem(item, language);
  };

  const localizeCategory = (categoryName: string): string => {
    return localizeCategoryName(categoryName, language);
  };

  const localizeProducts = (products: Product[]): Product[] => {
    return products.map((p) => localizeProduct(p, language));
  };

  const localizeCampaigns = (campaigns: Campaign[]): Campaign[] => {
    return campaigns.map((c) => localizeCampaign(c, language));
  };

  const localizeOrders = (orders: CustomerOrder[]): CustomerOrder[] => {
    return orders.map((o) => localizeOrder(o, language));
  };

  const localizePledges = (pledges: UserPledgeRecord[]): UserPledgeRecord[] => {
    return pledges.map((plg) => localizePledge(plg, language));
  };

  const localizeCartItems = (items: CartItem[]): CartItem[] => {
    return items.map((item) => localizeCartItem(item, language));
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageMeta,
        languages: SUPPORTED_LANGUAGES,
        t,
        localizeProduct: localizeProductItem,
        localizeCampaign: localizeCampaignItem,
        localizeOrder: localizeOrderItem,
        localizePledge: localizePledgeItem,
        localizeCartItem: localizeCartItemFn,
        localizeCategory,
        localizeProducts,
        localizeCampaigns,
        localizeOrders,
        localizePledges,
        localizeCartItems,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
