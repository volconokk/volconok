import React from 'react';
import { View, Text, Pressable, Image, FlatList, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import { PencilFrame } from './PencilFrame';
import { Avatar } from './Avatar';
import { useTheme } from '../theme/ThemeProvider';
import { HeartIcon, CommentIcon } from './icons';
import { timeAgo } from '../utils/time';

export function PostCard({ post, onLike, onOpen, onOpenAuthor }) {
  const { colors, typography } = useTheme();
  const { i18n } = useTranslation();
  const screenW = Dimensions.get('window').width;

  return (
    <PencilFrame
      filled
      elevated
      fillColor={colors.paper}
      radius={22}
      padding={16}
      style={{ marginBottom: 16 }}
    >
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

      {post.text ? (
        <Pressable onPress={onOpen}>
          <Text style={{ ...typography.body, color: colors.ink }}>{post.text}</Text>
        </Pressable>
      ) : null}

      {post.images?.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={post.images}
            keyExtractor={(uri) => uri}
            renderItem={({ item }) => (
              <PencilFrame radius={18} padding={4} style={{ marginRight: 8 }}>
                <Image
                  source={{ uri: item }}
                  style={{
                    width: Math.min(280, screenW - 96),
                    height: 220,
                    borderRadius: 14,
                    backgroundColor: colors.surface,
                  }}
                  resizeMode="cover"
                />
              </PencilFrame>
            )}
          />
        </View>
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 14,
          gap: 18,
        }}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onLike?.(post);
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <HeartIcon size={22} color={colors.ink} filled={!!post.myReaction} />
          <Text style={{ ...typography.body, color: colors.ink, marginLeft: 6 }}>
            {post.likesCount || 0}
          </Text>
        </Pressable>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <CommentIcon size={22} color={colors.ink} />
          <Text style={{ ...typography.body, color: colors.ink, marginLeft: 6 }}>
            {post.commentsCount || 0}
          </Text>
        </Pressable>
      </View>
    </PencilFrame>
  );
}
