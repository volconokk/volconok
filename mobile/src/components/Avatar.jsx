import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Avatar({ uri, name = '', size = 44, ring = true }) {
  const { colors } = useTheme();
  const initials = (name || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: ring ? 1.5 : 0,
        borderColor: colors.line,
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: colors.ink }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
