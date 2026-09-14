import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 2,
          paddingTop: 4,
          position: Platform.OS === 'web' ? ('fixed' as any) : 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
          marginBottom: 1,
          lineHeight: 12,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ride-booking"
        options={{
          title: 'Rides',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="car" size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mechanic-request"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home-services"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ride-tracking"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
