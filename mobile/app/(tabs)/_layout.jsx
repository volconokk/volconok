import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/theme/ThemeProvider';
import { HomeIcon, FriendsIcon, ChatIcon, ProfileIcon } from '../../src/components/icons';
import { useBadges } from '../../src/store/useBadges';
import { useSocketEvent } from '../../src/store/useSocket';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { messages, refresh, refreshMessages, refreshNotifications } = useBadges();

  const bottomInset = Math.max(insets.bottom, 8);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useSocketEvent('message:new', () => refreshMessages());
  useSocketEvent('notification:new', () => refreshNotifications());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
        tabBarItemStyle: { paddingTop: 6 },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.accentInk, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopWidth: 1,
          borderTopColor: colors.lineSoft,
          height: 58 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: t('tabs.feed'),
          tabBarIcon: ({ color }) => (
            <View>
              <HomeIcon color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('tabs.friends'),
          tabBarIcon: ({ color }) => (
            <View>
              <FriendsIcon color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabs.messages'),
          tabBarBadge: messages > 0 ? (messages > 99 ? '99+' : messages) : undefined,
          tabBarIcon: ({ color }) => (
            <View>
              <ChatIcon color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => (
            <View>
              <ProfileIcon color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
