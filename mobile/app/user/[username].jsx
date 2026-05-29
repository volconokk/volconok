import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilButton } from '../../src/components/PencilButton';
import { Avatar } from '../../src/components/Avatar';
import { PostCard } from '../../src/components/PostCard';
import { Header } from '../../src/components/Header';
import { ProfileStats } from '../../src/components/ProfileStats';
import { FeedLoading } from '../../src/components/LoadingStates';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api } from '../../src/api/client';
import { ChatIcon } from '../../src/components/icons';
import { formatMonthYear, timeAgo } from '../../src/utils/time';

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/users/${username}`);
      setUser(data.user);
      setFriendship(data.friendship);
      const p = await api.get(`/posts/user/${data.user.id}`);
      setPosts(p.data.posts);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const isOnline =
    user?.online ??
    (user?.lastSeenAt && Date.now() - new Date(user.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS);

  const renderFriendButton = () => {
    if (!user) return null;
    if (!friendship) {
      return (
        <PencilButton
          label={t('friends.add')}
          size="sm"
          onPress={async () => {
            await api.post(`/friends/request/${user.id}`);
            load();
          }}
        />
      );
    }
    if (friendship.status === 'pending') {
      return (
        <PencilButton
          label={friendship.isRequester ? t('friends.pending') : t('friends.accept')}
          size="sm"
          variant={friendship.isRequester ? 'ghost' : 'solid'}
          onPress={async () => {
            if (friendship.isRequester) return;
            await api.post(`/friends/request/${user.id}`);
            load();
          }}
        />
      );
    }
    if (friendship.status === 'accepted') {
      return (
        <PencilButton
          label={t('friends.remove')}
          size="sm"
          variant="ghost"
          onPress={async () => {
            await api.delete(`/friends/${user.id}`);
            load();
          }}
        />
      );
    }
    return null;
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={user?.displayName || ''} />
        <FlatList
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16, paddingBottom: 32 }}
          data={posts}
          keyExtractor={(p) => p.id}
          style={{ alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }}
          ListHeaderComponent={
            user ? (
              <PencilFrame
                filled
                elevated
                fillColor={colors.paper}
                radius={22}
                padding={18}
                style={{ marginBottom: 16 }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View>
                    <Avatar uri={user.avatarUrl} name={user.displayName} size={88} />
                    {isOnline ? (
                      <View
                        style={{
                          position: 'absolute',
                          right: 2,
                          bottom: 2,
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: colors.success,
                          borderWidth: 2,
                          borderColor: colors.paper,
                        }}
                      />
                    ) : null}
                  </View>
                  <Text style={{ ...typography.title, color: colors.ink, marginTop: 12 }}>
                    {user.displayName}
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.inkMuted, marginTop: 2 }}>
                    @{user.username}
                  </Text>
                  <Text
                    style={{
                      ...typography.caption,
                      color: isOnline ? colors.success : colors.inkFaint,
                      marginTop: 4,
                    }}
                  >
                    {isOnline
                      ? t('profile.online')
                      : user.lastSeenAt
                        ? t('profile.lastSeen', { time: timeAgo(user.lastSeenAt, i18n.language) })
                        : ''}
                  </Text>
                  {user.bio ? (
                    <Text
                      style={{
                        ...typography.body,
                        color: colors.ink,
                        marginTop: 10,
                        textAlign: 'center',
                      }}
                    >
                      {user.bio}
                    </Text>
                  ) : null}
                  {user.createdAt ? (
                    <Text style={{ ...typography.caption, color: colors.inkFaint, marginTop: 8 }}>
                      {t('profile.memberSince', {
                        date: formatMonthYear(user.createdAt, i18n.language),
                      })}
                    </Text>
                  ) : null}
                </View>

                <ProfileStats 
                  postsCount={user.postsCount} 
                  friendsCount={user.friendsCount}
                  onFriendsPress={() => router.push(`/friends/${user.id}`)}
                />

                <View style={{ flexDirection: 'row', marginTop: 14, gap: 8, justifyContent: 'center' }}>
                  {renderFriendButton()}
                  <PencilButton
                    label={t('profile.message')}
                    size="sm"
                    variant="ghost"
                    icon={<ChatIcon size={16} color={colors.ink} />}
                    onPress={() => router.push(`/chat/${user.id}`)}
                  />
                </View>
              </PencilFrame>
            ) : null
          }
          ListEmptyComponent={
            loading ? (
              <FeedLoading count={2} />
            ) : user ? (
              <PencilFrame filled fillColor={colors.paper} radius={16} padding={20}>
                <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                  {t('profile.noPosts')}
                </Text>
              </PencilFrame>
            ) : null
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onLike={async () => {
                const { data } = await api.post(`/posts/${item.id}/react`, { type: 'like' });
                setPosts((all) => all.map((p) => (p.id === item.id ? data.post : p)));
              }}
              onOpen={() => router.push(`/post/${item.id}`)}
            />
          )}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
