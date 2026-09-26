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
  return cleaned.length > 40 ? cleaned.slice(0, 40) : cleaned;
}

// Generate simple script translations for all Indic languages
function generateIndic(text: string, lang: string): string {
  if (lang === 'en') return text;

  // Dictionary mappings for common craftify domain words
  const dictHi: Record<string, string> = {
    'Craftify': 'क्राफ़्टिफ़ाई',
    'Marketplace': 'बाज़ार',
    'Crowdfunding': 'क्राउडफंडिंग',
    'Escrow': 'एस्क्रो',
    'Artisan': 'कारीगर',
    'Patron': 'संरक्षक',
    'Backer': 'समर्थक',
    'Campaign': 'अभियान',
    'Product': 'उत्पाद',
    'Store': 'स्टोर',
    'Shop': 'दुकान',
    'Cart': 'कार्ट',
    'Order': 'ऑर्डर',
    'Checkout': 'चेकआउट',
    'Search': 'खोजें',
    'Submit': 'जमा करें',
    'Cancel': 'रद्द करें',
    'Save': 'सहेजें',
    'Delete': 'हटाएं',
    'Remove': 'हटाएं',
    'Filter': 'फ़िल्टर',
    'View': 'देखें',
    'Details': 'विवरण',
    'Success': 'सफलता',
    'Error': 'त्रुटि',
    'Warning': 'चेतावनी',
  };

  const dictBn: Record<string, string> = {
    'Craftify': 'ক্রাফটিফাই',
    'Marketplace': 'মার্কেটপ্লেস',
    'Crowdfunding': 'ক্রাউডফান্ডিং',
    'Escrow': 'এসক্রো',
    'Artisan': 'কারুশিল্পী',
    'Patron': 'পৃষ্ঠপোষক',
    'Backer': 'সমর্থক',
    'Campaign': 'অভিযান',
    'Product': 'পণ্য',
    'Store': 'স্টোর',
    'Shop': 'দোকান',
    'Cart': 'কার্ট',
    'Order': 'অর্ডার',
    'Checkout': 'চেকআউট',
    'Search': 'অনুসন্ধান',
    'Submit': 'জমা দিন',
    'Cancel': 'বাতিল',
    'Save': 'সংরক্ষণ',
    'Delete': 'মুছুন',
    'Remove': 'সরান',
    'Filter': 'ফিল্টার',
    'View': 'দেখুন',
    'Details': 'বিস্তারিত',
  };

  const dictTa: Record<string, string> = {
    'Craftify': 'கிராஃப்டிஃபை',
    'Marketplace': 'சந்தை',
    'Crowdfunding': 'கூட்டு நிதி',
    'Escrow': 'எஸ்க்ரோ',
    'Artisan': 'கைவினைஞர்',
    'Patron': 'ஆதரவாளர்',
    'Backer': 'ஆதரவாளர்',
    'Campaign': 'பிரச்சாரம்',
    'Product': 'தயாரிப்பு',
    'Store': 'கடை',
    'Shop': 'கடை',
    'Cart': 'வண்டி',
    'Order': 'ஆர்டர்',
    'Checkout': 'வெளியேறு',
    'Search': 'தேடு',
    'Submit': 'சமர்ப்பி',
    'Cancel': 'ரத்து',
    'Save': 'சேமி',
    'Delete': 'நீக்கு',
    'Remove': 'அகற்று',
    'Filter': 'வடிகட்டி',
    'View': 'பார்',
    'Details': 'விவரங்கள்',
  };

  const dictTe: Record<string, string> = {
    'Craftify': 'క్రాఫ్టిఫై',
    'Marketplace': 'మార్కెట్ ప్లేస్',
    'Crowdfunding': 'క్రౌడ్‌ఫండింగ్',
    'Escrow': 'ఎస్క్రో',
    'Artisan': 'హస్తకళాకారుడు',
    'Patron': 'పోషకుడు',
    'Backer': 'మద్దతుదారు',
    'Campaign': 'ప్రచారం',
    'Product': 'ఉత్పత్తి',
    'Store': 'స్టోర్',
    'Shop': 'షాప్',
    'Cart': 'కార్ట్',
    'Order': 'ఆర్డర్',
    'Checkout': 'చెకౌట్',
    'Search': 'శోధించండి',
    'Submit': 'సమర్పించండి',
    'Cancel': 'రద్దు చేయి',
    'Save': 'సేవ్ చేయి',
    'Delete': 'తొలగించు',
    'Remove': 'తొలగించు',
    'Filter': 'ఫిల్టర్',
    'View': 'చూడండి',
    'Details': 'వివరాలు',
  };

  const dictMr: Record<string, string> = {
    'Craftify': 'क्राफ्टिफाय',
    'Marketplace': 'बाजारपेठ',
    'Crowdfunding': 'क्राउडफंडिंग',
    'Escrow': 'एस्क्रॉ',
    'Artisan': 'कारागीर',
    'Patron': 'पालक',
    'Backer': 'समर्थक',
    'Campaign': 'मोहीम',
    'Product': 'उत्पादन',
    'Store': 'स्टोअर',
    'Shop': 'दुकान',
    'Cart': 'कार्ट',
    'Order': 'ऑर्डर',
    'Checkout': 'चेकआउट',
    'Search': 'शोधा',
    'Submit': 'सादर करा',
    'Cancel': 'रद्द करा',
    'Save': 'जतन करा',
    'Delete': 'हटवा',
    'Remove': 'काढून टाका',
    'Filter': 'फिल्टर',
    'View': 'पहा',
    'Details': 'तपशील',
  };

  const dictKn: Record<string, string> = {
    'Craftify': 'ಕ್ರಾಫ್ಟಿಫೈ',
    'Marketplace': 'ಮಾರುಕಟ್ಟೆ',
    'Crowdfunding': 'ಕ್ರೌಡ್‌ಫಂಡಿಂಗ್',
    'Escrow': 'ಎಸ್ಕ್ರೋ',
    'Artisan': 'ಕುಶಲಕರ್ಮಿ',
    'Patron': 'ಪೋಷಕ',
    'Backer': 'ಬೆಂಬಲಿಗ',
    'Campaign': 'ಪ್ರಚಾರ',
    'Product': 'ಉತ್ಪನ್ನ',
    'Store': 'ಅಂಗಡಿ',
    'Shop': 'ಅಂಗಡಿ',
    'Cart': 'ಕಾರ್ಟ್',
    'Order': 'ಆರ್ಡರ್',
    'Checkout': 'ಚೆಕ್‌ಔಟ್',
    'Search': 'ಹುಡುಕಿ',
    'Submit': 'ಸಲ್ಲಿಸಿ',
    'Cancel': 'ರದ್ದುಗೊಳಿಸಿ',
    'Save': 'ಉಳಿಸಿ',
    'Delete': 'ಅಳಿಸಿ',
    'Remove': 'ತೆಗೆದುಹಾಕಿ',
    'Filter': 'ಫಿಲ್ಟರ್',
    'View': 'ವೀಕ್ಷಿಸಿ',
    'Details': 'ವಿವರಗಳು',
  };

  const dictGu: Record<string, string> = {
    'Craftify': 'ક્રાફ્ટિફાઇ',
    'Marketplace': 'બજાર',
    'Crowdfunding': 'ક્રાઉડફંડિંગ',
    'Escrow': 'એસ્ક્રો',
    'Artisan': 'કારીગર',
    'Patron': 'આશ્રયદાતા',
    'Backer': 'ટેકેદાર',
    'Campaign': 'ઝુંબેશ',
    'Product': 'ઉત્પાદન',
    'Store': 'સ્ટોર',
    'Shop': 'દુકાન',
    'Cart': 'કાર્ટ',
    'Order': 'ઓર્ડર',
    'Checkout': 'ચેકઆઉટ',
    'Search': 'શોધો',
    'Submit': 'સબમિટ કરો',
    'Cancel': 'રદ કરો',
    'Save': 'સાચવો',
    'Delete': 'હટાવો',
    'Remove': 'દૂર કરો',
    'Filter': 'ફિલ્ટર',
    'View': 'જુઓ',
    'Details': 'વિગતો',
  };

  let map: Record<string, string> = {};
  if (lang === 'hi') map = dictHi;
  else if (lang === 'bn') map = dictBn;
  else if (lang === 'ta') map = dictTa;
  else if (lang === 'te') map = dictTe;
  else if (lang === 'mr') map = dictMr;
  else if (lang === 'kn') map = dictKn;
  else if (lang === 'gu') map = dictGu;

  let translated = text;
  Object.entries(map).forEach(([en, target]) => {
    translated = translated.replace(new RegExp(`\\b${en}\\b`, 'gi'), target);
  });

  return translated;
}

console.log('Auto fix scanner setup ready.');
