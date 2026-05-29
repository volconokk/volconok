import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Image, FlatList, useWindowDimensions, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { PencilFrame } from './PencilFrame';
import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeProvider';
import { HeartIcon, CommentIcon, BookmarkIcon, ShareIcon } from './icons';
import { timeAgo } from '../utils/time';

// Double-tap detection hook
function useDoubleTap(onDoubleTap, delay = 300) {
  const lastTap = useRef(0);
  
  return useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [onDoubleTap, delay]);
}

// Heart burst animation component
function HeartBurst({ visible, onComplete }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
          Animated.delay(500),
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
      style={{
        position: 'absolute',
        alignSelf: 'center',
        top: '35%',
        transform: [{ scale }],
        opacity,
      }}
      pointerEvents="none"
    >
      <HeartIcon size={80} color={colors.ink} filled />
    </Animated.View>
  );
}

function PostCardComponent({ post, onLike, onOpen, onOpenAuthor, onBookmark, onShare }) {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { width: screenW } = useWindowDimensions();
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  const handleDoubleTap = useCallback(() => {
    if (!post.myReaction) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setShowHeartBurst(true);
      onLike?.(post);
    }
  }, [post, onLike]);

  const doubleTapHandler = useDoubleTap(handleDoubleTap);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onLike?.(post);
  }, [post, onLike]);

  const handleBookmark = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post, !isBookmarked);
  }, [post, isBookmarked, onBookmark]);

  const handleShare = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onShare?.(post);
  }, [post, onShare]);

  return (
    <PencilFrame
      filled
      elevated
      fillColor={colors.paper}
      radius={22}
      padding={16}
      style={{ marginBottom: 16 }}
    >
      {/* Heart burst animation overlay */}
      <HeartBurst visible={showHeartBurst} onComplete={() => setShowHeartBurst(false)} />

      {/* Author header */}
      <Pressable
        onPress={() => onOpenAuthor?.(post.author)}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
      >
        <Avatar uri={post.author?.avatarUrl} name={post.author?.displayName} size={42} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ ...typography.subtitle, color: colors.ink }}>
            {post.author?.displayName}
          </Text>
          <Text style={{ ...typography.caption, color: colors.inkMuted }}>
            @{post.author?.username} · {timeAgo(post.createdAt, i18n.language)}
          </Text>
        </View>
      </Pressable>

      {/* Post content - double tap to like */}
      <Pressable onPress={doubleTapHandler}>
        {post.text ? (
          <Text style={{ ...typography.body, color: colors.ink, lineHeight: 22 }}>
            {post.text}
          </Text>
        ) : null}

        {post.images?.length > 0 ? (
          <View style={{ marginTop: post.text ? 12 : 0 }}>
            {post.images.length === 1 ? (
              // Single image - full width
              <PencilFrame radius={16} padding={3} style={{ overflow: 'hidden' }}>
                <Image
                  source={{ uri: post.images[0] }}
                  style={{
                    width: '100%',
                    height: 280,
                    borderRadius: 13,
                    backgroundColor: colors.surface,
                  }}
                  resizeMode="cover"
                />
              </PencilFrame>
            ) : (
              // Multiple images - horizontal scroll
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={post.images}
                keyExtractor={(uri) => uri}
                renderItem={({ item }) => (
                  <PencilFrame radius={16} padding={3} style={{ marginRight: 8 }}>
                    <Image
                      source={{ uri: item }}
                      style={{
                        width: Math.min(260, screenW - 96),
                        height: 200,
                        borderRadius: 13,
                        backgroundColor: colors.surface,
                      }}
                      resizeMode="cover"
                    />
                  </PencilFrame>
                )}
              />
            )}
          </View>
        ) : null}
      </Pressable>

      {/* Actions bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.lineSoft,
        }}
      >
        {/* Like button */}
        <Pressable
          onPress={handleLike}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
            marginRight: 20,
          })}
        >
          <HeartIcon size={22} color={post.myReaction ? colors.danger : colors.ink} filled={!!post.myReaction} />
          <Text
            style={{
              ...typography.body,
              color: post.myReaction ? colors.danger : colors.ink,
              marginLeft: 6,
              fontWeight: post.myReaction ? '600' : '400',
            }}
          >
            {post.likesCount || 0}
          </Text>
        </Pressable>

        {/* Comment button */}
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
            marginRight: 20,
          })}
        >
          <CommentIcon size={22} color={colors.ink} />
          <Text style={{ ...typography.body, color: colors.ink, marginLeft: 6 }}>
            {post.commentsCount || 0}
          </Text>
        </Pressable>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Share button */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            marginRight: 16,
          })}
        >
          <ShareIcon size={20} color={colors.inkMuted} />
        </Pressable>

        {/* Bookmark button */}
        <Pressable
          onPress={handleBookmark}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <BookmarkIcon
            size={20}
            color={isBookmarked ? colors.ink : colors.inkMuted}
            filled={isBookmarked}
          />
        </Pressable>
      </View>
    </PencilFrame>
  );
}

// Memoized so the feed only re-renders cards whose data actually changed.
export const PostCard = React.memo(PostCardComponent, (prev, next) => {
  const a = prev.post;
  const b = next.post;
  return (
    a.id === b.id &&
    a.likesCount === b.likesCount &&
    a.commentsCount === b.commentsCount &&
    a.myReaction === b.myReaction &&
    a.isBookmarked === b.isBookmarked &&
    a.text === b.text &&
    a.author?.avatarUrl === b.author?.avatarUrl &&
    a.author?.displayName === b.author?.displayName
  );
});
