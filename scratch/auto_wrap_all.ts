import fs from 'fs';
import path from 'path';

function toCamelCase(str: string): string {
  let cleaned = str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');

  if (!cleaned) return 'key_' + Math.floor(Math.random() * 10000);
  if (/^[0-9]/.test(cleaned)) cleaned = 'key_' + cleaned;
  return cleaned.length > 35 ? cleaned.slice(0, 35) : cleaned;
}

const UI_PROPS = ['placeholder', 'title', 'alt', 'aria-label', 'label'];

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // 1. Ensure useLanguage import
  if (!content.includes('useLanguage')) {
    const relDepth = filePath.split(path.sep).length - path.resolve('src/components').split(path.sep).length;
    let importPath = '../context/LanguageContext';
    if (relDepth === 1) importPath = '../context/LanguageContext';
    else if (relDepth === 2) importPath = '../../context/LanguageContext';
    else if (filePath.includes('App.tsx')) importPath = './context/LanguageContext';

    content = `import { useLanguage } from '${importPath}';\n` + content;
  }

  // 2. Ensure const { t } = useLanguage(); inside component
  if (!content.includes('const { t') && !content.includes('const {t')) {
    // Insert after component declaration
    content = content.replace(/(export const \w+:[^=]+=\s*\([^)]*\)\s*=>\s*\{)/, '$1\n  const { t } = useLanguage();');
  }

  // 3. Replace simple JSX Text >Text<
  // Match >  English Text  < where Text is non-empty, contains letters, doesn't start with {
  const jsxTextRegex = />\s*([a-zA-Z][a-zA-Z0-9\s.,!?:;'\-()/&%+•–—✦→✓*]+?)\s*</g;
  content = content.replace(jsxTextRegex, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('{') || trimmed.endsWith('}') || trimmed.length < 2) return match;
    // Exclude if it looks like variable or code
    if (/^[0-[#]/.test(trimmed) || trimmed.includes('${') || trimmed === '•' || trimmed === '→' || trimmed === '✦') return match;

    const key = toCamelCase(trimmed);
    return `>{t('${key}', '${trimmed}')}<`;
  });

  // 4. Replace string attributes
  UI_PROPS.forEach((prop) => {
    const attrRegex = new RegExp(`${prop}="([a-zA-Z][a-zA-Z0-9\\s.,!?:;'\x22\\-()/&%+•–—✦→✓*]+?)"`, 'g');
    content = content.replace(attrRegex, (match, text) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('{') || trimmed.length < 2) return match;
      const key = toCamelCase(trimmed);
      return `${prop}={t('${key}', '${trimmed}')}`;
    });
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

const allFiles = fs.readdirSync('src/components').map(f => path.join('src/components', f)).filter(f => f.endsWith('.tsx'));
let changedCount = 0;
allFiles.forEach(f => {
  if (processFile(f)) changedCount++;
});

console.log(`Auto wrapped text in ${changedCount} component files.`);
