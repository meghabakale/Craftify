import { Campaign, Product, RewardTier, BackerRecord, CampaignUpdate, CampaignComment } from '../types';
import { CAMPAIGN_IMAGES, PRODUCT_IMAGES } from '../mockData/imageAssets';
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from '../data/mockData';

export function mapCraftToCategory(craft: string = ''): string {
  const c = craft.toLowerCase();
  if (
    c.includes('weav') ||
    c.includes('textile') ||
    c.includes('chanderi') ||
    c.includes('saree') ||
    c.includes('embroid') ||
    c.includes('chikan') ||
    c.includes('ajrakh') ||
    c.includes('print')
  ) {
    return 'Handloom & Textiles';
  }
  if (
    c.includes('potter') ||
    c.includes('clay') ||
    c.includes('ceramic') ||
    c.includes('terracotta') ||
    c.includes('blue pottery')
  ) {
    return 'Ceramics & Pottery';
  }
  if (c.includes('wood') || c.includes('carv') || c.includes('teak') || c.includes('jali')) {
    return 'Woodcraft & Carving';
  }
  if (c.includes('bamboo') || c.includes('cane')) {
    return 'Home & Living';
  }
  if (c.includes('brass') || c.includes('dhokra') || c.includes('metal') || c.includes('bell')) {
    return 'Metal & Dhokra';
  }
  if (c.includes('jewel') || c.includes('jhumka') || c.includes('choker') || c.includes('necklace') || c.includes('adorn')) {
    return 'Jewellery & Adornments';
  }
  if (c.includes('paint') || c.includes('madhubani') || c.includes('mithila') || c.includes('folk')) {
    return 'Paintings & Folk Art';
  }
  if (c.includes('leather') || c.includes('kolhapuri') || c.includes('mojari') || c.includes('chappal')) {
    return 'Leathercraft';
  }
  if (c.includes('bag') || c.includes('tote') || c.includes('jute')) {
    return 'Bags & Accessories';
  }
  return 'Home & Living';
}

