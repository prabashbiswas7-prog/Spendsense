import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import {
  getTransactions, getSummary, getCategoryBreakdown,
  formatAmount,
} from '../utils/storage';
import { categoryIcons, categoryColors } from '../utils/smsParser';

const { width } = Dimensions.get('window');
const BAR_WIDTH = width - spacing.md * 2 - 32;

const PERIODS = ['This Week', 'This Month', 'Last 3 Months'];

export default function ReportsScreen() {
  const [period, setPeriod] = useState('This Month');
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [categories, setCategories] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const load = async () => {
    const all = await getTransactions();
    const now = new Date();
    let filtered = all;

    if (period === 'This Week') {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = all.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'This Month') {
      filtered = all.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else {
      const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      filtered = all.filter(t => new Date(t.date) >= threeMonthsAgo);
    }

    setSummary(getSummary(filtered));
    setCategories(getCategoryBreakdown(filtered));

    // Daily breakdown (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayTx = all.filter(t => new Date(t.date).toDateString() === d.toDateString());
      const expense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      days.push({
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        expense,
      });
    }
    setDailyData(days);
  };

  useFocusEffect(useCallback(() => { load(); }, [period]));

  const maxExpense = Math.max(...dailyData.map(d => d.expense), 1);
  const savingsRate = summary.income > 0 ? ((summary.net / summary.income) * 100).toFixed(0) : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: colors.income }]}>
            <Text style={styles.summaryLabel}>INCOME</Text>
            <Text style={[styles.summaryAmount, { color: colors.income }]}>{formatAmount(summary.income)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.expense }]}>
            <Text style={styles.summaryLabel}>EXPENSE</Text>
            <Text style={[styles.summaryAmount, { color: colors.expense }]}>{formatAmount(summary.expense)}</Text>
          </View>
        </View>

        {/* Net + Savings Rate */}
        <View style={styles.netCard}>
          <View>
            <Text style={styles.netLabel}>NET BALANCE</Text>
            <Text style={[styles.netAmount, { color: summary.net >= 0 ? colors.income : colors.expense }]}>
              {summary.net >= 0 ? '+' : ''}{formatAmount(summary.net)}
            </Text>
          </View>
          <View style={styles.savingsBox}>
            <Text style={styles.savingsRate}>{savingsRate}%</Text>
            <Text style={styles.savingsLabel}>SAVED</Text>
          </View>
        </View>

        {/* Daily Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>DAILY SPENDING (LAST 7 DAYS)</Text>
          <View style={styles.barChart}>
            {dailyData.map((d, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barAmount}>
                  {d.expense > 0 ? `₹${(d.expense / 1000).toFixed(0)}k` : ''}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    height: `${(d.expense / maxExpense) * 100}%`,
                    backgroundColor: d.expense > 0 ? colors.primary : colors.border,
                  }]} />
                </View>
                <Text style={styles.barLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categoryCard}>
          <Text style={styles.chartTitle}>SPENDING BY CATEGORY</Text>
          {categories.length === 0 ? (
            <Text style={styles.noData}>No expense data</Text>
          ) : (
            categories.map((cat, i) => {
              const pct = summary.expense > 0 ? (cat.amount / summary.expense) * 100 : 0;
              return (
                <View key={i} style={styles.catRow}>
                  <View style={styles.catLeft}>
                    <Text style={styles.catIcon}>{categoryIcons[cat.category] || '📦'}</Text>
                    <View>
                      <Text style={styles.catName}>{cat.category}</Text>
                      <Text style={styles.catPct}>{pct.toFixed(0)}% of expenses</Text>
                    </View>
                  </View>
                  <Text style={[styles.catAmount, { color: colors.expense }]}>{formatAmount(cat.amount)}</Text>
                </View>
              );
            }).concat(
              categories.map((cat, i) => {
                const pct = summary.expense > 0 ? (cat.amount / summary.expense) * 100 : 0;
                return (
                  <View key={`bar_${i}`} style={styles.catBar}>
                    <View style={[styles.catBarFill, {
                      width: `${pct}%`,
                      backgroundColor: categoryColors[cat.category] || colors.primary,
                    }]} />
                  </View>
                );
              })
            )
          )}
        </View>

        {/* Insight */}
        {categories.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Top Spending</Text>
              <Text style={styles.insightDesc}>
                {`${categories[0]?.category} takes up ${((categories[0]?.amount / summary.expense) * 100).toFixed(0)}% of your expenses this period.`}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },

  content: { padding: spacing.md, gap: spacing.md },

  periodRow: { flexDirection: 'row', gap: 8 },
  periodBtn: {
    flex: 1, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  periodBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  periodText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  periodTextActive: { color: colors.primary },

  summaryRow: { flexDirection: 'row', gap: spacing.sm },
  summaryCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, gap: 4,
  },
  summaryLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  summaryAmount: { fontSize: 18, fontWeight: '800' },

  netCard: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  netLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  netAmount: { fontSize: 24, fontWeight: '900', marginTop: 4 },
  savingsBox: { alignItems: 'center', backgroundColor: colors.primaryGlow, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.primary },
  savingsRate: { fontSize: 22, fontWeight: '900', color: colors.primary },
  savingsLabel: { fontSize: 8, color: colors.primary, letterSpacing: 1 },

  chartCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  chartTitle: { fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md, fontWeight: '700' },
  barChart: { flexDirection: 'row', height: 100, alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barAmount: { fontSize: 7, color: colors.textMuted },
  barTrack: { width: '100%', flex: 1, backgroundColor: colors.surface, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 3, minHeight: 2 },
  barLabel: { fontSize: 9, color: colors.textMuted },

  categoryCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  catIcon: { fontSize: 20 },
  catName: { fontSize: 13, fontWeight: '700', color: colors.text },
  catPct: { fontSize: 10, color: colors.textMuted },
  catAmount: { fontSize: 14, fontWeight: '700' },
  catBar: { height: 4, backgroundColor: colors.surface, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
  noData: { color: colors.textMuted, textAlign: 'center', padding: spacing.md },

  insightCard: {
    flexDirection: 'row', backgroundColor: colors.primaryGlow,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
    borderWidth: 1, borderColor: colors.primary, alignItems: 'center',
  },
  insightIcon: { fontSize: 24 },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 13, fontWeight: '700', color: colors.primary },
  insightDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
});
