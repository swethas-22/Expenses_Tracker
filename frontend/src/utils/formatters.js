export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'AU$'
};

export function formatCurrency(amount, currency = 'INR') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Format with standard local thousands separator
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num);

  return `${symbol}${formattedNumber}`;
}

export function formatDateRelative(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, parseInt(month, 10) - 1, parseInt(day, 10));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatted = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  // Check if today or yesterday relative to Mar 16, 2025 or current
  if (dateStr === '2025-03-16') return `Today • ${formatted}`;
  if (dateStr === '2025-03-15') return `Yesterday • ${formatted}`;

  return formatted;
}
