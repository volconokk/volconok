import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { palettes } from './palette';

const ThemeContext = createContext({
  mode: 'system',
  scheme: 'light',
  colors: palettes.light,
  setMode: () => {},
});

const typography = {
  display: { fontSize: 30, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3 },
  subtitle: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4 },
};

const radii = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };
const spacing = (n) => n * 4;

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
    () => ({ mode, scheme, colors, typography, radii, spacing, setMode }),
    [mode, scheme, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
