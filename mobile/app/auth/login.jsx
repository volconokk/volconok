import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilButton } from '../../src/components/PencilButton';
import { PencilInput } from '../../src/components/PencilInput';
import { KeyboardAwareForm } from '../../src/components/KeyboardAvoidingScreen';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useAuth } from '../../src/store/useAuth';
import { PencilIcon } from '../../src/components/icons';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
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
      const cleanedLogin = form.login.replace(/^@/, '').trim();
      await login({ login: cleanedLogin, password: form.password });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.displayMessage || t('auth.error');
      if (errorMessage.includes('Invalid') || errorMessage.includes('not found')) {
        Alert.alert(t('common.error'), t('auth.invalidCredentials'));
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAwareForm
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: horizontalPadding,
            paddingVertical: 24,
            justifyContent: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
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

          <PencilFrame filled elevated fillColor={colors.paper} radius={24} padding={20}>
            <Text style={{ ...typography.title, color: colors.ink, marginBottom: 6 }}>
              {t('auth.welcome')}
            </Text>
            <Text style={{ ...typography.body, color: colors.inkMuted, marginBottom: 20 }}>
              {t('auth.subtitle')}
            </Text>
            <PencilInput
              label={t('auth.loginOrEmail')}
              value={form.login}
              onChangeText={(login) => setForm({ ...form, login })}
              placeholder={t('auth.usernamePlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ marginBottom: 12 }}
            />
            <PencilInput
              label={t('auth.password')}
              value={form.password}
              onChangeText={(password) => setForm({ ...form, password })}
              placeholder={t('auth.passwordPlaceholder')}
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
          </View>
        </KeyboardAwareForm>
      </SafeAreaView>
    </PaperBackground>
  );
}