export function transformBackendCampaign(item: any): Campaign {
  const rawId = String(item.id || '');
  const formattedCode = `CMP-${rawId.padStart(3, '0')}`;

  // Find matching mock campaign if exists to preserve curated data and images
  const mockMatch = MOCK_CAMPAIGNS.find((m) => {
    const mId = String(m.id).toLowerCase();
    const rId = rawId.toLowerCase();
    return (
      mId === rId ||
      mId === `cmp-${rId.padStart(2, '0')}` ||
      (m.code && String(m.code).toLowerCase() === formattedCode.toLowerCase()) ||
      (m.slug && item.slug && m.slug === item.slug)
    );
  });

  const campaignKey = mockMatch ? mockMatch.id : (rawId.startsWith('cmp-') ? rawId : `cmp-${rawId.padStart(2, '0')}`);
  const explicitImageUrl =
    CAMPAIGN_IMAGES[campaignKey] ||
    (item.slug ? CAMPAIGN_IMAGES[item.slug] : undefined) ||
    (mockMatch ? mockMatch.imageUrl : undefined);

  const imageUrl =
    explicitImageUrl ||
    (item.image && item.image.startsWith('http') ? item.image : (mockMatch ? mockMatch.imageUrl : CAMPAIGN_IMAGES['cmp-01']));

  const daysLeft = item.days_left !== undefined ? item.days_left : (mockMatch ? mockMatch.daysLeft : 30);
  const pledged = parseFloat(item.amount_raised) || (mockMatch ? mockMatch.pledgedAmount : 0);
  const goal = parseFloat(item.funding_goal) || (mockMatch ? mockMatch.goalAmount : 250000);

  let status: 'in_progress' | 'funded' | 'failed' = 'in_progress';
  if (item.status === 'funded' || pledged >= goal) {
    status = 'funded';
  } else if (item.status === 'failed' || daysLeft <= 0) {
    status = 'failed';
  }

  if (mockMatch) {
    return {
      ...mockMatch,
      pledgedAmount: pledged > 0 ? pledged : mockMatch.pledgedAmount,
      amountRaised: pledged > 0 ? pledged : mockMatch.pledgedAmount,
      backersCount: item.backers_count !== undefined ? item.backers_count : mockMatch.backersCount,
      daysLeft: Math.max(0, daysLeft),
      status,
      imageUrl: mockMatch.imageUrl || imageUrl,
      galleryImages: mockMatch.galleryImages || [mockMatch.imageUrl || imageUrl],
    };
  }

  const tiers: RewardTier[] = (item.reward_tiers || item.tiers || []).map((t: any, idx: number) => ({
    id: String(t.id || `tier-${idx + 1}`),
    title: t.title || `Heritage Patron Tier ${idx + 1}`,
    pledgeAmount: parseFloat(t.amount) || 1200,
    description: t.description || 'Direct patron pledge supporting master artisan guild workshop materials and fair living wages.',
    estimatedDelivery: t.estimated_delivery
      ? new Date(t.estimated_delivery).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Nov 2026',
    itemsIncluded: Array.isArray(t.items_included)
      ? t.items_included
      : typeof t.items_included === 'string'
      ? t.items_included.split(',').map((s: string) => s.trim())
      : [t.title || 'Handcrafted Artifact', 'Certificate of GI Authenticity'],
    backersCount: t.backers_count || 0,
    maxBackers: t.max_backers || undefined,
  }));

  if (tiers.length === 0) {
    tiers.push(
      {
        id: `tier-1-${item.id}`,
        title: 'Early Patron Supporter',
        pledgeAmount: Math.round(goal * 0.01) || 1000,
        description: 'Includes a signed thank-you note from the artisan cluster and digital workshop access.',
        estimatedDelivery: 'Nov 2026',
        itemsIncluded: ['Artisan Letter', 'Digital Workshop Archives'],
        backersCount: item.backers_count ? Math.floor(item.backers_count * 0.6) : 5,
      },
      {
        id: `tier-2-${item.id}`,
        title: 'Collector Masterpiece Tier',
        pledgeAmount: Math.round(goal * 0.035) || 3500,
        description: 'Receive an original museum-grade handcrafted piece with GI seal of provenance.',
        estimatedDelivery: 'Dec 2026',
        itemsIncluded: ['Certified Craft Piece', 'Handmade Packaging', 'Artisan Guild Document'],
        backersCount: item.backers_count ? Math.floor(item.backers_count * 0.4) : 2,
      }
    );
  }

  return {
    id: campaignKey,
    artisanId: item.artisan?.id ? String(item.artisan.id) : (item.artisan_id ? String(item.artisan_id) : undefined),
    title: item.title || 'Handcrafted Heritage Campaign',
    slug: item.slug || campaignKey,
    creator: item.artisan?.full_name || item.artisan?.username || 'Master Artisan',
    creatorBio: `National Heritage Awardee specializing in ${item.craft_type || 'traditional crafts'} from ${item.region_state || 'India'}.`,
    creatorLocation: item.region_state || 'India',
    artisanRegion: item.region_state || 'India',
    craftHeritage: item.craft_type || 'Traditional Indian Craft',
    category: mapCraftToCategory(item.craft_type),
    shortDescription:
      item.description ||
      `Revitalizing the endangered technique of ${item.craft_type || 'traditional craft'} in ${item.region_state || 'India'}. Backed by genuine GI heritage preservation.`,
    fullStory:
      item.description ||
      `This milestone initiative supports a cluster of traditional artisans in ${item.region_state || 'India'}. By funding this campaign, conscious patrons directly safeguard endangered generational looms, natural dyeing pots, and traditional tool forging. All funds are secured in transparent milestone escrow.`,
    goalAmount: goal,
    pledgedAmount: pledged,
    backersCount: item.backers_count || 0,
    daysLeft: Math.max(0, daysLeft),
    status,
    imageUrl,
    galleryImages: item.gallery_images && item.gallery_images.length > 0 ? item.gallery_images : [imageUrl],
    code: formattedCode,
    isApproved: item.is_approved !== false,
    rewardTiers: tiers,
    specs: [
      { label: 'Craft Discipline', value: item.craft_type || 'Handcrafted Heritage' },
      { label: 'Origin Cluster', value: item.region_state || 'India' },
      { label: 'Escrow Milestone', value: '4 Verified Phase Releases' },
      { label: 'Fair Living Wage', value: '100% Direct to Artisan Guild' },
    ],
    timeline: [
      { phase: 'Raw Material Sourcing', date: 'Phase 1', description: 'Ethical sourcing of organic cotton, bell metal, or unglazed clay.' },
      { phase: 'Cluster Production', date: 'Phase 2', description: 'Master artisans begin generational carving and weaving cycles.' },
      { phase: 'Quality Verification', date: 'Phase 3', description: 'Third-party GI certification and escrow inspection.' },
      { phase: 'Global Dispatch', date: 'Phase 4', description: 'Direct patron delivery with tamper-evident heritage sealing.' },
    ],
  };
}

