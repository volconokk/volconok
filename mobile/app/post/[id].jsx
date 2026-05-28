import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { Avatar } from '../../src/components/Avatar';
import { PostCard } from '../../src/components/PostCard';
import { Header } from '../../src/components/Header';
import { KeyboardAvoidingScreen } from '../../src/components/KeyboardAvoidingScreen';
import { useTheme } from '../../src/theme/ThemeProvider';
import { api } from '../../src/api/client';
import { SendIcon, HeartIcon } from '../../src/components/icons';
import { timeAgo } from '../../src/utils/time';

export default function PostScreen() {
  const { id } = useLocalSearchParams();
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/comments/post/${id}`),
      ]);
      setPost(p.data.post);
      setComments(c.data.comments);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/comments/post/${id}`, { text: text.trim() });
      setComments((c) => [...c, data.comment]);
      setText('');
      setPost((p) => p && { ...p, commentsCount: (p.commentsCount || 0) + 1 });
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setBusy(false);
    }
  };

  const likeComment = async (c) => {
    try {
      const { data } = await api.post(`/comments/${c.id}/like`);
      setComments((all) =>
        all.map((x) => (x.id === c.id ? { ...x, likes: data.likes, liked: data.liked } : x)),
      );
    } catch (_e) {
      // ignore
    }
  };

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('post.comments')} />
        <KeyboardAvoidingScreen
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
                  onChangeText={setText}
                  placeholder={t('post.commentPlaceholder')}
                  multiline
                  maxLength={1000}
                />
              </View>
              <Pressable
                disabled={busy || !text.trim()}
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
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            data={comments}
            keyExtractor={(c) => c.id}
            ListHeaderComponent={
              post ? (
                <PostCard
                  post={post}
                  onLike={async () => {
                    const { data } = await api.post(`/posts/${post.id}/react`, { type: 'like' });
                    setPost(data.post);
                  }}
                />
              ) : null
            }
            ListEmptyComponent={
              <PencilFrame filled fillColor={colors.paper} radius={18} padding={16}>
                <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                  {t('post.noComments')}
                </Text>
              </PencilFrame>
            }
            renderItem={({ item }) => (
              <PencilFrame
                filled
                fillColor={colors.paper}
                radius={16}
                padding={12}
                style={{ marginBottom: 10 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Avatar
                    uri={item.author?.avatarUrl}
                    name={item.author?.displayName}
                    size={36}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ ...typography.subtitle, color: colors.ink }}>
                      {item.author?.displayName}
                    </Text>
                    <Text style={{ ...typography.caption, color: colors.inkMuted }}>
                      {timeAgo(item.createdAt, i18n.language)}
                    </Text>
                    <Text style={{ ...typography.body, color: colors.ink, marginTop: 6 }}>
                      {item.text}
                    </Text>
                    <Pressable
                      onPress={() => likeComment(item)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 8,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <HeartIcon size={18} filled={item.liked} color={colors.ink} />
                      <Text style={{ ...typography.caption, color: colors.ink, marginLeft: 4 }}>
                        {item.likes}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </PencilFrame>
            )}
          />
        </KeyboardAvoidingScreen>
      </SafeAreaView>
    </PaperBackground>
  );
}
