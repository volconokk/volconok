import React from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from '../hooks/useKeyboard';
import { useTheme } from '../theme/ThemeProvider';

// A reliable, JS-only replacement for KeyboardAvoidingView that works in
// Expo Go on both iOS and Android (including Android edge-to-edge where the
// window does not auto-resize). The `footer` (e.g. a message input bar) is
// lifted to sit right above the keyboard, and the scrollable `children`
// area shrinks to fill the remaining space.
export function KeyboardAvoidingScreen({ children, footer, onKeyboardChange }) {
  const insets = useSafeAreaInsets();
  const kbHeight = useKeyboardHeight();
  const { colors } = useTheme();

  // When the keyboard is open the bottom safe-area inset is already covered
  // by the keyboard, so subtract it to avoid an extra gap.
  const lift = kbHeight > 0 ? Math.max(kbHeight - insets.bottom, 0) : 0;

  React.useEffect(() => {
    onKeyboardChange?.(kbHeight > 0);
  }, [kbHeight, onKeyboardChange]);

  // Keep the footer clear of the home indicator when the keyboard is hidden.
  const footerPaddingBottom = kbHeight > 0 ? 0 : insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      <View style={{ marginBottom: lift, paddingBottom: footerPaddingBottom, backgroundColor: colors.paper }}>
        {footer}
      </View>
    </View>
  );
}

// A scroll container for forms that adds bottom padding equal to the keyboard
// height, so the focused field can always be scrolled above the keyboard.
export function KeyboardAwareForm({ children, contentContainerStyle, ...rest }) {
  const insets = useSafeAreaInsets();
  const kbHeight = useKeyboardHeight();
  const extra = kbHeight > 0 ? Math.max(kbHeight - insets.bottom, 0) + 16 : 0;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[contentContainerStyle, { paddingBottom: extra }]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
