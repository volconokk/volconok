import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

// Generate a slightly wobbly rectangle path for sketch effect
function generateSketchPath(width, height, wobble = 2) {
  const w = width - wobble * 2;
  const h = height - wobble * 2;
  const r = Math.random;
  
  // Create slightly imperfect corners
  const tl = { x: wobble + r() * wobble, y: wobble + r() * wobble };
  const tr = { x: w + wobble - r() * wobble, y: wobble + r() * wobble };
  const br = { x: w + wobble - r() * wobble, y: h + wobble - r() * wobble };
  const bl = { x: wobble + r() * wobble, y: h + wobble - r() * wobble };

  return `M${tl.x},${tl.y} L${tr.x},${tr.y} L${br.x},${br.y} L${bl.x},${bl.y} Z`;
}

// A clean bordered container with optional sketch-style effects.
export function PencilFrame({
  children,
  style,
  radius = 18,
  strokeWidth = 1.5,
  filled = false,
  color,
  fillColor,
  padding = 12,
  elevated = false,
  sketch = false, // Enable hand-drawn sketch style
  dashed = false, // Dashed border
  cornerFold = false, // Paper corner fold effect
}) {
  const { colors, shadow } = useTheme();

  const isTransparentBorder = color === 'transparent';
  const borderColor = isTransparentBorder ? 'transparent' : color || colors.line;
  const backgroundColor = filled ? fillColor || colors.paper : 'transparent';

  // Dashed border style
  const dashedStyle = dashed ? {
    borderStyle: 'dashed',
  } : {};

  return (
    <View
      style={[
        styles.container,
        {
          padding,
          borderRadius: radius,
          borderWidth: isTransparentBorder ? 0 : strokeWidth,
          borderColor,
          backgroundColor,
          ...dashedStyle,
        },
        elevated ? shadow(1) : null,
        style,
      ]}
    >
      {/* Corner fold decoration */}
      {cornerFold && (
        <View style={[styles.cornerFold, { borderColor: colors.lineSoft }]}>
          <View style={[styles.cornerFoldInner, { backgroundColor: colors.surface }]} />
        </View>
      )}
      
      {/* Sketch overlay for hand-drawn effect */}
      {sketch && (
        <View style={styles.sketchOverlay} pointerEvents="none">
          <Svg style={StyleSheet.absoluteFill}>
            {/* Add subtle sketch lines in corners */}
            <Line
              x1="4"
              y1="4"
              x2="12"
              y2="4"
              stroke={colors.inkGhost}
              strokeWidth={0.5}
            />
            <Line
              x1="4"
              y1="4"
              x2="4"
              y2="12"
              stroke={colors.inkGhost}
              strokeWidth={0.5}
            />
          </Svg>
        </View>
      )}
      
      {children}
    </View>
  );
}

// Sketch-style card with notebook paper lines
export function NotebookCard({ children, style, lines = 4, ...props }) {
  const { colors } = useTheme();

  return (
    <PencilFrame {...props} style={[style]}>
      {/* Notebook lines background */}
      <View style={styles.linesContainer} pointerEvents="none">
        {Array.from({ length: lines }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.notebookLine,
              { backgroundColor: colors.lineSketch, top: 28 + i * 24 },
            ]}
          />
        ))}
        {/* Red margin line */}
        <View style={[styles.marginLine, { backgroundColor: colors.danger + '30' }]} />
      </View>
      {children}
    </PencilFrame>
  );
}

// Sticky note style card
export function StickyNote({ children, style, color, rotation = 0, ...props }) {
  const { colors, shadow } = useTheme();
  
  const noteColors = {
    yellow: '#FFF9C4',
    pink: '#FCE4EC',
    blue: '#E3F2FD',
    green: '#E8F5E9',
    default: colors.paper,
  };

  const bgColor = noteColors[color] || noteColors.default;

  return (
    <View
      style={[
        styles.stickyNote,
        {
          backgroundColor: bgColor,
          transform: [{ rotate: `${rotation}deg` }],
          ...shadow(2),
        },
        style,
      ]}
    >
      {/* Tape effect at top */}
      <View style={[styles.tape, { backgroundColor: colors.inkGhost + '60' }]} />
      <View style={styles.stickyContent}>{children}</View>
    </View>
  );
}

// Polaroid-style image frame
export function PolaroidFrame({ children, caption, style }) {
  const { colors, shadow, typography } = useTheme();

  return (
    <View
      style={[
        styles.polaroid,
        {
          backgroundColor: colors.paper,
          borderColor: colors.lineSoft,
          ...shadow(2),
        },
        style,
      ]}
    >
      <View style={styles.polaroidImage}>{children}</View>
      {caption && (
        <View style={styles.polaroidCaption}>
          <View style={[styles.polaroidCaptionText, { color: colors.ink }]}>
            {caption}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  sketchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerFold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
  },
  cornerFoldInner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 20,
    borderRightWidth: 20,
    borderTopColor: 'transparent',
    borderRightColor: 'white',
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  notebookLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  marginLine: {
    position: 'absolute',
    left: 32,
    top: 0,
    bottom: 0,
    width: 1,
  },
  stickyNote: {
    borderRadius: 2,
    minWidth: 120,
    minHeight: 100,
  },
  tape: {
    position: 'absolute',
    top: -8,
    left: '30%',
    width: '40%',
    height: 16,
    borderRadius: 2,
    transform: [{ rotate: '-2deg' }],
  },
  stickyContent: {
    padding: 16,
    paddingTop: 12,
  },
  polaroid: {
    padding: 8,
    paddingBottom: 32,
    borderWidth: 1,
    borderRadius: 2,
  },
  polaroidImage: {
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  polaroidCaption: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  polaroidCaptionText: {
    fontFamily: 'serif',
    fontSize: 12,
    textAlign: 'center',
  },
});
