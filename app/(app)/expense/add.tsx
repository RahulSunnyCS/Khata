import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { expensesService } from '@/src/services/expenses.service';
import { useExpensesStore } from '@/src/store/expenses.store';
import { useUiStore } from '@/src/store/ui.store';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';
import { Locale } from '@/src/constants/config';
import type { SplitType } from '@/src/types/expense.types';

const SPLIT_TYPES: { label: string; value: SplitType }[] = [
  { label: 'Equal', value: 'EQUAL' },
  { label: 'Exact', value: 'EXACT' },
  { label: '%', value: 'PERCENTAGE' },
  { label: 'Shares', value: 'SHARES' },
  { label: 'Adjust', value: 'ADJUSTMENT' },
  { label: 'Items', value: 'ITEMISED' },
];

export default function AddExpenseScreen() {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const isOnline = useUiStore((s) => s.isOnline);
  const { upsertExpense, enqueuePending } = useExpensesStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const total = parseFloat(amount);
    if (!total || total <= 0 || !description.trim()) return;

    const idempotencyKey = `${userId}_${Date.now()}`;

    const payload = {
      description: description.trim(),
      totalAmount: total,
      currency: Locale.defaultCurrency,
      categoryId: 'general',
      splitType,
      expenseDate: new Date().toISOString(),
      payers: [{ userId, amountPaid: total }],
      splits: [{ userId, owedAmount: total }],
      idempotencyKey,
    };

    if (!isOnline) {
      enqueuePending({ payload: { ...payload, groupId: null, receiptUrl: null, createdById: userId, commentCount: 0, deletedAt: null }, queuedAt: Date.now() });
      router.back();
      return;
    }

    setLoading(true);
    try {
      const expense = await expensesService.create(payload);
      upsertExpense(expense);
      router.back();
    } catch {
      // TODO: show error toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>

        {/* Amount — large numeric input, no text keyboard */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{Locale.currencySymbol}</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor={Colors.textDisabled}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        <TextInput
          style={styles.descriptionInput}
          placeholder="What's this for?"
          placeholderTextColor={Colors.textDisabled}
          value={description}
          onChangeText={setDescription}
          returnKeyType="done"
        />

        {/* Split type selector */}
        <Text style={styles.sectionLabel}>Split by</Text>
        <View style={styles.splitRow}>
          {SPLIT_TYPES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.splitChip, splitType === s.value && styles.splitChipActive]}
              onPress={() => setSplitType(s.value)}
            >
              <Text style={[styles.splitChipText, splitType === s.value && styles.splitChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TODO: payer selection, per-split-type detail, group/friend selector, date picker, category, receipt */}

        <TouchableOpacity
          style={[styles.saveBtn, (loading || !amount || !description) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading || !amount || !description.trim()}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving…' : !isOnline ? 'Save (offline)' : 'Save expense'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  scroll: { paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'], paddingBottom: Spacing['3xl'] },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  currencySymbol: { fontSize: Typography.fontSize['2xl'], fontWeight: '700', color: Colors.textPrimary, marginRight: Spacing.xs },
  amountInput: { fontSize: 48, fontWeight: '700', color: Colors.textPrimary, minWidth: 100, textAlign: 'center' },
  descriptionInput: {
    height: TouchTarget,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  sectionLabel: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  splitRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  splitChip: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  splitChipText: { fontSize: Typography.fontSize.xs, fontWeight: '600', color: Colors.textSecondary },
  splitChipTextActive: { color: Colors.textInverse },
  saveBtn: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.textInverse, fontSize: Typography.fontSize.base, fontWeight: '600' },
});
