import React, { useState, useEffect } from 'react';
import { ActiveView, BuyerPledge, Campaign, User, UserPledgeRecord } from '../types';
import { ShieldCheck, Calendar, Package, ArrowRight, ExternalLink, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../utils/format';
import { formatDeadlineDate } from '../utils/settleCampaign';

interface MyPledgesPageProps {
  currentUser: User | null;
  campaigns: Campaign[];
  localPledges: UserPledgeRecord[];
  onNavigate: (view: ActiveView) => void;
  onOpenCampaignDetail: (campaign: Campaign) => void;
  onOpenAuth: () => void;
  onSimulateSettlement?: (campaignId: string, forceOutcome?: 'funded' | 'unsuccessful' | 'reset') => void;
}

export const MyPledgesPage: React.FC<MyPledgesPageProps> = ({
  currentUser,
  campaigns,
  localPledges,
  onNavigate,
  onOpenCampaignDetail,
  onOpenAuth,
  onSimulateSettlement,
}) => {
  const [pledges, setPledges] = useState<BuyerPledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPledges = async () => {
    setLoading(true);
    setError(null);

    // 1. Gather all local / persisted pledges
    let localSaved: UserPledgeRecord[] = [];
    try {
      const stored = localStorage.getItem('craftify_user_pledges');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) localSaved = parsed;
      }
    } catch {
      // ignore
    }

    const allLocal: UserPledgeRecord[] = [...localPledges];
    for (const sp of localSaved) {
      if (!allLocal.some((p) => String(p.id) === String(sp.id))) {
        allLocal.push(sp);
      }
    }

    // Convert local records into BuyerPledge objects
    const localMapped: BuyerPledge[] = allLocal.map((lp) => {
      const camp = campaigns.find(
        (c) =>
          String(c.id) === String(lp.campaignId) ||
          c.code === lp.campaignCode ||
          c.title.toLowerCase().trim() === (lp.campaignTitle || '').toLowerCase().trim()
      );
      const formattedStatus = (lp.status === 'captured' ? 'captured' : lp.status === 'released' ? 'released' : 'authorized') as any;
      return {
        id: lp.id,
        campaignId: lp.campaignId,
        campaignTitle: lp.campaignTitle || camp?.title || 'Artisan Campaign',
        campaignSlug: camp?.slug,
        campaignStatus: camp?.status || 'in_progress',
        campaignImage: camp?.imageUrl || (camp as any)?.image,
        tierTitle: lp.tierTitle || 'Patron Support',
        amount: lp.amount,
        status: formattedStatus,
        createdAt: lp.dateAuthorized || 'Recent',
        estimatedDelivery: lp.estimatedDelivery || 'Estimated 4–6 weeks',
        settlementDate: lp.settlementDate || camp?.settlementDate,
      };
    });

    const token = currentUser?.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('kaarigar_access_token') : null);

    try {
      // Attempt to fetch from backend
      const res = await fetch('/api/campaigns/my-pledges/', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            },
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.results || [];
        if (Array.isArray(list)) {
          const backendMapped: BuyerPledge[] = list.map((item: any) => ({
            id: String(item.id),
            campaignId: String(item.campaign_id || item.campaign || item.campaignId),
            campaignTitle: item.campaign_title || item.campaignTitle || 'Artisan Campaign',
            campaignSlug: item.campaign_slug || item.campaignSlug,
            campaignStatus: item.campaign_status || item.campaignStatus || 'active',
            campaignImage: item.campaign_image || item.campaignImage,
            tierTitle: item.tier_title || item.tierTitle || 'Patron Support',
            amount: Number(item.amount) || 0,
            status: item.status || 'authorized',
            createdAt: item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : (item.dateAuthorized || 'Recent'),
            estimatedDelivery: item.estimated_delivery || item.estimatedDelivery || '4-6 weeks after funding',
          }));

          // Merge: localMapped first, then add backend pledges that are not already present
          const combined = [...localMapped];
          for (const bp of backendMapped) {
            const matchIndex = combined.findIndex(
              (c) =>
                String(c.id) === String(bp.id) ||
                (String(c.campaignId) === String(bp.campaignId) && c.amount === bp.amount)
            );
            if (matchIndex >= 0) {
              if (bp.status === 'captured' || bp.status === 'released') {
                combined[matchIndex].status = bp.status;
              }
            } else {
              combined.push(bp);
            }
          }
          setPledges(combined);
          setLoading(false);
          return;
        }
      } else if (res.status === 403) {
        setError('Access restricted: Buyer authentication required to view pledges.');
      }
    } catch {
      // Network unreachable, fall through to localMapped
    }

    setPledges(localMapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchPledges();
  }, [currentUser, localPledges]);

  const handleCampaignClick = (pledge: BuyerPledge) => {
    const found = campaigns.find(
      (c) =>
        c.id === String(pledge.campaignId) ||
        c.title.toLowerCase().trim() === pledge.campaignTitle.toLowerCase().trim() ||
        (pledge.campaignSlug && c.slug === pledge.campaignSlug)
    );
    if (found) {
      onOpenCampaignDetail(found);
    } else {
      onNavigate('campaigns');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'authorized':
      case 'authorized_pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider bg-[#FFF8E1] text-[#B78103] border border-[#B78103]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B78103]"></span>
            Authorized — card hold only
          </span>
        );
      case 'captured':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
            Charged — campaign funded
          </span>
        );
      case 'released':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider bg-[#F1F3F6] text-[#666666] border border-[#D5D5D5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#878787]"></span>
            Released — campaign did not reach goal, no charge
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wider bg-[#F1F3F6] text-[#666666]">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="my-pledges-page" className="py-6 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-[#878787] mb-3">
          <button onClick={() => onNavigate('home')} className="hover:text-[#2874F0] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-[#212121] font-semibold">My Backed Pledges</span>
        </div>

        {/* Page Header with Escrow Assurance */}
        <div className="p-5 sm:p-6 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#388E3C]" />
              <span className="text-xs uppercase tracking-wider text-[#388E3C] font-bold">
                100% Protected Escrow Covenants
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121]">
              My Crowdfunding Pledges
            </h1>
            <p className="text-xs sm:text-sm text-[#878787] mt-1 max-w-2xl leading-relaxed">
              Track the status of all your backed artisan projects. Funds are held in verified escrow as pre-authorizations and only captured when the campaign reaches 100% of its minimum goal.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchPledges}
              className="px-3.5 py-2 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-xs font-semibold text-[#212121] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-4 py-2 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
            >
              Discover Campaigns
            </button>
          </div>
        </div>

        {/* Not Logged In Warning Banner */}
        {!currentUser && (
          <div className="mb-6 p-4 bg-[#FFF9E6] border border-[#FFE082] rounded-[4px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FB641B] shrink-0" />
              <div className="text-xs text-[#212121]">
                <span className="font-bold">You are currently viewing guest/demo pledges.</span> Sign in with your registered patron account to sync live ledger authorizations.
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-[#2874F0] text-white rounded-[2px] text-xs font-bold shrink-0 hover:bg-[#1C5BC2] cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#FDEAEA] border border-[#D32F2F]/20 text-[#D32F2F] text-xs rounded-[4px] font-semibold">
            {error}
          </div>
        )}

        {/* Pledges List */}
        {loading ? (
          <div className="bg-[#FFFFFF] p-12 rounded-[4px] border border-[#EAEAEA] text-center">
            <div className="w-8 h-8 border-3 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#878787]">Loading verified escrow pledges...</p>
          </div>
        ) : pledges.length === 0 ? (
          <div className="bg-[#FFFFFF] p-12 rounded-[4px] border border-[#EAEAEA] text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 bg-[#F1F3F6] rounded-full flex items-center justify-center mx-auto mb-4 text-[#878787]">
              <Package className="w-8 h-8 text-[#2874F0]" />
            </div>
            <h3 className="text-lg font-bold text-[#212121] mb-1">No Active Pledges Found</h3>
            <p className="text-xs text-[#878787] mb-6 leading-relaxed">
              You haven’t backed any artisan campaigns yet. Discover master weavers, terracotta potters, and brass casters raising funds for their next production run.
            </p>
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-6 py-2.5 bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Active Campaigns</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pledges.map((pledge) => {
              const matchedCamp = campaigns.find(
                (c) =>
                  c.id === String(pledge.campaignId) ||
                  c.title.toLowerCase().trim() === pledge.campaignTitle.toLowerCase().trim() ||
                  (pledge.campaignSlug && c.slug === pledge.campaignSlug)
              );

              return (
                <div
                  key={pledge.id}
                  id={`pledge-card-${pledge.id}`}
                  className="bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs p-5 transition-shadow hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={pledge.campaignImage || matchedCamp?.imageUrl || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=300'}
                      alt={pledge.campaignTitle}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] object-cover border border-[#E0E0E0] shrink-0 bg-[#F5F5F5]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=300';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {getStatusBadge(pledge.status)}
                        <span className="text-[11px] text-[#878787] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {pledge.createdAt}
                        </span>
                      </div>

                      <h3
                        onClick={() => handleCampaignClick(pledge)}
                        className="text-base sm:text-lg font-bold text-[#212121] hover:text-[#2874F0] cursor-pointer transition-colors truncate"
                      >
                        {pledge.campaignTitle}
                      </h3>

                      <div className="mt-1 text-xs text-[#666666]">
                        <span className="font-semibold text-[#212121]">Reward Tier:</span> {pledge.tierTitle}
                      </div>

                      <div className="mt-0.5 text-xs text-[#878787]">
                        <span className="font-medium text-[#212121]">Fulfillment Window:</span> {pledge.estimatedDelivery}
                      </div>

                      {/* Escrow Status Specific Context Callout */}
                      {(pledge.status === 'authorized' || pledge.status === 'authorized_pending') && (
                        <div className="mt-2.5 p-2.5 rounded-[2px] bg-[#FFF8E1] border border-[#B78103]/30 text-xs text-[#B78103] flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Will only be charged if the campaign reaches its goal of{' '}
                            <strong>{formatINR(matchedCamp?.goalAmount || matchedCamp?.fundingGoal || 100000)}</strong> by{' '}
                            <strong>{formatDeadlineDate(matchedCamp?.deadline, matchedCamp?.daysLeft)}</strong>.
                          </span>
                        </div>
                      )}

                      {pledge.status === 'captured' && (
                        <div className="mt-2.5 p-2.5 rounded-[2px] bg-[#EAF8EB] border border-[#388E3C]/30 text-xs text-[#388E3C] flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            Campaign reached its funding goal! Captured on{' '}
                            <strong>{pledge.settlementDate || matchedCamp?.settlementDate || pledge.createdAt || 'Settlement'}</strong>. Amount charged:{' '}
                            <strong>{formatINR(pledge.amount)}</strong>.
                          </span>
                        </div>
                      )}

                      {pledge.status === 'released' && (
                        <div className="mt-2.5 p-2.5 rounded-[2px] bg-[#F1F3F6] border border-[#D5D5D5] text-xs text-[#666666] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#878787]" />
                          <span>
                            Campaign did not reach its goal before the deadline. All patron holds have been released.{' '}
                            <strong className="text-[#212121]">₹0 was charged to your card.</strong>
                          </span>
                        </div>
                      )}

                      {/* Simulation Quick Controls for this Pledge's Campaign */}
                      {onSimulateSettlement && (
                        <div className="mt-3 pt-2.5 border-t border-[#F0F0F0] flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#878787] flex items-center gap-1 mr-1">
                            <Sparkles className="w-3 h-3 text-[#2874F0]" />
                            Simulate:
                          </span>

                          <button
                            id={`btn-simulate-pledge-funded-${pledge.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSimulateSettlement(String(pledge.campaignId), 'funded');
                            }}
                            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              pledge.status === 'captured'
                                ? 'bg-[#EAF8EB] text-[#388E3C] border border-[#388E3C]/40'
                                : 'bg-[#FFFFFF] hover:bg-[#EAF8EB] text-[#2E7D32] border border-[#388E3C]/30 shadow-2xs'
                            }`}
                            title="Simulate 100%+ goal met: captures hold and marks as Funded"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Simulate: Goal Met (Funded)</span>
                          </button>

                          <button
                            id={`btn-simulate-pledge-unsuccessful-${pledge.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSimulateSettlement(String(pledge.campaignId), 'unsuccessful');
                            }}
                            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                              pledge.status === 'released'
                                ? 'bg-[#F1F3F6] text-[#666666] border border-[#D5D5D5]'
                                : 'bg-[#FFFFFF] hover:bg-[#FFF3EC] text-[#FB641B] border border-[#FB641B]/30'
                            }`}
                            title="Simulate deadline expired without reaching goal (hold released)"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Simulate: Unsuccessful</span>
                          </button>

                          {pledge.status !== 'authorized' && (
                            <button
                              id={`btn-simulate-pledge-reset-${pledge.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSimulateSettlement(String(pledge.campaignId), 'reset');
                              }}
                              className="px-2 py-1 rounded-[2px] text-[10px] font-medium text-[#666666] hover:text-[#212121] bg-[#FFFFFF] hover:bg-[#F1F3F6] border border-[#D5D5D5] transition-colors cursor-pointer flex items-center gap-1"
                              title="Reset campaign back to previous state"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reset to Previous State</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Action Link */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#F0F0F0] gap-3 shrink-0">
                    <div className="text-left md:text-right">
                      {pledge.status === 'captured' ? (
                        <>
                          <span className="text-[10px] uppercase tracking-wider text-[#388E3C] block font-bold">
                            Amount Charged
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-[#388E3C]">
                            {formatINR(pledge.amount)}
                          </span>
                          <span className="text-[11px] text-[#878787] block">
                            Captured on {pledge.settlementDate || matchedCamp?.settlementDate || pledge.createdAt}
                          </span>
                        </>
                      ) : pledge.status === 'released' ? (
                        <>
                          <span className="text-[10px] uppercase tracking-wider text-[#878787] block font-semibold">
                            Amount Charged
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-[#212121]">
                            ₹0
                          </span>
                          <span className="text-[11px] text-[#878787] block line-through">
                            {formatINR(pledge.amount)} pre-authorized
                          </span>
                          <span className="text-[10px] font-bold text-[#388E3C] block">
                            Hold Released • Zero Charge
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] uppercase tracking-wider text-[#878787] block font-semibold">
                            Authorized Hold
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-[#212121]">
                            {formatINR(pledge.amount)}
                          </span>
                          <span className="text-[10px] text-[#B78103] font-bold block">
                            ₹0 charged today
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleCampaignClick(pledge)}
                      className="px-4 py-2 rounded-[2px] bg-[#2874F0] hover:bg-[#1C5BC2] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>View Campaign</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
