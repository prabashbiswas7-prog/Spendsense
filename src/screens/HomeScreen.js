import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import {
  getTodayTransactions, getThisMonthTransactions,
  getSummary, formatAmount, formatDate,
} from '../utils/storage';
import { categoryIcons } from '../utils/smsParser';

export default function HomeScreen({ navigation }) {
  const [todaySummary, setTodaySummary] = useState({ income: 0, expense: 0, net: 0 });
  const [monthSummary, setMonthSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [recent, setRecent] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState({ name: 'User', currency: '₹' });

  const load = async () => {
    const today = await getTodayTransactions();
    const month = await getThisMonthTransactions();
    setTodaySummary(getSummary(today));
    setMonthSummary(getSummary(month));
    setRecent(today.slice(0, 5));
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.notifIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Today Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>TODAY'S NET BALANCE</Text>
          <Text style={[
            styles.balanceAmount,
            { color: todaySummary.net >= 0 ? colors.income : colors.expense }
          ]}>
            {todaySummary.net >= 0 ? '+' : ''}{formatAmount(todaySummary.net)}
          </Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>↑ INCOME</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.income }]}>
                {formatAmount(todaySummary.income)}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>↓ EXPENSE</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.expense }]}>
                {formatAmount(todaySummary.expense)}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {(todaySummary.income + todaySummary.expense) > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${Math.min((todaySummary.expense / (todaySummary.income || todaySummary.expense)) * 100, 100)}%`,
                backgroundColor: todaySummary.expense > todaySummary.income ? colors.expense : colors.primary,
              }]} />
            </View>
          )}
        </View>

        {/* This Month */}
        <View style={styles.monthCard}>
          <Text style={styles.sectionTitle}>THIS MONTH</Text>
          <View style={styles.monthRow}>
            <View style={styles.monthItem}>
              <Text style={styles.monthLabel}>Income</Text>
              <Text style={[styles.monthAmount, { color: colors.income }]}>{formatAmount(monthSummary.income)}</Text>
            </View>
            <View style={styles.monthItem}>
              <Text style={styles.monthLabel}>Expense</Text>
              <Text style={[styles.monthAmount, { color: colors.expense }]}>{formatAmount(monthSummary.expense)}</Text>
            </View>
            <View style={styles.monthItem}>
              <Text style={styles.monthLabel}>Saved</Text>
              <Text style={[styles.monthAmount, { color: monthSummary.net >= 0 ? colors.income : colors.expense }]}>
                {formatAmount(Math.abs(monthSummary.net))}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}>
            <Text style={styles.quickIcon}>💸</Text>
            <Text style={styles.quickLabel}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}>
            <Text style={styles.quickIcon}>💰</Text>
            <Text style={styles.quickLabel}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Scan')}>
            <Text style={styles.quickIcon}>📸</Text>
            <Text style={styles.quickLabel}>Scan Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.quickIcon}>📊</Text>
            <Text style={styles.quickLabel}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>TODAY'S TRANSACTIONS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No transactions today</Text>
              <Text style={styles.emptySubText}>Pull to refresh or add manually</Text>
            </View>
          ) : (
            recent.map(tx => (
              <TouchableOpacity
                key={tx.id}
                style={styles.txItem}
                onPress={() => navigation.navigate('Transactions')}
              >
                <View style={styles.txIcon}>
                  <Text style={styles.txIconText}>{categoryIcons[tx.category] || '📦'}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txMerchant}>{tx.merchant}</Text>
                  <Text style={styles.txCategory}>{tx.category} • {formatDate(tx.date)}</Text>
                </View>
                <Text style={[
                  styles.txAmount,
                  { color: tx.type === 'income' ? colors.income : colors.expense }
                ]}>
                  {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 50,
  },
  greeting: { fontSize: 13, color: colors.textMuted, letterSpacing: 0.5 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 2 },
  notifBtn: { padding: 8 },
  notifIcon: { fontSize: 22 },

  balanceCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryGlow,
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceItemLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  balanceItemAmount: { fontSize: 16, fontWeight: '700' },
  balanceDivider: { width: 1, height: 30, backgroundColor: colors.border },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },

  monthCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthRow: { flexDirection: 'row', marginTop: spacing.sm },
  monthItem: { flex: 1, alignItems: 'center' },
  monthLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  monthAmount: { fontSize: 14, fontWeight: '700' },

  quickActions: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  quickIcon: { fontSize: 22 },
  quickLabel: { fontSize: 9, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },

  recentSection: { margin: spacing.md },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { fontSize: 11, color: colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  seeAll: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: colors.textSecondary, fontWeight: '600' },
  emptySubText: { fontSize: 12, color: colors.textMuted },

  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconText: { fontSize: 20 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 14, fontWeight: '700', color: colors.text },
  txCategory: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '800' },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  fabText: { fontSize: 28, color: colors.black, fontWeight: '400', lineHeight: 32 },
});
