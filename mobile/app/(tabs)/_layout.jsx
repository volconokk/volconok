import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../src/theme/ThemeProvider';
import { HomeIcon, FriendsIcon, ChatIcon, ProfileIcon } from '../../src/components/icons';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
        tabBarItemStyle: { paddingTop: 6 },
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
