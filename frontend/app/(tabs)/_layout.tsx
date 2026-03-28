import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { LiveClock } from '../../src/components/LiveClock';
import { useAuthStore } from '../../src/store/authStore';
import { useTranslation } from '../../src/hooks/useTranslation';

function ClockHeader() {
  const { user } = useAuthStore();
  return (
    <View style={styles.clockWrapper}>
      <LiveClock countryCode={(user as any)?.country_code || 'GB'} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTitleStyle: { color: '#fff', fontSize: 18, fontWeight: '700' },
        headerTintColor: '#76FF00',
        headerRight: () => <ClockHeader />,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#76FF00',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: styles.tabBarLabel,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: t('workouts'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('progress'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A1A',
    borderTopColor: '#2A2A2A',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  clockWrapper: {
    marginRight: 16,
    alignItems: 'flex-end',
  },
});
