import { Campaign, BackerRecord, UserPledgeRecord, CustomerOrder, CustomerOrderItem, Product } from '../types';
import { buildDefaultHistory } from '../data/mockOrders';

export interface PayoutBreakdown {
  grossPledged: number;
  platformFee: number; // 5%
  processingFee: number; // 3%
  netPayout: number; // 92%
}

export interface SettlementResult {
  campaign: Campaign;
  pledges: BackerRecord[];
  payoutBreakdown: PayoutBreakdown | null;
  settledAt: string;
  isFunded: boolean;
  rewardOrders: CustomerOrder[];
}

/**
 * Creates an automatic reward-fulfillment order for a captured backer pledge.
 */
export function createRewardOrderForPledge(
  campaign: Campaign,
  pledge: BackerRecord | UserPledgeRecord,
  settledAtFormatted?: string,
  productsCatalog?: Product[]
): CustomerOrder {
  const backerName = (pledge as BackerRecord).name || 'Aarav Sharma';
  const pledgeId = String(pledge.id);
  const tierTitle = pledge.tierTitle || 'Backer Reward';

  // Try to find matching reward tier in campaign
  const matchedTier = campaign.rewardTiers?.find(
    (t) => t.title.toLowerCase().trim() === tierTitle.toLowerCase().trim()
  ) || campaign.rewardTiers?.[0];

  // Try to find linked product if published to shop
  const linkedProduct = productsCatalog?.find(
    (p) => p.graduatedFromCampaignId === campaign.id || p.id === campaign.publishedProductId
  );

  const orderDate = settledAtFormatted || new Date().toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const estimatedDelivery = matchedTier?.estimatedDelivery
    ? `Fulfillment window: ${matchedTier.estimatedDelivery}`
    : 'Arriving between 15–25 Nov';

  const rewardItem: CustomerOrderItem = {
    id: `reward-item-${campaign.id}-${pledgeId}`,
    productId: linkedProduct?.id || `prd-reward-${campaign.id}`,
    title: matchedTier ? matchedTier.title : tierTitle,
    price: 0, // Included with pledge
    quantity: 1,
    imageUrl: linkedProduct?.imageUrl || campaign.imageUrl,
    subtitle: `Included with your pledge • Reward from: ${campaign.title}`,
    isFundedOnCraftify: true,
    isFundedOnLaunchMart: true,
    artisanName: campaign.creator?.split(',')[0] || campaign.creator || 'Master Artisan Guild',
  };

  const orderId = `CRF-RWD-${campaign.id}-${pledgeId}`;
  const trackingNumber = `IN${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  return {
    id: orderId,
    orderDate,
    estimatedDeliveryRange: estimatedDelivery,
    status: 'confirmed',
    carrierName: 'Delhivery Surface',
    trackingNumber,
    items: [rewardItem],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    shippingAddress: {
      fullName: backerName,
      email: `${backerName.toLowerCase().replace(/\s+/g, '.')}@indiamail.in`,
      street: '42, 3rd Cross, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
    },
    paymentMethod: `Escrow Pledge Authorization (${campaign.code || campaign.id})`,
    history: buildDefaultHistory('confirmed', orderDate),
    isBackerReward: true,
    originatingCampaignId: campaign.id,
    originatingCampaignTitle: campaign.title,
    originatingPledgeId: pledgeId,
    buyerId: backerName,
    backerName: backerName,
  };
}

/**
 * Calculates days remaining until the campaign deadline against the current date.
 * Returns 0 if the deadline has already passed.
 */
export function calculateDaysRemaining(deadlineStr?: string, fallbackDays: number = 0): number {
  if (!deadlineStr) return Math.max(0, fallbackDays);
  
  const target = new Date(deadlineStr);
  if (isNaN(target.getTime())) return Math.max(0, fallbackDays);

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Checks whether a campaign's deadline has already elapsed.
 */
export function isDeadlinePassed(deadlineStr?: string): boolean {
  if (!deadlineStr) return false;
  const target = new Date(deadlineStr);
  if (isNaN(target.getTime())) return false;
  return target.getTime() <= Date.now();
}

/**
 * Formats a deadline string into an intuitive human-readable date.
 * e.g. "2026-10-01" -> "October 1, 2026"
 */
export function formatDeadlineDate(deadlineStr?: string, daysLeft?: number): string {
  if (deadlineStr) {
    const d = new Date(deadlineStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
  if (typeof daysLeft === 'number' && daysLeft > 0) {
    const future = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
    return future.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return 'Campaign Deadline';
}

/**
 * Calculates financial payout breakdown for an escrow settlement.
 * 5% Platform Fee, 3% Payment Processing Fee, 92% Net Payout.
 */
export function calculatePayoutBreakdown(amount: number): PayoutBreakdown {
  const platformFee = Math.round(amount * 0.05 * 100) / 100;
  const processingFee = Math.round(amount * 0.03 * 100) / 100;
  const netPayout = Math.max(0, Math.round((amount - platformFee - processingFee) * 100) / 100);
  return {
    grossPledged: amount,
    platformFee,
    processingFee,
    netPayout,
  };
}

/**
 * Core Escrow Settlement Logic matching Kickstarter covenants:
 * - All-or-nothing:
 *   If amountRaised >= fundingGoal:
 *     campaign.status = "funded"
 *     every pledge.status = "captured"
 *     payout breakdown calculated: 5% platform fee, 3% processing fee, 92% net payout.
 *     automatically generates a reward-fulfillment order for each captured pledge.
 *   Else:
 *     campaign.status = "failed"
 *     every pledge.status = "released"
 *     zero payout.
 */
export function settleCampaign(
  campaign: Campaign,
  pledges: BackerRecord[],
  productsCatalog?: Product[],
  userPledges?: UserPledgeRecord[]
): SettlementResult {
  const amountRaised = campaign.amountRaised ?? campaign.pledgedAmount;
  const fundingGoal = campaign.fundingGoal ?? campaign.goalAmount;
  const isFunded = amountRaised >= fundingGoal;

  const settledAt = new Date().toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let payoutBreakdown: PayoutBreakdown | null = null;
  if (isFunded) {
    const platformFee = Math.round(amountRaised * 0.05 * 100) / 100;
    const processingFee = Math.round(amountRaised * 0.03 * 100) / 100;
    const netPayout = Math.max(0, Math.round((amountRaised - platformFee - processingFee) * 100) / 100);
    payoutBreakdown = {
      grossPledged: amountRaised,
      platformFee,
      processingFee,
      netPayout,
    };
  }

  const updatedCampaign: Campaign = {
    ...campaign,
    status: isFunded ? 'funded' : 'failed',
    daysLeft: 0,
    isSettled: true,
    settlement: {
      settledAt,
      outcome: isFunded ? 'funded' : 'unsuccessful',
      grossPledged: amountRaised,
      platformFee: payoutBreakdown ? payoutBreakdown.platformFee : 0,
      processingFee: payoutBreakdown ? payoutBreakdown.processingFee : 0,
      netPayout: payoutBreakdown ? payoutBreakdown.netPayout : 0,
      backersAffectedCount: pledges.length || campaign.backersCount,
    },
  };

  const updatedPledges: BackerRecord[] = (pledges || []).map((p) => ({
    ...p,
    status: isFunded ? ('captured' as const) : ('released' as const),
    settlementDate: settledAt,
  }));

  const rewardOrders: CustomerOrder[] = [];
  if (isFunded) {
    // Generate reward order for every backer of this campaign
    for (const pledge of updatedPledges) {
      rewardOrders.push(createRewardOrderForPledge(updatedCampaign, pledge, settledAt, productsCatalog));
    }

    // Also ensure user pledges for this campaign get reward orders if not already in backer list
    if (userPledges) {
      const campUserPledges = userPledges.filter(up => String(up.campaignId) === String(campaign.id));
      for (const up of campUserPledges) {
        if (!rewardOrders.some(ro => ro.originatingPledgeId === String(up.id))) {
          rewardOrders.push(createRewardOrderForPledge(updatedCampaign, up, settledAt, productsCatalog));
        }
      }
    }
  }

  return {
    campaign: updatedCampaign,
    pledges: updatedPledges,
    payoutBreakdown,
    settledAt,
    isFunded,
    rewardOrders,
  };
}

