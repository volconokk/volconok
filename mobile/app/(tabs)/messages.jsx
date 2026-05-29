import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { Avatar } from '../../src/components/Avatar';
import { Header } from '../../src/components/Header';
import { MessagesLoading } from '../../src/components/LoadingStates';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api } from '../../src/api/client';
import { useSocketEvent } from '../../src/store/useSocket';
import { useBadges } from '../../src/store/useBadges';
import { timeAgo } from '../../src/utils/time';
import { ChatIcon } from '../../src/components/icons';

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export default function MessagesScreen() {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const router = useRouter();
  const { refreshMessages } = useBadges();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/threads');
      setThreads(data.threads);
      refreshMessages();
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Incremental update: patch the affected thread instead of reloading everything.
  useSocketEvent('message:new', (msg) => {
    const peerId = msg.outgoing ? msg.to : msg.from;
    setThreads((prev) => {
      const idx = prev.findIndex((th) => th.peer?.id === peerId);
      if (idx === -1) {
        // Unknown peer — fall back to a full reload to fetch their info.
        load();
        return prev;
      }
      const updated = {
        ...prev[idx],
        lastMessage: {
          id: msg.id,
          text: msg.text,
          attachment: msg.attachment,
          createdAt: msg.createdAt,
          outgoing: msg.outgoing,
          readAt: msg.readAt,
        },
        unread: msg.outgoing ? prev[idx].unread : (prev[idx].unread || 0) + 1,
      };
      // Move the updated thread to the top.
      const rest = prev.filter((_, i) => i !== idx);
      return [updated, ...rest];
    });
    refreshMessages();
  });

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header title={t('messages.title')} />
        <FlatList
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16, paddingBottom: 32 }}
          data={threads}
          keyExtractor={(item, index) => item.peer?.id || `thread-${index}`}
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
            loading ? (
              <MessagesLoading count={5} />
            ) : (
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
                <PencilFrame filled fillColor={colors.paper} radius={28} padding={20}>
                  <ChatIcon size={36} color={colors.inkMuted} />
                </PencilFrame>
                <Text
                  style={{ ...typography.subtitle, color: colors.ink, marginTop: 16, textAlign: 'center' }}
                >
                  {t('messages.empty')}
                </Text>
                <Text
                  style={{ ...typography.body, color: colors.inkMuted, marginTop: 6, textAlign: 'center' }}
                >
                  {t('messages.emptyHint')}
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            if (!item.peer) return null;
            return (
              <PencilFrame
                filled
                fillColor={colors.paper}
                radius={16}
                padding={12}
                style={{ marginBottom: 10 }}
              >
                <Pressable
                  onPress={() => router.push(`/chat/${item.peer.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Avatar
                    uri={item.peer.avatarUrl}
                    name={item.peer.displayName}
                    size={46}
                    online={
                      item.peer.lastSeenAt &&
                      Date.now() - new Date(item.peer.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS
                    }
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{ ...typography.subtitle, color: colors.ink, flex: 1 }}
                        numberOfLines={1}
                      >
                        {item.peer.displayName}
                      </Text>
                      <Text style={{ ...typography.caption, color: colors.inkMuted }}>
                        {timeAgo(item.lastMessage.createdAt, i18n.language)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          ...typography.body,
                          color: item.unread ? colors.ink : colors.inkMuted,
                          fontWeight: item.unread ? '700' : '400',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.lastMessage.outgoing ? '› ' : ''}
                        {item.lastMessage.deleted
                          ? t('messages.deletedMessage')
                          : item.lastMessage.text || (item.lastMessage.attachment ? '📷' : '')}
                      </Text>
                      {item.unread ? (
                        <View
                          style={{
                            backgroundColor: colors.accent,
                            minWidth: 22,
                            height: 22,
                            borderRadius: 11,
                            paddingHorizontal: 6,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                          }}
                        >
                          <Text style={{ color: colors.accentInk, fontSize: 12, fontWeight: '700' }}>
                            {item.unread}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              </PencilFrame>
            );
          }}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
