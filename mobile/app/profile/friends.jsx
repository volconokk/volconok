import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { Avatar } from '../../src/components/Avatar';
import { Header } from '../../src/components/Header';
import { FriendsLoading } from '../../src/components/LoadingStates';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api } from '../../src/api/client';
import { FriendsIcon, ChatIcon } from '../../src/components/icons';

export default function ProfileFriendsScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/friends');
      setFriends(data.friends);
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }) => (
    <PencilFrame
      filled
      fillColor={colors.paper}
      radius={16}
      padding={12}
      style={{ marginBottom: 10 }}
    >
      <Pressable
        onPress={() => router.push(`/user/${item.username}`)}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Avatar uri={item.avatarUrl} name={item.displayName} size={48} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ ...typography.subtitle, color: colors.ink }}>
            {item.displayName}
          </Text>
          <Text style={{ ...typography.caption, color: colors.inkMuted }}>
            @{item.username}
          </Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/chat/${item.id}`);
          }}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChatIcon size={22} color={colors.inkMuted} />
        </Pressable>
      </Pressable>
    </PencilFrame>
  );

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header back title={t('profile.friends')} backTo="/(tabs)/profile" />
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingVertical: 16,
            paddingBottom: 32,
          }}
          data={friends}
          keyExtractor={(item) => item.id}
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
              <FriendsLoading count={5} />
            ) : (
              <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
                <PencilFrame filled fillColor={colors.paper} radius={28} padding={20}>
                  <FriendsIcon size={36} color={colors.inkMuted} />
                </PencilFrame>
                <Text
                  style={{
                    ...typography.subtitle,
                    color: colors.ink,
                    marginTop: 16,
                    textAlign: 'center',
                  }}
                >
                  {t('friends.noFriends')}
                </Text>
                <Text
                  style={{
                    ...typography.body,
                    color: colors.inkMuted,
                    marginTop: 6,
                    textAlign: 'center',
                  }}
                >
                  {t('empty.friendsMessage')}
                </Text>
              </View>
            )
          }
          renderItem={renderItem}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
