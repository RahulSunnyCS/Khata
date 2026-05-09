import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { useGroupsStore } from '@/src/store/groups.store';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = useGroupsStore((s) => s.groupDetails[id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.name}>{group?.name ?? 'Group'}</Text>
        {/* TODO: tabs — Expenses, Balances, Members, Chat */}
        <Text style={styles.placeholder}>Group detail coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.base },
  name: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.base },
  placeholder: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
});
