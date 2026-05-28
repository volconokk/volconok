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
import { PencilIcon } from '../../src/components/icons';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ login: '', password: '' });
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!form.login.trim() || !form.password) {
      Alert.alert(t('common.error'), t('auth.fillFields'));
      return;
    }
    setBusy(true);
    try {
      await login(form);
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
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <PencilFrame
              radius={32}
              padding={20}
              filled
              fillColor={colors.paper}
              style={{ marginBottom: 18 }}
            >
              <PencilIcon size={48} color={colors.ink} />
            </PencilFrame>
            <Text style={{ ...typography.display, color: colors.ink }}>{t('app.name')}</Text>
            <Text
              style={{
                ...typography.body,
                color: colors.inkMuted,
                marginTop: 6,
                textAlign: 'center',
              }}
            >
              {t('app.tagline')}
            </Text>
          </View>

          <PencilFrame filled fillColor={colors.paper} radius={24} padding={20}>
            <Text style={{ ...typography.title, color: colors.ink, marginBottom: 14 }}>
              {t('auth.welcome')}
            </Text>
            <Text style={{ ...typography.body, color: colors.inkMuted, marginBottom: 18 }}>
              {t('auth.subtitle')}
            </Text>
            <PencilInput
              label={t('auth.loginOrEmail')}
              value={form.login}
              onChangeText={(login) => setForm({ ...form, login })}
              placeholder="anna"
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
              label={t('auth.signIn')}
              onPress={onSubmit}
              loading={busy}
              fullWidth
            />
            <Pressable
              onPress={() => router.replace('/auth/register')}
              style={{ marginTop: 16, alignItems: 'center' }}
            >
              <Text style={{ ...typography.body, color: colors.inkMuted }}>
                {t('auth.noAccount')}{' '}
                <Text style={{ color: colors.ink, fontWeight: '700' }}>
                  {t('auth.createAccount')}
                </Text>
              </Text>
            </Pressable>
          </PencilFrame>
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}
