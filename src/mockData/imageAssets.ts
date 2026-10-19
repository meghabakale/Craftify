/**
 * Explicit, curated image mappings for campaigns and products.
 * Product images feature authentic photographic links from Pexels, Unsplash,
 * and high-resolution local artisan craft photography.
 */

// Clean neutral fallback helper if ever needed
export const createCraftPlaceholder = (craftName: string, region: string): string => {
  const safeName = craftName.replace(/&/g, '&amp;');
  const safeRegion = region.replace(/&/g, '&amp;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
    <rect width="800" height="600" fill="#F8FAFC"/>
    <rect x="40" y="40" width="720" height="520" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="60" y="60" width="680" height="480" rx="12" fill="#FBFDFF"/>
    <circle cx="400" cy="220" r="48" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
    <path d="M400 196v48M376 220h48" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <text x="400" y="320" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#0F172A" text-anchor="middle">${safeName}</text>
    <text x="400" y="360" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#64748B" text-anchor="middle">${safeRegion}</text>
    <rect x="290" y="398" width="220" height="32" rx="16" fill="#EFF6FF" stroke="#DBEAFE" stroke-width="1"/>
    <text x="400" y="419" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#2563EB" text-anchor="middle">Authentic GI Heritage Craft</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const CAMPAIGN_IMAGES: Record<string, string> = {
  // Campaign 01: Revive Chanderi Pit-Loom Weaving
  'cmp-01': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'chanderi-handloom-revival': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'revive-chanderi-pit-loom-weaving': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',

  // Campaign 02: Jaipur Blue Pottery Studio Expansion
  'cmp-02': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'blue-pottery-studio-expansion': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'jaipur-blue-pottery-studio-expansion': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',

  // Campaign 03: Sustainable Assam Bhaluka Bamboo & Cane
  'cmp-03': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'sustainable-assam-bamboo': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'bhaluka-bamboo-workshop': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',

  // Campaign 04: Madhubani Folk Painting Collective
  'cmp-04': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'madhubani-folk-painting-collective': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'madhubani-painting-collective': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',

  // Campaign 05: Kutch Rogan Fabric Painting Preservation
  'cmp-05': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'kutch-rogan-painting': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'rogan-art-preservation': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',

  // Campaign 06: Swamimalai Bronze & Brass Lost-Wax Casting
  'cmp-06': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'swamimalai-bronze-workshop': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'bronze-brass-casting': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',

  // Campaign 07: Saharanpur Sheesham Wood Carving
  'cmp-07': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'saharanpur-sheesham-wood': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'wood-carving-seasoning-unit': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',

  // Campaign 08: Kolhapuri Vegetable-Tanned Leather Footwear
  'cmp-08': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  'kolhapuri-leather-footwear': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',
  'leather-footwear-guild': 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80',

  // Campaign 09: Kashmir Pashmina Hand-Spinning
  'cmp-09': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'kashmir-pashmina-spinning': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'pashmina-loom-preservation': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',

  // Campaign 10: Pochampally Ikat Handloom Preservation
  'cmp-10': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'pochampally-ikat-handloom': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',

  // Campaign 11: Aranmula Sacred Bell-Metal Heritage Foundry
  'cmp-11': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'aranmula-mirror-foundry': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',

  // Campaign 12: Thanjavur 22k Gold Foil Sacred Art Guild
  'cmp-12': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',
  'thanjavur-gold-art': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',

  // Campaign 13: Bastar Dhokra Lost-Wax Bell Metal Foundry
  'cmp-13': '/images/products/dhokra-tribal-musician.jpg',
  'bastar-dhokra-foundry': '/images/products/dhokra-tribal-musician.jpg',

  // Campaign 14: Channapatna Eco-Turnery & Vegetable Lacquer Workshop
  'cmp-14': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
  'channapatna-toy-workshop': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',

  // Campaign 15: Varanasi Katan Silk Handloom Revival
  'cmp-15': '/images/products/banarasi-katan-silk-saree.jpg',
  'varanasi-silk-handloom': '/images/products/banarasi-katan-silk-saree.jpg',

  // Campaign 16: Patan Double-Ikat Heritage Loom Setup
  'cmp-16': 'https://images.pexels.com/photos/2933636/pexels-photo-2933636.jpeg?auto=compress&cs=tinysrgb&w=800',
  'patan-patola-loom-setup': 'https://images.pexels.com/photos/2933636/pexels-photo-2933636.jpeg?auto=compress&cs=tinysrgb&w=800',
};

/**
 * Product Image mapping with direct photographic links for all 40 products.
 * Curated from verified Pexels photographic IDs, high-resolution Unsplash craft photography,
 * and authentic local artisan assets.
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  // 1. Pashmina Shawl – Jammu & Kashmir – Srinagar
  'prd-01': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'pashmina-shawl': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',

  // 2. Papier-Mâché Keepsake Box – Jammu & Kashmir – Srinagar
  'prd-02': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'papier-mache-keepsake-box': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',

  // 3. Kullu Woollen Shawl – Himachal Pradesh – Kullu
  'prd-03': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
  'kullu-woollen-shawl': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',

  // 4. Kangra Miniature Painting – Himachal Pradesh – Kangra
  'prd-04': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'kangra-miniature-painting': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',

  // 5. Phulkari Dupatta – Punjab – Patiala
  'prd-05': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
  'phulkari-dupatta': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',

  // 6. Panipat Khes Cotton Throw – Haryana – Panipat
  'prd-06': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  'panipat-khes-cotton-throw': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',

  // 7. Aipan Art Wall Frame – Uttarakhand – Almora
  'prd-07': 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
  'aipan-art-wall-frame': 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',

  // 8. Banarasi Silk Saree – Uttar Pradesh – Varanasi
  'prd-08': '/images/products/banarasi-katan-silk-saree.jpg',
  'banarasi-silk-saree': '/images/products/banarasi-katan-silk-saree.jpg',

  // 9. Chikankari Kurta – Uttar Pradesh – Lucknow
  'prd-09': '/images/products/lucknow-chikankari-kurta.jpg',
  'chikankari-kurta': '/images/products/lucknow-chikankari-kurta.jpg',

  // 10. Blue Pottery Vase – Rajasthan – Jaipur
  'prd-10': '/images/products/jaipur-blue-pottery-tea-set.jpg',
  'blue-pottery-vase': '/images/products/jaipur-blue-pottery-tea-set.jpg',

  // 11. Sanganeri Block-Printed Bedsheet – Rajasthan – Sanganer, Jaipur
  'prd-11': '/images/products/bagru-cotton-tablecloth.jpg',
  'sanganeri-block-printed-bedsheet': '/images/products/bagru-cotton-tablecloth.jpg',

  // 12. Patan Patola Silk Scarf – Gujarat – Patan
  'prd-12': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'patan-patola-silk-scarf': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',

  // 13. Kutch Embroidered Wall Hanging – Gujarat – Bhuj, Kutch
  'prd-13': '/images/products/zardozi-cushion-cover.jpg',
  'kutch-embroidered-wall-hanging': '/images/products/zardozi-cushion-cover.jpg',

  // 14. Paithani Silk Saree – Maharashtra – Paithan
  'prd-14': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'paithani-silk-saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',

  // 15. Warli Painting on Cloth – Maharashtra – Palghar
  'prd-15': 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',
  'warli-painting-on-cloth': 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?auto=format&fit=crop&w=800&q=80',

  // 16. Channapatna Wooden Toy Set – Karnataka – Channapatna
  'prd-16': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
  'channapatna-wooden-toy-set': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',

  // 17. Bidriware Jewellery Box – Karnataka – Bidar
  'prd-17': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
  'bidriware-jewellery-box': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',

  // 18. Aranmula Metal Mirror – Kerala – Aranmula
  'prd-18': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'aranmula-metal-mirror': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',

  // 19. Kasavu Cotton Saree – Kerala – Kuthampully
  'prd-19': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'kasavu-cotton-saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',

  // 20. Kanchipuram Silk Saree – Tamil Nadu – Kanchipuram
  'prd-20': 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  'kanchipuram-silk-saree': 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',

  // 21. Thanjavur Painting – Tamil Nadu – Thanjavur
  'prd-21': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',
  'thanjavur-painting': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',

  // 22. Kondapalli Wooden Toys – Andhra Pradesh – Kondapalli
  'prd-22': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80',
  'kondapalli-wooden-toys': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80',

  // 23. Kalamkari Cotton Dupatta – Andhra Pradesh – Machilipatnam
  'prd-23': '/images/products/ajrakh-modal-silk-dupatta.jpg',
  'kalamkari-cotton-dupatta': '/images/products/ajrakh-modal-silk-dupatta.jpg',

  // 24. Pochampally Ikat Saree – Telangana – Bhoodan Pochampally
  'prd-24': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',
  'pochampally-ikat-saree': 'https://images.unsplash.com/photo-1606744888344-493238951221?auto=format&fit=crop&w=800&q=80',

  // 25. Pattachitra Scroll Painting – Odisha – Raghurajpur
  'prd-25': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'pattachitra-scroll-painting': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',

  // 26. Sambalpuri Ikat Saree – Odisha – Sambalpur
  'prd-26': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
  'sambalpuri-ikat-saree': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',

  // 27. Kantha Stitch Stole – West Bengal – Bolpur, Birbhum
  'prd-27': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
  'kantha-stitch-stole': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',

  // 28. Bishnupur Terracotta Horse – West Bengal – Bishnupur
  'prd-28': '/images/products/terracotta-chai-cups-matka.jpg',
  'bishnupur-terracotta-horse': '/images/products/terracotta-chai-cups-matka.jpg',

  // 29. Madhubani Painting – Bihar – Madhubani
  'prd-29': '/images/products/madhubani-tree-of-life.jpg',
  'madhubani-painting': '/images/products/madhubani-tree-of-life.jpg',

  // 30. Chanderi Silk Saree – Madhya Pradesh – Chanderi
  'prd-30': '/images/products/chanderi-silk-zari-saree.jpg',
  'chanderi-silk-saree': '/images/products/chanderi-silk-zari-saree.jpg',

  // 31. Gond Art Canvas – Madhya Pradesh – Dindori
  'prd-31': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
  'gond-art-canvas': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',

  // 32. Bastar Dhokra Brass Figurine – Chhattisgarh – Kondagaon
  'prd-32': '/images/products/dhokra-tribal-musician.jpg',
  'bastar-dhokra-brass-figurine': '/images/products/dhokra-tribal-musician.jpg',

  // 33. Muga Silk Mekhela Chador – Assam – Sualkuchi
  'prd-33': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  'muga-silk-mekhela-chador': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',

  // 34. Cane and Bamboo Japi Hat – Assam – Nalbari
  'prd-34': '/images/products/assam-bamboo-pendant-light.jpg',
  'cane-and-bamboo-japi-hat': '/images/products/assam-bamboo-pendant-light.jpg',

  // 35. Longpi Black Pottery Bowl – Manipur – Ukhrul
  'prd-35': 'https://images.unsplash.com/photo-1615865417491-9941019fbc00?auto=format&fit=crop&w=800&q=80',
  'longpi-black-pottery-bowl': 'https://images.unsplash.com/photo-1615865417491-9941019fbc00?auto=format&fit=crop&w=800&q=80',

  // 36. Naga Handwoven Shawl – Nagaland – Kohima
  'prd-36': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
  'naga-handwoven-shawl': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',

  // 37. Mizo Puanchei Wrap – Mizoram – Aizawl
  'prd-37': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'mizo-puanchei-wrap': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',

  // 38. Sikkimese Thangka Painting – Sikkim – Gangtok
  'prd-38': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',
  'sikkimese-thangka-painting': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80',

  // 39. Monpa Handmade Paper Journal – Arunachal Pradesh – Tawang
  'prd-39': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'monpa-handmade-paper-journal': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',

  // 40. Changthangi Pashmina Stole – Ladakh – Leh
  'prd-40': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'changthangi-pashmina-stole': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
};