export function transformBackendProduct(item: any): Product {
  const rawId = String(item.id || '');
  const formattedSku = `CF-JPR-${rawId.padStart(2, '0')}`;

  // Find matching mock product if exists to preserve curated data and images
  const mockMatch = MOCK_PRODUCTS.find((m) => {
    const mId = String(m.id).toLowerCase();
    const rId = rawId.toLowerCase();
    return (
      mId === rId ||
      mId === `prd-${rId.padStart(2, '0')}` ||
      (m.sku && String(m.sku).toLowerCase() === formattedSku.toLowerCase()) ||
      ((m as any).slug && item.slug && (m as any).slug === item.slug)
    );
  });

  const productKey = mockMatch ? mockMatch.id : (rawId.startsWith('prd-') ? rawId : `prd-${rawId.padStart(2, '0')}`);
  const explicitImageUrl =
    PRODUCT_IMAGES[productKey] ||
    (item.slug ? PRODUCT_IMAGES[item.slug] : undefined) ||
    (mockMatch ? mockMatch.imageUrl : undefined);

  const imageUrl =
    explicitImageUrl ||
    (item.image && item.image.startsWith('http') ? item.image : (mockMatch ? mockMatch.imageUrl : PRODUCT_IMAGES['prd-01']));

  const price = parseFloat(item.price) || (mockMatch ? mockMatch.price : 2400);
  const inStock = item.in_stock !== false && (item.stock_quantity === undefined || item.stock_quantity > 0);
  const stockCount = item.stock_quantity !== undefined ? item.stock_quantity : (mockMatch ? mockMatch.stockCount : 12);

  let badgeType: 'in_stock' | 'pre_order' | 'limited_stock' = 'in_stock';
  let badgeLabel = 'Ready to Ship';
  if (!inStock || stockCount === 0) {
    badgeType = 'pre_order';
    badgeLabel = 'Made to Order';
  } else if (stockCount <= 5) {
    badgeType = 'limited_stock';
    badgeLabel = `Only ${stockCount} Left`;
  }

  if (mockMatch) {
    return {
      ...mockMatch,
      price,
      rating: parseFloat(item.average_rating) || mockMatch.rating,
      reviewsCount: item.reviews_count || mockMatch.reviewsCount,
      inStock,
      stockCount,
      badgeLabel,
      badgeType,
      imageUrl: mockMatch.imageUrl || imageUrl,
      galleryImages: mockMatch.galleryImages || [mockMatch.imageUrl || imageUrl],
    };
  }

  return {
    id: productKey,
    artisanId: item.artisan?.id ? String(item.artisan.id) : (item.artisan_id ? String(item.artisan_id) : undefined),
    title: item.name || 'Handcrafted Artisan Creation',
    sku: formattedSku,
    creator: item.artisan?.full_name || item.artisan?.username || 'Master Artisan',
    creatorLocation: item.region_state || 'India',
    artisanRegion: item.region_state || 'India',
    craftHeritage: item.craft_heritage_note || item.category || 'Traditional Indian Craft',
    category: mapCraftToCategory(item.category || item.name),
    shortDescription:
      item.description ||
      `Authentic handcrafted ${item.name || 'item'} made with generational precision and 100% sustainable materials.`,
    longDescription:
      item.description ||
      `Each piece is individually handcrafted by skilled artisans using traditional ancestral tools. Slight variations in tone, weave, and texture celebrate the unique human touch of authentic handicraft.`,
    price,
    graduatedFromCampaignId: item.campaign ? `cmp-${String(item.campaign).padStart(2, '0')}` : 'cmp-01',
    originalPledgedAmount: Math.round(price * 45),
    isFundedOnCraftify: item.is_funded_on_platform !== false,
    isFundedOnLaunchMart: item.is_funded_on_platform !== false,
    rating: parseFloat(item.average_rating) || 4.9,
    reviewsCount: item.reviews_count || 12,
    inStock,
    stockCount,
    badgeLabel,
    badgeType,
    imageUrl,
    galleryImages: item.gallery_images && item.gallery_images.length > 0 ? item.gallery_images : [imageUrl],
    features: [
      '100% Handcrafted by Master Artisans',
      'Authentic Geographical Indication (GI) Verified',
      'Zero Synthetic Resins or Toxic Chemical Dyes',
      'Fair Price Guarantee with Direct Artisan Royalties',
    ],
    specs: [
      { label: 'Craft Tradition', value: item.category || 'Handcrafted Heritage' },
      { label: 'Artisan Origin', value: item.region_state || 'India' },
      { label: 'Materials', value: 'Natural, Eco-friendly, Generational Raw Stock' },
      { label: 'Care Instructions', value: 'Dry clean only or wipe gently with soft damp cotton cloth' },
    ],
  };
}

