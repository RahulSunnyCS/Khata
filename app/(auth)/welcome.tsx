import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Khaata</Text>
        <Text style={styles.tagline}>Split expenses. Stay friends.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => router.push('/(auth)/phone')}
          accessibilityRole="button"
          accessibilityLabel="Continue with phone number"
        >
          <Text style={styles.buttonTextPrimary}>Continue with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => {/* TODO: Google Sign-In */}}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <Text style={styles.buttonTextOutline}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Sign-In rendered conditionally on iOS */}
        <TouchableOpacity
          style={[styles.button, styles.buttonDark]}
          onPress={() => {/* TODO: Apple Sign-In */}}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <Text style={styles.buttonTextPrimary}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.replace('/(app)/(tabs)')}
          accessibilityRole="button"
          accessibilityLabel="Continue as guest"
        >
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.legal}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
    paddingBottom: Spacing['2xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  actions: {
    gap: Spacing.md,
  },
  button: {
    height: TouchTarget,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  buttonDark: {
    backgroundColor: '#000000',
  },
  buttonTextPrimary: {
    color: Colors.textInverse,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  guestButton: {
    height: TouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    textDecorationLine: 'underline',
  },
  legal: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.textDisabled,
    marginTop: Spacing.base,
  },
});
