import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';

function Stat({ value, label }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ ...typography.title, color: colors.ink }}>{value ?? 0}</Text>
      <Text style={{ ...typography.caption, color: colors.inkMuted }}>{label}</Text>
    </View>
  );
}

export function ProfileStats({ postsCount, friendsCount }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: colors.lineSoft,
      }}
    >
      <Stat value={postsCount} label={t('profile.posts')} />
      <View style={{ width: 1, backgroundColor: colors.lineSoft }} />
      <Stat value={friendsCount} label={t('profile.friends')} />
    </View>
  );
}
