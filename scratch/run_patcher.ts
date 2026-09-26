import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const srcDir = path.resolve('src');
const translationsFilePath = path.resolve('src/i18n/translations.ts');

const IGNORED_ATTRIBUTES = new Set([
  'id', 'className', 'class', 'src', 'href', 'key', 'type', 'name', 'rel',
  'referrerPolicy', 'role', 'tabIndex', 'method', 'step', 'min', 'max',
  'autoComplete', 'htmlFor', 'value', 'color', 'size', 'variant', 'view',
  'tab', 'initialTab', 'status', 'outcome', 'code', 'category', 'sku',
  'target', 'width', 'height', 'fill', 'stroke', 'd', 'viewBox', 'align',
  'valign', 'colSpan', 'rowSpan', 'encType', 'accept', 'autoCapitalize',
  'autoCorrect', 'spellCheck', 'dir', 'lang', 'style'
]);

const UI_ATTRIBUTES = new Set([
  'placeholder', 'title', 'alt', 'aria-label', 'label', 'header', 'subtitle',
  'heading', 'tooltip', 'errorMessage', 'message', 'warning', 'prompt',
  'confirmText', 'cancelText', 'description', 'badgeText', 'buttonText',
  'toast', 'helperText', 'emptyText'
]);

const LANGUAGES = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu'] as const;

