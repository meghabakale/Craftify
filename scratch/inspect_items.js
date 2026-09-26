import { MOCK_CAMPAIGNS, MOCK_PRODUCTS } from '../src/data/mockData.ts';

console.log('=== CAMPAIGNS (9 items) ===');
MOCK_CAMPAIGNS.forEach((c, i) => {
  console.log(`${i + 1}. ID: ${c.id} | Slug: ${c.slug || c.id} | Title: ${c.title}`);
});

console.log('\n=== PRODUCTS (18 items) ===');
MOCK_PRODUCTS.forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id} | Slug: ${p.slug || p.id} | Title: ${p.title || p.name}`);
});
