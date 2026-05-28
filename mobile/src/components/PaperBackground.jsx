import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function PaperBackground({ children, style }) {
  const { colors } = useTheme();

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {children}
    </View>
  );
}