// Comprehensive dictionary for Indic translations across domain terms
const DICT_EN_TO_INDIC: Record<string, Record<typeof LANGUAGES[number], string>> = {
  'Account Status': {
    en: 'Account Status',
    hi: 'खाता स्थिति',
    bn: 'অ্যাাকাউন্ট স্থিতি',
    ta: 'கணக்கு நிலை',
    te: 'ఖాతా స్థితి',
    mr: 'खाते स्थिती',
    kn: 'ಖಾತೆ ಸ್ಥಿತಿ',
    gu: 'ખાતાની સ્થિતિ'
  },
  'Actions': {
    en: 'Actions',
    hi: 'कार्रवाई',
    bn: 'পদক্ষেপসমূহ',
    ta: 'செயல்கள்',
    te: 'చర్యలు',
    mr: 'कृती',
    kn: 'ಕ್ರಿಯೆಗಳು',
    gu: 'કાર્ડ કાયદા'
  },
  'Active': {
    en: 'Active',
    hi: 'सक्रिय',
    bn: 'সক্রিয়',
    ta: 'செயலில் உள்ள',
    te: 'యాక్టివ్',
    mr: 'सक्रिय',
    kn: 'ಸಕ್ರಿಯ',
    gu: 'સક્રિય'
  },
  'Suspended': {
    en: 'Suspended',
    hi: 'निलंबित',
    bn: 'স্থগিত',
    ta: 'இடைநீக்கம் செய்யப்பட்டது',
    te: 'సస్పెండ్ చేయబడింది',
    mr: 'निलंबित',
    kn: 'ಅಮಾನತುಗೊಳಿಸಲಾಗಿದೆ',
    gu: 'મોકૂફ'
  },
  'Registered': {
    en: 'Registered',
    hi: 'पंजीकृत',
    bn: 'নিবন্ধিত',
    ta: 'பதிவு செய்யப்பட்டது',
    te: 'నమోదైంది',
    mr: 'नोंदणीकृत',
    kn: 'ನೋಂದಾಯಿಸಲಾಗಿದೆ',
    gu: 'નોંધાયેલ'
  },
  'Role': {
    en: 'Role',
    hi: 'भूमिका',
    bn: 'ভূমিকা',
    ta: 'பங்கு',
    te: 'పాత్ర',
    mr: 'भूमिका',
    kn: 'ಪಾತ್ರ',
    gu: 'ભૂમિકા'
  },
  'User': {
    en: 'User',
    hi: 'उपयोगकर्ता',
    bn: 'ব্যবহারকারী',
    ta: 'பயனர்',
    te: 'యూజర్',
    mr: 'वापरकर्ता',
    kn: 'ಬಳಕೆದಾರ',
    gu: 'વપરાશકર્તા'
  },
  'Admins': {
    en: 'Admins',
    hi: 'व्यवस्थापक',
    bn: 'প্রশাসকগণ',
    ta: 'நிர்வாகிகள்',
    te: 'అడ్మిన్లు',
    mr: 'ॲडमिन्स',
    kn: 'ಅಡ್ಮಿನ್ಗಳು',
    gu: 'એડમિન'
  },
  'Approve Campaign': {
    en: 'Approve Campaign',
    hi: 'अभियान स्वीकृत करें',
    bn: 'অভিযান অনুমোদন করুন',
    ta: 'பிரச்சாரத்தை ஒப்புதல் செய்',
    te: 'ప్రచారాన్ని ఆమోదించండి',
    mr: 'मोहीम मंजूर करा',
    kn: 'ಪ್ರಚಾರವನ್ನು ಅನುಮೋದಿಸಿ',
    gu: 'ઝુંબેશ મંજૂર કરો'
  },
  'Preview': {
    en: 'Preview',
    hi: 'पूर्वावलोकन',
    bn: 'পূর্বরূপ',
    ta: 'முன்னோட்டம்',
    te: 'ముందస్తు వీక్షణం',
    mr: 'पूर्वावलोकन',
    kn: 'ಪೂರ್ವವೀಕ್ಷಣೆ',
    gu: 'પૂર્વાવલોકન'
  },
  'Admin Panel': {
    en: 'Admin Panel',
    hi: 'एडमिन पैनल',
    bn: 'এডমিন প্যানেল',
    ta: 'நிர்வாகக் குழு',
    te: 'అడ్మిన్ ప్యానెల్',
    mr: 'ॲडमिन पॅनेल',
    kn: 'ಅಡ್ಮಿನ್ ಪ್ಯಾನಲ್',
    gu: 'એડમિન પેનલ'
  },
  'Launch Campaign': {
    en: 'Launch Campaign',
    hi: 'अभियान शुरू करें',
    bn: 'অভিযান শুরু করুন',
    ta: 'பிரச்சாரத்தைத் தொடங்கு',
    te: 'ప్రచారాన్ని ప్రారంభించండి',
    mr: 'मोहीम सुरू करा',
    kn: 'ಪ್ರಚಾರ ಪ್ರಾರಂಭಿಸಿ',
    gu: 'ઝુંબેશ શરૂ કરો'
  },
  'Verified': {
    en: 'Verified',
    hi: 'सत्यापित',
    bn: 'যাচাইকৃত',
    ta: 'சரிபார்க்கப்பட்டது',
    te: 'నిరూపించబడింది',
    mr: 'सत्यापित',
    kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    gu: 'પ્રમાણિત'
  },
  'Cancel': {
    en: 'Cancel',
    hi: 'रद्द करें',
    bn: 'বাতিল করুন',
    ta: 'ரத்து செய்',
    te: 'రద్దు చేయి',
    mr: 'रद्द करा',
    kn: 'ರದ್ದುಗೊಳಿಸಿ',
    gu: 'રદ કરો'
  },
  'Save Address': {
    en: 'Save Address',
    hi: 'पता सहेजें',
    bn: 'ঠিকানা সংরক্ষণ করুন',
    ta: 'முகவரியைச் சேமி',
    te: 'చిరునామాను సేవ్ చేయండి',
    mr: 'पत्ता जतन करा',
    kn: 'ವಿಳಾಸವನ್ನು ಉಳಿಸಿ',
    gu: 'સરનામું સાચવો'
  },
  'Country': {
    en: 'Country',
    hi: 'देश',
    bn: 'দেশ',
    ta: 'நாடு',
    te: 'దేశం',
    mr: 'देश',
    kn: 'ದೇಶ',
    gu: 'દેશ'
  },
  'City': {
    en: 'City',
    hi: 'शहर',
    bn: 'শহর',
    ta: 'நகரம்',
    te: 'నగరం',
    mr: 'शहर',
    kn: 'ನಗರ',
    gu: 'શહેર'
  },
  'Street Address': {
    en: 'Street Address',
    hi: 'सड़क का पता',
    bn: 'রাস্তার ঠিকানা',
    ta: 'தெரு முகவரி',
    te: 'వీధి చిరునామా',
    mr: 'रस्त्याचा पत्ता',
    kn: 'ರಸ್ತೆ ವಿಳಾಸ',
    gu: 'શેરીનું સરનામું'
  },
  'Edit': {
    en: 'Edit',
    hi: 'संपादित करें',
    bn: 'সম্পাদনা করুন',
    ta: 'திருத்து',
    te: 'సవరించు',
    mr: 'संपादित करा',
    kn: 'ಸಂಪಾದಿಸಿ',
    gu: 'સંપાદિત કરો'
  },
  'Delivery Address': {
    en: 'Delivery Address',
    hi: 'डिलिवरी का पता',
    bn: 'ডেলিভারি ঠিকানা',
    ta: 'டெலிவரி முகவரி',
    te: 'డెలివరీ చిరునామా',
    mr: 'डिलिव्हरी पत्ता',
    kn: 'ವಿಲೇವಾರಿ ವಿಳಾಸ',
    gu: 'ડિલિવરી સરનામું'
  },
  'Add to Cart': {
    en: 'Add to Cart',
    hi: 'कार्ट में जोड़ें',
    bn: 'কার্টে যোগ করুন',
    ta: 'வண்டியில் சேர்',
    te: 'కార్ట్‌కు జోడించండి',
    mr: 'कार्टमध्ये जोडा',
    kn: 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',
    gu: 'કાર્ટમાં ઉમેરો'
  },
  'in stock': {
    en: 'in stock',
    hi: 'स्टॉक में उपलब्ध',
    bn: 'স্টকে আছে',
    ta: 'கையிருப்பில் உள்ளது',
    te: 'స్టాక్‌లో ఉంది',
    mr: 'स्टॉकमध्ये उपलब्ध',
    kn: 'ದಾಸ್ತಾನಿನಲ್ಲಿದೆ',
    gu: 'સ્ટોકમાં ઉપલબ્ધ'
  },
  'Explore Store': {
    en: 'Explore Store',
    hi: 'स्टोर देखें',
    bn: 'স্টোর অন্বেষণ করুন',
    ta: 'கடையை ஆராயுங்கள்',
    te: 'స్టోర్‌ను అన్వేషించండి',
    mr: 'स्टोअर एक्सप्लोर करा',
    kn: 'ಅಂಗಡಿಯನ್ನು ಪರಿಶೀಲಿಸಿ',
    gu: 'સ્ટોર જુઓ'
  },
  'My Wishlist': {
    en: 'My Wishlist',
    hi: 'मेरी इच्छासूची',
    bn: 'আমার পছন্দের তালিকা',
    ta: 'எனது விருப்பப் பட்டியல்',
    te: 'నా విష్‌లిస్ట్',
    mr: 'माझी इच्छासूची',
    kn: 'ನನ್ನ ಇಚ್ಛೆಯ ಪಟ್ಟಿ',
    gu: 'મારી પસંદગીઓ'
  },
  'Browse Shop': {
    en: 'Browse Shop',
    hi: 'दुकान देखें',
    bn: 'দোকান দেখুন',
    ta: 'கடையைப் பார்வையிடுக',
    te: 'షాప్ చూడండి',
    mr: 'दुकान पहा',
    kn: 'ಅಂಗಡಿಯನ್ನು ವೀಕ್ಷಿಸಿ',
    gu: 'દુકાન જુઓ'
  },
  'Discover Campaigns': {
    en: 'Discover Campaigns',
    hi: 'अभियान खोजें',
    bn: 'অভিযান খুঁজুন',
    ta: 'பிரச்சாரங்களைக் கண்டறியவும்',
    te: 'ప్రచారాలను కనుగొనండి',
    mr: 'मोहीम शोधा',
    kn: 'ಪ್ರಚಾರಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    gu: 'ઝુંબેશો શોધો'
  },
  'Authentication Required': {
    en: 'Authentication Required',
    hi: 'प्रमाणीकरण आवश्यक है',
    bn: 'অনুমোদন প্রয়োজন',
    ta: 'அடையாளச் சான்று தேவை',
    te: 'ప్రామాణీకరణ అవసరం',
    mr: 'प्रमाणीकरण आवश्यक',
    kn: 'ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ',
    gu: 'પ્રમાણીકરણ જરૂરી છે'
  },
  'Switch Account': {
    en: 'Switch Account',
    hi: 'खाता बदलें',
    bn: 'অ্যাাকাউন্ট পরিবর্তন করুন',
    ta: 'கணக்கை மாற்று',
    te: 'ఖాతాను మార్చండి',
    mr: 'खाते बदला',
    kn: 'ಖಾತೆ ಬದಲಾಯಿಸಿ',
    gu: 'ખાતું બદલો'
  },
  'Return Home': {
    en: 'Return Home',
    hi: 'मुख्य पृष्ठ पर वापस जाएं',
    bn: 'হোমে ফিরে যান',
    ta: 'முகப்பிற்குத் திரும்பு',
    te: 'హోమ్‌కు తిరిగి వెళ్ళండి',
    mr: 'मुख्य पृष्ठावर जा',
    kn: 'ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    gu: 'મુખ્ય પૃષ્ઠ પર પાછા ફરો'
  },
  'Return to Store': {
    en: 'Return to Store',
    hi: 'स्टोर पर वापस जाएं',
    bn: 'স্টোরে ফিরে যান',
    ta: 'கடைகளுக்குத் திரும்பு',
    te: 'స్టోర్‌కు తిరిగి వెళ్ళండి',
    mr: 'स्टोअरवर परत जा',
    kn: 'ಅಂಗಡಿಗೆ ಹಿಂತಿರುಗಿ',
    gu: 'સ્ટોર પર પાછા ફરો'
  },
  'Artisan Account Required': {
    en: 'Artisan Account Required',
    hi: 'कारीगर खाता आवश्यक है',
    bn: 'কারুশিল্পী অ্যাকাউন্ট প্রয়োজন',
    ta: 'கைவினைஞர் கணக்கு தேவை',
    te: 'హస్తకళాకారుల ఖాతా అవసరం',
    mr: 'कारागीर खाते आवश्यक',
    kn: 'ಕುಶಲಕರ್ಮಿ ಖಾತೆ ಅಗತ್ಯವಿದೆ',
    gu: 'કારીગર ખાતું જરૂરી છે'
  }
};

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

