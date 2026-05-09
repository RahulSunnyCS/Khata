import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { api } from '@/src/services/api';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors, Typography, Spacing, BorderRadius, TouchTarget } from '@/src/constants/theme';
import type { User } from '@/src/types/user.types';

export default function ProfileSetupScreen() {
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState('');
  const [vpa, setVpa] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      // SDK 54: preserve original format (HEIC) on iOS by default;
      // pass .automatic only if JPEG re-encoding is required
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      const updated = await api.patch<User>('/users/me', {
        displayName: displayName.trim() || undefined,
        vpa: vpa.trim() || undefined,
      });
      setUser(updated);
      router.replace('/(app)/(tabs)');
    } catch {
      router.replace('/(app)/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>You can always change this later.</Text>

        <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>+</Text>
            </View>
          )}
          <Text style={styles.avatarLabel}>Add photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rahul Sharma"
          placeholderTextColor={Colors.textDisabled}
          value={displayName}
          onChangeText={setDisplayName}
          autoFocus
          returnKeyType="next"
        />

        <Text style={styles.label}>UPI ID (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. rahul@upi"
          placeholderTextColor={Colors.textDisabled}
          value={vpa}
          onChangeText={setVpa}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skip} onPress={() => router.replace('/(app)/(tabs)')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  inner: { flex: 1, paddingHorizontal: Spacing['2xl'], paddingTop: Spacing['2xl'] },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, marginBottom: Spacing['2xl'] },
  avatarPicker: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: Typography.fontSize.xl, color: Colors.textDisabled },
  avatarLabel: { marginTop: Spacing.sm, fontSize: Typography.fontSize.sm, color: Colors.primary },
  label: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.base },
  input: {
    height: TouchTarget,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  button: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.textInverse, fontSize: Typography.fontSize.base, fontWeight: '600' },
  skip: { marginTop: Spacing.base, alignItems: 'center' },
  skipText: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm },
});
