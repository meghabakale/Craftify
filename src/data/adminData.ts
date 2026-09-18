// Admin fallback and initial mock datasets for Kaarigar Admin Console
import { AdminPlatformStats, AdminUserRecord } from '../types';

export interface AdminPendingCampaign {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  category: string;
  goal_amount: number;
  amount_raised: number;
  artisan_name: string;
  craft_type: string;
  region_state: string;
  image: string;
  is_approved: boolean;
  created_at: string;
}

export const DEFAULT_PENDING_CAMPAIGNS: AdminPendingCampaign[] = [
  {
    id: 'pen-01',
    slug: 'dokra-tribal-figurines',
    title: 'Bastar Dhokra Lost-Wax Bell Metal Sculptures',
    short_description: 'Generational non-ferrous lost-wax metal casting by 12 tribal families in Kondagaon, Chhattisgarh.',
    category: 'Handmade Brass & Bronze',
    goal_amount: 175000,
    amount_raised: 0,
    artisan_name: 'Mangal Ram Baghel',
    craft_type: 'Dhokra Lost-Wax Casting',
    region_state: 'Chhattisgarh',
    image: '/images/products/kuthu-vilakku-brass-lamp.jpg',
    is_approved: false,
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@craftify.in',
    role: 'admin',
    is_suspended: false,
    is_active: true,
    date_joined: '10 Jan, 2026',
  },
  {
    id: 2,
    username: 'ramesh_potter',
    email: 'ramesh.clay@craftify.in',
    role: 'artisan',
    craft_type: 'Jaipur Blue Pottery',
    is_suspended: false,
    is_active: true,
    date_joined: '14 Feb, 2026',
  },
  {
    id: 3,
    username: 'priya_weaver',
    email: 'priya.chanderi@craftify.in',
    role: 'artisan',
    craft_type: 'Chanderi Handloom Weaving',
    is_suspended: false,
    is_active: true,
    date_joined: '22 Feb, 2026',
  },
  {
    id: 4,
    username: 'vikram_patron',
    email: 'vikram.patron@craftify.in',
    role: 'buyer',
    is_suspended: false,
    is_active: true,
    date_joined: '01 Mar, 2026',
  },
];

export const DEFAULT_ADMIN_STATS: AdminPlatformStats = {
  total_campaigns: 12,
  total_funded_amount: 1485000,
  active_artisans_count: 8,
  total_orders: 24,
  pending_campaigns_count: 1,
  approved_campaigns_count: 11,
};