export function transformBackendPledge(item: any): import('../types').UserPledgeRecord {
  let status: 'authorized_pending' | 'captured' | 'cancelled' = 'authorized_pending';
  if (item.status === 'captured') status = 'captured';
  else if (item.status === 'cancelled' || item.status === 'released') status = 'cancelled';

  return {
    id: String(item.id),
    campaignId: String(item.campaign_id || item.campaign),
    campaignTitle: item.campaign_title || 'Craft Campaign',
    campaignCode: `CMP-${String(item.campaign_id || item.campaign).padStart(3, '0')}`,
    tierTitle: item.tier_title || 'Handcrafted Reward',
    amount: parseFloat(item.amount) || 1000,
    dateAuthorized: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recent',
    status,
    estimatedDelivery: item.estimated_delivery
      ? new Date(item.estimated_delivery).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Nov 2026',
  };
}

export function transformBackendOrder(item: any): import('../types').CustomerOrder {
  const items = (item.items || []).map((it: any, idx: number) => ({
    id: String(it.id || idx + 1),
    productId: it.product ? String(it.product.id) : undefined,
    title: it.product ? it.product.name : 'Handcrafted Masterpiece',
    price: parseFloat(it.price_at_purchase || it.product?.price || 1500),
    quantity: it.quantity || 1,
    imageUrl: it.product?.image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
    subtitle: it.product?.craft_heritage_note || it.product?.category || 'Artisan Direct',
    artisanName: it.product?.artisan?.full_name || it.product?.artisan?.username || 'Master Artisan',
    isFundedOnCraftify: it.product?.is_funded_on_platform || false,
    isFundedOnLaunchMart: it.product?.is_funded_on_platform || false,
  }));

  const subtotal = parseFloat(item.total_amount) || 0;
  const shipping = subtotal > 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.05);

  const trackingEvents: import('../types').OrderTrackingHistoryEvent[] = (item.status_history || []).map((h: any) => ({
    stage: h.status,
    label: h.status.replace(/_/g, ' ').toUpperCase(),
    timestamp: h.created_at
      ? new Date(h.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Updated',
    location: h.location || 'Hub',
    description: h.note || `Order status updated to ${h.status}`,
    completed: true,
  }));

  return {
    id: item.order_number || `CRF-2026-${String(item.id).padStart(5, '0')}`,
    orderDate: item.created_at
      ? new Date(item.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Recent',
    estimatedDeliveryRange: 'Arriving between 18–22 Sept',
    status: item.status || 'confirmed',
    carrierName: item.carrier_name || 'Blue Dart Express',
    trackingNumber: item.tracking_number || 'IN0098234561',
    items,
    subtotal,
    shipping,
    tax,
    total: item.total_amount ? parseFloat(item.total_amount) : subtotal + shipping + tax,
    shippingAddress: {
      fullName: item.shipping_name || 'Valued Patron',
      email: item.shipping_email || 'patron@craftify.in',
      street: item.shipping_address || '42, Heritage Enclave',
      city: item.shipping_city || 'Bengaluru',
      state: item.shipping_state || 'Karnataka',
      zip: item.shipping_zip || '560038',
      country: 'India',
      phone: item.shipping_phone || '+91 98765 43210',
    },
    paymentMethod: item.payment_method || 'Prepaid Razorpay / UPI',
    history: trackingEvents,
  };
}
