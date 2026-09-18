import { BackerRecord } from '../types';
import { MOCK_CAMPAIGN_BACKERS } from './mockData';

export interface CampaignPledgeItem extends BackerRecord {
  campaignTitle?: string;
  backerEmail?: string;
  isCurrentUser?: boolean;
}

// Flatten existing mock backers into campaignActivity.pledges structure
const initialPledges: CampaignPledgeItem[] = Object.entries(MOCK_CAMPAIGN_BACKERS).flatMap(
  ([campId, backers]) =>
    backers.map((b) => ({
      ...b,
      campaignId: campId,
      status: b.status || 'authorized',
    }))
);

export const campaignActivity = {
  pledges: initialPledges,
};

export default campaignActivity;
