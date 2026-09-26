import https from 'https';
import { CAMPAIGN_IMAGES, PRODUCT_IMAGES } from '../src/mockData/imageAssets.ts';
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from '../src/data/mockData.ts';

console.log('=== STEP 1: CAMPAIGN IMAGES MAPPING ===');
const campaignEntries = [
  { id: 'cmp-01', name: 'Revive Chanderi Pit-Loom Weaving — New Looms & Natural Indigo Dye Setup', slug: 'chanderi-handloom-revival', url: CAMPAIGN_IMAGES['cmp-01'] },
  { id: 'cmp-02', name: 'Jaipur Blue Pottery Studio Expansion & Lead-Free Solar Kiln', slug: 'blue-pottery-studio-expansion', url: CAMPAIGN_IMAGES['cmp-02'] },
  { id: 'cmp-03', name: 'Sustainable Assam Bhaluka Bamboo & Cane Workshop Setup', slug: 'sustainable-assam-bamboo', url: CAMPAIGN_IMAGES['cmp-03'] },
  { id: 'cmp-04', name: 'Madhubani Folk Painting Collective — Natural Pigment & Raw Silk Guild', slug: 'madhubani-folk-painting-collective', url: CAMPAIGN_IMAGES['cmp-04'] },
  { id: 'cmp-05', name: 'Kutch Rogan Castor-Oil Fabric Painting Preservation Guild', slug: 'kutch-rogan-painting', url: CAMPAIGN_IMAGES['cmp-05'] },
  { id: 'cmp-06', name: 'Swamimalai Bronze & Brass Lost-Wax Casting Workshop Upgrade', slug: 'swamimalai-bronze-workshop', url: CAMPAIGN_IMAGES['cmp-06'] },
  { id: 'cmp-07', name: 'Saharanpur Sheesham Wood Carving Studio Solarization & Seasoning Unit', slug: 'saharanpur-sheesham-wood', url: CAMPAIGN_IMAGES['cmp-07'] },
  { id: 'cmp-08', name: 'Kolhapuri Vegetable-Tanned Leather Footwear Guild Expansion', slug: 'kolhapuri-leather-footwear', url: CAMPAIGN_IMAGES['cmp-08'] },
  { id: 'cmp-09', name: 'Kashmir Pashmina Hand-Spinning & Wooden Loom Preservation Project', slug: 'kashmir-pashmina-spinning', url: CAMPAIGN_IMAGES['cmp-09'] },
];

console.log(`Campaign count: ${campaignEntries.length}`);

