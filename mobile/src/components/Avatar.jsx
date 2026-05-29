import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';

export function Avatar({ 
  uri, 
  name = '', 
  size = 44, 
  ring = true, 
  online,
  badge,
  verified,
  sketch = false, // Add sketch-style border
}) {
  const { colors } = useTheme();
  const initials = (name || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dotSize = Math.max(10, Math.round(size * 0.28));
  const badgeSize = Math.max(16, Math.round(size * 0.35));

  return (
    <View style={{ width: size, height: size }}>
      {/* Sketch-style border decoration */}
      {sketch && (
        <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-3deg' }] }]}>
          <Svg width={size + 4} height={size + 4} style={{ position: 'absolute', top: -2, left: -2 }}>
            <Circle
              cx={(size + 4) / 2}
              cy={(size + 4) / 2}
              r={size / 2}
              stroke={colors.inkGhost}
              strokeWidth={1}
              fill="none"
              strokeDasharray="4,4"
            />
          </Svg>
        </View>
      )}
      
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          borderWidth: ring ? 1.5 : 0,
          borderColor: colors.line,
          overflow: 'hidden',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: colors.ink }}>
              {initials}
            </Text>
          </View>
        )}
      </View>
      
      {/* Online indicator */}
      {online && (
        <View
          style={[
            styles.statusDot,
            {
              right: 0,
              bottom: 0,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: colors.success,
              borderColor: colors.paper,
            },
          ]}
        />
      )}
      
      {/* Verified badge */}
      {verified && (
        <View
          style={[
            styles.verifiedBadge,
            {
              width: badgeSize,
              height: badgeSize,
              right: -2,
              bottom: -2,
            },
          ]}
        >
          <Svg width={badgeSize} height={badgeSize} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" fill={colors.accent} />
            <Path
              d="M8 12 L11 15 L16 9"
              stroke={colors.accentInk}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
      
      {/* Custom badge (emoji or icon) */}
      {badge && !verified && (
        <View
          style={[
            styles.customBadge,
            {
              minWidth: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: colors.paper,
              borderColor: colors.lineSoft,
            },
          ]}
        >
          {typeof badge === 'string' ? (
            <Text style={{ fontSize: badgeSize * 0.7 }}>{badge}</Text>
          ) : (
            badge
          )}
        </View>
      )}
    </View>
  );
}

// Avatar group for showing multiple users
export function AvatarGroup({ users = [], max = 3, size = 36 }) {
  const { colors, typography } = useTheme();
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <View style={styles.group}>
      {displayUsers.map((user, index) => (
        <View
          key={user.id || index}
          style={[
            styles.groupItem,
            {
              marginLeft: index > 0 ? -size * 0.3 : 0,
              zIndex: max - index,
            },
          ]}
        >
          <Avatar
            uri={user.avatarUrl}
            name={user.displayName || user.name}
            size={size}
            ring
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.remainingBadge,
            {
              marginLeft: -size * 0.3,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surface,
              borderColor: colors.line,
            },
          ]}
        >
          <Text style={{ ...typography.caption, color: colors.ink, fontWeight: '700' }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

// Story-style avatar with gradient ring
export function StoryAvatar({ uri, name, size = 64, hasStory, seen }) {
  const { colors } = useTheme();
  const ringSize = size + 6;

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
      {hasStory && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: ringSize / 2,
              borderWidth: 2,
              borderColor: seen ? colors.inkGhost : colors.ink,
            },
          ]}
        />
      )}
      <Avatar uri={uri} name={name} size={size} ring={!hasStory} />
    </View>
  );
}

const styles = StyleSheet.create({
  initialsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
  },
  verifiedBadge: {
    position: 'absolute',
  },
  customBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 2,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {},
  remainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
