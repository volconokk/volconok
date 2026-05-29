import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, G, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeProvider';
import { PencilFrame } from './PencilFrame';

// Sketch-style illustrations for empty states
function EmptyIllustration({ type, size = 120, color }) {
  const { colors } = useTheme();
  const c = color || colors.inkFaint;

  const illustrations = {
    // Empty feed - blank paper with pencil
    feed: (
      <G>
        <Rect x="25" y="20" width="70" height="90" rx="4" stroke={c} strokeWidth="2" fill="none" />
        {/* Paper lines */}
        <Line x1="35" y1="40" x2="85" y2="40" stroke={c} strokeWidth="1" opacity="0.5" />
        <Line x1="35" y1="52" x2="85" y2="52" stroke={c} strokeWidth="1" opacity="0.5" />
        <Line x1="35" y1="64" x2="75" y2="64" stroke={c} strokeWidth="1" opacity="0.5" />
        {/* Pencil */}
        <G transform="translate(70, 85) rotate(-45)">
          <Rect x="0" y="0" width="8" height="35" rx="1" stroke={c} strokeWidth="1.5" fill="none" />
          <Path d="M0 35 L4 45 L8 35" stroke={c} strokeWidth="1.5" fill="none" />
          <Line x1="0" y1="8" x2="8" y2="8" stroke={c} strokeWidth="1" />
        </G>
      </G>
    ),
    
    // No messages - empty chat bubbles
    messages: (
      <G>
        {/* Chat bubble 1 */}
        <Path
          d="M20 30 Q20 20 30 20 H70 Q80 20 80 30 V50 Q80 60 70 60 H40 L25 75 V60 H30 Q20 60 20 50 Z"
          stroke={c}
          strokeWidth="2"
          fill="none"
        />
        {/* Dots in bubble */}
        <Circle cx="40" cy="40" r="3" fill={c} opacity="0.5" />
        <Circle cx="55" cy="40" r="3" fill={c} opacity="0.5" />
        <Circle cx="70" cy="40" r="3" fill={c} opacity="0.5" />
        {/* Chat bubble 2 (smaller, offset) */}
        <Path
          d="M60 70 Q60 62 68 62 H95 Q103 62 103 70 V82 Q103 90 95 90 H75 L65 100 V90 Q60 90 60 82 Z"
          stroke={c}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </G>
    ),
    
    // No friends - two figures
    friends: (
      <G>
        {/* Person 1 */}
        <Circle cx="35" cy="35" r="15" stroke={c} strokeWidth="2" fill="none" />
        <Path d="M15 90 Q15 65 35 60 Q55 65 55 90" stroke={c} strokeWidth="2" fill="none" />
        {/* Person 2 */}
        <Circle cx="80" cy="35" r="15" stroke={c} strokeWidth="2" fill="none" opacity="0.6" />
        <Path d="M60 90 Q60 65 80 60 Q100 65 100 90" stroke={c} strokeWidth="2" fill="none" opacity="0.6" />
        {/* Dotted line between */}
        <Line x1="50" y1="45" x2="65" y2="45" stroke={c} strokeWidth="2" strokeDasharray="4,4" />
      </G>
    ),
    
    // No notifications - bell
    notifications: (
      <G>
        <Path
          d="M35 40 Q35 20 60 20 Q85 20 85 40 V70 L95 80 H25 L35 70 Z"
          stroke={c}
          strokeWidth="2"
          fill="none"
        />
        <Path d="M50 85 Q50 95 60 95 Q70 95 70 85" stroke={c} strokeWidth="2" fill="none" />
        {/* Zzz */}
        <Text x="75" y="25" fontSize="16" fill={c} opacity="0.5">z</Text>
        <Text x="85" y="18" fontSize="12" fill={c} opacity="0.3">z</Text>
      </G>
    ),
    
    // Search - magnifying glass with nothing found
    search: (
      <G>
        <Circle cx="50" cy="45" r="30" stroke={c} strokeWidth="2.5" fill="none" />
        <Line x1="70" y1="65" x2="95" y2="90" stroke={c} strokeWidth="3" strokeLinecap="round" />
        {/* Question mark inside */}
        <Path d="M42 35 Q42 30 50 30 Q58 30 58 38 Q58 45 50 45 V50" stroke={c} strokeWidth="2" fill="none" />
        <Circle cx="50" cy="57" r="2" fill={c} />
      </G>
    ),
    
    // Error - crumpled paper
    error: (
      <G>
        <Path
          d="M30 20 L70 25 L90 20 L95 50 L90 85 L55 90 L20 85 L15 50 Z"
          stroke={c}
          strokeWidth="2"
          fill="none"
        />
        {/* Crumple lines */}
        <Path d="M30 35 Q50 45 70 35" stroke={c} strokeWidth="1" fill="none" opacity="0.5" />
        <Path d="M25 55 Q55 50 85 60" stroke={c} strokeWidth="1" fill="none" opacity="0.5" />
        <Path d="M35 75 Q55 70 75 78" stroke={c} strokeWidth="1" fill="none" opacity="0.5" />
      </G>
    ),

    // Bookmarks - empty bookmark
    bookmarks: (
      <G>
        <Path
          d="M30 15 H85 V105 L57.5 85 L30 105 Z"
          stroke={c}
          strokeWidth="2"
          fill="none"
        />
        {/* Ribbon detail */}
        <Line x1="45" y1="35" x2="70" y2="35" stroke={c} strokeWidth="1.5" opacity="0.5" />
        <Line x1="45" y1="48" x2="70" y2="48" stroke={c} strokeWidth="1.5" opacity="0.5" />
        <Line x1="45" y1="61" x2="60" y2="61" stroke={c} strokeWidth="1.5" opacity="0.5" />
      </G>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {illustrations[type] || illustrations.feed}
    </Svg>
  );
}

export function EmptyState({
  type = 'feed',
  title,
  message,
  action,
  style,
}) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <PencilFrame
        filled
        fillColor={colors.paper}
        radius={32}
        padding={24}
        style={styles.illustrationFrame}
      >
        <EmptyIllustration type={type} size={100} />
      </PencilFrame>
      
      {title && (
        <Text style={[typography.title, styles.title, { color: colors.ink }]}>
          {title}
        </Text>
      )}
      
      {message && (
        <Text style={[typography.body, styles.message, { color: colors.inkMuted }]}>
          {message}
        </Text>
      )}
      
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
}

