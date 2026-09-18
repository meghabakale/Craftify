import { Campaign, BackerRecord, UserPledgeRecord } from '../types';

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
 *   Else:
 *     campaign.status = "failed"
 *     every pledge.status = "released"
 *     zero payout.
 */
export function settleCampaign(
  campaign: Campaign,
  pledges: BackerRecord[]
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

  return {
    campaign: updatedCampaign,
    pledges: updatedPledges,
    payoutBreakdown,
    settledAt,
    isFunded,
  };
}
