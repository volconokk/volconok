import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { Header } from '../../src/components/Header';
import { Avatar } from '../../src/components/Avatar';
import { useTheme } from '../../src/theme/ThemeProvider';
import { api } from '../../src/api/client';
import { ensureSocket, useSocketEvent } from '../../src/store/useSocket';
import { SendIcon } from '../../src/components/icons';

export default function ChatScreen() {
  const { userId } = useLocalSearchParams();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [m, u] = await Promise.all([
        api.get(`/messages/with/${userId}`),
        api.get(`/users/${userId}`),
      ]);
      setMessages(m.data.messages);
      setPeer(u.data.user);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
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

  const sendTyping = async (v) => {
    setText(v);
    const s = await ensureSocket();
    s?.emit('typing', { to: userId, typing: v.length > 0 });
  };

  const send = async () => {
    if (!text.trim()) return;
    const value = text.trim();
    setText('');
    try {
      await api.post(`/messages/with/${userId}`, { text: value });
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
      setText(value);
    }
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header
          back
          title={peer?.displayName || ''}
          subtitle={typing ? t('messages.typing') : peer?.username ? `@${peer.username}` : ''}
          right={peer ? <Avatar uri={peer.avatarUrl} name={peer.displayName} size={36} /> : null}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={80}
        >
          <FlatList
            ref={listRef}
            contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
            data={messages}
            keyExtractor={(m) => m.id}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <View
                style={{
                  alignSelf: item.outgoing ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  marginVertical: 4,
                }}
              >
                <PencilFrame
                  filled
                  fillColor={item.outgoing ? colors.bubbleMe : colors.bubbleOther}
                  radius={18}
                  padding={10}
                  jitter={1.2}
                >
                  <Text
                    style={{
                      ...typography.body,
                      color: item.outgoing ? colors.bubbleMeInk : colors.bubbleOtherInk,
                    }}
                  >
                    {item.text}
                  </Text>
                </PencilFrame>
              </View>
            )}
          />
          <View
            style={{
              padding: 12,
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
              />
            </View>
            <Pressable
              disabled={!text.trim()}
              onPress={send}
              style={({ pressed }) => ({
                padding: 12,
                opacity: !text.trim() ? 0.3 : pressed ? 0.5 : 1,
              })}
            >
              <SendIcon color={colors.ink} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperBackground>
  );
}
