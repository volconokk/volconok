import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PencilFrame } from './PencilFrame';
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
  const { colors, typography } = useTheme();
  const isSolid = variant === 'solid';
  const isGhost = variant === 'ghost';

  const heights = { sm: 36, md: 48, lg: 56 };
  const fonts = { sm: 13, md: 15, lg: 17 };

  const inkColor = isSolid ? colors.accentInk : colors.ink;

  return (
    <Pressable
      onPress={() => {
        if (disabled || loading) return;
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      <PencilFrame
        filled={isSolid}
        fillColor={isSolid ? colors.accent : colors.paper}
        color={isGhost ? 'transparent' : colors.line}
        radius={heights[size] / 2}
        padding={0}
        strokeWidth={isGhost ? 0 : 1.6}
        jitter={1.8}
        style={{
          height: heights[size],
          paddingHorizontal: 22,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
        </View>
      </PencilFrame>
    </Pressable>
  );
}
