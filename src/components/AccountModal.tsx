import React from 'react';
import { X, User, Shield, Package, Clock, CheckCircle } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="account-modal-overlay"
      className="fixed inset-0 z-50 bg-[#1B2430]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
    >
      <div
        id="account-modal-dialog"
        className="bg-[#ECE9E2] border-2 border-[#1B2430] w-full max-w-lg shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1B2430]/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B2430] text-[#ECE9E2] flex items-center justify-center font-ledger font-bold text-sm">
              BK
            </div>
            <div>
              <div className="font-display text-xl font-bold text-[#1B2430]">
                Backer & Patron Account
              </div>
              <div className="font-ledger text-xs text-[#1B2430]/60">
                Member ID: LM-PATRON-8821
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#1B2430]/20 hover:border-[#1B2430] text-[#1B2430]"
            aria-label="Close account modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status card */}
        <div className="p-4 bg-[#F4F2EC] border border-[#1B2430]/20 mb-6 space-y-3 font-ledger text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-[#1B2430]/10">
            <span className="text-[#1B2430]/70 uppercase tracking-wider">Account Role</span>
            <span className="font-bold text-[#2F6F4F] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Verified Escrow Backer
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#1B2430]/70 uppercase tracking-wider">Campaigns Backed</span>
            <span className="font-bold text-[#1B2430]">3 Projects (2 Graduated)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#1B2430]/70 uppercase tracking-wider">Marketplace Orders</span>
            <span className="font-bold text-[#1B2430]">1 Delivered</span>
          </div>
        </div>

        {/* Ledger Activity Overview */}
        <div className="space-y-4 mb-6">
          <div className="font-display font-bold text-base text-[#1B2430]">
            Recent Ledger Entries
          </div>

          {/* Item 1 */}
          <div className="p-3 bg-[#F4F2EC] border border-[#1B2430]/15 flex items-center justify-between font-ledger text-xs">
            <div>
              <div className="font-bold text-[#1B2430]">CMP-104 Atelier Monolith Pencil</div>
              <div className="text-[11px] text-[#2F6F4F] flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3" />
                Authorized Hold: $65.00 (Goal Met)
              </div>
            </div>
            <span className="text-[#1B2430]/60">Batch 1</span>
          </div>

          {/* Item 2 */}
          <div className="p-3 bg-[#F4F2EC] border border-[#1B2430]/15 flex items-center justify-between font-ledger text-xs">
            <div>
              <div className="font-bold text-[#1B2430]">SKU-084 Komorebi Desk Lamp</div>
              <div className="text-[11px] text-[#1B2430]/70 flex items-center gap-1 mt-0.5">
                <Package className="w-3 h-3 text-[#2F6F4F]" />
                Order Delivered #LM-9902
              </div>
            </div>
            <span className="text-[#1B2430]/60">$185.00</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1B2430] hover:bg-[#1B2430]/90 text-[#ECE9E2] font-ledger text-xs uppercase tracking-wider font-semibold"
        >
          Close Ledger
        </button>
      </div>
    </div>
  );
};
