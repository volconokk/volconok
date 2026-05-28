import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';

export function PencilButton({
  label,
  onPress,
  variant = 'solid',
  size = 'md',
  disabled,
  loading,
  icon,
  fullWidth,
  style,
}) {
  const { colors, typography, shadow } = useTheme();
  const isSolid = variant === 'solid';
  const isGhost = variant === 'ghost';

  const heights = { sm: 38, md: 50, lg: 56 };
  const fonts = { sm: 13.5, md: 15.5, lg: 17 };

  const inkColor = isSolid ? colors.accentInk : colors.ink;
  const backgroundColor = isSolid ? colors.accent : isGhost ? 'transparent' : colors.paper;
  const borderColor = isGhost ? colors.line : isSolid ? colors.accent : colors.line;

  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: 22,
          borderRadius: heights[size] / 2,
          borderWidth: 1.5,
          borderColor,
          backgroundColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        isSolid && !disabled ? shadow(1) : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={inkColor} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          {label ? (
            <Text
              style={{
                ...typography.subtitle,
                fontSize: fonts[size],
                color: inkColor,
              }}
            >
              {label}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
