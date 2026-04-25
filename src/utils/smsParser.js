// SMS Parser - Detects Indian bank/UPI transaction SMS
export const parseSMS = (sms) => {
  const body = sms.body || '';
  const lower = body.toLowerCase();

  // Amount regex - matches INR, Rs, ₹
  const amountRegex = /(?:inr|rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
  const amountMatch = body.match(amountRegex);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(amount) || amount <= 0) return null;

  // Determine type
  const debitKeywords = ['debited', 'debit', 'spent', 'paid', 'payment', 'withdrawn', 'purchase', 'sent'];
  const creditKeywords = ['credited', 'credit', 'received', 'deposited', 'salary', 'refund', 'cashback', 'added'];

  let type = null;
  if (debitKeywords.some(k => lower.includes(k))) type = 'expense';
  else if (creditKeywords.some(k => lower.includes(k))) type = 'income';
  else return null;

  // Merchant detection
  const merchant = detectMerchant(body);
  const category = detectCategory(body, merchant);

  // UPI ID or account
  const upiMatch = body.match(/([a-zA-Z0-9._]+@[a-zA-Z]+)/);
  const upiId = upiMatch ? upiMatch[1] : null;

  return {
    id: `sms_${sms.date}_${amount}`,
    amount,
    type,
    category,
    merchant: merchant || upiId || 'Unknown',
    description: body.substring(0, 80),
    date: new Date(parseInt(sms.date)).toISOString(),
    source: 'sms',
    raw: body,
  };
};

const detectMerchant = (body) => {
  const merchants = [
    { name: 'Swiggy', keywords: ['swiggy'] },
    { name: 'Zomato', keywords: ['zomato'] },
    { name: 'Amazon', keywords: ['amazon'] },
    { name: 'Flipkart', keywords: ['flipkart'] },
    { name: 'Uber', keywords: ['uber'] },
    { name: 'Ola', keywords: ['olacabs', 'ola cab'] },
    { name: 'Netflix', keywords: ['netflix'] },
    { name: 'Spotify', keywords: ['spotify'] },
    { name: 'PhonePe', keywords: ['phonepe'] },
    { name: 'Google Pay', keywords: ['gpay', 'google pay'] },
    { name: 'Paytm', keywords: ['paytm'] },
    { name: 'IRCTC', keywords: ['irctc'] },
    { name: 'MakeMyTrip', keywords: ['makemytrip'] },
    { name: 'BigBasket', keywords: ['bigbasket'] },
    { name: 'Dunzo', keywords: ['dunzo'] },
    { name: 'Myntra', keywords: ['myntra'] },
    { name: 'BookMyShow', keywords: ['bookmyshow'] },
  ];
  const lower = body.toLowerCase();
  for (const m of merchants) {
    if (m.keywords.some(k => lower.includes(k))) return m.name;
  }
  // Try "at MERCHANT" pattern
  const atMatch = body.match(/at\s+([A-Z][A-Za-z\s]{2,20})/);
  if (atMatch) return atMatch[1].trim();
  return null;
};

const detectCategory = (body, merchant) => {
  const lower = body.toLowerCase();
  const m = (merchant || '').toLowerCase();

  if (['swiggy', 'zomato', 'bigbasket', 'dunzo'].some(k => m.includes(k))) return 'Food';
  if (['uber', 'ola', 'irctc', 'makemytrip'].some(k => m.includes(k))) return 'Transport';
  if (['amazon', 'flipkart', 'myntra'].some(k => m.includes(k))) return 'Shopping';
  if (['netflix', 'spotify', 'bookmyshow'].some(k => m.includes(k))) return 'Entertainment';
  if (lower.includes('salary') || lower.includes('payroll')) return 'Salary';
  if (lower.includes('refund') || lower.includes('cashback')) return 'Refund';
  if (lower.includes('recharge') || lower.includes('bill')) return 'Bills';
  if (lower.includes('emi') || lower.includes('loan')) return 'EMI';
  if (lower.includes('atm') || lower.includes('withdraw')) return 'ATM';
  if (lower.includes('transfer')) return 'Transfer';
  return 'Others';
};

export const categoryIcons = {
  Food: '🍕',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Health: '💊',
  Bills: '📱',
  Salary: '💰',
  Refund: '🔄',
  EMI: '🏦',
  ATM: '🏧',
  Transfer: '↔️',
  Others: '📦',
};

export const categoryColors = {
  Food: '#ff6d00',
  Transport: '#2196f3',
  Shopping: '#9c27b0',
  Entertainment: '#e91e63',
  Health: '#00bcd4',
  Bills: '#607d8b',
  Salary: '#00c853',
  Refund: '#8bc34a',
  EMI: '#ff5722',
  ATM: '#795548',
  Transfer: '#9e9e9e',
  Others: '#616161',
};
