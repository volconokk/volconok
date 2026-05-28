import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';
import { palettes } from './palette';

const ThemeContext = createContext({
  mode: 'system',
  scheme: 'light',
  colors: palettes.light,
  setMode: () => {},
});

const typography = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: 0.2 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { fontSize: 16, fontWeight: '600', letterSpacing: 0.1 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12.5, fontWeight: '500', letterSpacing: 0.2 },
};

const radii = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };
const spacing = (n) => n * 4;

// Cross-platform soft shadow helper.
function makeShadow(colors, level = 1) {
  if (level === 0) return {};
  const configs = {
    1: { ios: { radius: 8, opacity: 0.08, height: 3 }, elevation: 2 },
    2: { ios: { radius: 16, opacity: 0.12, height: 6 }, elevation: 5 },
  };
  const cfg = configs[level] || configs[1];
  if (Platform.OS === 'android') {
    return { elevation: cfg.elevation, shadowColor: colors.shadow };
  }
  return {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: cfg.ios.height },
    shadowOpacity: cfg.ios.opacity,
    shadowRadius: cfg.ios.radius,
  };
}

export function ThemeProvider({ children, initialMode = 'system' }) {
  const [mode, setMode] = useState(initialMode);
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => sub.remove();
  }, []);

  const scheme = mode === 'system' ? systemScheme : mode;
  const colors = palettes[scheme] || palettes.light;

  const value = useMemo(
    () => ({
      mode,
      scheme,
      colors,
      typography,
      radii,
      spacing,
      shadow: (level) => makeShadow(colors, level),
      setMode,
    }),
    [mode, scheme, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
