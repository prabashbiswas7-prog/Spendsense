import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TRANSACTIONS: 'spendsense_transactions',
  USER: 'spendsense_user',
  SETTINGS: 'spendsense_settings',
  ONBOARDED: 'spendsense_onboarded',
};

// ─── Transactions ───────────────────────────────────────────
export const saveTransaction = async (tx) => {
  try {
    const all = await getTransactions();
    // Deduplicate by id
    const exists = all.find(t => t.id === tx.id);
    if (exists) return;
    const updated = [tx, ...all];
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
  } catch (e) { console.error(e); }
};

export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const deleteTransaction = async (id) => {
  try {
    const all = await getTransactions();
    const updated = all.filter(t => t.id !== id);
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updated));
  } catch (e) { console.error(e); }
};

export const getTodayTransactions = async () => {
  const all = await getTransactions();
  const today = new Date().toDateString();
  return all.filter(t => new Date(t.date).toDateString() === today);
};

export const getThisMonthTransactions = async () => {
  const all = await getTransactions();
  const now = new Date();
  return all.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
};

// ─── Summary ────────────────────────────────────────────────
export const getSummary = (transactions) => {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
};

export const getCategoryBreakdown = (transactions) => {
  const breakdown = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
  });
  return Object.entries(breakdown)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

// ─── User ────────────────────────────────────────────────────
export const saveUser = async (user) => {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : { name: 'User', currency: '₹' };
  } catch (e) { return { name: 'User', currency: '₹' }; }
};

// ─── Settings ────────────────────────────────────────────────
export const saveSettings = async (settings) => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      notifTime: '21:00',
      realtimeNotif: true,
      dailySummary: true,
      currency: '₹',
    };
  } catch (e) {
    return { notifTime: '21:00', realtimeNotif: true, dailySummary: true, currency: '₹' };
  }
};

// ─── Onboarding ──────────────────────────────────────────────
export const setOnboarded = async () => {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
};

export const isOnboarded = async () => {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
  return val === 'true';
};

// ─── Export ──────────────────────────────────────────────────
export const exportCSV = async () => {
  const all = await getTransactions();
  const header = 'Date,Type,Amount,Category,Merchant,Description\n';
  const rows = all.map(t =>
    `${new Date(t.date).toLocaleDateString()},${t.type},${t.amount},${t.category},${t.merchant},"${t.description}"`
  ).join('\n');
  return header + rows;
};

// ─── Format ──────────────────────────────────────────────────
export const formatAmount = (amount, currency = '₹') => {
  return `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
