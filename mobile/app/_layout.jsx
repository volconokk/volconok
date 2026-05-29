import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/store/useAuth';
import { ensureSocket, disconnectSocket } from '../src/store/useSocket';
import { setLanguage } from '../src/i18n';
import { ToastProvider } from '../src/components/Toast';
import { PencilLoader } from '../src/components/SketchLoader';
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
    const atRoot = segments.length === 0;

    if (!user && !inAuth) {
      router.replace('/auth/login');
    } else if (user && (inAuth || atRoot)) {
      router.replace('/(tabs)/feed');
    }
  }, [user, loading, ready, segments]);

  if (!ready || loading) {
    return <LoadingScreen />;
  }

  return children;
}

function LoadingScreen() {
  const { colors, typography } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <View style={{ marginBottom: 24 }}>
        <PencilLoader size={80} />
      </View>
      <Text style={{ ...typography.title, color: colors.ink, marginBottom: 8 }}>Volconok</Text>
      <Text style={{ ...typography.caption, color: colors.inkMuted }}>Загрузка...</Text>
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
          <ToastProvider>
            <StatusBarWrapper />
            <AuthGate>
              <Slot />
            </AuthGate>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
