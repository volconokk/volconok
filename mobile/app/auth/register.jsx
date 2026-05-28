import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilButton } from '../../src/components/PencilButton';
import { PencilInput } from '../../src/components/PencilInput';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/store/useAuth';
import { client } from '../../src/api/client';

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
  const [usernameState, setUsernameState] = useState({ checking: false, available: null, error: null });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const checkUsername = async () => {
      const cleaned = form.username.replace(/^@/, '').toLowerCase();
      if (!cleaned || cleaned.length < 3) {
        setUsernameState({ checking: false, available: null, error: null });
        return;
      }
      
      if (!/^[a-z0-9_.]+$/.test(cleaned)) {
        setUsernameState({ checking: false, available: false, error: t('auth.invalidUsername') });
        return;
      }

      if (cleaned.length > 20) {
        setUsernameState({ checking: false, available: false, error: t('auth.shortUsername') });
        return;
      }

      setUsernameState({ checking: true, available: null, error: null });
      try {
        const { data } = await client.get(`/auth/check-username?username=${encodeURIComponent(cleaned)}`);
        setUsernameState({ checking: false, available: data.available, error: null });
      } catch (err) {
        setUsernameState({ checking: false, available: null, error: null });
      }
    };

    const timer = setTimeout(checkUsername, 400);
    return () => clearTimeout(timer);
  }, [form.username, t]);

  const validateForm = () => {
    const errors = {};
    const username = form.username.replace(/^@/, '').toLowerCase();
    
    if (!username) {
      errors.username = t('auth.fillFields');
    } else if (username.length < 3 || username.length > 20) {
      errors.username = t('auth.shortUsername');
    } else if (!/^[a-z0-9_.]+$/.test(username)) {
      errors.username = t('auth.invalidUsername');
    } else if (usernameState.available === false && !usernameState.checking) {
      errors.username = t('auth.usernameTaken');
    }
    
    if (!form.email) {
      errors.email = t('auth.fillFields');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t('auth.invalidEmail');
    }
    
    if (!form.password) {
      errors.password = t('auth.fillFields');
    } else if (form.password.length < 6) {
      errors.password = t('auth.shortPassword');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setBusy(true);
    try {
      const cleanedUsername = form.username.replace(/^@/, '').toLowerCase();
      await register({
        ...form,
        username: cleanedUsername,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.displayMessage || t('auth.error');
      if (errorMessage.includes('username')) {
        Alert.alert(t('common.error'), t('auth.userExists'));
      } else if (errorMessage.includes('email')) {
        Alert.alert(t('common.error'), t('auth.userExists'));
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUsernameChange = (text) => {
    let cleaned = text.trim();
    if (!cleaned.startsWith('@')) {
      cleaned = '@' + cleaned;
    }
    cleaned = cleaned.replace(/[^@a-z0-9_.]/gi, '').toLowerCase();
    if (cleaned.split('@').length > 2) {
      cleaned = '@' + cleaned.split('@').join('');
    }
    setForm({ ...form, username: cleaned });
  };

  const getUsernameStatus = () => {
    if (!form.username || form.username === '@') return null;
    if (usernameState.checking) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <ActivityIndicator size="small" color={colors.inkMuted} />
          <Text style={{ ...typography.caption, color: colors.inkMuted, marginLeft: 6 }}>
            {t('auth.usernameChecking')}
          </Text>
        </View>
      );
    }
    if (usernameState.error) {
      return (
        <Text style={{ ...typography.caption, color: colors.danger, marginTop: 4 }}>
          {usernameState.error}
        </Text>
      );
    }
    if (usernameState.available === true) {
      return (
        <Text style={{ ...typography.caption, color: colors.success, marginTop: 4 }}>
          ✓ {t('auth.usernameAvailable')}
        </Text>
      );
    }
    if (usernameState.available === false) {
      return (
        <Text style={{ ...typography.caption, color: colors.danger, marginTop: 4 }}>
          {t('auth.usernameTaken')}
        </Text>
      );
    }
    return null;
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
              {t('auth.registerTitle')}
            </Text>
            <Text style={{ ...typography.body, color: colors.inkMuted, marginTop: 6 }}>
              {t('auth.registerSubtitle')}
            </Text>
          </View>

          <PencilFrame filled elevated fillColor={colors.paper} radius={24} padding={20}>
            <View style={{ marginBottom: 12 }}>
              <PencilInput
                label={t('auth.username')}
                value={form.username}
                onChangeText={handleUsernameChange}
                placeholder={t('auth.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {getUsernameStatus()}
              <Text style={{ ...typography.caption, color: colors.inkMuted, marginTop: 4 }}>
                {t('auth.usernameHint')}
              </Text>
              {validationErrors.username && (
                <Text style={{ ...typography.caption, color: colors.danger, marginTop: 4 }}>
                  {validationErrors.username}
                </Text>
              )}
            </View>

            <PencilInput
              label={t('auth.displayName')}
              value={form.displayName}
              onChangeText={(displayName) => setForm({ ...form, displayName })}
              autoCapitalize="words"
              placeholder={t('auth.displayNamePlaceholder')}
              style={{ marginBottom: 12 }}
            />

            <View style={{ marginBottom: 12 }}>
              <PencilInput
                label={t('auth.email')}
                value={form.email}
                onChangeText={(email) => setForm({ ...form, email })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder={t('auth.emailPlaceholder')}
              />
              {validationErrors.email && (
                <Text style={{ ...typography.caption, color: colors.danger, marginTop: 4 }}>
                  {validationErrors.email}
                </Text>
              )}
            </View>

            <View style={{ marginBottom: 18 }}>
              <PencilInput
                label={t('auth.password')}
                value={form.password}
                onChangeText={(password) => setForm({ ...form, password })}
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
              />
              {validationErrors.password && (
                <Text style={{ ...typography.caption, color: colors.danger, marginTop: 4 }}>
                  {validationErrors.password}
                </Text>
              )}
            </View>

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
