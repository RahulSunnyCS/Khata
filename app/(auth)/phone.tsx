import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/src/services/auth.service';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authService.requestOtp({ phone, countryCode });
      router.push({ pathname: '/(auth)/otp', params: { phone, countryCode } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter your number</Text>
        <Text style={styles.subtitle}>We'll send a 6-digit OTP to verify your number.</Text>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.countryCode}>
            <Text style={styles.countryCodeText}>{countryCode}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor={Colors.textDisabled}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            autoFocus
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, (loading || phone.length < 10) && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading || phone.length < 10}
        >
          <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send OTP'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  inner: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.base },
  back: { marginBottom: Spacing['2xl'] },
  backText: { fontSize: Typography.fontSize.base, color: Colors.primary },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, marginBottom: Spacing['2xl'] },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  countryCode: {
    height: TouchTarget,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  countryCodeText: { fontSize: Typography.fontSize.base, color: Colors.textPrimary, fontWeight: '600' },
  input: {
    flex: 1,
    height: TouchTarget,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  error: { color: Colors.error, fontSize: Typography.fontSize.sm, marginBottom: Spacing.sm },
  button: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.textInverse, fontSize: Typography.fontSize.base, fontWeight: '600' },
});
