import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Animated,
  Keyboard,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

// A JS-only keyboard-aware container for chat-style screens.
// The footer (e.g., a message composer) animates above the keyboard,
// and the content area (FlatList/ScrollView) shrinks to fill the rest.
export function KeyboardAvoidingScreen({ children, footer, onKeyboardChange }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const animatedPadding = useRef(new Animated.Value(0)).current;
  const keyboardVisible = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const kbHeight = e?.endCoordinates?.height ?? 0;
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 150;
      // Subtract bottom inset because the keyboard covers the safe area
      const lift = Math.max(0, kbHeight - insets.bottom);

      keyboardVisible.current = true;
      onKeyboardChange?.(true);

      Animated.timing(animatedPadding, {
        toValue: lift,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e) => {
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 200) : 100;

      keyboardVisible.current = false;
      onKeyboardChange?.(false);

      Animated.timing(animatedPadding, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedPadding, insets.bottom, onKeyboardChange]);

  // The bottom padding when keyboard is hidden (to clear home indicator/nav bar)
  const staticBottomPadding = insets.bottom;

  // Interpolate: when keyboard is open, reduce static padding to 0
  const bottomPadding = animatedPadding.interpolate({
    inputRange: [0, 1],
    outputRange: [staticBottomPadding, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      <Animated.View
        style={{
          paddingBottom: bottomPadding,
          marginBottom: animatedPadding,
          backgroundColor: colors.paper,
        }}
      >
        {footer}
      </Animated.View>
    </View>
  );
}

// A scroll container for forms that adds bottom padding when keyboard is open,
// allowing the user to scroll focused inputs into view.
export function KeyboardAwareForm({ children, contentContainerStyle, scrollRef, ...rest }) {
  const insets = useSafeAreaInsets();
  const animatedPadding = useRef(new Animated.Value(0)).current;
  const scrollViewRef = scrollRef || useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const kbHeight = e?.endCoordinates?.height ?? 0;
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 250) : 150;
      const extra = Math.max(0, kbHeight - insets.bottom) + 20;

      Animated.timing(animatedPadding, {
        toValue: extra,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e) => {
      const duration = Platform.OS === 'ios' ? (e?.duration ?? 200) : 100;

      Animated.timing(animatedPadding, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedPadding, insets.bottom]);

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      style={{ flex: 1 }}
      {...rest}
    >
      {children}
      <Animated.View style={{ height: animatedPadding }} />
    </Animated.ScrollView>
  );
}
