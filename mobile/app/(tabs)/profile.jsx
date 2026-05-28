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
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/store/useAuth';
import { api, uploadImage } from '../../src/api/client';
import { SettingsIcon, PencilIcon } from '../../src/components/icons';

export default function ProfileScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/posts/user/${user.id}`);
      setPosts(data.posts);
    } catch (_e) {
      // ignore
    } finally {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          data={posts}
          keyExtractor={(p) => p.id}
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
              fillColor={colors.paper}
              radius={22}
              padding={18}
              style={{ marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable onPress={changeAvatar}>
                  <Avatar uri={user.avatarUrl} name={user.displayName} size={72} />
                </Pressable>
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ ...typography.title, color: colors.ink }}>
                    {user.displayName || user.username}
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
                <PencilButton
                  label={t('profile.edit')}
                  size="sm"
                  icon={<PencilIcon size={16} color={colors.accentInk} />}
                  onPress={() => router.push('/profile/edit')}
                />
                <PencilButton
                  label={t('profile.changeAvatar')}
                  size="sm"
                  variant="ghost"
                  onPress={changeAvatar}
                />
              </View>
            </PencilFrame>
          }
          ListEmptyComponent={
            <PencilFrame filled fillColor={colors.paper} radius={16} padding={16}>
              <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                {t('feed.empty')}
              </Text>
            </PencilFrame>
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
