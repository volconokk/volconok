import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

// Animated scribble underline - like hand-drawn emphasis
export function ScribbleUnderline({ width = 100, color, animated = true }) {
  const { colors } = useTheme();
  const c = color || colors.scribble;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(1);
    }
  }, [animated, opacity]);

  // Create a wavy, hand-drawn looking path
  const wavyPath = `M0,6 Q${width * 0.1},2 ${width * 0.2},6 T${width * 0.4},6 T${width * 0.6},6 T${width * 0.8},6 T${width},6`;

  return (
    <Animated.View style={{ opacity, width, height: 12 }}>
      <Svg width={width} height={12} viewBox={`0 0 ${width} 12`}>
        <Path
          d={wavyPath}
          stroke={c}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

// Crosshatch pattern for shadows/fills - classic pencil shading
export function CrosshatchPattern({ width = 40, height = 40, density = 4, color }) {
  const { colors } = useTheme();
  const c = color || colors.inkGhost;

  const lines = [];
  const spacing = height / density;

  for (let i = 0; i < density + 2; i++) {
    const y = i * spacing - spacing / 2;
    lines.push(
      <Line
        key={`h${i}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y + width * 0.3}
        stroke={c}
        strokeWidth={0.8}
      />
    );
    lines.push(
      <Line
        key={`v${i}`}
        x1={i * spacing}
        y1={0}
        x2={i * spacing + height * 0.3}
        y2={height}
        stroke={c}
        strokeWidth={0.6}
      />
    );
  }

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', opacity: 0.3 }}>
      <G>{lines}</G>
    </Svg>
  );
}

// Small doodle decorations
export function Doodle({ type = 'star', size = 20, color }) {
  const { colors } = useTheme();
  const c = color || colors.inkFaint;

  const doodles = {
    star: (
      <Path
        d="M10 2l2.5 5 5.5 1-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-1z"
        stroke={c}
        strokeWidth={1.2}
        fill="none"
      />
    ),
    heart: (
      <Path
        d="M10 18s-7-4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5-7 9-7 9z"
        stroke={c}
        strokeWidth={1.2}
        fill="none"
      />
    ),
    circle: (
      <>
        <Circle cx="10" cy="10" r="7" stroke={c} strokeWidth={1.2} fill="none" />
        <Circle cx="10" cy="10" r="3" stroke={c} strokeWidth={0.8} fill="none" />
      </>
    ),
    spiral: (
      <Path
        d="M10 10 Q12 8 14 10 Q16 12 14 14 Q12 16 10 14 Q8 12 10 10 Q11 9 12 10"
        stroke={c}
        strokeWidth={1.2}
        fill="none"
      />
    ),
    squiggle: (
      <Path
        d="M2 10 Q5 5 8 10 T14 10 T20 10"
        stroke={c}
        strokeWidth={1.2}
        fill="none"
      />
    ),
    arrow: (
      <>
        <Line x1="4" y1="10" x2="16" y2="10" stroke={c} strokeWidth={1.2} />
        <Path d="M12 6 L16 10 L12 14" stroke={c} strokeWidth={1.2} fill="none" />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {doodles[type] || doodles.star}
    </Svg>
  );
}

// Animated typing indicator with pencil writing effect
export function PencilTyping({ color }) {
  const { colors } = useTheme();
  const c = color || colors.inkMuted;
  
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (value, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c,
    marginHorizontal: 2,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  });

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
}

// Paper fold corner decoration
export function PaperCorner({ size = 24, position = 'topRight', color }) {
  const { colors } = useTheme();
  const c = color || colors.lineSoft;

  const positionStyle = {
    topRight: { top: 0, right: 0 },
    topLeft: { top: 0, left: 0, transform: [{ scaleX: -1 }] },
    bottomRight: { bottom: 0, right: 0, transform: [{ scaleY: -1 }] },
    bottomLeft: { bottom: 0, left: 0, transform: [{ scale: -1 }] },
  };

  return (
    <View style={[styles.cornerContainer, positionStyle[position]]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M0 0 L24 0 L24 24 Z" fill={colors.surface} />
        <Path d="M0 0 L24 24" stroke={c} strokeWidth={1} />
      </Svg>
    </View>
  );
}

// Sketch-style divider line
export function SketchDivider({ style, color }) {
  const { colors } = useTheme();
  const c = color || colors.lineSketch;

  return (
    <View style={[styles.divider, style]}>
      <View style={[styles.dividerLine, { backgroundColor: c }]} />
      <Doodle type="circle" size={12} color={c} />
      <View style={[styles.dividerLine, { backgroundColor: c }]} />
    </View>
  );
}

// Animated pencil cursor (for loading states)
export function PencilCursor({ size = 32, color }) {
  const { colors } = useTheme();
  const c = color || colors.ink;
  const rotation = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const posAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(position, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(position, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotAnim.start();
    posAnim.start();

    return () => {
      rotAnim.stop();
      posAnim.stop();
    };
  }, [rotation, position]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-15deg', '0deg', '15deg'],
            }),
          },
          {
            translateX: position.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
          },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M3 21l4-1 13-13-3-3L4 17z"
          stroke={c}
          strokeWidth={1.6}
          fill="none"
        />
        <Line x1="14" y1="6" x2="18" y2="10" stroke={c} strokeWidth={1.6} />
        <Circle cx="3" cy="21" r="1" fill={c} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cornerContainer: {
    position: 'absolute',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
});
