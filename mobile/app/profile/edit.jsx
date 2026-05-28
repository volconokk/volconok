import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { PencilButton } from '../../src/components/PencilButton';
import { Header } from '../../src/components/Header';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/store/useAuth';

export default function EditProfileScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile(form);
      router.back();
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('profile.edit')} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <PencilFrame filled fillColor={colors.paper} radius={22} padding={18}>
              <Text
                style={{
                  ...typography.caption,
                  color: colors.inkMuted,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                @{user?.username}
              </Text>
              <PencilInput
                label={t('profile.displayName')}
                value={form.displayName}
                onChangeText={(displayName) => setForm({ ...form, displayName })}
                autoCapitalize="words"
                style={{ marginBottom: 12 }}
              />
              <PencilInput
                label={t('profile.bio')}
                value={form.bio}
                onChangeText={(bio) => setForm({ ...form, bio })}
                multiline
                numberOfLines={4}
                style={{ marginBottom: 18 }}
              />
              <PencilButton label={t('common.save')} onPress={save} loading={busy} fullWidth />
            </PencilFrame>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperBackground>
  );
}
