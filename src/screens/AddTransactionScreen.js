import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Alert, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { saveTransaction } from '../utils/storage';
import { categoryIcons, categoryColors } from '../utils/smsParser';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Salary', 'Transfer', 'EMI', 'Others'];

export default function AddTransactionScreen({ navigation, route }) {
  const defaultType = route?.params?.type || 'expense';
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Others');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    const tx = {
      id: `manual_${Date.now()}`,
      amount: parseFloat(amount),
      type,
      category,
      merchant: merchant || (type === 'income' ? 'Income' : 'Expense'),
      description: note,
      date: new Date().toISOString(),
      source: 'manual',
    };
    await saveTransaction(tx);
    setLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeBtnText, type === 'expense' && { color: colors.expense }]}>💸 EXPENSE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeBtnText, type === 'income' && { color: colors.income }]}>💰 INCOME</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currency, { color: type === 'income' ? colors.income : colors.expense }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: type === 'income' ? colors.income : colors.expense }]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        {/* Merchant */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>MERCHANT / SOURCE</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder={type === 'income' ? 'e.g. Company Salary' : 'e.g. Swiggy'}
            placeholderTextColor={colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.catIcon}>{categoryIcons[cat] || '📦'}</Text>
                <Text style={[styles.catText, category === cat && { color: colors.primary }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={[styles.fieldInput, styles.noteInput]}
            placeholder="Add a note..."
            placeholderTextColor={colors.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: type === 'income' ? colors.income : colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? 'SAVING...' : 'SAVE TRANSACTION'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.md,
  },
  back: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },

  content: { padding: spacing.md, gap: spacing.md },

  typeToggle: {
    flexDirection: 'row', backgroundColor: colors.card,
    borderRadius: radius.md, padding: 4, gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.sm,
    alignItems: 'center',
  },
  typeBtnExpense: { backgroundColor: 'rgba(255,23,68,0.1)', borderWidth: 1, borderColor: colors.expense },
  typeBtnIncome: { backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.income },
  typeBtnText: { fontSize: 12, fontWeight: '800', color: colors.textMuted, letterSpacing: 1 },

  amountCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  amountLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, fontWeight: '800', marginRight: 4 },
  amountInput: { fontSize: 48, fontWeight: '900', minWidth: 120, textAlign: 'center' },

  field: { gap: 8 },
  fieldLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  fieldInput: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  noteInput: { height: 80, textAlignVertical: 'top' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  catBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  catIcon: { fontSize: 14 },
  catText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  saveBtn: {
    borderRadius: radius.full, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  saveBtnText: { color: colors.black, fontSize: 15, fontWeight: '900', letterSpacing: 2 },
});
