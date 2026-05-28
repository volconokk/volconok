import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/store/useAuth';
import { useTheme } from '../src/theme/ThemeProvider';

export default function Index() {
  const { colors } = useTheme();
  useAuth();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}
