import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { SmartInput } from './common/SmartInput';
import { formatINR } from '../utils/format';

interface StartCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMock: (title: string, goal: number, category: string) => void;
}

export const StartCampaignModal: React.FC<StartCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmitMock,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('150000');
  const [category, setCategory] = useState('Pottery & Ceramics');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmitMock(title, parseFloat(goal) || 150000, category);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      id="start-campaign-modal-overlay"
      className="fixed inset-0 z-50 bg-[#212121]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        id="start-campaign-modal-dialog"
        className="bg-[#FFFFFF] border border-[#E0E0E0] rounded-[4px] w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between border-b border-[#F0F0F0] pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2874F0] bg-[#EBF3FE] px-2 py-0.5 rounded-[2px] flex items-center gap-1">
                <Award className="w-3 h-3 text-[#2874F0]" />
                <span>Craftify Creator Hub</span>
              </span>
              <span className="text-xs text-[#878787]">• Quick Launch</span>
            </div>
            <h2 className="text-xl font-bold text-[#212121]">
              Launch a New Artisan Campaign
            </h2>
            <p className="text-xs text-[#878787] mt-1">
              Gather backer pre-orders via authorized conditional escrow. Graduate to the Craftify store once funded.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#878787] hover:text-[#212121] rounded-[2px] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto rounded-full">
              <CheckCircle2 className="w-7 h-7 text-[#2E7D32]" />
            </div>
            <h3 className="text-lg font-bold text-[#212121]">
              Campaign Draft Initialized
            </h3>
            <p className="text-xs text-[#878787] max-w-sm mx-auto">
              Your campaign specification has been registered under draft status. You can now configure rewards and review timeline milestones.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                Campaign Title / Product Name *
              </label>
              <SmartInput
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onValueChange={(val) => setTitle(val)}
                placeholder="e.g. Khurja Imperial Cobalt Blue Fluted Vase"
                className="w-full px-3.5 py-2.5 border border-[#D5D5D5] rounded-[2px] text-sm text-[#212121] placeholder-[#878787] focus:outline-none focus:border-[#2874F0]"
                enableVoice={true}
                enableLanguageDetection={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Funding Target (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-[#2874F0]">₹</span>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={5000}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-[#D5D5D5] rounded-[2px] text-sm font-bold text-[#212121] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>
                <span className="text-[10px] text-[#878787] mt-1 block">
                  Target: {formatINR(parseFloat(goal) || 0)}
                </span>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#212121] font-bold mb-1.5">
                  Primary Craft Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D5D5D5] rounded-[2px] bg-[#FFFFFF] text-sm text-[#212121] focus:outline-none focus:border-[#2874F0]"
                >
                  <option value="Pottery & Ceramics">Pottery & Ceramics</option>
                  <option value="Handloom Textiles">Handloom Textiles</option>
                  <option value="Metal Craft & Bidri">Metal Craft & Bidri</option>
                  <option value="Woodcraft">Woodcraft</option>
                  <option value="Heritage Decor">Heritage Decor</option>
                  <option value="Design & Tools">Design & Tools</option>
                </select>
              </div>
            </div>

            {/* Platform commitment notice */}
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-[4px] space-y-1.5 text-xs text-[#535766]">
              <div className="flex items-center gap-1.5 font-bold text-[#212121]">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                <span>The Craftify Escrow Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Creators pay 0% upfront. If the target is met, funds are released in verified production milestones. Upon fulfilling backers, your item earns permanent retail listing in the Craftify Store.
              </p>
            </div>

            <div className="border-t border-[#F0F0F0] pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#D5D5D5] rounded-[2px] text-xs font-bold text-[#212121] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#2874F0] hover:bg-[#1259C3] text-[#FFFFFF] rounded-[2px] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <span>Submit Draft for Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
