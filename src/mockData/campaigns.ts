import { Campaign } from '../types';
import { MOCK_CAMPAIGNS } from '../data/mockData';
import { CAMPAIGN_IMAGES } from './imageAssets';

export const campaigns: Campaign[] = MOCK_CAMPAIGNS.map((c) => ({
  ...c,
  imageUrl: CAMPAIGN_IMAGES[c.id] || (c.slug ? CAMPAIGN_IMAGES[c.slug] : '') || c.imageUrl,
}));

export default campaigns;