function getRelativeImportPath(fromFile: string, toFile: string): string {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.tsx?$/, '');
}

function generateIndicObject(enText: string): Record<typeof LANGUAGES[number], string> {
  if (DICT_EN_TO_INDIC[enText]) {
    return DICT_EN_TO_INDIC[enText];
  }
  // Standard default translations for Indic languages based on common words or fallback
  return {
    en: enText,
    hi: enText,
    bn: enText,
    ta: enText,
    te: enText,
    mr: enText,
    kn: enText,
    gu: enText,
  };
}

const accumulatedTranslations: Record<string, Record<typeof LANGUAGES[number], string>> = {};

function processFile(filePath: string): boolean {
  if (filePath.includes('LanguageContext.tsx') || filePath.includes('translations.ts')) return false;

  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  interface Replacement {
    start: number;
    end: number;
    newText: string;
    key: string;
    english: string;
  }

  const replacements: Replacement[] = [];

  function isInsideTranslationCall(node: ts.Node): boolean {
    let parent = node.parent;
    while (parent) {
      if (
        ts.isCallExpression(parent) &&
        (
          (ts.isIdentifier(parent.expression) && parent.expression.text === 't') ||
          (ts.isPropertyAccessExpression(parent.expression) && parent.expression.name.text === 't') ||
          (ts.isIdentifier(parent.expression) && parent.expression.text.startsWith('localize'))
        )
      ) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  function visit(node: ts.Node) {
    // 1. JsxText
    if (ts.isJsxText(node)) {
      const text = node.getText().trim();
      if (text && /[a-zA-Z]/.test(text) && !/^[0-9\s.,\/\\()\-+:#$&%*!]+$/.test(text)) {
        if (!text.startsWith('{') && !text.endsWith('}')) {
          const key = toCamelCase(text);
          replacements.push({
            start: node.getStart(),
            end: node.getEnd(),
            newText: `{t('${key}', '${text.replace(/'/g, "\\'")}')}`,
            key,
            english: text,
          });
        }
      }
    }

    // 2. JsxAttribute string literal
    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText();
      if (UI_ATTRIBUTES.has(attrName) || (!IGNORED_ATTRIBUTES.has(attrName) && UI_ATTRIBUTES.has(attrName))) {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          const text = node.initializer.text.trim();
          if (text && /[a-zA-Z]/.test(text) && !isInsideTranslationCall(node)) {
            const key = toCamelCase(text);
            replacements.push({
              start: node.initializer.getStart(),
              end: node.initializer.getEnd(),
              newText: `{t('${key}', '${text.replace(/'/g, "\\'")}')}`,
              key,
              english: text,
            });
          }
        }
      }
    }

    // 3. String literal in JSX expression UI context
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text.trim();
      if (text && /[a-zA-Z]/.test(text)) {
        let inJsx = false;
        let p: ts.Node | undefined = node.parent;
        while (p) {
          if (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxAttribute(p)) {
            inJsx = true;
            break;
          }
          p = p.parent;
        }

        if (inJsx && !isInsideTranslationCall(node)) {
          let isUIContext = false;
          let curr: ts.Node | undefined = node.parent;
          while (curr && curr !== p) {
            if (ts.isConditionalExpression(curr) || ts.isBinaryExpression(curr) || ts.isArrayLiteralExpression(curr)) {
              isUIContext = true;
              break;
            }
            if (ts.isCallExpression(curr)) {
              const fnName = curr.expression.getText();
              if (fnName.includes('showToast') || fnName.includes('alert') || fnName.includes('setError') || fnName.includes('setSuccess')) {
                isUIContext = true;
                break;
              }
            }
            curr = curr.parent;
          }

          if (isUIContext && text.length > 1 && (text.includes(' ') || /^[A-Z]/.test(text))) {
            const key = toCamelCase(text);
            replacements.push({
              start: node.getStart(),
              end: node.getEnd(),
              newText: `t('${key}', '${text.replace(/'/g, "\\'")}')`,
              key,
              english: text,
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (replacements.length === 0) return false;

  // Sort replacements backwards to preserve character indices
  replacements.sort((a, b) => b.start - a.start);

  // Filter overlapping replacements
  const filteredReplacements: Replacement[] = [];
  let lastStart = Infinity;
  for (const r of replacements) {
    if (r.end <= lastStart) {
      filteredReplacements.push(r);
      lastStart = r.start;
    }
  }

  filteredReplacements.forEach((r) => {
    content = content.slice(0, r.start) + r.newText + content.slice(r.end);
    accumulatedTranslations[r.key] = generateIndicObject(r.english);
  });

  // Ensure import { useLanguage } from '...';
  if (!content.includes('useLanguage')) {
    const langContextPath = path.resolve('src/context/LanguageContext.tsx');
    const relPath = getRelativeImportPath(filePath, langContextPath);
    const importStatement = `import { useLanguage } from '${relPath}';\n`;
    content = importStatement + content;
  }

  // Ensure const { t } = useLanguage(); inside component body if `t(` is used
  if (content.includes("t('") || content.includes('t("')) {
    // Check if component already declares `const { t }` or `const { ... t ... }`
    if (!/const\s+\{.*?\bt\b.*?\}\s*=\s*useLanguage\(\)/.test(content)) {
      // Find main functional component declaration
      content = content.replace(/(export\s+(default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|export\s+const\s+[A-Za-z0-9_]+\s*:\s*React\.FC<[^>]*>\s*=\s*\([^)]*\)\s*=>\s*\{|const\s+[A-Za-z0-9_]+\s*:\s*React\.FC<[^>]*>\s*=\s*\([^)]*\)\s*=>\s*\{|function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/, (match) => {
        return `${match}\n  const { t } = useLanguage();`;
      });
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

function getAllFiles(dir: string, ext = '.tsx'): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ext));
    } else if (filePath.endsWith(ext)) {
      results.push(filePath);
    }
  });
  return results;
}

const allTsxFiles = getAllFiles(srcDir, '.tsx');
let modifiedCount = 0;

allTsxFiles.forEach((file) => {
  if (processFile(file)) {
    modifiedCount++;
    console.log(`Updated file: ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`Finished patching ${modifiedCount} files.`);
console.log(`Accumulated ${Object.keys(accumulatedTranslations).length} translation keys.`);

// Append new keys to src/i18n/translations.ts across all 8 languages
if (Object.keys(accumulatedTranslations).length > 0) {
  let transContent = fs.readFileSync(translationsFilePath, 'utf-8');

  LANGUAGES.forEach((lang) => {
    const langBlockMarker = `${lang}: {`;
    const markerIdx = transContent.indexOf(langBlockMarker);
    if (markerIdx !== -1) {
      let keyLines = '\n';
      Object.entries(accumulatedTranslations).forEach(([key, values]) => {
        const val = (values[lang] || values.en || '').replace(/'/g, "\\'");
        keyLines += `    ${key}: '${val}',\n`;
      });
      const insertPos = markerIdx + langBlockMarker.length;
      transContent = transContent.slice(0, insertPos) + keyLines + transContent.slice(insertPos);
    }
  });

  fs.writeFileSync(translationsFilePath, transContent, 'utf-8');
  console.log('Updated src/i18n/translations.ts with all 8 language keys!');
}
