import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { useUiStore } from '@/src/store/ui.store';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';
import { Locale } from '@/src/constants/config';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isOnline = useUiStore((s) => s.isOnline);
  const hasPendingSync = useUiStore((s) => s.hasPendingSync);

  return (
    <SafeAreaView style={styles.container}>
      {/* Offline banner */}
      {(!isOnline || hasPendingSync) && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            {!isOnline ? 'You are offline' : `${hasPendingSync ? 'Syncing…' : ''}`}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.displayName ?? 'there'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your balance summary</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(app)/settings/index')}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Balance overview card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You are owed</Text>
          <Text style={[styles.balanceAmount, styles.owing]}>{Locale.currencySymbol}0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>You owe</Text>
          <Text style={[styles.balanceAmount, styles.owed]}>{Locale.currencySymbol}0</Text>
        </View>
      </View>

      {/* TODO: groups list, smart netting suggestion card, activity feed */}
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No groups yet.</Text>
        <TouchableOpacity
          style={styles.addGroupBtn}
          onPress={() => router.push('/(app)/(tabs)/groups')}
        >
          <Text style={styles.addGroupText}>Create a group</Text>
        </TouchableOpacity>
      </View>

      {/* FAB: Add Expense */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/expense/add')}
        accessibilityLabel="Add expense"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  offlineBanner: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  offlineText: { color: Colors.textInverse, fontSize: Typography.fontSize.sm, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  subGreeting: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  settingsBtn: { width: TouchTarget, height: TouchTarget, justifyContent: 'center', alignItems: 'center' },
  settingsIcon: { fontSize: 22 },
  balanceCard: {
    marginHorizontal: Spacing['2xl'],
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  balanceItem: { flex: 1, alignItems: 'center' },
  balanceLabel: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  balanceAmount: { fontSize: Typography.fontSize.xl, fontWeight: '700' },
  owing: { color: Colors.owing },
  owed: { color: Colors.owed },
  divider: { width: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, marginBottom: Spacing.base },
  addGroupBtn: {
    height: TouchTarget,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  addGroupText: { color: Colors.textInverse, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: Spacing['3xl'],
    right: Spacing['2xl'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: Colors.textInverse, fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
