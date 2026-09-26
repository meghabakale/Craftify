import fs from 'fs';
import path from 'path';

function searchFiles(dir, matchPattern) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...searchFiles(fullPath, matchPattern));
    } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (matchPattern.test(line)) {
          results.push({ file: fullPath, lineNum: index + 1, content: line.trim() });
        }
      });
    }
  }
  return results;
}

console.log('=== SEARCH: setCampaigns / setProducts ===');
const stateSets = searchFiles('src', /setCampaigns|setProducts/);
stateSets.forEach(r => console.log(`${r.file}:${r.lineNum} -> ${r.content}`));

console.log('\n=== SEARCH: fetch( / axios / api ===');
const fetches = searchFiles('src', /fetch\(|axios|\/api\//);
fetches.forEach(r => console.log(`${r.file}:${r.lineNum} -> ${r.content}`));

console.log('\n=== SEARCH: localStorage / sessionStorage ===');
const storage = searchFiles('src', /localStorage|sessionStorage/);
storage.forEach(r => console.log(`${r.file}:${r.lineNum} -> ${r.content}`));
