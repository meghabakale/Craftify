import fs from 'fs';
import path from 'path';

function inspectDir(dirPath) {
  console.log(`\n=== Directory: ${dirPath} ===`);
  if (!fs.existsSync(dirPath)) {
    console.log('Directory does not exist');
    return;
  }
  const files = fs.readdirSync(dirPath);
  files.forEach(f => {
    const fullPath = path.join(dirPath, f);
    const stat = fs.statSync(fullPath);
    console.log(`- ${f} (${stat.size} bytes)`);
  });
}

inspectDir('src/data');
inspectDir('src/mockData');
