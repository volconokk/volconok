import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { Header } from '../../src/components/Header';
import { Avatar } from '../../src/components/Avatar';
import { KeyboardAvoidingScreen } from '../../src/components/KeyboardAvoidingScreen';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api } from '../../src/api/client';
import { ensureSocket, useSocketEvent } from '../../src/store/useSocket';
import { useBadges } from '../../src/store/useBadges';
import { SendIcon } from '../../src/components/icons';
import { formatTime, formatDateSeparator, isSameDay, timeAgo } from '../../src/utils/time';

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export default function ChatScreen() {
  const { userId } = useLocalSearchParams();
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth } = useResponsive();
  const { refreshMessages } = useBadges();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [m, u] = await Promise.all([
        api.get(`/messages/with/${userId}`),
        api.get(`/users/${userId}`),
      ]);
      setMessages(m.data.messages);
      setPeer(u.data.user);
      refreshMessages();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useSocketEvent(
    'message:new',
    (msg) => {
      if (msg.from === userId || msg.to === userId) {
        setMessages((m) => {
          if (m.some((x) => x.id === msg.id)) return m;
          return [...m, msg];
        });
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
        if (msg.from === userId) {
          api.post(`/messages/with/${userId}/read`).catch(() => {});
        }
      }
    },
    [userId],
  );

  useSocketEvent(
    'typing',
    ({ from, typing: t2 }) => {
      if (from === userId) setTyping(t2);
    },
    [userId],
  );

  useSocketEvent(
    'presence',
    ({ userId: who, online }) => {
      if (who === userId) {
        setPeer((p) => (p ? { ...p, online, lastSeenAt: online ? p.lastSeenAt : new Date().toISOString() } : p));
      }
    },
    [userId],
  );

  const sendTyping = async (v) => {
    setText(v);
    const s = await ensureSocket();
    s?.emit('typing', { to: userId, typing: v.length > 0 });
  };

  const send = async () => {
    if (!text.trim()) return;
    const value = text.trim();
    setText('');
    const s = await ensureSocket();
    s?.emit('typing', { to: userId, typing: false });
    try {
      await api.post(`/messages/with/${userId}`, { text: value });
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
      setText(value);
    }
  };

  // Decide which messages need a date separator above them.
  const decorated = useMemo(() => {
    return messages.map((m, i) => {
      const prev = messages[i - 1];
      const showDate = !prev || !isSameDay(prev.createdAt, m.createdAt);
      return { ...m, showDate };
    });
  }, [messages]);

  const isOnline =
    peer?.online ??
    (peer?.lastSeenAt && Date.now() - new Date(peer.lastSeenAt).getTime() < ONLINE_THRESHOLD_MS);

  const subtitle = typing
    ? t('messages.typing')
    : isOnline
      ? t('messages.online')
      : peer?.lastSeenAt
        ? t('profile.lastSeen', { time: timeAgo(peer.lastSeenAt, i18n.language) })
        : peer?.username
          ? `@${peer.username}`
          : '';

  const renderItem = ({ item }) => (
    <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' }}>
      {item.showDate ? (
        <View style={{ alignItems: 'center', marginVertical: 12 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text style={{ ...typography.caption, color: colors.inkMuted }}>
              {formatDateSeparator(item.createdAt, i18n.language, {
                today: t('messages.today'),
                yesterday: t('messages.yesterday'),
              })}
            </Text>
          </View>
        </View>
      ) : null}
      <View
        style={{
          alignSelf: item.outgoing ? 'flex-end' : 'flex-start',
          maxWidth: '82%',
          marginVertical: 3,
        }}
      >
        <View
          style={{
            backgroundColor: item.outgoing ? colors.bubbleMe : colors.bubbleOther,
            borderWidth: item.outgoing ? 0 : 1,
            borderColor: colors.lineSoft,
            borderRadius: 18,
            borderBottomRightRadius: item.outgoing ? 4 : 18,
            borderBottomLeftRadius: item.outgoing ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 9,
          }}
        >
          <Text
            style={{
              ...typography.body,
              color: item.outgoing ? colors.bubbleMeInk : colors.bubbleOtherInk,
            }}
          >
            {item.text}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: item.outgoing ? 'flex-end' : 'flex-start',
            marginTop: 2,
            marginHorizontal: 4,
            gap: 4,
          }}
        >
          <Text style={{ ...typography.caption, fontSize: 11, color: colors.inkFaint }}>
            {formatTime(item.createdAt, i18n.language)}
          </Text>
          {item.outgoing ? (
            <Text style={{ fontSize: 11, color: item.readAt ? colors.success : colors.inkFaint }}>
              {item.readAt ? '✓✓' : '✓'}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header
          back
          title={peer?.displayName || ''}
          subtitle={subtitle}
          right={peer ? <Avatar uri={peer.avatarUrl} name={peer.displayName} size={36} /> : null}
        />
        <KeyboardAvoidingScreen
          onKeyboardChange={(open) => {
            if (open) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
          }}
          footer={
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: colors.lineSoft,
                backgroundColor: colors.paper,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <PencilInput
                  value={text}
                  onChangeText={sendTyping}
                  placeholder={t('messages.placeholder')}
                  multiline
                  maxLength={2000}
                />
              </View>
              <Pressable
                disabled={!text.trim()}
                onPress={send}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: text.trim() ? colors.accent : colors.surface,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <SendIcon color={text.trim() ? colors.accentInk : colors.inkFaint} />
              </Pressable>
            </View>
          }
        >
          <FlatList
            ref={listRef}
            contentContainerStyle={{ padding: 16, paddingBottom: 12, flexGrow: 1 }}
            data={decorated}
            keyExtractor={(m) => m.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              loading ? null : (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ ...typography.body, color: colors.inkMuted }}>
                    {t('messages.startConversation')}
                  </Text>
                </View>
              )
            }
            renderItem={renderItem}
          />
        </KeyboardAvoidingScreen>
      </SafeAreaView>
    </PaperBackground>
  );
}
