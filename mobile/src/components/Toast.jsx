import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { CheckIcon, XIcon, InfoIcon, SparkleIcon } from './icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ message, type = 'info', duration = 3000, icon }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, icon }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hide = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message, options = {}) => show({ ...options, message, type: 'success' }),
    [show]
  );

  const error = useCallback(
    (message, options = {}) => show({ ...options, message, type: 'error' }),
    [show]
  );

  const info = useCallback(
    (message, options = {}) => show({ ...options, message, type: 'info' }),
    [show]
  );

  return (
    <ToastContext.Provider value={{ show, hide, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hide} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { colors, typography, shadow } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(onDismiss);
  };

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    
    switch (toast.type) {
      case 'success':
        return <CheckIcon size={20} color={colors.success} />;
      case 'error':
        return <XIcon size={20} color={colors.danger} />;
      default:
        return <SparkleIcon size={20} color={colors.ink} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      default:
        return colors.line;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.paper,
          borderColor: getBorderColor(),
          ...shadow(2),
        },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable onPress={handleDismiss} style={styles.toastContent}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <Text style={[typography.body, styles.message, { color: colors.ink }]} numberOfLines={2}>
          {toast.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Simple inline toast for quick feedback
export function InlineToast({ message, visible, type = 'info', style }) {
  const { colors, typography } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  const getColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      default:
        return colors.inkMuted;
    }
  };

  return (
    <Animated.View style={[styles.inlineToast, { opacity }, style]}>
      <Text style={[typography.caption, { color: getColor() }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    maxWidth: 360,
    width: '100%',
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
  },
  inlineToast: {
    paddingVertical: 4,
  },
});
