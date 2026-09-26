import fs from 'fs';

let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

// Ensure import statement is added at top
if (!content.includes("from '../mockData/imageAssets'")) {
  content = `import { CAMPAIGN_IMAGES, PRODUCT_IMAGES } from '../mockData/imageAssets';\n` + content;
}

// Replace campaign image assignments
for (let i = 1; i <= 9; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const id = `cmp-${numStr}`;
  // Replace direct hardcoded unsplash URL string for campaign imageUrl
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?imageUrl:\\s*)['"][^'"]+['"]`, 'g');
  content = content.replace(regex, `$1CAMPAIGN_IMAGES['${id}']`);
}

// Replace product image assignments
for (let i = 1; i <= 18; i++) {
  const numStr = i < 10 ? `0${i}` : `${i}`;
  const id = `prd-${numStr}`;
  
  // Replace imageUrl
  const imgRegex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?imageUrl:\\s*)['"][^'"]+['"]`, 'g');
  content = content.replace(imgRegex, `$1PRODUCT_IMAGES['${id}']`);
}

fs.writeFileSync('src/data/mockData.ts', content, 'utf8');
console.log('Successfully updated src/data/mockData.ts with CAMPAIGN_IMAGES and PRODUCT_IMAGES!');
