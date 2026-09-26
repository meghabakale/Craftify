import https from 'https';

const candidateUrls = [
  // Campaigns (9)
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', // cmp-01 (Chanderi Weaving)
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80', // cmp-02 (Blue Pottery)
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', // cmp-03 (Bamboo & Cane)
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80', // cmp-04 (Madhubani Painting)
  'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80', // cmp-05 (Rogan Painting)
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', // cmp-06 (Bronze & Brass)
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // cmp-07 (Wood Carving)
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80', // cmp-08 (Leather Footwear)
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', // cmp-09 (Pashmina Spinning)

  // Products (18)
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', // prd-01 (Chanderi Ivory Saree)
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80', // prd-02 (Blue Pottery Vase)
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80', // prd-03 (Bamboo Lamp)
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', // prd-04 (Brass Kuthu Vilakku)
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80', // prd-05 (Teakwood Jali Panel)
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', // prd-06 (Indigo Dabu Saree)
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80', // prd-07 (Pashmina Shawl)
  'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80', // prd-08 (Madhubani Canvas)
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', // prd-09 (Kolhapuri Sandals)
  'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', // prd-10 (Banarasi Crimson Saree)
  'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80', // prd-11 (Terracotta Kulhad Set)
  'https://images.unsplash.com/photo-1558679908-541bcf1249ff?auto=format&fit=crop&w=800&q=80', // prd-12 (Wooden Toy Set)
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', // prd-13 (Brass Temple Bell)
  'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', // prd-14 (Zardozi Cushion)
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', // prd-15 (Jute Tote Bag)
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', // prd-16 (Temple Jewellery)
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80', // prd-17 (Walnut Spice Box)
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', // prd-18 (Kalamkari Silk Dupatta)
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
  });
}

async function run() {
  console.log(`Checking ${candidateUrls.length} candidate URLs...`);
  const unique = new Set(candidateUrls);
  console.log(`Unique URLs count: ${unique.size}`);
  if (unique.size !== candidateUrls.length) {
    console.error('DUPLICATES IN CANDIDATE LIST!');
  }
  const results = await Promise.all(candidateUrls.map(checkUrl));
  let failed = 0;
  results.forEach((r, idx) => {
    if (r.status !== 200) {
      console.log(`FAIL [${idx}]: ${r.status} -> ${r.url}`);
      failed++;
    } else {
      console.log(`OK   [${idx}]: ${r.status} -> ${r.url.substring(0, 50)}...`);
    }
  });
  console.log(`\nSummary: ${results.length - failed}/${results.length} succeeded.`);
}

run();
