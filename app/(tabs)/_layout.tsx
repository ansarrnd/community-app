import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, PlusCircle, ShieldAlert, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRoleGuard } from '../../application/hooks/useRoleGuard';

export default function TabsLayout() {
  const { isMod, isAdmin } = useRoleGuard();
  const { theme } = useTheme();
  const canModerate = isMod || isAdmin;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bgHeader,
          borderBottomColor: theme.colors.borderCard,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '800',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopColor: theme.colors.tabBarBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
        },
        tabBarActiveTintColor: theme.colors.accentTeal,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore Events',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Host an Event',
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Moderation Queue',
          tabBarLabel: 'Moderation',
          href: canModerate ? '/admin' : null,
          tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile & Settings',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
