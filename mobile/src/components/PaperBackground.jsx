import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Pattern, Line, Circle, G, Defs } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

// Subtle paper texture patterns
function PaperTexture({ type = 'dots', opacity = 0.03 }) {
  const { colors } = useTheme();

  const patterns = {
    dots: (
      <Pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <Circle cx="10" cy="10" r="0.8" fill={colors.ink} />
      </Pattern>
    ),
    grid: (
      <Pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <Line x1="0" y1="20" x2="20" y2="20" stroke={colors.ink} strokeWidth="0.5" />
        <Line x1="20" y1="0" x2="20" y2="20" stroke={colors.ink} strokeWidth="0.5" />
      </Pattern>
    ),
    lines: (
      <Pattern id="lines" width="10" height="20" patternUnits="userSpaceOnUse">
        <Line x1="0" y1="20" x2="10" y2="20" stroke={colors.ink} strokeWidth="0.3" />
      </Pattern>
    ),
    crosshatch: (
      <Pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
        <Line x1="0" y1="8" x2="8" y2="0" stroke={colors.ink} strokeWidth="0.3" />
        <Line x1="0" y1="0" x2="8" y2="8" stroke={colors.ink} strokeWidth="0.3" />
      </Pattern>
    ),
    noise: (
      <Pattern id="noise" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Random-ish dots for noise texture */}
        <Circle cx="5" cy="8" r="0.5" fill={colors.ink} />
        <Circle cx="18" cy="3" r="0.4" fill={colors.ink} />
        <Circle cx="32" cy="15" r="0.5" fill={colors.ink} />
        <Circle cx="8" cy="25" r="0.4" fill={colors.ink} />
        <Circle cx="25" cy="32" r="0.5" fill={colors.ink} />
        <Circle cx="38" cy="28" r="0.4" fill={colors.ink} />
        <Circle cx="12" cy="38" r="0.5" fill={colors.ink} />
        <Circle cx="35" cy="5" r="0.4" fill={colors.ink} />
      </Pattern>
    ),
  };

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>{patterns[type] || patterns.dots}</Defs>
        <Rect width="100%" height="100%" fill={`url(#${type})`} />
      </Svg>
    </View>
  );
}

export function PaperBackground({ 
  children, 
  style, 
  texture = false, 
  textureType = 'noise',
  textureOpacity = 0.025,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
      {texture && <PaperTexture type={textureType} opacity={textureOpacity} />}
      {children}
    </View>
  );
}

// Notebook-style background with lines
export function NotebookBackground({ children, style, lineSpacing = 28 }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }, style]}>
      {/* Notebook lines */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="notebook" width="100%" height={lineSpacing} patternUnits="userSpaceOnUse">
              <Line 
                x1="0" 
                y1={lineSpacing} 
                x2="100%" 
                y2={lineSpacing} 
                stroke={colors.lineSketch} 
                strokeWidth="0.5" 
              />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#notebook)" />
          {/* Red margin line */}
          <Line x1="40" y1="0" x2="40" y2="100%" stroke={colors.danger} strokeWidth="0.8" opacity="0.2" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

// Graph paper background
export function GraphPaperBackground({ children, style, gridSize = 20 }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <Rect width={gridSize} height={gridSize} fill="none" stroke={colors.lineSketch} strokeWidth="0.3" />
            </Pattern>
            <Pattern id="largeGrid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
              <Rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
              <Rect width={gridSize * 5} height={gridSize * 5} fill="none" stroke={colors.lineSoft} strokeWidth="0.5" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#largeGrid)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
