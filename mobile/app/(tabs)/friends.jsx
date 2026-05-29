import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PaperBackground } from '../../src/components/PaperBackground';
import { PencilFrame } from '../../src/components/PencilFrame';
import { PencilInput } from '../../src/components/PencilInput';
import { PencilButton } from '../../src/components/PencilButton';
import { Avatar } from '../../src/components/Avatar';
import { Header } from '../../src/components/Header';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useResponsive } from '../../src/hooks/useResponsive';
import { api } from '../../src/api/client';
import { SearchIcon, CheckIcon, XIcon } from '../../src/components/icons';

export default function FriendsScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { contentMaxWidth, horizontalPadding } = useResponsive();
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, r] = await Promise.all([api.get('/friends'), api.get('/friends/requests')]);
      setFriends(f.data.friends);
      setRequests(r.data);
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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/users/search', { params: { q: query.trim() } });
        setResults(data.users);
      } catch (_e) {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const accept = async (id) => {
    await api.post(`/friends/accept/${id}`);
    load();
  };
  const decline = async (id) => {
    await api.post(`/friends/decline/${id}`);
    load();
  };
  const requestFriend = async (userId) => {
    try {
      await api.post(`/friends/request/${userId}`);
      Alert.alert(t('friends.pending'));
      load();
    } catch (err) {
      Alert.alert(t('common.error'), err.displayMessage);
    }
  };
  const remove = async (userId) => {
    await api.delete(`/friends/${userId}`);
    load();
  };

  const renderFriendRow = (u, action) => (
    <PencilFrame
      filled
      fillColor={colors.paper}
      radius={16}
      padding={12}
      style={{ marginBottom: 10 }}
    >
      <Pressable
        onPress={() => router.push(`/user/${u.username}`)}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <Avatar uri={u.avatarUrl} name={u.displayName} size={42} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ ...typography.subtitle, color: colors.ink }}>{u.displayName}</Text>
          <Text style={{ ...typography.caption, color: colors.inkMuted }}>@{u.username}</Text>
        </View>
        {action}
      </Pressable>
    </PencilFrame>
  );

  const sections = [
    ...(requests.incoming.length
      ? [
          {
            title: t('friends.incoming'),
            items: requests.incoming,
            render: (item) =>
              renderFriendRow(
                item.user,
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Pressable onPress={() => accept(item.id)} hitSlop={8}>
                    <PencilFrame
                      filled
                      fillColor={colors.accent}
                      radius={20}
                      padding={6}
                      strokeWidth={1.4}
                    >
                      <CheckIcon size={18} color={colors.accentInk} />
                    </PencilFrame>
                  </Pressable>
                  <Pressable onPress={() => decline(item.id)} hitSlop={8}>
                    <PencilFrame filled fillColor={colors.paper} radius={20} padding={6}>
                      <XIcon size={18} />
                    </PencilFrame>
                  </Pressable>
                </View>,
              ),
          },
        ]
      : []),
    ...(requests.outgoing.length
      ? [
          {
            title: t('friends.outgoing'),
            items: requests.outgoing,
            render: (item) =>
              renderFriendRow(
                item.user,
                <Text style={{ ...typography.caption, color: colors.inkMuted }}>
                  {t('friends.pending')}
                </Text>,
              ),
          },
        ]
      : []),
    {
      title: t('friends.myFriends'),
      items: friends,
      render: (item) =>
        renderFriendRow(
          item,
          <PencilButton label={t('friends.remove')} size="sm" variant="ghost" onPress={() => remove(item.id)} />,
        ),
      empty: t('friends.noFriends'),
    },
  ];

  const renderSearchHeader = () => (
    <View style={{ marginBottom: 12 }}>
      <PencilInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('friends.search')}
        leftIcon={<SearchIcon color={colors.inkMuted} />}
      />
      {results.length > 0 ? (
        <View style={{ marginTop: 10 }}>
          {results.map((u) => (
            <View key={u.id}>
              {renderFriendRow(
                u,
                <PencilButton
                  label={t('friends.add')}
                  size="sm"
                  onPress={() => requestFriend(u.id)}
                />,
              )}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <PaperBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header title={t('friends.title')} />
        <FlatList
          contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingVertical: 16, paddingBottom: 32 }}
          data={sections}
          keyExtractor={(s) => s.title}
          style={{ alignSelf: 'center', width: '100%', maxWidth: contentMaxWidth }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListHeaderComponent={renderSearchHeader()}
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
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  ...typography.caption,
                  color: colors.inkMuted,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {item.title}
              </Text>
              {item.items.length === 0 && item.empty ? (
                <PencilFrame filled fillColor={colors.paper} radius={16} padding={16}>
                  <Text style={{ ...typography.body, color: colors.inkMuted, textAlign: 'center' }}>
                    {item.empty}
                  </Text>
                </PencilFrame>
              ) : (
                item.items.map((it) => (
                  <View key={it.id || it.user?.id}>{item.render(it)}</View>
                ))
              )}
            </View>
          )}
        />
      </SafeAreaView>
    </PaperBackground>
  );
}
