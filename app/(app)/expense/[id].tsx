import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing } from '@/src/constants/theme';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* TODO: expense detail — payers, splits, comments, receipt, edit/delete */}
        <Text style={styles.placeholder}>Expense {id} — detail coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.base },
  placeholder: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
});
