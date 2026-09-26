import fs from 'fs';
import path from 'path';

function searchImports(dir) {
  const fileImports = {};
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(/from\s+['"]([^'"]+)['"]/g);
        if (matches) {
          fileImports[fullPath] = matches;
        }
      }
    }
  }
  walk(dir);
  return fileImports;
}

const imports = searchImports('src');
console.log('=== DATA FILE IMPORTS IN SRC ===');
Object.entries(imports).forEach(([file, impList]) => {
  impList.forEach(imp => {
    if (imp.includes('data/') || imp.includes('mockData/') || imp.includes('artisanAssets')) {
      console.log(`${file} -> ${imp}`);
    }
  });
});
