import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useGroupsStore } from '@/src/store/groups.store';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';
import { Locale } from '@/src/constants/config';
import type { Group } from '@/src/types/group.types';

function GroupRow({ group }: { group: Group }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/(app)/group/${group.id}`)}
      accessibilityRole="button"
    >
      <View style={styles.groupIcon}>
        <Text style={styles.groupEmoji}>{groupTypeEmoji(group.type)}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupMeta}>{group.memberCount} members</Text>
      </View>
      <View style={styles.rowBalance}>
        <Text style={styles.balanceText}>{Locale.currencySymbol}0</Text>
        <Text style={styles.balanceLabel}>settled</Text>
      </View>
    </TouchableOpacity>
  );
}

function groupTypeEmoji(type: Group['type']): string {
  switch (type) {
    case 'TRIP': return '✈️';
    case 'HOME': return '🏠';
    case 'COUPLE': return '💑';
    default: return '👥';
  }
}

export default function GroupsScreen() {
  const groups = useGroupsStore((s) => s.groups);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => {/* TODO: create group modal */}}
        >
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => <GroupRow group={item} />}
        contentContainerStyle={groups.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a group for a trip, home, or anything else.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => {/* TODO */}}>
              <Text style={styles.emptyBtnText}>Create group</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.base,
  },
  title: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  createBtn: {
    height: 36,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  createBtnText: { color: Colors.textInverse, fontWeight: '600', fontSize: Typography.fontSize.sm },
  list: { paddingBottom: Spacing['3xl'] },
  emptyContainer: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    minHeight: TouchTarget,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  groupEmoji: { fontSize: 20 },
  rowInfo: { flex: 1 },
  groupName: { fontSize: Typography.fontSize.base, fontWeight: '600', color: Colors.textPrimary },
  groupMeta: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  rowBalance: { alignItems: 'flex-end' },
  balanceText: { fontSize: Typography.fontSize.base, fontWeight: '600', color: Colors.settled },
  balanceLabel: { fontSize: Typography.fontSize.xs, color: Colors.textDisabled },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing['2xl'] },
  emptyBtn: {
    height: TouchTarget,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  emptyBtnText: { color: Colors.textInverse, fontWeight: '600' },
});
