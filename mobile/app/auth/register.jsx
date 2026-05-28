import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilButton } from '../../src/components/PencilButton';
import { PencilInput } from '../../src/components/PencilInput';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/store/useAuth';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const { username, email, password } = form;
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.fillFields'));
      return;
    }
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage || t('auth.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 18 }}>
            <Text style={{ ...typography.display, color: colors.ink }}>
              {t('auth.createAccount')}
            </Text>
            <Text style={{ ...typography.body, color: colors.inkMuted, marginTop: 6 }}>
              {t('app.tagline')}
            </Text>
          </View>

          <PencilFrame filled fillColor={colors.paper} radius={24} padding={20}>
            <PencilInput
              label={t('auth.username')}
              value={form.username}
              onChangeText={(v) =>
                setForm({ ...form, username: v.toLowerCase().replace(/[^a-z0-9_.]/g, '') })
              }
              placeholder="my_handle"
              style={{ marginBottom: 12 }}
            />
            <PencilInput
              label={t('auth.displayName')}
              value={form.displayName}
              onChangeText={(displayName) => setForm({ ...form, displayName })}
              autoCapitalize="words"
              placeholder="Anna"
              style={{ marginBottom: 12 }}
            />
            <PencilInput
              label={t('auth.email')}
              value={form.email}
              onChangeText={(email) => setForm({ ...form, email })}
              keyboardType="email-address"
              placeholder="you@example.com"
              style={{ marginBottom: 12 }}
            />
            <PencilInput
              label={t('auth.password')}
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
              placeholder="••••••••"
              secureTextEntry
              style={{ marginBottom: 18 }}
            />
            <PencilButton
              label={t('auth.createAccount')}
              onPress={onSubmit}
              loading={busy}
              fullWidth
            />
            <Pressable
              onPress={() => router.replace('/auth/login')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ ...typography.body, color: colors.inkMuted }}>
                {t('auth.haveAccount')}{' '}
                <Text style={{ color: colors.ink, fontWeight: '700' }}>{t('auth.signIn')}</Text>
              </Text>
            </Pressable>
          </PencilFrame>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}
