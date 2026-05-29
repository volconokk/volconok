import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';

function Stat({ value, label, onPress }) {
  const { colors, typography } = useTheme();
  
  const content = (
    <View style={{ alignItems: 'center', flex: 1, paddingVertical: 4 }}>
      <Text style={{ ...typography.title, color: colors.ink }}>{value ?? 0}</Text>
      <Text style={{ ...typography.caption, color: colors.inkMuted }}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={{ flex: 1 }}>{content}</View>;
}

export function ProfileStats({ postsCount, friendsCount, onFriendsPress, onPostsPress }) {
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
      <Stat value={postsCount} label={t('profile.posts')} onPress={onPostsPress} />
      <View style={{ width: 1, backgroundColor: colors.lineSoft }} />
      <Stat value={friendsCount} label={t('profile.friends')} onPress={onFriendsPress} />
    </View>
  );
}
