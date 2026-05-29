import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, Animated, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { HeartIcon, LoveIcon, LaughIcon, WowIcon, SadIcon, AngryIcon, FireIcon } from './icons';

const REACTIONS = [
  { type: 'like', Icon: HeartIcon, label: '❤️' },
  { type: 'love', Icon: LoveIcon, label: '😍' },
  { type: 'laugh', Icon: LaughIcon, label: '😂' },
  { type: 'wow', Icon: WowIcon, label: '😮' },
  { type: 'sad', Icon: SadIcon, label: '😢' },
  { type: 'fire', Icon: FireIcon, label: '🔥' },
];

export function ReactionPicker({ visible, onSelect, onClose, currentReaction }) {
  const { colors, shadow } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(REACTIONS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();

      // Stagger item animations
      itemAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 40),
          Animated.spring(anim, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      itemAnims.forEach((anim) => anim.setValue(0));
    }
  }, [visible, scaleAnim, itemAnims]);

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        style={[
          styles.picker,
          {
            backgroundColor: colors.paper,
            borderColor: colors.line,
            ...shadow(2),
          },
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          },
        ]}
      >
        {REACTIONS.map((reaction, index) => {
          const isActive = currentReaction === reaction.type;
          return (
            <Animated.View
              key={reaction.type}
              style={{
                transform: [
                  {
                    scale: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    translateY: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                opacity: itemAnims[index],
              }}
            >
              <Pressable
                onPress={() => {
                  onSelect(reaction.type);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.reactionButton,
                  {
                    backgroundColor: isActive ? colors.surface : 'transparent',
                    transform: [{ scale: pressed ? 1.3 : 1 }],
                  },
                ]}
              >
                <reaction.Icon
                  size={26}
                  color={isActive ? colors.ink : colors.inkMuted}
                  filled={isActive}
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    </Pressable>
  );
}

// Compact reaction display for posts
export function ReactionSummary({ reactions, totalCount, myReaction, onPress, onLongPress }) {
  const { colors, typography } = useTheme();

  if (totalCount === 0) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.summary, { opacity: pressed ? 0.6 : 1 }]}
      >
        <HeartIcon size={20} color={colors.inkMuted} />
        <Text style={[typography.caption, { color: colors.inkMuted, marginLeft: 4 }]}>
          0
        </Text>
      </Pressable>
    );
  }

  // Get top 3 reaction types
  const sortedReactions = Object.entries(reactions || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.summary, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={styles.iconStack}>
        {sortedReactions.map(([type], index) => {
          const reaction = REACTIONS.find((r) => r.type === type);
          if (!reaction) return null;
          return (
            <View
              key={type}
              style={[
                styles.stackedIcon,
                {
                  backgroundColor: colors.paper,
                  borderColor: colors.lineSoft,
                  marginLeft: index === 0 ? 0 : -8,
                  zIndex: 10 - index,
                },
              ]}
            >
              <reaction.Icon
                size={14}
                color={myReaction === type ? colors.ink : colors.inkSoft}
                filled={myReaction === type}
              />
            </View>
          );
        })}
      </View>
      <Text
        style={[
          typography.caption,
          { color: myReaction ? colors.ink : colors.inkMuted, marginLeft: 6 },
        ]}
      >
        {totalCount}
      </Text>
    </Pressable>
  );
}

// Double-tap handler hook
export function useDoubleTap(callback, delay = 300) {
  const lastTap = useRef(0);

  return () => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };
}

// Heart animation for double-tap like
export function HeartBurst({ visible, onComplete }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0);
      opacity.setValue(1);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => onComplete?.());
    }
  }, [visible, scale, opacity, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.heartBurst,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <HeartIcon size={80} color={colors.ink} filled />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  heartBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
  },
});
