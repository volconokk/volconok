import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { Avatar } from '../../src/components/Avatar';
import { Header } from '../../src/components/Header';
import { useTheme } from '../../src/theme/ThemeProvider';
import { api } from '../../src/api/client';
import { useSocketEvent } from '../../src/store/useSocket';
import { timeAgo } from '../../src/utils/time';

export default function MessagesScreen() {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/threads');
      setThreads(data.threads);
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

  useSocketEvent('message:new', () => {
    load();
  });

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header title={t('messages.title')} />
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          data={threads}
          keyExtractor={(t) => t.peer?.id || Math.random().toString()}
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
                {t('messages.empty')}
              </Text>
            </PencilFrame>
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
                  <Avatar uri={item.peer.avatarUrl} name={item.peer.displayName} size={46} />
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
                        {item.lastMessage.text || (item.lastMessage.attachment ? '📷' : '')}
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
