import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { Header } from '../../src/components/Header';
import { Composer } from '../../src/components/Composer';
import { PostCard } from '../../src/components/PostCard';
import { api } from '../../src/api/client';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/store/useAuth';
import { BellIcon, TrashIcon } from '../../src/components/icons';
import { useSocketEvent } from '../../src/store/useSocket';

export default function FeedScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (refresh = false) => {
    try {
      const { data } = await api.get('/posts/feed', { params: { limit: 15 } });
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSocketEvent('notification:new', () => {});

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get('/posts/feed', {
        params: { cursor: nextCursor, limit: 15 },
      });
      setPosts((p) => [...p, ...data.posts]);
      setNextCursor(data.nextCursor);
    } catch (_e) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const onLike = async (post) => {
    const optimistic = posts.map((p) =>
      p.id === post.id
        ? {
            ...p,
            likesCount: p.myReaction ? p.likesCount - 1 : p.likesCount + 1,
            myReaction: p.myReaction ? null : 'like',
          }
        : p,
    );
    setPosts(optimistic);
    try {
      const { data } = await api.post(`/posts/${post.id}/react`, { type: 'like' });
      setPosts((all) => all.map((p) => (p.id === post.id ? { ...p, ...data.post } : p)));
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
      load();
    }
  };

  const onOpen = (post) => router.push(`/post/${post.id}`);
  const onOpenAuthor = (author) =>
    author?.username && router.push(`/user/${author.username}`);

  const onDelete = (post) =>
    Alert.alert(t('feed.deletePost'), '', [
      { text: t('feed.cancel'), style: 'cancel' },
      {
        text: t('feed.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/posts/${post.id}`);
            setPosts((all) => all.filter((p) => p.id !== post.id));
          } catch (err) {
            Alert.alert(t('common.error'), err.displayMessage);
          }
        },
      },
    ]);

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header
          title={t('feed.title')}
          right={
            <Pressable
              onPress={() => router.push('/notifications')}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <BellIcon color={colors.ink} />
            </Pressable>
          }
        />
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          data={posts}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={<Composer onPosted={(p) => setPosts((all) => [p, ...all])} />}
          ListEmptyComponent={
            !loading ? (
              <PencilFrame filled fillColor={colors.paper} radius={20} padding={20}>
                <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                  {t('feed.empty')}
                </Text>
              </PencilFrame>
            ) : null
          }
          renderItem={({ item }) => (
            <View>
              <PostCard
                post={item}
                onLike={onLike}
                onOpen={() => onOpen(item)}
                onOpenAuthor={onOpenAuthor}
              />
              {item.author?.id === user?.id ? (
                <Pressable
                  onPress={() => onDelete(item)}
                  hitSlop={10}
                  style={{
                    position: 'absolute',
                    right: 22,
                    top: 22,
                    padding: 4,
                  }}
                >
                  <TrashIcon size={18} color={colors.inkMuted} />
                </Pressable>
              ) : null}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(true);
              }}
              tintColor={colors.ink}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
