/**
 * Indian Rupee (INR) Currency and Number Formatter
 * Formats numbers into Indian numbering system (e.g., ₹1,50,000, ₹2,00,000, ₹499)
 */

export const formatINR = (amount: number | string | undefined | null, showDecimals = false): string => {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);

  return `₹${formatted}`;
};

export const formatIndianNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n);
};
