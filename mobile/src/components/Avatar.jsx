import React from 'react';
import { View, Text, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {ring ? (
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
            stroke={colors.line}
            strokeWidth={1.4}
            fill={colors.paper}
          />
        </Svg>
      ) : null}
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size - 6,
            height: size - 6,
            borderRadius: (size - 6) / 2,
          }}
        />
      ) : (
        <Text style={{ fontSize: size * 0.38, fontWeight: '700', color: colors.ink }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
