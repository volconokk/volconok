import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilButton } from '../../src/components/PencilButton';
import { Avatar } from '../../src/components/Avatar';
import { PostCard } from '../../src/components/PostCard';
import { Header } from '../../src/components/Header';
import { ProfileStats } from '../../src/components/ProfileStats';
import { FeedLoading } from '../../src/components/LoadingStates';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useAuth } from '../../src/store/useAuth';
import { api, uploadImage } from '../../src/api/client';
import { SettingsIcon, PencilIcon } from '../../src/components/icons';
import { formatMonthYear } from '../../src/utils/time';

export default function ProfileScreen() {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ postsCount: 0, friendsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [p, s] = await Promise.all([
        api.get(`/posts/user/${user.id}`),
        api.get('/users/me/stats'),
      ]);
      setPosts(p.data.posts);
      setStats(s.data);
    } catch (_e) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const changeAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled) return;
    try {
      const url = await uploadImage(res.assets[0]);
      await updateProfile({ avatarUrl: url });
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    }
  };

  if (!user) return null;

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header
          title={user.displayName || user.username}
          right={
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={10}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <SettingsIcon color={colors.ink} />
            </Pressable>
          }
        />
        <FlatList
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16, paddingBottom: 32 }}
          data={posts}
          keyExtractor={(p) => p.id}
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
          ListHeaderComponent={
            <PencilFrame
              filled
              elevated
              fillColor={colors.paper}
              radius={22}
              padding={18}
              style={{ marginBottom: 16 }}
            >
              <View style={{ alignItems: 'center' }}>
                <Pressable onPress={changeAvatar}>
                  <Avatar uri={user.avatarUrl} name={user.displayName} size={88} />
                  <View
                    style={{
                      position: 'absolute',
                      right: -2,
                      bottom: -2,
                      backgroundColor: colors.accent,
                      borderRadius: 14,
                      width: 28,
                      height: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.paper,
                    }}
                  >
                    <PencilIcon size={14} color={colors.accentInk} />
                  </View>
                </Pressable>
                <Text style={{ ...typography.title, color: colors.ink, marginTop: 12 }}>
                  {user.displayName || user.username}
                </Text>
                <Text style={{ ...typography.caption, color: colors.inkMuted, marginTop: 2 }}>
                  @{user.username}
                </Text>
                {user.bio ? (
                  <Text
                    style={{
                      ...typography.body,
                      color: colors.ink,
                      marginTop: 10,
                      textAlign: 'center',
                    }}
                  >
                    {user.bio}
                  </Text>
                ) : null}
                {user.createdAt ? (
                  <Text style={{ ...typography.caption, color: colors.inkFaint, marginTop: 8 }}>
                    {t('profile.memberSince', {
                      date: formatMonthYear(user.createdAt, i18n.language),
                    })}
                  </Text>
                ) : null}
              </View>

              <ProfileStats postsCount={stats.postsCount} friendsCount={stats.friendsCount} />

              <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
                <PencilButton
                  label={t('profile.edit')}
                  size="sm"
                  fullWidth
                  style={{ flex: 1 }}
                  icon={<PencilIcon size={16} color={colors.accentInk} />}
                  onPress={() => router.push('/profile/edit')}
                />
                <PencilButton
                  label={t('settings.title')}
                  size="sm"
                  variant="ghost"
                  icon={<SettingsIcon size={16} color={colors.ink} />}
                  onPress={() => router.push('/settings')}
                />
              </View>
            </PencilFrame>
          }
          ListEmptyComponent={
            loading ? (
              <FeedLoading count={2} />
            ) : (
              <PencilFrame filled fillColor={colors.paper} radius={16} padding={20}>
                <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                  {t('profile.noPostsOwn')}
                </Text>
              </PencilFrame>
            )
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
