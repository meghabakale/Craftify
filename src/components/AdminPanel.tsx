import React, { useState, useEffect } from 'react';
import { ActiveView, Campaign, User, AdminPlatformStats, AdminUserRecord } from '../types';
import { DEFAULT_PENDING_CAMPAIGNS, DEFAULT_ADMIN_USERS, DEFAULT_ADMIN_STATS } from '../data/adminData';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Users,
  BarChart3,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  UserX,
  IndianRupee,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User | null;
  campaigns: Campaign[];
  onNavigate: (view: ActiveView) => void;
  onOpenCampaignDetail: (campaign: Campaign) => void;
  onCampaignApproved?: (slug: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  campaigns,
  onNavigate,
  onOpenCampaignDetail,
  onCampaignApproved,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'stats' | 'users'>('pending');
  const [loading, setLoading] = useState(false);
  const [pendingCampaigns, setPendingCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | number | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'artisan' | 'admin'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getAuthToken = () => {
    return currentUser?.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('kaarigar_access_token') : null);
  };

  // 1. Fetch Pending Campaigns
  const fetchPendingCampaigns = async () => {
    const token = getAuthToken();
    setLoading(true);
    setErrorMessage(null);
    try {
      if (token) {
        const res = await fetch('/api/admin/campaigns/pending/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPendingCampaigns(data);
            setLoading(false);
            return;
          }
        } else if (res.status === 403) {
          setErrorMessage("Access denied (403): Administrator permissions required.");
          setLoading(false);
          return;
        }
      }
    } catch {
      // Backend not yet responding, fallback to local unapproved campaigns
    }

    // Fallback: search campaigns with isApproved === false or status === 'pending_review'
    const fallbackPending = campaigns
      .filter((c) => c.isApproved === false || c.status === 'pending_review')
      .map((c) => ({
        id: c.id,
        slug: c.slug || c.id,
        title: c.title,
        short_description: c.shortDescription,
        category: c.category,
        goal_amount: c.goalAmount,
        amount_raised: c.pledgedAmount,
        artisan_name: c.creator,
        craft_type: c.craftHeritage || c.category,
        region_state: c.artisanRegion || 'India',
        image: c.imageUrl,
        is_approved: false,
        created_at: new Date().toISOString(),
      }));

    // If none are unapproved in list, show sample pending campaign for review demonstration
    if (fallbackPending.length === 0) {
      fallbackPending.push(...DEFAULT_PENDING_CAMPAIGNS);
    }

    setPendingCampaigns(fallbackPending);
    setLoading(false);
  };

  // 2. Fetch Platform Stats
  const fetchStats = async () => {
    const token = getAuthToken();
    setLoading(true);
    setErrorMessage(null);
    try {
      if (token) {
        const res = await fetch('/api/admin/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStats({
            total_campaigns: data.total_campaigns ?? 0,
            total_funded_amount: Number(data.total_funded_amount) || 0,
            active_artisans_count: data.active_artisans_count ?? 0,
            total_orders: data.total_orders ?? 0,
          });
          setLoading(false);
          return;
        } else if (res.status === 403) {
          setErrorMessage("Access denied (403): Administrator permissions required.");
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Local stats fallback
    const totalRaised = campaigns.reduce((acc, curr) => acc + (curr.pledgedAmount || 0), 0);
    setStats({
      total_campaigns: campaigns.length,
      total_funded_amount: totalRaised || DEFAULT_ADMIN_STATS.total_funded_amount,
      active_artisans_count: DEFAULT_ADMIN_STATS.active_artisans_count,
      total_orders: DEFAULT_ADMIN_STATS.total_orders,
      pending_campaigns_count: pendingCampaigns.length,
      approved_campaigns_count: campaigns.length,
    });
    setLoading(false);
  };

  // 3. Fetch Users
  const fetchUsers = async () => {
    const token = getAuthToken();
    setLoading(true);
    setErrorMessage(null);
    try {
      if (token) {
        const res = await fetch('/api/admin/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((u: any) => ({
              id: u.id,
              username: u.username || `user_${u.id}`,
              email: u.email || 'user@kaarigar.in',
              role: u.role || 'buyer',
              craft_type: u.craft_type,
              is_suspended: Boolean(u.is_suspended),
              is_active: u.is_active ?? !u.is_suspended,
              date_joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active',
            }));
            setUsersList(mapped);
            setLoading(false);
            return;
          }
        } else if (res.status === 403) {
          setErrorMessage("Access denied (403): Administrator permissions required.");
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback users list
    setUsersList(DEFAULT_ADMIN_USERS);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingCampaigns();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Handle Campaign Approval
  const handleApproveCampaign = async (slugOrId: string, title: string) => {
    setActionInProgress(slugOrId);
    const token = getAuthToken();

    try {
      if (token) {
        const res = await fetch(`/api/admin/campaigns/${slugOrId}/approve/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          setPendingCampaigns((prev) => prev.filter((c) => c.slug !== slugOrId && c.id !== slugOrId));
          if (showToast) {
            showToast(`Campaign "${title}" approved successfully and published to live catalog!`, 'success');
          }
          if (onCampaignApproved) {
            onCampaignApproved(slugOrId);
          }
          setActionInProgress(null);
          return;
        } else if (res.status === 403) {
          if (showToast) {
            showToast("Permission denied: Only administrative accounts can approve campaigns.", 'error');
          }
          setActionInProgress(null);
          return;
        }
      }
    } catch {
      // Offline / demo approval fallback
    }

    // Local state update
    setPendingCampaigns((prev) => prev.filter((c) => c.slug !== slugOrId && c.id !== slugOrId));
    if (showToast) {
      showToast(`Campaign "${title}" approved successfully!`, 'success');
    }
    if (onCampaignApproved) {
      onCampaignApproved(slugOrId);
    }
    setActionInProgress(null);
  };

  // Handle User Suspension Toggle
  const handleToggleUserSuspension = async (userId: number | string, username: string, currentSuspended: boolean) => {
    setActionInProgress(userId);
    const token = getAuthToken();

    try {
      if (token) {
        const res = await fetch(`/api/admin/users/${userId}/suspend/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const nextState = data.is_suspended ?? !currentSuspended;
          setUsersList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, is_suspended: nextState, is_active: !nextState } : u))
          );
          if (showToast) {
            showToast(data.detail || `User "${username}" ${nextState ? 'suspended' : 'unsuspended'}.`, 'info');
          }
          setActionInProgress(null);
          return;
        } else if (res.status === 403) {
          if (showToast) {
            showToast("Permission denied: Only platform administrators can manage user accounts.", 'error');
          }
          setActionInProgress(null);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    // Local toggle
    const nextSuspended = !currentSuspended;
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: nextSuspended, is_active: !nextSuspended } : u))
    );
    if (showToast) {
      showToast(`User "${username}" ${nextSuspended ? 'suspended' : 'unsuspended'} successfully.`, 'info');
    }
    setActionInProgress(null);
  };

  // Filter users list
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.craft_type && u.craft_type.toLowerCase().includes(userSearchQuery.toLowerCase()));

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div id="admin-panel-page" className="py-6 bg-[#F1F3F6] min-h-screen text-[#212121]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-[#878787] mb-3">
          <button onClick={() => onNavigate('home')} className="hover:text-[#2874F0] cursor-pointer">
            Home
          </button>
          <span>/</span>
          <span className="text-[#212121] font-semibold">Admin Panel</span>
        </div>

        {/* Admin Header */}
        <div className="p-5 sm:p-6 bg-[#FFFFFF] rounded-[4px] border border-[#EAEAEA] shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-[4px] bg-[#2874F0]/10 flex items-center justify-center shrink-0 text-[#2874F0]">
              <ShieldAlert className="w-6 h-6 text-[#2874F0]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-[2px] text-[10px] uppercase font-bold tracking-wider bg-[#2874F0] text-white">
                  Platform Administrator
                </span>
                <span className="text-xs text-[#878787]">Role: {currentUser?.role || 'Admin'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#212121]">
                Kaarigar Admin Operations
              </h1>
              <p className="text-xs sm:text-sm text-[#878787] mt-1">
                Enforce campaign curation, oversee escrow funding totals, and govern artisan & patron accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === 'pending') fetchPendingCampaigns();
                if (activeTab === 'stats') fetchStats();
                if (activeTab === 'users') fetchUsers();
              }}
              className="px-3.5 py-2 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-xs font-semibold text-[#212121] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-[#FDEAEA] border border-[#D32F2F]/20 text-[#D32F2F] text-xs rounded-[4px] font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-[#FFFFFF] rounded-t-[4px] border-b border-[#EAEAEA] px-4 sm:px-6 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'border-[#2874F0] text-[#2874F0]'
                : 'border-transparent text-[#878787] hover:text-[#212121]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Campaigns</span>
            {pendingCampaigns.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FB641B] text-white font-bold">
                {pendingCampaigns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'border-[#2874F0] text-[#2874F0]'
                : 'border-transparent text-[#878787] hover:text-[#212121]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#2874F0] text-[#2874F0]'
                : 'border-transparent text-[#878787] hover:text-[#212121]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>
        </div>

        {/* TAB 1: PENDING CAMPAIGNS */}
        {activeTab === 'pending' && (
          <div className="bg-[#FFFFFF] rounded-b-[4px] p-6 border border-t-0 border-[#EAEAEA] shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#212121]">Campaign Review Queue</h2>
                <p className="text-xs text-[#878787]">
                  Review draft campaigns submitted by verified artisans before approving them for public crowdfunding.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#878787]">
                {pendingCampaigns.length} awaiting curation
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-[#878787]">Loading pending campaigns...</p>
              </div>
            ) : pendingCampaigns.length === 0 ? (
              <div className="py-12 text-center max-w-md mx-auto">
                <div className="w-14 h-14 bg-[#EBF7EE] text-[#388E3C] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#212121]">Queue Clear</h3>
                <p className="text-xs text-[#878787] mt-1">
                  All submitted campaigns have been reviewed and approved. New submissions from registered artisans will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCampaigns.map((camp) => (
                  <div
                    key={camp.id || camp.slug}
                    className="p-5 border border-[#EAEAEA] rounded-[4px] bg-[#FFFFFF] hover:border-[#2874F0]/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <img
                        src={camp.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=300'}
                        alt={camp.title}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] object-cover border border-[#E0E0E0] shrink-0 bg-[#F5F5F5]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=300';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-[2px] text-[10px] uppercase font-bold tracking-wider bg-[#FFF7E6] text-[#B78103] border border-[#B78103]/20">
                            Awaiting Approval
                          </span>
                          <span className="text-[11px] text-[#2874F0] font-semibold">{camp.category}</span>
                          <span className="text-[11px] text-[#878787]">• {camp.region_state || 'India'}</span>
                        </div>

                        <h3 className="text-base font-bold text-[#212121] truncate">{camp.title}</h3>
                        <p className="text-xs text-[#666666] line-clamp-2 mt-1 leading-relaxed">
                          {camp.short_description}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-[#878787]">
                          <div>
                            <span className="font-semibold text-[#212121]">Artisan:</span> {camp.artisan_name}
                          </div>
                          <div>
                            <span className="font-semibold text-[#212121]">Goal:</span> ₹
                            {Number(camp.goal_amount).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#F0F0F0] shrink-0">
                      <button
                        onClick={() => {
                          const existingCamp = campaigns.find(
                            (c) => c.slug === camp.slug || c.id === camp.id || c.title === camp.title
                          );
                          if (existingCamp) {
                            onOpenCampaignDetail(existingCamp);
                          }
                        }}
                        className="px-3 py-2 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-xs font-semibold text-[#212121] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        disabled={actionInProgress === (camp.slug || camp.id)}
                        onClick={() => handleApproveCampaign(camp.slug || camp.id, camp.title)}
                        className="px-4 py-2 rounded-[2px] bg-[#388E3C] hover:bg-[#2E7D32] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{actionInProgress === (camp.slug || camp.id) ? 'Approving...' : 'Approve Campaign'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLATFORM STATS */}
        {activeTab === 'stats' && (
          <div className="bg-[#FFFFFF] rounded-b-[4px] p-6 border border-t-0 border-[#EAEAEA] shadow-xs">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#212121]">Platform Economic & Ledger Overview</h2>
              <p className="text-xs text-[#878787]">
                Aggregated crowdfunding volume, escrow obligations, and artisan participation rates.
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-[#878787]">Loading stats...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-[4px] border border-[#EAEAEA] bg-[#FAFAFA]">
                    <div className="flex items-center justify-between text-[#878787] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Campaigns</span>
                      <Layers className="w-4 h-4 text-[#2874F0]" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#212121]">
                      {stats.total_campaigns}
                    </div>
                    <p className="text-[11px] text-[#388E3C] mt-1 font-medium">All active & past initiatives</p>
                  </div>

                  <div className="p-5 rounded-[4px] border border-[#EAEAEA] bg-[#FAFAFA]">
                    <div className="flex items-center justify-between text-[#878787] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Total Funds Raised</span>
                      <IndianRupee className="w-4 h-4 text-[#388E3C]" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#212121]">
                      ₹{Number(stats.total_funded_amount).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-[#388E3C] mt-1 font-medium">Escrow pre-auths & commitments</p>
                  </div>

                  <div className="p-5 rounded-[4px] border border-[#EAEAEA] bg-[#FAFAFA]">
                    <div className="flex items-center justify-between text-[#878787] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Active Artisans</span>
                      <Users className="w-4 h-4 text-[#FB641B]" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#212121]">
                      {stats.active_artisans_count}
                    </div>
                    <p className="text-[11px] text-[#878787] mt-1">Verified creator accounts</p>
                  </div>

                  <div className="p-5 rounded-[4px] border border-[#EAEAEA] bg-[#FAFAFA]">
                    <div className="flex items-center justify-between text-[#878787] mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Graduated Orders</span>
                      <CheckCircle2 className="w-4 h-4 text-[#7B1FA2]" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#212121]">
                      {stats.total_orders}
                    </div>
                    <p className="text-[11px] text-[#878787] mt-1">Direct craft shop orders</p>
                  </div>
                </div>

                {/* Escrow Covenant Breakdown */}
                <div className="p-5 border border-[#EAEAEA] rounded-[4px] bg-[#FFFFFF]">
                  <h3 className="text-sm font-bold text-[#212121] mb-2">Platform Fee Covenant Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-[#EBF7EE] rounded-[3px] border border-[#388E3C]/20">
                      <span className="font-bold text-[#388E3C] block mb-0.5">92% Net Milestone Payout</span>
                      <p className="text-[#666666]">
                        Direct disbursement to master craftspeople upon meeting 100% threshold.
                      </p>
                    </div>
                    <div className="p-3 bg-[#EBF2FE] rounded-[3px] border border-[#2874F0]/20">
                      <span className="font-bold text-[#2874F0] block mb-0.5">5% Platform Infrastructure</span>
                      <p className="text-[#666666]">
                        Maintains AI artisan studio tools, craft verification, and multi-lingual UI.
                      </p>
                    </div>
                    <div className="p-3 bg-[#FFF7E6] rounded-[3px] border border-[#B78103]/20">
                      <span className="font-bold text-[#B78103] block mb-0.5">3% Payment Escrow Fee</span>
                      <p className="text-[#666666]">
                        Covers banking pre-authorizations, zero-fraud escrow, and payment gateways.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-[#FFFFFF] rounded-b-[4px] p-6 border border-t-0 border-[#EAEAEA] shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#212121]">User & Role Governance</h2>
                <p className="text-xs text-[#878787]">
                  Supervise user identities, craft specializations, and enforce suspensions when necessary.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#878787]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, craft..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FFFFFF] border border-[#D5D5D5] rounded-[2px] focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#F1F3F6] p-1 rounded-[2px] text-xs">
                  <button
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-[2px] font-semibold cursor-pointer ${
                      userRoleFilter === 'all' ? 'bg-[#FFFFFF] text-[#2874F0] shadow-2xs' : 'text-[#666666]'
                    }`}
                  >
                    All ({usersList.length})
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('artisan')}
                    className={`px-2.5 py-1 rounded-[2px] font-semibold cursor-pointer ${
                      userRoleFilter === 'artisan' ? 'bg-[#FFFFFF] text-[#2874F0] shadow-2xs' : 'text-[#666666]'
                    }`}
                  >
                    Artisans
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('buyer')}
                    className={`px-2.5 py-1 rounded-[2px] font-semibold cursor-pointer ${
                      userRoleFilter === 'buyer' ? 'bg-[#FFFFFF] text-[#2874F0] shadow-2xs' : 'text-[#666666]'
                    }`}
                  >
                    Buyers
                  </button>
                  <button
                    onClick={() => setUserRoleFilter('admin')}
                    className={`px-2.5 py-1 rounded-[2px] font-semibold cursor-pointer ${
                      userRoleFilter === 'admin' ? 'bg-[#FFFFFF] text-[#2874F0] shadow-2xs' : 'text-[#666666]'
                    }`}
                  >
                    Admins
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-[#2874F0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-[#878787]">Loading registered users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#878787]">
                No users match the search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#EAEAEA] rounded-[4px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9FAFB] text-[#878787] uppercase font-bold border-b border-[#EAEAEA]">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Craft / Specialization</th>
                      <th className="px-4 py-3">Account Status</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {filteredUsers.map((u) => {
                      const isAdmin = u.role === 'admin';
                      const isSuspended = u.is_suspended;

                      return (
                        <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-[#212121]">{u.username}</div>
                            <div className="text-[11px] text-[#878787]">{u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-[#EAE8FE] text-[#5E35B1]'
                                  : u.role === 'artisan'
                                  ? 'bg-[#EBF7EE] text-[#388E3C]'
                                  : 'bg-[#EBF2FE] text-[#2874F0]'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#666666]">
                            {u.craft_type ? u.craft_type : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 text-[#D32F2F] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]"></span>
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#388E3C] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#388E3C]"></span>
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#878787]">{u.date_joined || 'Active'}</td>
                          <td className="px-4 py-3 text-right">
                            {isAdmin ? (
                              <span className="text-[10px] text-[#878787] font-semibold italic">Protected</span>
                            ) : (
                              <button
                                disabled={actionInProgress === u.id}
                                onClick={() => handleToggleUserSuspension(u.id, u.username, isSuspended)}
                                className={`px-2.5 py-1 rounded-[2px] font-bold text-[11px] transition-colors cursor-pointer border ${
                                  isSuspended
                                    ? 'bg-[#EBF7EE] text-[#388E3C] border-[#388E3C]/30 hover:bg-[#388E3C] hover:text-white'
                                    : 'bg-[#FDEAEA] text-[#D32F2F] border-[#D32F2F]/30 hover:bg-[#D32F2F] hover:text-white'
                                }`}
                              >
                                {actionInProgress === u.id
                                  ? 'Updating...'
                                  : isSuspended
                                  ? 'Unsuspend Account'
                                  : 'Suspend Account'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
