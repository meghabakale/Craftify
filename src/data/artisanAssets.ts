// High-Fidelity Exact Vector & Photographic Assets for Craftify
// Matching the reference design with:
// 1. Hero still life: Royal blue silk shawl draped with ornate handcrafted brass elephant & blue pottery
// 2. Category button capsules: Folded sarees stack, terracotta pot, maroon cushion, gold jhumkas, jute bag, wooden elephant, festive gift box
// 3. Deals for Good products: Kuthu vilakku lamp, royal blue banarasi saree, terracotta set, teak jali panel, hanging brass bells, navy gold cushion

export const HERO_BLUE_SHAWL_ELEPHANT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" width="1000" height="620">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF8F3"/>
      <stop offset="50%" stop-color="#F5EFE4"/>
      <stop offset="100%" stop-color="#EBE2D2"/>
    </linearGradient>

    <radialGradient id="sunGlow" cx="65%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#FFF8E7" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#F8EDD6" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#EFE3CA" stop-opacity="0"/>
    </radialGradient>

    <!-- Royal Blue Silk Gradients -->
    <linearGradient id="blueSilk1" x1="0%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#2A64D8"/>
      <stop offset="25%" stop-color="#1948B2"/>
      <stop offset="60%" stop-color="#0E2F82"/>
      <stop offset="85%" stop-color="#081E57"/>
      <stop offset="100%" stop-color="#041133"/>
    </linearGradient>

    <linearGradient id="blueSilkFold" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#3B7AEF"/>
      <stop offset="35%" stop-color="#1E52C6"/>
      <stop offset="70%" stop-color="#103896"/>
      <stop offset="100%" stop-color="#081C4F"/>
    </linearGradient>

    <!-- Golden Zari Embroidery Gradient -->
    <linearGradient id="goldZari" x1="0%" y1="0%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#FFE082"/>
      <stop offset="30%" stop-color="#FFD54F"/>
      <stop offset="60%" stop-color="#FFA000"/>
      <stop offset="85%" stop-color="#FFD54F"/>
      <stop offset="100%" stop-color="#FF8F00"/>
    </linearGradient>

    <!-- Handcrafted Antique Brass Elephant Gradients -->
    <linearGradient id="brassLight" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFF2C6"/>
      <stop offset="20%" stop-color="#ECC665"/>
      <stop offset="50%" stop-color="#D4A028"/>
      <stop offset="80%" stop-color="#A57211"/>
      <stop offset="100%" stop-color="#674304"/>
    </linearGradient>

    <linearGradient id="brassShadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C29221"/>
      <stop offset="60%" stop-color="#805307"/>
      <stop offset="100%" stop-color="#492F03"/>
    </linearGradient>

    <!-- Jaipur Blue Pottery Gradients -->
    <linearGradient id="potteryBlue" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#2979FF"/>
      <stop offset="30%" stop-color="#1565C0"/>
      <stop offset="75%" stop-color="#0D47A1"/>
      <stop offset="100%" stop-color="#05265E"/>
    </linearGradient>

    <!-- Shadows -->
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="15" dy="25" stdDeviation="18" flood-color="#402D15" flood-opacity="0.28"/>
    </filter>

    <filter id="fabricShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="8" dy="18" stdDeviation="14" flood-color="#07142E" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Table/Studio Background -->
  <rect width="1000" height="620" fill="url(#bgGrad)"/>
  <rect width="1000" height="620" fill="url(#sunGlow)"/>

  <!-- Wooden Table Plinth / Surface Line -->
  <path d="M0 510 C300 500 700 495 1000 510 L1000 620 L0 620 Z" fill="#DFCDB7" opacity="0.45"/>
  <path d="M0 508 C300 498 700 493 1000 508" stroke="#C9B39B" stroke-width="2" opacity="0.6"/>

  <!-- BACKGROUND: Traditional Indian Brass Diya / Oil Lamp (Soft Bokeh in background) -->
  <g opacity="0.65" transform="translate(490, 160)">
    <!-- Golden Diya Glow -->
    <circle cx="50" cy="50" r="85" fill="#FFE082" opacity="0.3" filter="blur(20px)"/>
    <!-- Diya Base & Pedestal -->
    <path d="M30 180 C30 150 40 130 45 100 L55 100 C60 130 70 150 70 180 Z" fill="url(#brassShadow)"/>
    <ellipse cx="50" cy="180" rx="35" ry="10" fill="url(#brassLight)"/>
    <ellipse cx="50" cy="100" rx="22" ry="7" fill="url(#brassLight)"/>
    <!-- Diya Bowl -->
    <path d="M25 98 Q50 120 75 98 Q50 90 25 98 Z" fill="url(#brassLight)"/>
    <!-- Flame -->
    <path d="M50 85 C46 70 42 60 50 45 C58 60 54 70 50 85 Z" fill="#FFA000"/>
    <path d="M50 80 C48 70 45 62 50 52 C55 62 52 70 50 80 Z" fill="#FFF9C4"/>
  </g>

  <!-- MAIN ITEM 1: Royal Blue Silk Shawl Draped Gracefully Across Background & Foreground -->
  <g filter="url(#fabricShadow)">
    <!-- Back Deep Swathe of Blue Silk -->
    <path d="M80 620 C180 430 220 280 340 180 C440 100 610 60 780 110 C860 135 910 220 950 380 C980 500 950 580 920 620 Z" fill="url(#blueSilk1)"/>

    <!-- Silk Wave Crest 1 (Main Cascade) -->
    <path d="M220 620 C240 480 310 320 450 240 C570 170 720 160 840 230 C890 260 920 340 920 460 C920 540 880 600 850 620 Z" fill="url(#blueSilkFold)"/>

    <!-- Silk Deep Fold Crease Highlights and Shadows -->
    <path d="M320 420 C420 340 540 310 680 330 C760 340 820 380 870 450 C800 480 710 470 630 460 C510 445 400 470 320 540 Z" fill="#0C2566" opacity="0.8"/>
    <path d="M380 310 C480 250 590 235 710 260 C790 280 840 320 880 390 C810 370 730 350 640 345 C530 340 430 370 360 430 Z" fill="#2E69E8" opacity="0.6"/>

    <!-- Rich Golden Zari Border (Ornate Indian Kadhwa Jaal Trim along draped edge) -->
    <path d="M160 620 C220 490 290 350 430 250 C540 175 680 160 810 210 C870 235 905 295 915 380 L895 385 C885 305 855 250 800 225 C675 180 545 192 440 265 C305 360 238 495 180 620 Z" fill="url(#goldZari)"/>
    
    <!-- Fine Gold Thread Embroidery Detail Dots and Motifs -->
    <path d="M430 260 Q450 250 470 265 Q450 280 430 260 Z" fill="#FFF8E1"/>
    <path d="M510 210 Q530 200 550 215 Q530 230 510 210 Z" fill="#FFF8E1"/>
    <path d="M600 185 Q620 175 640 190 Q620 205 600 185 Z" fill="#FFF8E1"/>
    <path d="M690 180 Q710 170 730 185 Q710 200 690 180 Z" fill="#FFF8E1"/>
    <path d="M780 205 Q800 195 820 210 Q800 225 780 205 Z" fill="#FFF8E1"/>
    <path d="M850 250 Q865 240 880 255 Q865 268 850 250 Z" fill="#FFF8E1"/>
  </g>

  <!-- MAIN ITEM 2: Jaipur Hand-Painted Cobalt Blue Pottery Vase with Foliage (Right Side) -->
  <g transform="translate(680, 180)" filter="url(#softShadow)">
    <!-- Green Botanical Leaves emerging from Vase -->
    <path d="M85 80 C80 20 120 -30 150 -60 C140 -20 130 30 95 80 Z" fill="#2E7D32"/>
    <path d="M80 80 C60 10 30 -20 0 -50 C20 -20 45 25 75 80 Z" fill="#388E3C"/>
    <path d="M90 75 C120 40 160 10 190 -10 C165 20 130 50 95 85 Z" fill="#4CAF50"/>
    <!-- Leaf veins -->
    <path d="M90 75 Q135 15 150 -55" stroke="#A5D6A7" stroke-width="2" fill="none"/>
    <path d="M80 80 Q40 15 5 -45" stroke="#A5D6A7" stroke-width="2" fill="none"/>

    <!-- Blue Pottery Ceramic Vase Body -->
    <ellipse cx="85" cy="80" rx="42" ry="12" fill="#0D47A1"/>
    <path d="M43 80 C43 140 0 180 0 250 C0 310 35 340 85 340 C135 340 170 310 170 250 C170 180 127 140 127 80 Z" fill="url(#potteryBlue)"/>
    <ellipse cx="85" cy="335" rx="55" ry="10" fill="#082A6B"/>

    <!-- Hand-Painted White Arabesque Floral Patterns (Traditional Jaipur Pottery Style) -->
    <circle cx="85" cy="240" r="32" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="6,4"/>
    <circle cx="85" cy="240" r="16" fill="#FFFFFF" opacity="0.9"/>
    <!-- Floral Petals around Medallion -->
    <path d="M85 190 C78 205 92 205 85 190 Z" fill="#FFFFFF"/>
    <path d="M85 290 C78 275 92 275 85 290 Z" fill="#FFFFFF"/>
    <path d="M35 240 C50 233 50 247 35 240 Z" fill="#FFFFFF"/>
    <path d="M135 240 C120 233 120 247 135 240 Z" fill="#FFFFFF"/>
    <!-- Ornate Vines on Shoulder -->
    <path d="M30 160 Q85 190 140 160" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M20 210 Q85 245 150 210" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.8"/>
    <!-- Gloss Sheen Reflection -->
    <path d="M35 150 C25 200 25 270 45 310 C35 270 35 200 45 150 Z" fill="#FFFFFF" opacity="0.3"/>
  </g>

  <!-- MAIN ITEM 3: Handcrafted Solid Antique Brass Indian Elephant Figurine (Center Foreground) -->
  <g transform="translate(390, 240)" filter="url(#softShadow)">
    <!-- Elephant Cast Drop Shadow on Table -->
    <ellipse cx="140" cy="295" rx="140" ry="24" fill="#261A07" opacity="0.45"/>

    <!-- Elephant Back Legs (Shadow side) -->
    <rect x="70" y="200" width="34" height="90" rx="12" fill="url(#brassShadow)"/>
    <rect x="180" y="200" width="34" height="90" rx="12" fill="url(#brassShadow)"/>

    <!-- Elephant Main Massive Body -->
    <path d="M60 210 C45 160 70 90 140 85 C210 80 250 110 270 150 C285 180 270 230 240 245 C200 255 100 255 60 210 Z" fill="url(#brassLight)"/>

    <!-- Elephant Tail with Bell / Hair Brush -->
    <path d="M55 160 C40 180 38 210 42 240" stroke="url(#brassShadow)" stroke-width="6" stroke-linecap="round" fill="none"/>
    <ellipse cx="43" cy="245" rx="6" ry="10" fill="url(#brassShadow)"/>

    <!-- Front Near Legs (Bright Golden Highlight) -->
    <rect x="95" y="190" width="38" height="105" rx="14" fill="url(#brassLight)"/>
    <ellipse cx="114" cy="295" rx="19" ry="7" fill="url(#brassShadow)"/>
    <!-- Toes / Nails Detail in Pure Gold -->
    <circle cx="104" cy="295" r="3" fill="#FFF2C6"/>
    <circle cx="114" cy="296" r="3.5" fill="#FFF2C6"/>
    <circle cx="124" cy="295" r="3" fill="#FFF2C6"/>

    <rect x="205" y="185" width="38" height="110" rx="14" fill="url(#brassLight)"/>
    <ellipse cx="224" cy="295" rx="19" ry="7" fill="url(#brassShadow)"/>
    <circle cx="214" cy="295" r="3" fill="#FFF2C6"/>
    <circle cx="224" cy="296" r="3.5" fill="#FFF2C6"/>
    <circle cx="234" cy="295" r="3" fill="#FFF2C6"/>

    <!-- Elephant Head, Forehead & Beautiful Curved Trunk Raised Upwards (Auspicious Pose) -->
    <path d="M230 160 C240 120 280 105 310 130 C330 150 335 180 320 205 C310 220 280 230 250 205 Z" fill="url(#brassLight)"/>

    <!-- Raised Trunk curling gracefully upwards in greeting -->
    <path d="M295 180 C320 190 350 210 360 180 C370 145 345 100 375 75 C390 65 405 85 390 105 C370 130 380 170 355 215 C335 245 295 230 275 200 Z" fill="url(#brassLight)"/>
    <!-- Trunk Ridges / Creases -->
    <path d="M315 185 Q325 180 335 190" stroke="#9A6908" stroke-width="2.5" fill="none"/>
    <path d="M335 160 Q345 155 355 165" stroke="#9A6908" stroke-width="2.5" fill="none"/>
    <path d="M350 135 Q360 130 370 140" stroke="#9A6908" stroke-width="2.5" fill="none"/>

    <!-- Polished Ivory/Brass Tusk -->
    <path d="M295 195 C330 205 365 195 385 165 C365 185 330 190 295 195 Z" fill="#FFFDE7" stroke="#ECC665" stroke-width="1.5"/>

    <!-- Large Majestic Flapped Ear with Carved Floral Filigree -->
    <path d="M235 130 C205 130 190 165 200 205 C210 230 240 230 255 205 C265 185 260 140 235 130 Z" fill="url(#brassShadow)"/>
    <path d="M232 140 C215 140 205 165 212 195 C220 215 240 215 248 195 C255 180 250 145 232 140 Z" fill="url(#brassLight)"/>
    <!-- Ear carvings -->
    <path d="M225 155 Q230 175 225 190" stroke="#805307" stroke-width="2" fill="none"/>

    <!-- Elephant Eye and Forehead Plate (Matha-Patti) -->
    <circle cx="280" cy="150" r="4.5" fill="#2E1B02"/>
    <circle cx="281" cy="149" r="1.5" fill="#FFFFFF"/>
    <!-- Forehead Girth / Temple Crown Jewel -->
    <path d="M260 125 Q290 115 315 135" stroke="#FFD54F" stroke-width="5" fill="none"/>
    <circle cx="290" cy="122" r="6" fill="#C62828"/>
    <circle cx="290" cy="122" r="3" fill="#FFF59D"/>

    <!-- ORNATE EMBOSSED SADDLE / HOWDAH BLANKET (Royal Jhool with intricate details) -->
    <path d="M100 130 C130 120 180 120 210 130 C220 160 215 190 210 215 C180 225 130 225 100 215 C95 190 90 160 100 130 Z" fill="#9C27B0" stroke="#FFD54F" stroke-width="3.5"/>
    <path d="M108 138 C135 130 175 130 202 138 C210 162 206 186 202 206 C175 214 135 214 108 206 C104 186 100 162 108 138 Z" fill="#6A1B9A"/>
    <!-- Central Royal Gold Medallion on Saddle -->
    <circle cx="155" cy="172" r="16" fill="url(#goldZari)" stroke="#FFF8E1" stroke-width="2"/>
    <circle cx="155" cy="172" r="8" fill="#D32F2F"/>
    <circle cx="155" cy="172" r="3.5" fill="#FFF8E1"/>
    <!-- Hanging Gold Fringe / Pearl Drops along Saddle hem -->
    <circle cx="112" cy="214" r="3" fill="#FFD54F"/>
    <circle cx="126" cy="216" r="3" fill="#FFD54F"/>
    <circle cx="140" cy="218" r="3.5" fill="#FFD54F"/>
    <circle cx="155" cy="219" r="4" fill="#FFD54F"/>
    <circle cx="170" cy="218" r="3.5" fill="#FFD54F"/>
    <circle cx="184" cy="216" r="3" fill="#FFD54F"/>
    <circle cx="198" cy="214" r="3" fill="#FFD54F"/>

    <!-- Antique Patina Relief and Shimmer Specks -->
    <circle cx="140" cy="100" r="2" fill="#FFFDE7" opacity="0.8"/>
    <circle cx="215" cy="160" r="2.5" fill="#FFFDE7" opacity="0.9"/>
    <circle cx="340" cy="175" r="2" fill="#FFFDE7" opacity="0.8"/>
    <circle cx="380" cy="85" r="2.5" fill="#FFFDE7" opacity="0.9"/>
  </g>

  <!-- FOREGROUND: Draped Silk Edge with Golden Floral Motifs spilling into lower frame -->
  <path d="M0 620 C120 540 260 510 420 530 C580 550 720 590 850 620 Z" fill="url(#blueSilk1)" opacity="0.85"/>
  <path d="M0 620 C120 540 260 510 420 530 L435 538 C275 520 135 550 0 620 Z" fill="url(#goldZari)"/>
