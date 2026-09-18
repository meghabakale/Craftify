import React from 'react';
import { ActiveView } from '../types';
import { ShieldCheck, ArrowUp, HelpCircle, Briefcase, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#172337] border-t border-[#2A3749] text-[#FFFFFF] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-[#2D3C52]">
          {/* Col 1: ABOUT */}
          <div className="space-y-2.5">
            <div className="text-[#878787] font-semibold text-[11px] uppercase tracking-wider mb-3">
              ABOUT
            </div>
            <ul className="space-y-2 text-[#FFFFFF]/80">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:underline cursor-pointer">
                  About Craftify
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('campaigns')} className="hover:underline cursor-pointer">
                  Artisan Pre-Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:underline cursor-pointer">
                  Marketplace Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('start-campaign')} className="hover:underline cursor-pointer">
                  Weaver Guild Onboarding
                </button>
              </li>
              <li>
                <span className="text-[#878787]">GI Tag Verification</span>
              </li>
            </ul>
          </div>

          {/* Col 2: HELP */}
          <div className="space-y-2.5">
            <div className="text-[#878787] font-semibold text-[11px] uppercase tracking-wider mb-3">
              HELP
            </div>
            <ul className="space-y-2 text-[#FFFFFF]/80">
              <li><span className="hover:underline cursor-pointer">Payments & Escrow</span></li>
              <li><span className="hover:underline cursor-pointer">Shipping & Logistics</span></li>
              <li><span className="hover:underline cursor-pointer">Cancellation & Returns</span></li>
              <li><span className="hover:underline cursor-pointer">FAQ & Backer Protection</span></li>
              <li><span className="hover:underline cursor-pointer">Report Infringement</span></li>
            </ul>
          </div>

          {/* Col 3: CONSUMER POLICY */}
          <div className="space-y-2.5">
            <div className="text-[#878787] font-semibold text-[11px] uppercase tracking-wider mb-3">
              CONSUMER POLICY
            </div>
            <ul className="space-y-2 text-[#FFFFFF]/80">
              <li><span className="hover:underline cursor-pointer">Cancellation & Escrow Policy</span></li>
              <li><span className="hover:underline cursor-pointer">Terms Of Use</span></li>
              <li><span className="hover:underline cursor-pointer">Security Guarantee</span></li>
              <li><span className="hover:underline cursor-pointer">Privacy Notice</span></li>
              <li><span className="hover:underline cursor-pointer">Sitemap</span></li>
            </ul>
          </div>

          {/* Col 4: SOCIAL & COMMUNITIES */}
          <div className="space-y-2.5">
            <div className="text-[#878787] font-semibold text-[11px] uppercase tracking-wider mb-3">
              CONNECT
            </div>
            <ul className="space-y-2 text-[#FFFFFF]/80">
              <li><span className="hover:underline cursor-pointer">Instagram @craftify.in</span></li>
              <li><span className="hover:underline cursor-pointer">Twitter / X</span></li>
              <li><span className="hover:underline cursor-pointer">YouTube Workshops</span></li>
              <li><span className="hover:underline cursor-pointer">Artisan Stories Podcast</span></li>
            </ul>
          </div>

          {/* Col 5: Registered Office */}
          <div className="col-span-2 md:col-span-1 border-l-0 md:border-l border-[#2D3C52] md:pl-6 space-y-2 text-[11px] text-[#878787]">
            <div className="text-[#878787] font-semibold text-[11px] uppercase tracking-wider mb-3">
              REGISTERED OFFICE
            </div>
            <p className="leading-relaxed">
              Craftify Internet Private Limited,<br />
              Buildings Alyssa, Begonia & Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103, Karnataka, India<br />
              CIN: U51109KA2026PTC066107
            </p>
          </div>
        </div>

        {/* Bottom Feature Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[#FFFFFF]/90 text-[11px]">
          <div className="flex flex-wrap items-center gap-6">
            <LanguageSelector variant="footer" />

            <button
              onClick={() => onNavigate('start-campaign')}
              className="flex items-center gap-1.5 hover:text-[#FFE500] cursor-pointer text-[#FFE500]"
            >
              <Briefcase className="w-4 h-4 text-[#FFE500]" />
              <span className="font-semibold">{t('startCampaign')}</span>
            </button>
            <div className="flex items-center gap-1.5 text-[#388E3C]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[#FFFFFF]">100% Escrow Protected</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#878787]">© 2026 Craftify.com</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#2874F0] hover:text-[#FFE500] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
