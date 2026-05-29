import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilInput } from '../../src/components/PencilInput';
import { Header } from '../../src/components/Header';
import { Avatar } from '../../src/components/Avatar';
import { KeyboardAvoidingScreen } from '../../src/components/KeyboardAvoidingScreen';
import { MessageBubble } from '../../src/components/MessageBubble';
import { MessageActionsSheet } from '../../src/components/MessageActionsSheet';
import { DotsLoader } from '../../src/components/SketchLoader';
import { useToast } from '../../src/components/Toast';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api, uploadImage } from '../../src/api/client';
import { ensureSocket, useSocketEvent } from '../../src/store/useSocket';
import { useBadges } from '../../src/store/useBadges';
import { useAuth } from '../../src/store/useAuth';
import { SendIcon, ImageIcon, XIcon, ChevronDownIcon } from '../../src/components/icons';
import { formatDateSeparator, isSameDay, timeAgo } from '../../src/utils/time';

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth } = useResponsive();
  const { refreshMessages } = useBadges();
  const { user: me } = useAuth();
  const toast = useToast();

  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [activeMessage, setActiveMessage] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const listRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);
  const atBottomRef = useRef(true);
  const fabAnim = useRef(new Animated.Value(0)).current;

  const myId = me?.id;

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

  // New incoming/outgoing messages
  useSocketEvent(
    'message:new',
    (msg) => {
      if (msg.from === userId || msg.to === userId) {
        setMessages((m) => {
          if (m.some((x) => x.id === msg.id)) return m;
          // Replace optimistic temp message if it matches text
          const tempIdx = m.findIndex(
            (x) => x.pending && x.outgoing && x.text === msg.text,
          );
          if (tempIdx >= 0) {
            const copy = [...m];
            copy[tempIdx] = msg;
            return copy;
          }
          return [...m, msg];
        });
        if (atBottomRef.current) {
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
        }
        if (msg.from === userId) {
          api.post(`/messages/with/${userId}/read`).catch(() => {});
        }
      }
    },
    [userId],
  );

  // Live read receipts — peer read our messages
  useSocketEvent(
    'message:read',
    ({ by }) => {
      if (by === userId) {
        setMessages((m) =>
          m.map((x) => (x.outgoing && !x.readAt ? { ...x, readAt: new Date().toISOString() } : x)),
        );
      }
    },
    [userId],
  );

  useSocketEvent(
    'message:edited',
    (payload) => {
      setMessages((m) =>
        m.map((x) => (x.id === payload.id ? { ...x, text: payload.text, edited: true } : x)),
      );
    },
    [userId],
  );

  useSocketEvent(
    'message:deleted',
    (payload) => {
      setMessages((m) =>
        m.map((x) =>
          x.id === payload.id ? { ...x, deleted: true, text: '', attachment: '', reactions: [] } : x,
        ),
      );
    },
    [userId],
  );

  useSocketEvent(
    'message:react',
    (payload) => {
      setMessages((m) => m.map((x) => (x.id === payload.id ? { ...x, reactions: payload.reactions } : x)));
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
        setPeer((p) =>
          p ? { ...p, online, lastSeenAt: online ? p.lastSeenAt : new Date().toISOString() } : p,
        );
      }
    },
    [userId],
  );

  // Debounced typing indicator
  const sendTyping = useCallback(
    async (v) => {
      setText(v);
      const shouldType = v.length > 0;
      if (shouldType !== isTypingRef.current) {
        isTypingRef.current = shouldType;
        const s = await ensureSocket();
        s?.emit('typing', { to: userId, typing: shouldType });
      }
      if (shouldType) {
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(async () => {
          isTypingRef.current = false;
          const s = await ensureSocket();
          s?.emit('typing', { to: userId, typing: false });
        }, 3000);
      }
    },
    [userId],
  );

  const stopTyping = useCallback(async () => {
    clearTimeout(typingTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      const s = await ensureSocket();
      s?.emit('typing', { to: userId, typing: false });
    }
  }, [userId]);

  const send = useCallback(async () => {
    const value = text.trim();
    if (!value) return;

    // Edit mode
    if (editing) {
      const original = editing;
      setEditing(null);
      setText('');
      setMessages((m) => m.map((x) => (x.id === original.id ? { ...x, text: value, edited: true } : x)));
      try {
        await api.patch(`/messages/${original.id}`, { text: value });
      } catch (err) {
        toast.error(err.displayMessage || t('common.error'));
      }
      return;
    }

    const replySnapshot = replyTo;
    setText('');
    setReplyTo(null);
    stopTyping();

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text: value,
      attachment: '',
      outgoing: true,
      pending: true,
      createdAt: new Date().toISOString(),
      readAt: null,
      reactions: [],
      replyTo: replySnapshot
        ? { id: replySnapshot.id, text: replySnapshot.text, outgoing: replySnapshot.outgoing, deleted: replySnapshot.deleted }
        : null,
    };
    setMessages((m) => [...m, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);

    try {
      const { data } = await api.post(`/messages/with/${userId}`, {
        text: value,
        replyTo: replySnapshot?.id,
      });
      setMessages((m) => m.map((x) => (x.id === tempId ? data.message : x)));
    } catch (err) {
      setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, pending: false, failed: true } : x)));
      toast.error(err.displayMessage || t('common.error'));
    }
  }, [text, editing, replyTo, userId, stopTyping, toast, t]);

  const retrySend = useCallback(
    async (item) => {
      setMessages((m) => m.map((x) => (x.id === item.id ? { ...x, failed: false, pending: true } : x)));
      try {
        const { data } = await api.post(`/messages/with/${userId}`, {
          text: item.text,
          replyTo: item.replyTo?.id,
        });
        setMessages((m) => m.map((x) => (x.id === item.id ? data.message : x)));
      } catch (err) {
        setMessages((m) => m.map((x) => (x.id === item.id ? { ...x, pending: false, failed: true } : x)));
        toast.error(err.displayMessage || t('common.error'));
      }
    },
    [userId, toast, t],
  );

  const pickAndSendImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text: '',
      attachment: asset.uri,
      outgoing: true,
      pending: true,
      createdAt: new Date().toISOString(),
      readAt: null,
      reactions: [],
      replyTo: null,
    };
    setMessages((m) => [...m, optimistic]);
    setSending(true);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 30);
    try {
      const url = await uploadImage(asset);
      const { data } = await api.post(`/messages/with/${userId}`, { attachment: url });
      setMessages((m) => m.map((x) => (x.id === tempId ? data.message : x)));
    } catch (err) {
      setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, pending: false, failed: true } : x)));
      toast.error(err.displayMessage || t('common.error'));
    } finally {
      setSending(false);
    }
  }, [userId, toast, t]);

  // Long-press actions
  const openActions = useCallback(
    (message) => {
      const annotated = {
        ...message,
        reactions: (message.reactions || []).map((r) => ({ ...r, mine: r.user === myId })),
      };
      setActiveMessage(annotated);
    },
    [myId],
  );

  const closeActions = useCallback(() => setActiveMessage(null), []);

  const handleReact = useCallback(
    async (type) => {
      const msg = activeMessage;
      closeActions();
      if (!msg) return;
      try {
        const { data } = await api.post(`/messages/${msg.id}/react`, { type });
        setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, reactions: data.message.reactions } : x)));
      } catch (err) {
        toast.error(err.displayMessage || t('common.error'));
      }
    },
    [activeMessage, closeActions, toast, t],
  );

  const handleReply = useCallback(() => {
    setReplyTo(activeMessage);
    closeActions();
  }, [activeMessage, closeActions]);

  const handleCopy = useCallback(async () => {
    if (activeMessage?.text) {
      await Clipboard.setStringAsync(activeMessage.text);
      toast.success(t('common.copied'));
    }
    closeActions();
  }, [activeMessage, closeActions, toast, t]);

  const handleEdit = useCallback(() => {
    setEditing(activeMessage);
    setText(activeMessage.text);
    setReplyTo(null);
    closeActions();
  }, [activeMessage, closeActions]);

  const handleDelete = useCallback(() => {
    const msg = activeMessage;
    closeActions();
    if (!msg) return;
    Alert.alert(t('messages.deleteMessage'), t('messages.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setMessages((m) =>
            m.map((x) => (x.id === msg.id ? { ...x, deleted: true, text: '', reactions: [] } : x)),
          );
          try {
            await api.delete(`/messages/${msg.id}`);
          } catch (err) {
            toast.error(err.displayMessage || t('common.error'));
          }
        },
      },
    ]);
  }, [activeMessage, closeActions, t, toast]);

  const scrollToReply = useCallback(
    (reply) => {
      const idx = messages.findIndex((m) => m.id === reply.id);
      if (idx >= 0) listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    },
    [messages],
  );

  const onScroll = useCallback(
    (e) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
      const atBottom = distanceFromBottom < 120;
      atBottomRef.current = atBottom;
      const show = !atBottom;
      setShowScrollDown((prev) => {
        if (prev !== show) {
          Animated.timing(fabAnim, { toValue: show ? 1 : 0, duration: 180, useNativeDriver: true }).start();
        }
        return show;
      });
    },
    [fabAnim],
  );

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

  const renderItem = useCallback(
    ({ item }) => (
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
        <MessageBubble
          item={item}
          myId={myId}
          language={i18n.language}
          colors={colors}
          typography={typography}
          onLongPress={openActions}
          onReplyPress={scrollToReply}
          onRetry={retrySend}
        />
      </View>
    ),
    [colors, typography, i18n.language, contentMaxWidth, myId, openActions, scrollToReply, retrySend, t],
  );

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header
          back
          title={peer?.displayName || ''}
          subtitle={subtitle}
          right={peer ? <Avatar uri={peer.avatarUrl} name={peer.displayName} size={36} online={isOnline} /> : null}
        />
        <KeyboardAvoidingScreen
          onKeyboardChange={(open) => {
            if (open && atBottomRef.current) {
              setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
            }
          }}
          footer={
            <View>
              {/* Reply / edit banner */}
              {replyTo || editing ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.lineSoft,
                  }}
                >
                  <View
                    style={{
                      width: 3,
                      alignSelf: 'stretch',
                      backgroundColor: colors.accent,
                      borderRadius: 2,
                      marginRight: 10,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...typography.caption, fontWeight: '700', color: colors.accent }}>
                      {editing ? t('messages.editing') : t('messages.replyingTo', { name: peer?.displayName || '' })}
                    </Text>
                    <Text style={{ ...typography.caption, color: colors.inkMuted }} numberOfLines={1}>
                      {(editing || replyTo)?.text || '📷'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setReplyTo(null);
                      setEditing(null);
                      if (editing) setText('');
                    }}
                    hitSlop={10}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
                  >
                    <XIcon size={18} color={colors.inkMuted} />
                  </Pressable>
                </View>
              ) : null}

              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderTopWidth: replyTo || editing ? 0 : 1,
                  borderTopColor: colors.lineSoft,
                  backgroundColor: colors.paper,
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {!editing ? (
                  <Pressable
                    onPress={pickAndSendImage}
                    disabled={sending}
                    hitSlop={8}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <ImageIcon size={24} color={colors.inkMuted} />
                  </Pressable>
                ) : null}
                <View style={{ flex: 1 }}>
                  <PencilInput
                    value={text}
                    onChangeText={sendTyping}
                    placeholder={t('messages.placeholder')}
                    multiline
                    maxLength={4000}
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
            </View>
          }
        >
          <View style={{ flex: 1 }}>
            {loading ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <DotsLoader />
              </View>
            ) : (
              <FlatList
                ref={listRef}
                contentContainerStyle={{ padding: 16, paddingBottom: 12, flexGrow: 1 }}
                data={decorated}
                keyExtractor={(m) => m.id}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                onScroll={onScroll}
                scrollEventThrottle={32}
                onContentSizeChange={() => {
                  if (atBottomRef.current) listRef.current?.scrollToEnd({ animated: false });
                }}
                onScrollToIndexFailed={() => {}}
                initialNumToRender={15}
                maxToRenderPerBatch={12}
                windowSize={13}
                removeClippedSubviews
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ ...typography.body, color: colors.inkMuted }}>
                      {t('messages.startConversation')}
                    </Text>
                  </View>
                }
                renderItem={renderItem}
              />
            )}

            {/* Scroll-to-bottom FAB */}
            <Animated.View
              pointerEvents={showScrollDown ? 'auto' : 'none'}
              style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                opacity: fabAnim,
                transform: [{ scale: fabAnim }],
              }}
            >
              <Pressable
                onPress={() => listRef.current?.scrollToEnd({ animated: true })}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.paper,
                  borderWidth: 1,
                  borderColor: colors.lineSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.shadow,
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}
              >
                <ChevronDownIcon size={22} color={colors.ink} />
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingScreen>

        <MessageActionsSheet
          visible={!!activeMessage}
          message={activeMessage}
          onClose={closeActions}
          onReact={handleReact}
          onReply={handleReply}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