</svg>
`)}`;

// 8 EXACT CATEGORY BUTTON ASSETS MATCHING USER SCREENSHOT
export const CATEGORY_ASSETS = {
  // 1. Handloom & Textiles: Stack of folded colorful sarees with royal blue silk on top
  handloomTextiles: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#F8F6F2"/>
    <g transform="translate(15, 20)">
      <!-- Saree 4 (Bottom - Deep Maroon/Ruby) -->
      <path d="M10 95 L120 95 L115 110 L5 110 Z" fill="#880E4F"/>
      <path d="M5 110 L115 110 L115 115 L5 115 Z" fill="#C2185B"/>
      <!-- Saree 3 (Emerald Green) -->
      <path d="M12 75 L122 75 L118 95 L8 95 Z" fill="#1B5E20"/>
      <path d="M8 95 L118 95 L118 98 L8 98 Z" fill="#4CAF50"/>
      <rect x="8" y="93" width="110" height="4" fill="#FFD54F"/>
      <!-- Saree 2 (Golden Ochre / Saffron) -->
      <path d="M15 55 L125 55 L120 75 L10 75 Z" fill="#E65100"/>
      <path d="M10 75 L120 75 L120 78 L10 78 Z" fill="#FFA726"/>
      <rect x="10" y="73" width="110" height="4" fill="#FFE082"/>
      <!-- Saree 1 (Top - Royal Blue Silk with Golden Zari Border - exactly as in reference) -->
      <path d="M20 20 L130 20 L122 55 L12 55 Z" fill="#1565C0"/>
      <path d="M12 55 L122 55 L120 62 L10 62 Z" fill="#0D47A1"/>
      <!-- Royal Gold Zari Border on top saree -->
      <path d="M20 20 L40 20 L32 55 L12 55 Z" fill="#FFC107"/>
      <path d="M22 25 L38 25 L32 50 L16 50 Z" fill="#FFA000"/>
      <!-- Gold Jaal floral specks -->
      <circle cx="60" cy="35" r="2.5" fill="#FFE082"/>
      <circle cx="85" cy="30" r="2.5" fill="#FFE082"/>
      <circle cx="105" cy="38" r="2.5" fill="#FFE082"/>
      <circle cx="75" cy="45" r="2" fill="#FFE082"/>
      <!-- Fold sheen highlight -->
      <path d="M12 55 L122 55" stroke="#FFFFFF" stroke-width="1.5" opacity="0.8"/>
    </g>
  </svg>
  `)}`,

  // 2. Pottery & Ceramics: Smooth terracotta clay water pot (matka) on clean background
  potteryCeramics: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FDFBF8"/>
    <defs>
      <radialGradient id="terracottaPotGrad" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#FF8A65"/>
        <stop offset="35%" stop-color="#E64A19"/>
        <stop offset="75%" stop-color="#BF360C"/>
        <stop offset="100%" stop-color="#5D1B05"/>
      </radialGradient>
      <linearGradient id="terracottaNeck" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#BF360C"/>
        <stop offset="40%" stop-color="#FF8A65"/>
        <stop offset="100%" stop-color="#5D1B05"/>
      </linearGradient>
    </defs>
    <!-- Pot Shadow -->
    <ellipse cx="80" cy="142" rx="42" ry="9" fill="#D7CCC8" opacity="0.6"/>
    <!-- Spherical Pot Body -->
    <circle cx="80" cy="92" r="48" fill="url(#terracottaPotGrad)"/>
    <!-- Pot Neck & Lip -->
    <path d="M60 48 C60 40 64 36 80 36 C96 36 100 40 100 48 Z" fill="url(#terracottaNeck)"/>
    <ellipse cx="80" cy="38" rx="20" ry="6" fill="#FFAB91"/>
    <ellipse cx="80" cy="38" rx="14" ry="4" fill="#4E1A07"/>
    <!-- Etched Folk Tribal Bands on Clay -->
    <path d="M42 85 Q80 100 118 85" stroke="#FFE0B2" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="3,2"/>
    <path d="M40 95 Q80 110 120 95" stroke="#FFE0B2" stroke-width="2.5" fill="none" opacity="0.7"/>
    <!-- Clay shine highlight -->
    <ellipse cx="64" cy="74" rx="10" ry="16" fill="#FFCCBC" opacity="0.45" transform="rotate(-25, 64, 74)"/>
  </svg>
  `)}`,

  // 3. Home Decor: Square maroon cushion with ornate golden zardozi embroidery
  homeDecor: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FAF8F5"/>
    <defs>
      <linearGradient id="cushionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#880E4F"/>
        <stop offset="50%" stop-color="#640A39"/>
        <stop offset="100%" stop-color="#3A031F"/>
      </linearGradient>
    </defs>
    <!-- Cushion Drop Shadow -->
    <rect x="24" y="24" width="112" height="112" rx="16" fill="#3E2723" opacity="0.18" transform="translate(4, 6)"/>
    <!-- Velvet Cushion Square Base with Plump Corners -->
    <rect x="24" y="24" width="112" height="112" rx="16" fill="url(#cushionGrad)"/>
    <!-- Gold Piping Border -->
    <rect x="28" y="28" width="104" height="104" rx="14" fill="none" stroke="#FFD54F" stroke-width="2" opacity="0.8"/>
    <!-- Inner Fine Gold Stitched Border -->
    <rect x="36" y="36" width="88" height="88" rx="10" fill="none" stroke="#FFCA28" stroke-width="1.5" stroke-dasharray="4,2"/>
    <!-- Central Zardozi Embroidered Floral Mandala -->
    <circle cx="80" cy="80" r="22" fill="none" stroke="#FFE082" stroke-width="2.5"/>
    <circle cx="80" cy="80" r="14" fill="#FFB300"/>
    <circle cx="80" cy="80" r="6" fill="#880E4F"/>
    <circle cx="80" cy="80" r="2.5" fill="#FFFDE7"/>
    <!-- 8 Radiating Mandala Petals -->
    <path d="M80 54 Q84 62 80 66 Q76 62 80 54 Z" fill="#FFE082"/>
    <path d="M80 106 Q84 98 80 94 Q76 98 80 106 Z" fill="#FFE082"/>
    <path d="M54 80 Q62 84 66 80 Q62 76 54 80 Z" fill="#FFE082"/>
    <path d="M106 80 Q98 84 94 80 Q98 76 106 80 Z" fill="#FFE082"/>
    <!-- 4 Corner Paisley Kalga Motifs in Gold -->
    <circle cx="46" cy="46" r="4" fill="#FFE082"/>
    <circle cx="114" cy="46" r="4" fill="#FFE082"/>
    <circle cx="46" cy="114" r="4" fill="#FFE082"/>
    <circle cx="114" cy="114" r="4" fill="#FFE082"/>
  </svg>
  `)}`,

  // 4. Jewellery: Pair of traditional Indian gold jhumka drop earrings with pearls
  jewellery: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FCFAF7"/>
    <defs>
      <linearGradient id="goldJhumkaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF9C4"/>
        <stop offset="30%" stop-color="#FFD54F"/>
        <stop offset="70%" stop-color="#FFB300"/>
        <stop offset="100%" stop-color="#FF8F00"/>
      </linearGradient>
    </defs>
    <!-- Left Jhumka Earring -->
    <g transform="translate(38, 26)">
      <!-- Ear Stud Floral Disc -->
      <circle cx="20" cy="16" r="11" fill="url(#goldJhumkaGrad)"/>
      <circle cx="20" cy="16" r="5" fill="#D81B60"/>
      <circle cx="20" cy="16" r="2" fill="#FFFDE7"/>
      <!-- Connecting Link -->
      <line x1="20" y1="27" x2="20" y2="38" stroke="#FFA000" stroke-width="3"/>
      <!-- Bell / Jhumki Dome -->
      <path d="M6 58 C6 38 34 38 34 58 Z" fill="url(#goldJhumkaGrad)"/>
      <ellipse cx="20" cy="58" rx="14" ry="4" fill="#FF8F00"/>
      <!-- Filigree Details on Dome -->
      <path d="M10 52 Q20 46 30 52" stroke="#FFF9C4" stroke-width="1.5" fill="none"/>
      <!-- Hanging Pearl Droplets -->
      <circle cx="8" cy="66" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="14" cy="68" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="20" cy="69" r="3" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="26" cy="68" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="32" cy="66" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
    </g>
    <!-- Right Jhumka Earring -->
    <g transform="translate(84, 26)">
      <!-- Ear Stud Floral Disc -->
      <circle cx="20" cy="16" r="11" fill="url(#goldJhumkaGrad)"/>
      <circle cx="20" cy="16" r="5" fill="#D81B60"/>
      <circle cx="20" cy="16" r="2" fill="#FFFDE7"/>
      <!-- Connecting Link -->
      <line x1="20" y1="27" x2="20" y2="38" stroke="#FFA000" stroke-width="3"/>
      <!-- Bell / Jhumki Dome -->
      <path d="M6 58 C6 38 34 38 34 58 Z" fill="url(#goldJhumkaGrad)"/>
      <ellipse cx="20" cy="58" rx="14" ry="4" fill="#FF8F00"/>
      <!-- Filigree Details on Dome -->
      <path d="M10 52 Q20 46 30 52" stroke="#FFF9C4" stroke-width="1.5" fill="none"/>
      <!-- Hanging Pearl Droplets -->
      <circle cx="8" cy="66" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="14" cy="68" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="20" cy="69" r="3" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="26" cy="68" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
      <circle cx="32" cy="66" r="2.5" fill="#FFFFFF" stroke="#FFA000" stroke-width="1"/>
    </g>
  </svg>
  `)}`,

  // 5. Bags & Accessories: Handwoven natural jute / straw tote bag with round handles
  bagsAccessories: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FAF7F2"/>
    <defs>
      <linearGradient id="juteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E0C39E"/>
        <stop offset="40%" stop-color="#C7A172"/>
        <stop offset="80%" stop-color="#A27D4C"/>
        <stop offset="100%" stop-color="#7B5B33"/>
      </linearGradient>
    </defs>
    <!-- Bag Drop Shadow -->
    <ellipse cx="80" cy="144" rx="46" ry="8" fill="#D7CCC8" opacity="0.6"/>
    <!-- Braided Handles -->
    <path d="M55 70 C55 35 105 35 105 70" stroke="#8D6E63" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M55 70 C55 37 105 37 105 70" stroke="#D7CCC8" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Trapezoid Woven Tote Bag Body -->
    <path d="M35 70 L125 70 L115 138 C115 142 110 144 105 144 L55 144 C50 144 45 142 45 138 Z" fill="url(#juteGrad)"/>
    <!-- Woven Texture Rows -->
    <path d="M36 82 L124 82" stroke="#8D6E63" stroke-width="2.5" stroke-dasharray="6,4"/>
    <path d="M38 96 L122 96" stroke="#8D6E63" stroke-width="2.5" stroke-dasharray="6,4"/>
    <path d="M40 110 L120 110" stroke="#8D6E63" stroke-width="2.5" stroke-dasharray="6,4"/>
    <path d="M42 124 L118 124" stroke="#8D6E63" stroke-width="2.5" stroke-dasharray="6,4"/>
    <!-- Top Hem Binding -->
    <path d="M32 70 L128 70" stroke="#5D4037" stroke-width="6" stroke-linecap="round"/>
  </svg>
  `)}`,

  // 6. Woodcraft: Hand-carved solid brown wood Indian elephant figurine
  woodcraft: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FDFBF9"/>
    <defs>
      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A16B47"/>
        <stop offset="35%" stop-color="#804E2D"/>
        <stop offset="70%" stop-color="#5C341B"/>
        <stop offset="100%" stop-color="#381D0B"/>
      </linearGradient>
    </defs>
    <!-- Drop Shadow -->
    <ellipse cx="80" cy="138" rx="48" ry="8" fill="#D7CCC8" opacity="0.65"/>
    <g transform="translate(18, 25)">
      <!-- Back Far Legs -->
      <rect x="22" y="70" width="16" height="38" rx="6" fill="#381D0B"/>
      <rect x="68" y="70" width="16" height="38" rx="6" fill="#381D0B"/>
      <!-- Main Elephant Wood Carved Body -->
      <path d="M18 72 C12 50 25 24 55 22 C82 20 98 32 105 48 C112 60 108 78 95 85 C80 90 40 90 18 72 Z" fill="url(#woodGrad)"/>
      <!-- Near Front Legs -->
      <rect x="32" y="65" width="18" height="46" rx="7" fill="url(#woodGrad)"/>
      <rect x="78" y="64" width="18" height="47" rx="7" fill="url(#woodGrad)"/>
      <!-- Head & Raised Curved Trunk -->
      <path d="M92 50 C96 35 110 30 120 38 C128 45 130 55 125 64 Z" fill="url(#woodGrad)"/>
      <path d="M115 54 C124 58 135 65 140 54 C144 42 135 26 145 18 C150 14 154 22 148 30 C140 40 144 55 132 72 C124 82 110 76 102 65 Z" fill="url(#woodGrad)"/>
      <!-- Carved Ivory White Tusk -->
      <path d="M114 62 C128 66 138 60 144 48 C136 56 124 58 114 62 Z" fill="#FFFDE7"/>
      <!-- Ear Flap with Carved Relief -->
      <path d="M92 40 C80 40 75 52 80 66 C85 74 95 72 100 64 C104 56 102 42 92 40 Z" fill="#381D0B"/>
      <path d="M90 44 C82 44 78 54 82 64 C86 70 94 68 98 62 Z" fill="url(#woodGrad)"/>
      <!-- Carved Wood Saddle Pattern -->
      <rect x="38" y="38" width="40" height="28" rx="4" fill="#381D0B"/>
      <rect x="42" y="42" width="32" height="20" rx="3" stroke="#D7CCC8" stroke-width="1.5" fill="none"/>
    </g>
  </svg>
  `)}`,

  // 7. Festive Picks: Festive gift box with vibrant red paper and bright gold ribbon
  festivePicks: `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="12" fill="#FAF8F5"/>
    <defs>
      <linearGradient id="redBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF5252"/>
        <stop offset="40%" stop-color="#E53935"/>
        <stop offset="85%" stop-color="#C62828"/>
        <stop offset="100%" stop-color="#8E0000"/>
      </linearGradient>
      <linearGradient id="goldRibbonGrad" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#FFF59D"/>
        <stop offset="35%" stop-color="#FFD54F"/>
        <stop offset="70%" stop-color="#FFA000"/>
        <stop offset="100%" stop-color="#FF8F00"/>
      </linearGradient>
    </defs>
    <!-- Drop Shadow -->
    <ellipse cx="80" cy="144" rx="45" ry="9" fill="#D7CCC8" opacity="0.6"/>
    <!-- Lower Box Base -->
    <rect x="35" y="66" width="90" height="72" rx="6" fill="url(#redBoxGrad)"/>
    <!-- Box Lid (Slightly wider) -->
    <rect x="30" y="52" width="100" height="20" rx="5" fill="url(#redBoxGrad)"/>
    <!-- Gold Ribbon (Vertical) -->
    <rect x="71" y="52" width="18" height="86" fill="url(#goldRibbonGrad)"/>
    <!-- Gold Ribbon (Horizontal on Base) -->
    <rect x="35" y="96" width="90" height="16" fill="url(#goldRibbonGrad)"/>
    <!-- Opulent Multi-Loop Gold Satin Bow on Top -->
    <!-- Left Loop -->
    <path d="M72 50 C48 30 45 15 62 25 C75 32 76 45 74 50 Z" fill="url(#goldRibbonGrad)"/>
    <!-- Right Loop -->
    <path d="M88 50 C112 30 115 15 98 25 C85 32 84 45 86 50 Z" fill="url(#goldRibbonGrad)"/>
    <!-- Center Knot -->
    <circle cx="80" cy="48" r="9" fill="#FFC107" stroke="#FF8F00" stroke-width="2"/>
    <!-- Trailing Ribbon Tails -->
    <path d="M74 54 C66 65 60 76 50 82" stroke="#FFA000" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M86 54 C94 65 100 76 110 82" stroke="#FFA000" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>
  `)}`,
};

// Authentic Indian handicraft product photography sourced from verified craft reference archives
export const EXACT_PRODUCT_IMAGES = {
  // 1. Kuthu Vilakku Handcrafted Brass Temple Lamp
  kuthuVilakku: '/images/products/kuthu-vilakku-brass-lamp.jpg',

  // 2. Pure Banarasi Katan Silk Zari Brocade Saree
  banarasiSaree: '/images/products/banarasi-katan-silk-saree.jpg',

  // 3. Handmade Terracotta Chai Cups & Water Matka Set
  terracottaSet: '/images/products/terracotta-chai-cups-matka.jpg',

  // 4. Saharanpur Teakwood Floral Carved Jali Wall Panel
  teakJaliPanel: '/images/products/saharanpur-teakwood-jali-panel.jpg',

  // 5. Hand-Cast Brass Hanging Temple Bells Chime
  hangingBrassBells: '/images/products/brass-hanging-temple-bells.jpg',

  // 6. Royal Navy & Gold Zari Hand-Embroidered Cushion Cover
  royalNavyCushion: '/images/products/zardozi-cushion-cover.jpg',

  // 7. Handcrafted Embroidered Leather Juttis / Mojaris
  leatherJuttis: '/images/products/kolhapuri-leather-sandals.jpg',

  // 8. Hand-Carved Walnut Wood Masala Spice Dabba / Keepsake Box
  spiceBox: '/images/products/saharanpur-teakwood-jali-panel.jpg',
};

export interface CategoryNavigationItem {
  id: string;
  nameKey: string;
  defaultName: string;
  imageUrl: string;
  isAllCategories?: boolean;
}

export const CATEGORIES_DATA: CategoryNavigationItem[] = [
  {
    id: 'cat-textiles',
    nameKey: 'textilesWeaving',
    defaultName: 'Handloom & Textiles',
    imageUrl: CATEGORY_ASSETS.handloomTextiles,
  },
  {
    id: 'cat-pottery',
    nameKey: 'potteryCeramics',
    defaultName: 'Pottery & Ceramics',
    imageUrl: CATEGORY_ASSETS.potteryCeramics,
  },
  {
    id: 'cat-decor',
    nameKey: 'homeDecor',
    defaultName: 'Home Decor',
    imageUrl: CATEGORY_ASSETS.homeDecor,
  },
  {
    id: 'cat-jewellery',
    nameKey: 'metalworkJewellery',
    defaultName: 'Jewellery',
    imageUrl: CATEGORY_ASSETS.jewellery,
  },
  {
    id: 'cat-bags',
    nameKey: 'bagsAccessories',
    defaultName: 'Bags & Accessories',
    imageUrl: CATEGORY_ASSETS.bagsAccessories,
  },
  {
    id: 'cat-woodcraft',
    nameKey: 'rosewoodSandalwood',
    defaultName: 'Woodcraft',
    imageUrl: CATEGORY_ASSETS.woodcraft,
  },
  {
    id: 'cat-festive',
    nameKey: 'festivePicks',
    defaultName: 'Festive Picks',
    imageUrl: CATEGORY_ASSETS.festivePicks,
  },
  {
    id: 'cat-all',
    nameKey: 'allCrafts',
    defaultName: 'View All Categories',
    imageUrl: '',
    isAllCategories: true,
  },
];

export interface PresetCraftImage {
  name: string;
  category: string;
  url: string;
}

export const PRESET_CRAFT_IMAGES: PresetCraftImage[] = [
  {
    name: 'Khurja Studio Ceramic Vase',
    category: 'Pottery & Ceramics',
    url: '/images/products/khurja-ceramic-vase.jpg',
  },
  {
    name: 'Handloom Pashmina Weave',
    category: 'Handloom Textiles',
    url: '/images/products/kashmir-pashmina-shawl.jpg',
  },
  {
    name: 'Bidriware Silver Inlay Box',
    category: 'Metal Craft & Bidri',
    url: '/images/products/bidriware-silver-inlay-box.jpg',
  },
  {
    name: 'Saharanpur Sheesham Carving',
    category: 'Woodcraft',
    url: '/images/products/saharanpur-teakwood-jali-panel.jpg',
  },
  {
    name: 'Jaipur Blue Glazed Heritage Urn',
    category: 'Pottery & Ceramics',
    url: '/images/products/jaipur-blue-pottery-plate.jpg',
  },
  {
    name: 'Kuthu Vilakku Brass Temple Lamp',
    category: 'Handmade Brass & Bronze',
    url: '/images/products/kuthu-vilakku-brass-lamp.jpg',
  },
];

