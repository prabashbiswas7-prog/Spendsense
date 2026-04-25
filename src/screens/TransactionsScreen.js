import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme';
import { getTransactions, deleteTransaction, formatAmount, formatDate } from '../utils/storage';
import { categoryIcons } from '../utils/smsParser';

const FILTERS = ['All', 'Today', 'This Week', 'This Month'];

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Income, Expense

  const load = async () => {
    const all = await getTransactions();
    setTransactions(all);
    applyFilters(all, activeFilter, typeFilter, search);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const applyFilters = (data, dateFilter, type, searchText) => {
    let result = [...data];
    const now = new Date();

    if (dateFilter === 'Today') {
      result = result.filter(t => new Date(t.date).toDateString() === now.toDateString());
    } else if (dateFilter === 'This Week') {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateFilter === 'This Month') {
      result = result.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    if (type !== 'All') result = result.filter(t => t.type === type.toLowerCase());
    if (searchText) result = result.filter(t =>
      t.merchant.toLowerCase().includes(searchText.toLowerCase()) ||
      t.category.toLowerCase().includes(searchText.toLowerCase())
    );

    setFiltered(result);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await deleteTransaction(id); load(); }
      },
    ]);
  };

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.txItem}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.txLeft}>
        <View style={styles.txIcon}>
          <Text style={styles.txIconText}>{categoryIcons[item.category] || '📦'}</Text>
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txMerchant}>{item.merchant}</Text>
          <View style={styles.txMeta}>
            <Text style={styles.txCategory}>{item.category}</Text>
            <Text style={styles.txDot}>•</Text>
            <Text style={styles.txDate}>{formatDate(item.date)}</Text>
            {item.source === 'sms' && <Text style={styles.txSource}>SMS</Text>}
            {item.source === 'ocr' && <Text style={[styles.txSource, { backgroundColor: '#1a237e' }]}>SCAN</Text>}
          </View>
        </View>
      </View>
      <Text style={[styles.txAmount, { color: item.type === 'income' ? colors.income : colors.expense }]}>
        {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
        >
          <Text style={styles.addBtnText}>+ ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={t => { setSearch(t); applyFilters(transactions, activeFilter, typeFilter, t); }}
        />
      </View>

      {/* Date Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => { setActiveFilter(f); applyFilters(transactions, f, typeFilter, search); }}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type Filter */}
      <View style={styles.typeRow}>
        {['All', 'Income', 'Expense'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, typeFilter === t && styles.typeBtnActive]}
            onPress={() => { setTypeFilter(t); applyFilters(transactions, activeFilter, t, search); }}
          >
            <Text style={[styles.typeText, typeFilter === t && styles.typeTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: colors.income }]}>{formatAmount(totalIncome)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryAmount, { color: colors.expense }]}>{formatAmount(totalExpense)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Count</Text>
          <Text style={styles.summaryAmount}>{filtered.length}</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  addBtn: {
    backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
  },
  addBtnText: { color: colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md,
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: colors.text, fontSize: 14 },

  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  filterText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  filterTextActive: { color: colors.primary },

  typeRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: 8, marginBottom: spacing.sm },
  typeBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  typeBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  typeText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  typeTextActive: { color: colors.primary },

  summary: {
    flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  summaryAmount: { fontSize: 13, fontWeight: '700', color: colors.text },

  listContent: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm,
    marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.sm },
  txIcon: {
    width: 42, height: 42, borderRadius: radius.sm,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  txIconText: { fontSize: 20 },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 14, fontWeight: '700', color: colors.text },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  txCategory: { fontSize: 11, color: colors.textMuted },
  txDot: { fontSize: 11, color: colors.textMuted },
  txDate: { fontSize: 11, color: colors.textMuted },
  txSource: {
    fontSize: 8, color: colors.primary, backgroundColor: colors.primaryGlow,
    paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, fontWeight: '700',
  },
  txAmount: { fontSize: 15, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
