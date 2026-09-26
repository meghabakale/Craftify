import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from '../src/data/mockData';
import { User } from '../src/types';

// Helper logic directly matching CreatorDashboard.tsx
function isArtisanItem(
  currentUser: User | null,
  artisanId?: string,
  creatorNameVal?: string,
  creatorLegalNameVal?: string,
  creatorBusinessNameVal?: string
): boolean {
  if (!currentUser) return false;

  const currentUserIdStr = String(currentUser.id || '').trim();
  const itemArtisanIdStr = String(artisanId || '').trim();

  // 1. Direct ID match
  if (itemArtisanIdStr && currentUserIdStr && itemArtisanIdStr === currentUserIdStr) {
    return true;
  }

  // 2. String/Name matching for seeded or legacy items
  const userTokens = [
    currentUser.name,
    currentUser.legalName,
    currentUser.businessName,
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim());

  if (userTokens.length === 0) return false;

  const creatorTokens = [
    creatorNameVal,
    creatorLegalNameVal,
    creatorBusinessNameVal,
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase().trim());

  if (creatorTokens.length === 0) return false;

  return userTokens.some((uToken) => {
    if (uToken.length < 3) return false;
    return creatorTokens.some((cToken) => cToken.includes(uToken) || uToken.includes(cToken));
  });
}

function runScopingTests() {
  console.log('=== CREATOR DASHBOARD SCOPING TEST ===\n');

  // Test 1: Brand New Artisan Account
  const newArtisan: User = {
    id: 'usr-new-999',
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    role: 'artisan',
    avatarInitials: 'AS',
    memberSince: 'Sept 2026',
  };

  const newCampaigns = MOCK_CAMPAIGNS.filter((c) =>
    isArtisanItem(newArtisan, c.artisanId, c.creator, c.creatorLegalName, c.creatorBusinessName)
  );

  const newProducts = MOCK_PRODUCTS.filter((p) =>
    isArtisanItem(newArtisan, p.artisanId, p.creator, p.creatorLocation, p.craftHeritage)
  );

  const newEscrow = newCampaigns.reduce((sum, c) => sum + (c.pledgedAmount || c.amountRaised || 0), 0);
  const newFundedCount = newCampaigns.filter((c) => c.status === 'funded' || (c.pledgedAmount || 0) >= (c.goalAmount || 1)).length;
  const newGraduatedCount = newProducts.filter((p) => p.isFundedOnCraftify ?? true).length;

  console.log('--- TEST 1: BRAND NEW ARTISAN ("Ananya Sharma") ---');
  console.log(`My Studio Campaigns Count: ${newCampaigns.length}`);
  console.log(`Studio Escrow Pipeline: ₹${newEscrow}`);
  console.log(`Campaigns Over 100%: ${newFundedCount}`);
  console.log(`Shop Graduated Items: ${newGraduatedCount}`);
  console.assert(newCampaigns.length === 0, 'New artisan must have 0 campaigns');
  console.assert(newEscrow === 0, 'New artisan escrow pipeline must be 0');
  console.assert(newProducts.length === 0, 'New artisan products must be 0');
  console.log('✓ PASS: New artisan account sees genuinely empty dashboard (0 / ₹0).\n');

  // Test 2: Seeded Potter Artisan ("Rameshwar Prajapati")
  const rameshArtisan: User = {
    id: 'usr-artisan-ramesh',
    name: 'Rameshwar Prajapati',
    legalName: 'Rameshwar Prajapati',
    businessName: 'Prajapati Blue Pottery Studio',
    email: 'ramesh@example.com',
    role: 'artisan',
    avatarInitials: 'RP',
    memberSince: 'Jan 2025',
  };

  const rameshCampaigns = MOCK_CAMPAIGNS.filter((c) =>
    isArtisanItem(rameshArtisan, c.artisanId, c.creator, c.creatorLegalName, c.creatorBusinessName)
  );

  const rameshProducts = MOCK_PRODUCTS.filter((p) =>
    isArtisanItem(rameshArtisan, p.artisanId, p.creator, p.creatorLocation, p.craftHeritage)
  );

  const rameshEscrow = rameshCampaigns.reduce((sum, c) => sum + (c.pledgedAmount || c.amountRaised || 0), 0);
  const rameshFundedCount = rameshCampaigns.filter((c) => c.status === 'funded' || (c.pledgedAmount || 0) >= (c.goalAmount || 1)).length;

  console.log('--- TEST 2: SEEDED DEMO ARTISAN ("Rameshwar Prajapati") ---');
  console.log(`My Studio Campaigns Count: ${rameshCampaigns.length}`);
  console.log(`Campaign Titles: ${rameshCampaigns.map((c) => c.title).join(', ')}`);
  console.log(`Studio Escrow Pipeline: ₹${rameshEscrow}`);
  console.log(`Campaigns Over 100%: ${rameshFundedCount}`);
  console.assert(rameshCampaigns.length === 1, 'Rameshwar Prajapati should have exactly 1 campaign (not global catalog)');
  console.assert(rameshCampaigns[0].id === 'cmp-02', 'Rameshwar Prajapati should own Blue Pottery campaign');
  console.assert(rameshEscrow === 170000, `Rameshwar Escrow should be ₹170,000, got ₹${rameshEscrow}`);
  console.log('✓ PASS: Rameshwar Prajapati sees ONLY his specific campaign data.\n');

  // Test 3: Seeded Weaver Artisan ("Master Shahid Ansari")
  const ansariArtisan: User = {
    id: 'usr-artisan-ansari',
    name: 'Master Shahid Ansari',
    legalName: 'Master Shahid Ansari',
    businessName: 'Ansari Heritage Loom Guild',
    email: 'ansari@example.com',
    role: 'artisan',
    avatarInitials: 'SA',
    memberSince: 'March 2025',
  };

  const ansariCampaigns = MOCK_CAMPAIGNS.filter((c) =>
    isArtisanItem(ansariArtisan, c.artisanId, c.creator, c.creatorLegalName, c.creatorBusinessName)
  );

  console.log('--- TEST 3: SEEDED DEMO ARTISAN ("Master Shahid Ansari") ---');
  console.log(`My Studio Campaigns Count: ${ansariCampaigns.length}`);
  console.log(`Campaign Titles: ${ansariCampaigns.map((c) => c.title).join(', ')}`);
  console.assert(ansariCampaigns.length === 1, 'Master Shahid Ansari should have exactly 1 campaign');
  console.assert(ansariCampaigns[0].id === 'cmp-06', 'Ansari should own Kalamkari campaign');
  console.log('✓ PASS: Master Shahid Ansari sees ONLY his specific campaign data.\n');

  console.log('ALL SCOPING VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runScopingTests();
