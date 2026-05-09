import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/src/store/auth.store';
import { useUiStore } from '@/src/store/ui.store';
import { initSocket, disconnectSocket } from '@/src/lib/socket';
import { registerForPushNotifications } from '@/src/lib/notifications';
import { authService } from '@/src/services/auth.service';
import * as Network from 'expo-network';

export default function AppLayout() {
  const { isAuthenticated, tokens } = useAuthStore();
  const { setOnline } = useUiStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Init socket for real-time updates
    if (tokens?.accessToken) {
      initSocket(tokens.accessToken);
    }

    // Register push token
    registerForPushNotifications().then((token) => {
      if (token) authService.updatePushToken(token);
    });

    // Network status listener
    const sub = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected ?? true);
    });

    return () => {
      sub.remove();
      disconnectSocket();
    };
  }, [isAuthenticated, tokens, setOnline]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="group/[id]" options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="expense/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense' }} />
      <Stack.Screen name="expense/[id]" options={{ headerShown: true, title: 'Expense' }} />
      <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
    </Stack>
  );
}