// Pre-configured empty states for common scenarios
export function EmptyFeed({ onCreatePost }) {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="feed"
      title={t('empty.feedTitle', 'No posts yet')}
      message={t('empty.feedMessage', 'Be the first to share something!')}
    />
  );
}

export function EmptyMessages() {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="messages"
      title={t('empty.messagesTitle', 'No conversations')}
      message={t('empty.messagesMessage', 'Start chatting with your friends')}
    />
  );
}

export function EmptyFriends() {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="friends"
      title={t('empty.friendsTitle', 'No friends yet')}
      message={t('empty.friendsMessage', 'Find people to connect with')}
    />
  );
}

export function EmptyNotifications() {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="notifications"
      title={t('empty.notificationsTitle', "All caught up!")}
      message={t('empty.notificationsMessage', 'No new notifications')}
    />
  );
}

export function EmptySearch({ query }) {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="search"
      title={t('empty.searchTitle', 'No results')}
      message={t('empty.searchMessage', `Nothing found for "${query}"`)}
    />
  );
}

export function EmptyBookmarks() {
  const { t } = require('react-i18next').useTranslation();
  return (
    <EmptyState
      type="bookmarks"
      title={t('empty.bookmarksTitle', 'No saved posts')}
      message={t('empty.bookmarksMessage', 'Bookmark posts to find them later')}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  illustrationFrame: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: 20,
  },
});
