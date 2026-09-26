import fs from 'fs';
import path from 'path';

// 1. Fix App.tsx
const appPath = path.resolve('src/App.tsx');
let appContent = fs.readFileSync(appPath, 'utf-8');
appContent = appContent.replace(
  `function CraftifyApp() {\n  const { t } = useLanguage();\n  const {\n    language,\n    t,`,
  `function CraftifyApp() {\n  const {\n    language,\n    t,`
);
fs.writeFileSync(appPath, appContent, 'utf-8');
console.log('Fixed App.tsx duplicate t declaration.');

// 2. Fix SmartTextarea.tsx and SmartInput.tsx
['src/components/common/SmartTextarea.tsx', 'src/components/common/SmartInput.tsx'].forEach((relPath) => {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    let code = fs.readFileSync(fullPath, 'utf-8');
    code = code.replace(
      /const\s+\{\s*language,\s*setLanguage\s*\}\s*=\s*useLanguage\(\);/g,
      'const { language, setLanguage, t } = useLanguage();'
    );
    fs.writeFileSync(fullPath, code, 'utf-8');
    console.log(`Updated ${relPath} to destructure t.`);
  }
});

// 3. Deduplicate keys in src/i18n/translations.ts
const translationsPath = path.resolve('src/i18n/translations.ts');
let transContent = fs.readFileSync(translationsPath, 'utf-8');

// Parse keys in interface Translations to deduplicate interface properties if needed
const LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu'];

LANGUAGES.forEach((lang) => {
  const startMarker = `  ${lang}: {`;
  const startIdx = transContent.indexOf(startMarker);
  if (startIdx === -1) return;

  // Find closing block for this language object
  let endIdx = -1;
  let braceCount = 0;
  let inLang = false;

  for (let i = startIdx; i < transContent.length; i++) {
    if (transContent[i] === '{') {
      braceCount++;
      inLang = true;
    } else if (transContent[i] === '}') {
      braceCount--;
      if (inLang && braceCount === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx !== -1) {
    const blockContent = transContent.slice(startIdx + startMarker.length, endIdx);
    const lines = blockContent.split('\n');
    const seenKeys = new Set<string>();
    const uniqueLines: string[] = [];

    lines.forEach((line) => {
      const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
      if (match) {
        const key = match[1];
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueLines.push(line);
        }
      } else {
        uniqueLines.push(line);
      }
    });

    const newBlockContent = uniqueLines.join('\n');
    transContent =
      transContent.slice(0, startIdx + startMarker.length) +
      newBlockContent +
      transContent.slice(endIdx);
  }
});

fs.writeFileSync(translationsPath, transContent, 'utf-8');
console.log('Deduplicated key entries in src/i18n/translations.ts!');