console.log('\n=== STEP 2: PRODUCT IMAGES MAPPING ===');
const productEntries = [
  { id: 'prd-01', name: 'Handloom Chanderi Cotton-Silk Saree — Ivory & Gold Zari', slug: 'handloom-chanderi-cotton-silk-saree', url: PRODUCT_IMAGES['prd-01'] },
  { id: 'prd-02', name: 'Jaipur Blue Pottery Ceramic Floral Table Vase', slug: 'jaipur-blue-pottery-table-vase', url: PRODUCT_IMAGES['prd-02'] },
  { id: 'prd-03', name: 'Handwoven Bamboo Table Lamp with Cane Shade', slug: 'handwoven-bamboo-table-lamp', url: PRODUCT_IMAGES['prd-03'] },
  { id: 'prd-04', name: 'Hand-Cast Brass Kuthu Vilakku Temple Lamp (5-Wick)', slug: 'brass-kuthu-vilakku-temple-lamp', url: PRODUCT_IMAGES['prd-04'] },
  { id: 'prd-05', name: 'Saharanpur Hand-Carved Teakwood Jali Wall Panel', slug: 'saharanpur-teakwood-jali-panel', url: PRODUCT_IMAGES['prd-05'] },
  { id: 'prd-06', name: 'Hand Block-Printed Cotton Saree — Indigo Dabu Print', slug: 'block-print-cotton-saree-indigo', url: PRODUCT_IMAGES['prd-06'] },
  { id: 'prd-07', name: 'Authentic Kashmiri Hand-Embroidered Pashmina Shawl', slug: 'kashmiri-pashmina-shawl', url: PRODUCT_IMAGES['prd-07'] },
  { id: 'prd-08', name: 'Madhubani Tree of Life Hand-Painted Canvas Wall Art', slug: 'madhubani-tree-of-life-canvas', url: PRODUCT_IMAGES['prd-08'] },
  { id: 'prd-09', name: 'Traditional Kolhapuri Handcrafted Leather Sandals', slug: 'kolhapuri-leather-sandals', url: PRODUCT_IMAGES['prd-09'] },
  { id: 'prd-10', name: 'Pure Banarasi Katan Silk Brocade Saree — Royal Crimson', slug: 'banarasi-katan-silk-saree', url: PRODUCT_IMAGES['prd-10'] },
  { id: 'prd-11', name: 'Terracotta Handcrafted Clay Matka & Tea Kulhad Set', slug: 'terracotta-kulhad-tea-set', url: PRODUCT_IMAGES['prd-11'] },
  { id: 'prd-12', name: 'Kondapalli Hand-Painted Wooden Toy Set — Village Musicians', slug: 'kondapalli-wooden-toy-set', url: PRODUCT_IMAGES['prd-12'] },
  { id: 'prd-13', name: 'Traditional Antique Brass Temple Bell Wall Chime', slug: 'antique-brass-temple-bell', url: PRODUCT_IMAGES['prd-13'] },
  { id: 'prd-14', name: 'Hand-Embroidered Zardozi Velvet Cushion Cover — Navy & Gold', slug: 'zardozi-velvet-cushion-cover', url: PRODUCT_IMAGES['prd-14'] },
  { id: 'prd-15', name: 'Natural Jute & Cotton Hand-Braided Tote Bag', slug: 'natural-jute-cotton-tote-bag', url: PRODUCT_IMAGES['prd-15'] },
  { id: 'prd-16', name: 'Handcrafted Brass Temple Jewellery Set with Kemp Stones', slug: 'brass-temple-jewellery-set', url: PRODUCT_IMAGES['prd-16'] },
  { id: 'prd-17', name: 'Hand-Carved Walnut Wood Spice Box with Glass Inlay Lid', slug: 'walnut-wood-spice-box', url: PRODUCT_IMAGES['prd-17'] },
  { id: 'prd-18', name: 'Hand-Painted Kalamkari Silk Dupatta — Tree of Life', slug: 'kalamkari-silk-dupatta', url: PRODUCT_IMAGES['prd-18'] },
];

console.log(`Product count: ${productEntries.length}`);

console.log('\n=== STEP 3: DUPLICATE CHECK ===');
const all27Urls = [...campaignEntries.map(c => c.url), ...productEntries.map(p => p.url)];
const uniqueSet = new Set(all27Urls);

console.log(`Total URLs: ${all27Urls.length}`);
console.log(`Unique URLs: ${uniqueSet.size}`);
if (all27Urls.length === 27 && uniqueSet.size === 27) {
  console.log('SUCCESS: Exactly 27 unique URLs across all campaigns and products! Zero duplicates found.');
} else {
  console.error(`ERROR: Duplicates found! ${all27Urls.length} total vs ${uniqueSet.size} unique.`);
}

console.log('\n=== STEP 4: HTTP RESOLUTION TEST ===');
function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
  });
}

async function runTest() {
  const results = await Promise.all(all27Urls.map(checkUrl));
  let failed = 0;
  results.forEach((r, i) => {
    if (r.status !== 200) {
      console.error(`HTTP FAIL [${i + 1}]: ${r.status} -> ${r.url}`);
      failed++;
    }
  });
  if (failed === 0) {
    console.log('SUCCESS: All 27/27 Unsplash URLs load with HTTP 200 status!');
  } else {
    console.error(`FAILURE: ${failed} URLs failed to load.`);
  }
}

runTest();
