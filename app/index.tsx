import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { authService } from '@/src/services/auth.service';
import { useAuthStore } from '@/src/store/auth.store';
import { Colors } from '@/src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      await authService.restoreSession();
      setLoading(false);
    }
    checkSession();
  }, [setLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundLight }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(app)/(tabs)' : '/(auth)/welcome'} />;
}
