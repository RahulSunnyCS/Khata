import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SECURE_KEYS = ['accessToken', 'refreshToken'] as const;
type SecureKey = (typeof SECURE_KEYS)[number];

// Tokens go to iOS Keychain / Android Keystore; everything else to AsyncStorage
export const Storage = {
  async setSecure(key: SecureKey, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(`secure_${key}`, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getSecure(key: SecureKey): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(`secure_${key}`);
    }
    return SecureStore.getItemAsync(key);
  },

  async deleteSecure(key: SecureKey): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(`secure_${key}`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

// Named keys used across the app
export const StorageKeys = {
  pendingExpenses: 'khaata:pending_expenses',
  lastSyncedAt: 'khaata:last_synced_at',
  onboardingDone: 'khaata:onboarding_done',
  pushToken: 'khaata:push_token',
} as const;
