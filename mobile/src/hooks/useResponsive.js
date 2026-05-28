import { useWindowDimensions } from 'react-native';

// Centralized responsive breakpoints + derived layout values so screens
// render comfortably on phones, large phones and tablets.
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isSmall = width < 360;
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Cap the readable content width on big screens and center it.
  const contentMaxWidth = isTablet ? 640 : width;
  const horizontalPadding = isTablet ? 24 : isSmall ? 12 : 16;

  // Scale a base size gently for small/large screens.
  const scale = (n) => {
    if (isSmall) return Math.round(n * 0.92);
    if (isTablet) return Math.round(n * 1.08);
    return n;
  };

  return {
    width,
    height,
    isSmall,
    isTablet,
    isLandscape,
    contentMaxWidth,
    horizontalPadding,
    scale,
  };
}
