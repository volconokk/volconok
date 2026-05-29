import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { PencilFrame } from './PencilFrame';

// Skeleton placeholder for a post card
export function PostSkeleton() {
  const { colors } = useTheme();
  
  return (
    <PencilFrame filled fillColor={colors.paper} radius={22} padding={16} style={styles.postSkeleton}>
      {/* Author row */}
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.surface }]} />
        <View style={styles.authorInfo}>
          <View style={[styles.line, styles.lineShort, { backgroundColor: colors.surface }]} />
          <View style={[styles.line, styles.lineXShort, { backgroundColor: colors.surface, marginTop: 6 }]} />
        </View>
      </View>
      
      {/* Content lines */}
      <View style={styles.content}>
        <View style={[styles.line, { backgroundColor: colors.surface }]} />
        <View style={[styles.line, { backgroundColor: colors.surface, marginTop: 8 }]} />
        <View style={[styles.line, styles.lineMedium, { backgroundColor: colors.surface, marginTop: 8 }]} />
      </View>
      
      {/* Actions row */}
      <View style={[styles.row, styles.actions]}>
        <View style={[styles.actionButton, { backgroundColor: colors.surface }]} />
        <View style={[styles.actionButton, { backgroundColor: colors.surface }]} />
      </View>
    </PencilFrame>
  );
}

// Skeleton for a message thread item
export function MessageSkeleton() {
  const { colors } = useTheme();
  
  return (
    <PencilFrame filled fillColor={colors.paper} radius={16} padding={12} style={styles.messageSkeleton}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.surface }]} />
        <View style={styles.messageInfo}>
          <View style={styles.messageHeader}>
            <View style={[styles.line, styles.lineShort, { backgroundColor: colors.surface }]} />
            <View style={[styles.line, styles.lineXShort, { backgroundColor: colors.surface }]} />
          </View>
          <View style={[styles.line, styles.lineMedium, { backgroundColor: colors.surface, marginTop: 6 }]} />
        </View>
      </View>
    </PencilFrame>
  );
}

// Skeleton for a friend/user item
export function UserSkeleton() {
  const { colors } = useTheme();
  
  return (
    <PencilFrame filled fillColor={colors.paper} radius={14} padding={12} style={styles.userSkeleton}>
      <View style={styles.row}>
        <View style={[styles.avatarSmall, { backgroundColor: colors.surface }]} />
        <View style={styles.userInfo}>
          <View style={[styles.line, styles.lineShort, { backgroundColor: colors.surface }]} />
          <View style={[styles.line, styles.lineXShort, { backgroundColor: colors.surface, marginTop: 4 }]} />
        </View>
        <View style={[styles.button, { backgroundColor: colors.surface }]} />
      </View>
    </PencilFrame>
  );
}

// Skeleton for notification item
export function NotificationSkeleton() {
  const { colors } = useTheme();
  
  return (
    <PencilFrame filled fillColor={colors.paper} radius={14} padding={12} style={styles.notifSkeleton}>
      <View style={styles.row}>
        <View style={[styles.avatarSmall, { backgroundColor: colors.surface }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={[styles.line, { backgroundColor: colors.surface }]} />
          <View style={[styles.line, styles.lineShort, { backgroundColor: colors.surface, marginTop: 6 }]} />
        </View>
      </View>
    </PencilFrame>
  );
}

// Loading list with multiple skeletons
export function FeedLoading({ count = 3 }) {
  return (
    <View style={styles.loadingContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </View>
  );
}

export function MessagesLoading({ count = 5 }) {
  return (
    <View style={styles.loadingContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </View>
  );
}

export function FriendsLoading({ count = 4 }) {
  return (
    <View style={styles.loadingContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <UserSkeleton key={i} />
      ))}
    </View>
  );
}

export function NotificationsLoading({ count = 5 }) {
  return (
    <View style={styles.loadingContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </View>
  );
}

// Simple centered loading indicator
export function CenteredLoading({ message }) {
  const { colors, typography } = useTheme();
  
  return (
    <View style={styles.centeredLoading}>
      <ActivityIndicator size="large" color={colors.ink} />
      {message && (
        <View style={{ marginTop: 12 }}>
          <View style={{ ...typography.body, color: colors.inkMuted }}>{message}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingTop: 8,
  },
  postSkeleton: {
    marginBottom: 16,
  },
  messageSkeleton: {
    marginBottom: 10,
  },
  userSkeleton: {
    marginBottom: 8,
  },
  notifSkeleton: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  messageInfo: {
    marginLeft: 12,
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  line: {
    height: 12,
    borderRadius: 6,
    width: '100%',
  },
  lineShort: {
    width: '50%',
  },
  lineMedium: {
    width: '75%',
  },
  lineXShort: {
    width: '30%',
  },
  content: {
    marginTop: 14,
  },
  actions: {
    marginTop: 16,
    gap: 16,
  },
  actionButton: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  button: {
    width: 70,
    height: 32,
    borderRadius: 16,
  },
  centeredLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});
