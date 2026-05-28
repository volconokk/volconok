import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../src/components/PaperBackground';
import { PencilFrame } from '../src/components/PencilFrame';
import { Avatar } from '../src/components/Avatar';
import { Header } from '../src/components/Header';
import { useTheme } from '../src/theme/ThemeProvider';
import { useResponsive } from '../src/hooks/useResponsive';
import { api } from '../src/api/client';
import { useSocketEvent } from '../src/store/useSocket';
import { timeAgo, isSameDay } from '../src/utils/time';
import { HeartIcon, CommentIcon, FriendsIcon, ChatIcon, CheckIcon, BellIcon } from '../src/components/icons';

function iconFor(type, color) {
  switch (type) {
    case 'like':
      return <HeartIcon size={18} color={color} />;
    case 'comment':
      return <CommentIcon size={18} color={color} />;
    case 'friend_request':
      return <FriendsIcon size={18} color={color} />;
    case 'friend_accept':
      return <CheckIcon size={18} color={color} />;
    case 'message':
      return <ChatIcon size={18} color={color} />;
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
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

  // Build a flat list with section headers for "Today" and "Earlier".
  const sectioned = useMemo(() => {
    const now = new Date();
    const out = [];
    let lastGroup = null;
    items.forEach((n) => {
      const group = isSameDay(n.createdAt, now) ? 'today' : 'earlier';
      if (group !== lastGroup) {
        out.push({ type: 'header', id: `h-${group}`, group });
        lastGroup = group;
      }
      out.push({ type: 'item', id: n.id, data: n });
    });
    return out;
  }, [items]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <Text
          style={{
            ...typography.caption,
            color: colors.inkMuted,
            textTransform: 'uppercase',
            marginTop: 8,
            marginBottom: 8,
            marginLeft: 4,
          }}
        >
          {item.group === 'today' ? t('notif.today') : t('notif.earlier')}
        </Text>
      );
    }
    const n = item.data;
    return (
      <PencilFrame
        filled
        fillColor={n.read ? colors.paper : colors.surface}
        radius={16}
        padding={12}
        style={{ marginBottom: 10 }}
      >
        <Pressable onPress={() => open(n)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {n.actor ? (
            <Avatar uri={n.actor.avatarUrl} name={n.actor.displayName} size={44} />
          ) : null}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ ...typography.body, color: colors.ink }}>
              <Text style={{ fontWeight: '700' }}>{n.actor?.displayName}</Text>{' '}
              {t(`notif.${n.type}`)}
            </Text>
            <Text style={{ ...typography.caption, color: colors.inkMuted, marginTop: 2 }}>
              {timeAgo(n.createdAt, i18n.language)}
            </Text>
          </View>
          <View style={{ marginLeft: 8 }}>{iconFor(n.type, colors.inkMuted)}</View>
          {!n.read ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accent,
                marginLeft: 8,
              }}
            />
          ) : null}
        </Pressable>
      </PencilFrame>
    );
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('notif.title')} />
        <FlatList
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16, paddingBottom: 32 }}
          data={sectioned}
          keyExtractor={(it) => it.id}
          style={{ alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }}
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
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
              <PencilFrame filled fillColor={colors.paper} radius={28} padding={20}>
                <BellIcon size={36} color={colors.inkMuted} />
              </PencilFrame>
              <Text
                style={{ ...typography.body, color: colors.inkMuted, marginTop: 16, textAlign: 'center' }}
              >
                {t('notif.empty')}
              </Text>
            </View>
          }
          renderItem={renderItem}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
