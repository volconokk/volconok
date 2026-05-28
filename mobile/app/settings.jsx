import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../src/components/PaperBackground';
import { PencilFrame } from '../src/components/PencilFrame';
import { PencilButton } from '../src/components/PencilButton';
import { Header } from '../src/components/Header';
import { useTheme } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/store/useAuth';
import { setLanguage } from '../src/i18n';
import { CheckIcon, MoonIcon, SunIcon, GlobeIcon, LogoutIcon } from '../src/components/icons';

function Row({ icon, title, right, onPress }) {
  const { colors, typography } = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      {icon ? <View style={{ marginRight: 12 }}>{icon}</View> : null}
      <Text style={{ ...typography.body, color: colors.ink, flex: 1 }}>{title}</Text>
      {right}
    </View>
  );
  if (onPress)
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
        {content}
      </Pressable>
    );
  return content;
}

function Section({ title, children }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          ...typography.caption,
          color: colors.inkMuted,
          textTransform: 'uppercase',
          marginBottom: 8,
          marginHorizontal: 6,
        }}
      >
        {title}
      </Text>
      <PencilFrame filled fillColor={colors.paper} radius={18} padding={0}>
        {children}
      </PencilFrame>
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, typography, setMode, mode } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, updateSettings, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const settings = user?.settings || {};
  const notifs = settings.notifications || {};

  const changeLanguage = async (lng) => {
    setLanguage(lng);
    if (user) await updateSettings({ language: lng });
  };

  const changeTheme = async (themeMode) => {
    setMode(themeMode);
    if (user) await updateSettings({ theme: themeMode });
  };

  const toggleNotif = async (key, value) => {
    if (!user) return;
    setBusy(true);
    try {
      await updateSettings({ notifications: { ...notifs, [key]: value } });
    } finally {
      setBusy(false);
    }
  };

  const Tick = () => <CheckIcon size={18} color={colors.ink} />;

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('settings.title')} />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Section title={t('settings.language')}>
            <Row
              icon={<GlobeIcon size={20} color={colors.ink} />}
              title="Русский"
              right={i18n.language === 'ru' ? <Tick /> : null}
              onPress={() => changeLanguage('ru')}
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              icon={<GlobeIcon size={20} color={colors.ink} />}
              title="Română"
              right={i18n.language === 'ro' ? <Tick /> : null}
              onPress={() => changeLanguage('ro')}
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              icon={<GlobeIcon size={20} color={colors.ink} />}
              title="English"
              right={i18n.language === 'en' ? <Tick /> : null}
              onPress={() => changeLanguage('en')}
            />
          </Section>

          <Section title={t('settings.theme')}>
            <Row
              icon={<SunIcon size={20} color={colors.ink} />}
              title={t('settings.themeLight')}
              right={mode === 'light' ? <Tick /> : null}
              onPress={() => changeTheme('light')}
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              icon={<MoonIcon size={20} color={colors.ink} />}
              title={t('settings.themeDark')}
              right={mode === 'dark' ? <Tick /> : null}
              onPress={() => changeTheme('dark')}
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              title={t('settings.themeSystem')}
              right={mode === 'system' ? <Tick /> : null}
              onPress={() => changeTheme('system')}
            />
          </Section>

          <Section title={t('settings.notifications')}>
            <Row
              title={t('settings.notifMessages')}
              right={
                <Switch
                  value={notifs.messages !== false}
                  onValueChange={(v) => toggleNotif('messages', v)}
                  trackColor={{ true: colors.ink, false: colors.lineSoft }}
                  thumbColor={colors.paper}
                  disabled={busy}
                />
              }
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              title={t('settings.notifLikes')}
              right={
                <Switch
                  value={notifs.likes !== false}
                  onValueChange={(v) => toggleNotif('likes', v)}
                  trackColor={{ true: colors.ink, false: colors.lineSoft }}
                  thumbColor={colors.paper}
                  disabled={busy}
                />
              }
            />
            <View style={{ height: 1, backgroundColor: colors.lineSoft }} />
            <Row
              title={t('settings.notifFriends')}
              right={
                <Switch
                  value={notifs.friendRequests !== false}
                  onValueChange={(v) => toggleNotif('friendRequests', v)}
                  trackColor={{ true: colors.ink, false: colors.lineSoft }}
                  thumbColor={colors.paper}
                  disabled={busy}
                />
              }
            />
          </Section>

          <Section title={t('settings.about')}>
            <Row title="Volconok 1.0.0" />
          </Section>

          <PencilButton
            label={t('settings.logout')}
            variant="ghost"
            icon={<LogoutIcon size={18} color={colors.ink} />}
            onPress={() =>
              Alert.alert(t('settings.logout'), '', [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('settings.logout'),
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ])
            }
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    </PaperBackground>
  );
}
