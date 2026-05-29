import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Keyboard,
  Platform,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

// Keyboard-aware container for chat-style screens.
// Properly handles keyboard in Expo SDK 54+ on both iOS and Android,
// including Android's edge-to-edge mode where keyboard overlaps content.
export function KeyboardAvoidingScreen({ children, footer, onKeyboardChange }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const animatedMargin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (e) => {
      const kbHeight = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(kbHeight);
      onKeyboardChange?.(true);

      // Calculate lift: keyboard height minus bottom inset (already accounted for)
      const lift = Math.max(0, kbHeight - insets.bottom);
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 200;

      Animated.timing(animatedMargin, {
        toValue: lift,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const handleHide = (e) => {
      setKeyboardHeight(0);
      onKeyboardChange?.(false);

      const duration = Platform.OS === 'ios' ? (e?.duration ?? 200) : 150;

      Animated.timing(animatedMargin, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedMargin, insets.bottom, onKeyboardChange]);

  // Bottom safe area padding only when keyboard is hidden
  const isKeyboardVisible = keyboardHeight > 0;
  const bottomPadding = isKeyboardVisible ? 0 : insets.bottom;

  return (
    <View style={styles.container}>
      {/* Content area - flex: 1 to fill available space */}
      <View style={styles.content}>{children}</View>

      {/* Footer - animated to sit above keyboard */}
      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: bottomPadding,
            marginBottom: animatedMargin,
            backgroundColor: colors.paper,
          },
        ]}
      >
        {footer}
      </Animated.View>
    </View>
  );
}

// Scroll container for forms with keyboard handling.
export function KeyboardAwareForm({ children, contentContainerStyle, ...rest }) {
  const insets = useSafeAreaInsets();
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = (e) => {
      const kbHeight = e?.endCoordinates?.height ?? 0;
      // Add extra padding so inputs can scroll above keyboard
      const extra = kbHeight > 0 ? kbHeight + 24 : 280;
      setKeyboardPadding(extra);
    };

    const handleHide = () => {
      setKeyboardPadding(0);
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { flexGrow: 1, paddingBottom: Math.max(insets.bottom, keyboardPadding) },
        contentContainerStyle,
      ]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    // Footer sits at bottom, animated marginBottom lifts it above keyboard
  },
});
