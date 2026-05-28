import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { PencilButton } from '../../src/components/PencilButton';
import { Header } from '../../src/components/Header';
import { KeyboardAwareForm } from '../../src/components/KeyboardAvoidingScreen';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useAuth } from '../../src/store/useAuth';

export default function EditProfileScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
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
        <KeyboardAwareForm
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16 }}
        >
          <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
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
                maxLength={64}
                style={{ marginBottom: 12 }}
              />
              <PencilInput
                label={t('profile.bio')}
                value={form.bio}
                onChangeText={(bio) => setForm({ ...form, bio })}
                placeholder={t('profile.bioPlaceholder')}
                multiline
                numberOfLines={4}
                maxLength={280}
                showCounter
                autoCapitalize="sentences"
                style={{ marginBottom: 18 }}
              />
              <PencilButton label={t('common.save')} onPress={save} loading={busy} fullWidth />
            </PencilFrame>
          </View>
        </KeyboardAwareForm>
      </SafeAreaView>
    </PaperBackground>
  );
}
