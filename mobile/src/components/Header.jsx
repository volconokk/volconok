import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '../theme/ThemeProvider';
import { BackIcon } from './icons';

export function Header({ title, right, back, subtitle, onBack }) {
  const { colors, typography } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to tabs if no history
      router.replace('/(tabs)/feed');
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {back ? (
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: 8 })}
        >
          <BackIcon color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.title, color: colors.ink }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ ...typography.caption, color: colors.inkMuted }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={{ marginLeft: 8 }}>{right}</View> : null}
    </View>
  );
}
