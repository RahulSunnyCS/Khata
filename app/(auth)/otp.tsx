import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '@/src/services/auth.service';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone, countryCode } = useLocalSearchParams<{ phone: string; countryCode: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  async function handleVerify() {
    if (otp.length < OTP_LENGTH) return;
    setError(null);
    setLoading(true);
    try {
      await authService.verifyOtp({ phone, countryCode, otp });
      router.replace('/(auth)/profile-setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    await authService.requestOtp({ phone, countryCode });
    setOtp('');
    setError(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {countryCode} {phone}
        </Text>

        {/* Hidden native input; display boxes rendered below */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(v) => {
            setOtp(v.replace(/\D/g, '').slice(0, OTP_LENGTH));
            if (v.length === OTP_LENGTH) handleVerify();
          }}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          style={styles.hiddenInput}
          autoFocus
          caretHidden
        />

        <TouchableOpacity style={styles.otpRow} onPress={() => inputRef.current?.focus()}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[styles.otpBox, otp.length === i && styles.otpBoxActive]}
            >
              <Text style={styles.otpChar}>{otp[i] ?? ''}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, otp.length < OTP_LENGTH && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.length < OTP_LENGTH}
        >
          <Text style={styles.buttonText}>{loading ? 'Verifying…' : 'Verify'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resend} onPress={handleResend}>
          <Text style={styles.resendText}>Didn't receive it? Resend OTP</Text>
        </TouchableOpacity>
      </View>
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
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  otpRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: { borderColor: Colors.primary, borderWidth: 2 },
  otpChar: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.textPrimary },
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
  resend: { marginTop: Spacing.xl, alignItems: 'center' },
  resendText: { color: Colors.primary, fontSize: Typography.fontSize.sm, textDecorationLine: 'underline' },
});
