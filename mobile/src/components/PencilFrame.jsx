import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// A clean bordered container that renders identically on every device.
// (Previously an SVG sketch frame which glitched on mobile.) The API is kept
// stable so all existing screens keep working without changes.
export function PencilFrame({
  children,
  style,
  radius = 18,
  strokeWidth = 1.5,
  filled = false,
  color,
  fillColor,
  padding = 12,
  elevated = false,
  // legacy props kept for compatibility (ignored):
  jitter,
}) {
  const { colors, shadow } = useTheme();

  const isTransparentBorder = color === 'transparent';
  const borderColor = isTransparentBorder ? 'transparent' : color || colors.line;
  const backgroundColor = filled ? fillColor || colors.paper : 'transparent';

  return (
    <View
      style={[
        {
          padding,
          borderRadius: radius,
          borderWidth: isTransparentBorder ? 0 : strokeWidth,
          borderColor,
          backgroundColor,
        },
        elevated ? shadow(1) : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
