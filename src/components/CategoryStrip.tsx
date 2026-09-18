import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ActiveView } from '../types';
import { CATEGORIES_DATA } from '../data/artisanAssets';
import { useLanguage } from '../context/LanguageContext';

interface CategoryStripProps {
  onSelectCategory?: (categoryName: string) => void;
  onNavigate?: (view: ActiveView) => void;
}

export const CategoryStrip: React.FC<CategoryStripProps> = ({
  onSelectCategory,
  onNavigate,
}) => {
  const { t } = useLanguage();

  return (
    <section id="category-capsules-section" className="pt-2 pb-4 bg-[#F1F3F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {CATEGORIES_DATA.map((cat) => {
            const displayName = t(cat.nameKey) || cat.defaultName;

            if (cat.isAllCategories) {
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate?.('shop')}
                  className="bg-[#EBF2FE] hover:bg-[#DCE8FC] border border-[#2874F0]/20 rounded-[4px] p-2.5 flex items-center justify-between gap-2 text-left transition-all duration-150 cursor-pointer group shadow-2xs"
                >
                  <span className="text-xs font-semibold text-[#2874F0] leading-tight">
                    {displayName}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#2874F0] text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(cat.defaultName);
                  } else {
                    onNavigate?.('shop');
                  }
                }}
                className="bg-[#FFFFFF] hover:border-[#2874F0]/40 hover:shadow-xs border border-[#EAEAEA] rounded-[4px] p-2 flex items-center gap-2.5 text-left transition-all duration-150 cursor-pointer group"
              >
                <img
                  src={cat.imageUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-[3px] object-cover shrink-0 group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
                <span className="text-xs font-semibold text-[#212121] group-hover:text-[#2874F0] transition-colors leading-snug line-clamp-2">
                  {displayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
