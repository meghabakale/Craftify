import fs from 'fs';

function extractItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n=== File: ${filePath} ===`);
  const lines = content.split('\n');
  let currentId = '';
  let currentTitle = '';
  let currentSlug = '';
  lines.forEach((line) => {
    const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
    const slugMatch = line.match(/slug:\s*['"]([^'"]+)['"]/);
    const titleMatch = line.match(/(title|name):\s*['"]([^'"]+)['"]/);
    if (idMatch) currentId = idMatch[1];
    if (slugMatch) currentSlug = slugMatch[1];
    if (titleMatch) currentTitle = titleMatch[2];
    if (idMatch || slugMatch || titleMatch) {
      if (currentId && currentTitle) {
        console.log(`ID: ${currentId} | Slug: ${currentSlug} | Title/Name: ${currentTitle}`);
        currentId = '';
        currentSlug = '';
        currentTitle = '';
      }
    }
  });
}

extractItems('src/mockData/campaigns.ts');
extractItems('src/mockData/products.ts');
