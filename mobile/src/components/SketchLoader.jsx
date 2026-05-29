import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Text } from 'react-native';
import Svg, { Path, Circle, Line, G } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Pencil writing animation loader
export function PencilLoader({ size = 60, color }) {
  const { colors } = useTheme();
  const c = color || colors.ink;
  
  const rotation = useRef(new Animated.Value(0)).current;
  const scribble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const scribbleAnim = Animated.loop(
      Animated.timing(scribble, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    rotateAnim.start();
    scribbleAnim.start();

    return () => {
      rotateAnim.stop();
      scribbleAnim.stop();
    };
  }, [rotation, scribble]);

  const rotate = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Scribble path being drawn */}
      <View style={[styles.scribbleContainer, { width: size }]}>
        <Animated.View
          style={{
            width: scribble.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            overflow: 'hidden',
          }}
        >
          <Svg width={size} height={10} viewBox={`0 0 ${size} 10`}>
            <Path
              d={`M0,5 Q${size * 0.15},0 ${size * 0.25},5 T${size * 0.5},5 T${size * 0.75},5 T${size},5`}
              stroke={c}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </View>
      
      {/* Animated pencil */}
      <Animated.View
        style={{
          position: 'absolute',
          right: 0,
          transform: [{ rotate }, { translateX: 5 }],
        }}
      >
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
          <Path
            d="M3 21l4-1 13-13-3-3L4 17z"
            stroke={c}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1="14" y1="6" x2="18" y2="10" stroke={c} strokeWidth={1.6} />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Dots typing/loading indicator
export function DotsLoader({ size = 8, color, count = 3 }) {
  const { colors } = useTheme();
  const c = color || colors.inkMuted;
  const dots = useRef(Array(count).fill(0).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => animations.forEach((anim) => anim.stop());
  }, [dots]);

  return (
    <View style={styles.dotsContainer}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: c,
              marginHorizontal: size / 3,
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -size],
                  }),
                },
                {
                  scale: dot.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2, 1],
                  }),
                },
              ],
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

// Skeleton loading placeholder with sketch effect
export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: colors.surfaceAlt,
          opacity: shimmer.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.6, 0.3],
          }),
        }}
      />
      {/* Add crosshatch pattern for sketch effect */}
      <View style={styles.sketchPattern}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <G opacity={0.1}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Line
                key={i}
                x1={i * 15}
                y1={0}
                x2={i * 15 + 50}
                y2={height}
                stroke={colors.inkGhost}
                strokeWidth={0.5}
              />
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

// Full-screen loading overlay
export function LoadingOverlay({ visible, message }) {
  const { colors, typography } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <View style={[styles.overlayContent, { backgroundColor: colors.paper }]}>
        <PencilLoader size={80} />
        {message && (
          <Text style={[typography.body, { color: colors.inkMuted, marginTop: 16 }]}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// Pull-to-refresh pencil animation
export function RefreshPencil({ progress, color }) {
  const { colors } = useTheme();
  const c = color || colors.ink;

  // Progress is 0-1 based on pull distance
  const rotation = progress * 360;
  const scale = Math.min(1, progress);

  return (
    <View style={styles.refreshContainer}>
      <Animated.View
        style={{
          transform: [
            { rotate: `${rotation}deg` },
            { scale },
          ],
        }}
      >
        <Svg width={32} height={32} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.5} fill="none" opacity={0.3} />
          <Path
            d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21"
            stroke={c}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={1.5} fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scribbleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dot: {},
  sketchPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
});
