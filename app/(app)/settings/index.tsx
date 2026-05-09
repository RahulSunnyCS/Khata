import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { authService } from '@/src/services/auth.service';
import { resetAnalytics } from '@/src/lib/analytics';
import { clearSentryUser } from '@/src/lib/sentry';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';

function SettingsRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '›'}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          resetAnalytics();
          clearSentryUser();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsRow label="Name" value={user?.displayName ?? '—'} onPress={() => {/* TODO: edit */}} />
          <SettingsRow label="Email" value={user?.email ?? '—'} />
          <SettingsRow label="Phone" value={user?.phone ? `${user.countryCode} ${user.phone}` : '—'} onPress={() => {/* TODO */}} />
          <SettingsRow label="UPI ID" value={user?.vpa ?? 'Not set'} onPress={() => {/* TODO */}} />
          <SettingsRow label="Default currency" value={user?.defaultCurrency ?? 'INR'} onPress={() => {/* TODO */}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingsRow label="Push notifications" onPress={() => {/* TODO */}} />
          <SettingsRow label="Email notifications" onPress={() => {/* TODO */}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingsRow label="Import from Splitwise" onPress={() => {/* TODO */}} />
          <SettingsRow label="Export as CSV" onPress={() => {/* TODO */}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingsRow label="Privacy Policy" onPress={() => {/* TODO */}} />
          <SettingsRow label="Terms of Service" onPress={() => {/* TODO */}} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => Alert.alert('Delete account', 'This will schedule your account for deletion in 30 days. Contact support to cancel.')}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  scroll: { paddingBottom: Spacing['3xl'] },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    minHeight: TouchTarget,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: { fontSize: Typography.fontSize.base, color: Colors.textPrimary },
  rowValue: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  logoutBtn: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    height: TouchTarget,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { color: Colors.error, fontSize: Typography.fontSize.base, fontWeight: '600' },
  deleteBtn: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing.md,
    height: TouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: { color: Colors.textDisabled, fontSize: Typography.fontSize.sm, textDecorationLine: 'underline' },
});
