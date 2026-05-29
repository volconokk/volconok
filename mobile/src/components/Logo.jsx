import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, G, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedG = Animated.createAnimatedComponent(G);

// Animated logo with pencil writing effect
export function AnimatedLogo({ size = 80, color, animated = true }) {
  const { colors } = useTheme();
  const c = color || colors.ink;
  
  const pencilRotation = useRef(new Animated.Value(0)).current;
  const drawProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Pencil wiggle animation
    const pencilAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pencilRotation, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pencilRotation, {
          toValue: -1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pencilRotation, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Draw progress animation
    const drawAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(drawProgress, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(drawProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    pencilAnim.start();
    drawAnim.start();

    return () => {
      pencilAnim.stop();
      drawAnim.stop();
    };
  }, [animated, pencilRotation, drawProgress]);

  const pencilTransform = pencilRotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Paper/Canvas background */}
        <Rect 
          x="15" 
          y="15" 
          width="70" 
          height="70" 
          rx="8" 
          stroke={c} 
          strokeWidth="2" 
          fill="none" 
          opacity="0.3"
        />
        
        {/* Decorative corner fold */}
        <Path d="M70 15 L85 15 L85 30 Z" stroke={c} strokeWidth="1.5" fill="none" opacity="0.2" />
        
        {/* Letter V (for Volconok) - hand-drawn style */}
        <Path
          d="M30 35 L50 70 L70 35"
          stroke={c}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Pencil */}
        <Animated.View style={{ position: 'absolute', transform: [{ rotate: pencilTransform }] }}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <G transform="translate(58, 55) rotate(-45)">
              {/* Pencil body */}
              <Rect x="0" y="0" width="8" height="28" fill={c} opacity="0.2" rx="1" />
              <Rect x="0" y="0" width="8" height="28" stroke={c} strokeWidth="1.5" fill="none" rx="1" />
              
              {/* Pencil tip */}
              <Path d="M0 28 L4 38 L8 28" stroke={c} strokeWidth="1.5" fill="none" />
              
              {/* Eraser band */}
              <Line x1="0" y1="5" x2="8" y2="5" stroke={c} strokeWidth="1" />
            </G>
          </Svg>
        </Animated.View>
        
        {/* Sketch marks/doodles */}
        <Circle cx="25" cy="80" r="3" stroke={c} strokeWidth="1" fill="none" opacity="0.3" />
        <Path d="M72 75 Q77 72 82 75 Q77 78 72 75" stroke={c} strokeWidth="1" fill="none" opacity="0.3" />
      </Svg>
    </View>
  );
}

// Simple static logo
export function Logo({ size = 48, color }) {
  const { colors } = useTheme();
  const c = color || colors.ink;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Paper */}
      <Rect x="6" y="6" width="36" height="36" rx="4" stroke={c} strokeWidth="1.5" fill="none" />
      
      {/* V letter */}
      <Path
        d="M14 16 L24 34 L34 16"
        stroke={c}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pencil accent */}
      <G transform="translate(32, 30) rotate(-45)">
        <Rect x="0" y="0" width="4" height="14" stroke={c} strokeWidth="1" fill="none" rx="0.5" />
        <Path d="M0 14 L2 18 L4 14" stroke={c} strokeWidth="1" fill="none" />
      </G>
    </Svg>
  );
}

// Icon-only version for tab bar
export function LogoIcon({ size = 24, color }) {
  const { colors } = useTheme();
  const c = color || colors.ink;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 7 L12 18 L18 7"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
