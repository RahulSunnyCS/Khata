import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useExpensesStore } from '@/src/store/expenses.store';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import type { ActivityItem } from '@/src/types/expense.types';

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <View style={styles.rowContent}>
        <Text style={styles.rowText}>
          <Text style={styles.actor}>{item.actorName}</Text>
          {' '}
          {activityLabel(item.type)}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleDateString('en-IN')}
        </Text>
      </View>
    </View>
  );
}

function activityLabel(type: ActivityItem['type']): string {
  switch (type) {
    case 'EXPENSE_ADDED': return 'added an expense';
    case 'EXPENSE_UPDATED': return 'edited an expense';
    case 'EXPENSE_DELETED': return 'deleted an expense';
    case 'PAYMENT_RECORDED': return 'recorded a payment';
    case 'MEMBER_JOINED': return 'joined the group';
    case 'MEMBER_LEFT': return 'left the group';
    case 'GROUP_CREATED': return 'created the group';
    case 'COMMENT_ADDED': return 'commented on an expense';
  }
}

export default function ActivityScreen() {
  const activity = useExpensesStore((s) => s.activity);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>
      <FlatList
        data={activity}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ActivityRow item={item} />}
        contentContainerStyle={activity.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptySubtitle}>
              Add an expense or join a group to see activity here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.base,
  },
  title: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  list: { paddingBottom: Spacing['3xl'] },
  emptyContainer: { flex: 1 },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  rowContent: { flex: 1 },
  rowText: { fontSize: Typography.fontSize.base, color: Colors.textPrimary },
  actor: { fontWeight: '600' },
  timestamp: { fontSize: Typography.fontSize.xs, color: Colors.textDisabled, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center' },
});
