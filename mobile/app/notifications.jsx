import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../src/components/PaperBackground';
import { PencilFrame } from '../src/components/PencilFrame';
import { Avatar } from '../src/components/Avatar';
import { Header } from '../src/components/Header';
import { useTheme } from '../src/theme/ThemeProvider';
import { api } from '../src/api/client';
import { useSocketEvent } from '../src/store/useSocket';
import { timeAgo } from '../src/utils/time';
import { HeartIcon, CommentIcon, FriendsIcon, ChatIcon, CheckIcon } from '../src/components/icons';

function iconFor(type, color) {
  switch (type) {
    case 'like':
      return <HeartIcon color={color} />;
    case 'comment':
      return <CommentIcon color={color} />;
    case 'friend_request':
      return <FriendsIcon color={color} />;
    case 'friend_accept':
      return <CheckIcon color={color} />;
    case 'message':
      return <ChatIcon color={color} />;
    default:
      return null;
  }
}

function textFor(type, t) {
  switch (type) {
    case 'like':
      return t('post.like');
    case 'comment':
      return t('post.comments');
    case 'friend_request':
      return t('friends.add');
    case 'friend_accept':
      return t('friends.accept');
    case 'message':
      return t('messages.title');
    default:
      return '';
  }
}

export default function NotificationsScreen() {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setItems(data.notifications);
      await api.post('/notifications/read-all').catch(() => {});
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSocketEvent('notification:new', () => load());

  const open = (n) => {
    if (n.entityModel === 'Post' && n.entity) router.push(`/post/${n.entity}`);
    if (n.type === 'message' && n.actor) router.push(`/chat/${n.actor.id}`);
    if (n.type === 'friend_request' || n.type === 'friend_accept') {
      if (n.actor?.username) router.push(`/user/${n.actor.username}`);
    }
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('settings.notifications')} />
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          data={items}
          keyExtractor={(n) => n.id}
          refreshControl={
            <RefreshControl
              tintColor={colors.ink}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListEmptyComponent={
            <PencilFrame filled fillColor={colors.paper} radius={18} padding={16}>
              <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                {t('friends.noRequests')}
              </Text>
            </PencilFrame>
          }
          renderItem={({ item }) => (
            <PencilFrame
              filled
              fillColor={item.read ? colors.paper : colors.surface}
              radius={16}
              padding={12}
              style={{ marginBottom: 10 }}
            >
              <Pressable
                onPress={() => open(item)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                {item.actor ? (
                  <Avatar uri={item.actor.avatarUrl} name={item.actor.displayName} size={42} />
                ) : null}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ ...typography.subtitle, color: colors.ink }}>
                    {item.actor?.displayName}
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.inkMuted }}>
                    {textFor(item.type, t)} · {timeAgo(item.createdAt, i18n.language)}
                  </Text>
                </View>
                {iconFor(item.type, colors.ink)}
              </Pressable>
            </PencilFrame>
          )}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
