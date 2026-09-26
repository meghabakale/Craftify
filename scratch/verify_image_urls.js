import https from 'https';

const CAMPAIGN_IMAGES = {
  'cmp-01': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'cmp-02': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'cmp-03': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'cmp-04': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'cmp-05': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'cmp-06': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'cmp-07': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'cmp-08': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  'cmp-09': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
};

const PRODUCT_IMAGES = {
  'prd-01': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'prd-02': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
  'prd-03': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
  'prd-04': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'prd-05': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
  'prd-06': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  'prd-07': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
  'prd-08': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  'prd-09': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
  'prd-10': 'https://images.unsplash.com/photo-1610030469668-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'prd-11': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
  'prd-12': 'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80',
  'prd-13': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  'prd-14': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
  'prd-15': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'prd-16': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  'prd-17': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  'prd-18': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
};

const allUrls = [...Object.values(CAMPAIGN_IMAGES), ...Object.values(PRODUCT_IMAGES)];
const uniqueUrls = new Set(allUrls);

console.log(`Total URLs: ${allUrls.length}`);
console.log(`Unique URLs: ${uniqueUrls.size}`);
if (allUrls.length !== uniqueUrls.size) {
  console.error('DUPLICATES DETECTED!');
  const counts = {};
  allUrls.forEach((u) => {
    counts[u] = (counts[u] || 0) + 1;
  });
  Object.entries(counts).forEach(([u, count]) => {
    if (count > 1) console.log(`Duplicate URL (${count}x): ${u}`);
  });
} else {
  console.log('NO DUPLICATE URLS FOUND! Perfect uniqueness across all 27 items.');
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
  });
}

async function run() {
  console.log('\nTesting URL resolution...');
  const results = await Promise.all(allUrls.map(checkUrl));
  let failures = 0;
  results.forEach((r) => {
    if (r.status !== 200 && r.status !== 302 && r.status !== 301) {
      console.log(`FAILED (${r.status}): ${r.url}`);
      failures++;
    }
  });
  if (failures === 0) {
    console.log('ALL 27 URLs RESOLVED SUCCESSFULLY (Status 200/302)!');
  } else {
    console.log(`${failures} URLs failed to resolve.`);
  }
}

run();
