import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/store/useAuth';
import { ensureSocket, disconnectSocket } from '../src/store/useSocket';
import { setLanguage } from '../src/i18n';
import '../src/i18n';

function AuthGate({ children }) {
  const { user, loading, bootstrap } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await bootstrap();
      } catch (e) {
        console.log('Bootstrap error:', e);
      } finally {
        setReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) {
      ensureSocket().catch(() => {});
      if (user.settings?.language) {
        setLanguage(user.settings.language);
      }
    } else {
      disconnectSocket();
    }
  }, [user]);

  useEffect(() => {
    if (loading || !ready) return;
    const inAuth = segments[0] === 'auth';
    if (!user && !inAuth) {
      router.replace('/auth/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/feed');
    }
  }, [user, loading, ready, segments]);

  if (!ready || loading) {
    return (
      <LoadingScreen />
    );
  }

  return children;
}

function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.ink} />
      <Text style={{ marginTop: 16, color: colors.inkMuted, fontSize: 14 }}>Загрузка...</Text>
    </View>
  );
}

function StatusBarWrapper() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBarWrapper />
          <AuthGate>
            <Slot />
          </AuthGate>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
