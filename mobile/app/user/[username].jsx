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
import { useTheme } from '../../src/theme/ThemeProvider';
import { api } from '../../src/api/client';
import { ChatIcon } from '../../src/components/icons';

export default function UserScreen() {
  const { username } = useLocalSearchParams();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [friendship, setFriendship] = useState(null);
  const [posts, setPosts] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/users/${username}`);
      setUser(data.user);
      setFriendship(data.friendship);
      const p = await api.get(`/posts/user/${data.user.id}`);
      setPosts(p.data.posts);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

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
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          data={posts}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={
            user ? (
              <PencilFrame
                filled
                fillColor={colors.paper}
                radius={22}
                padding={18}
                style={{ marginBottom: 16 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar uri={user.avatarUrl} name={user.displayName} size={72} />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ ...typography.title, color: colors.ink }}>
                      {user.displayName}
                    </Text>
                    <Text style={{ ...typography.caption, color: colors.inkMuted }}>
                      @{user.username}
                    </Text>
                  </View>
                </View>
                {user.bio ? (
                  <Text style={{ ...typography.body, color: colors.ink, marginTop: 12 }}>
                    {user.bio}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
                  {renderFriendButton()}
                  <PencilButton
                    label={t('messages.send')}
                    size="sm"
                    variant="ghost"
                    icon={<ChatIcon size={16} color={colors.ink} />}
                    onPress={() => router.push(`/chat/${user.id}`)}
                  />
                </View>
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
