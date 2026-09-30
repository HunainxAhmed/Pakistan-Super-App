import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import { ServiceRequestStatus } from '@superapp/types';

export default function ProviderTabsLayout() {
  const { activeRide } = useAppStore();

  const isJobActive =
    !!activeRide &&
    [
      ServiceRequestStatus.ACCEPTED,
      ServiceRequestStatus.PROVIDER_EN_ROUTE,
      ServiceRequestStatus.ARRIVED,
      ServiceRequestStatus.IN_PROGRESS,
    ].includes(activeRide.status);

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
        name="dashboard"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => (
            <Ionicons name="speedometer-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="job-active"
        options={{
          title: isJobActive ? 'Active Trip' : 'Navigation',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons
                name="navigation"
                size={23}
                color={isJobActive ? Colors.primary : color}
              />
              {isJobActive && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 9,
                    height: 9,
                    borderRadius: 4.5,
                    backgroundColor: Colors.primary,
                    borderWidth: 1.5,
                    borderColor: '#FFFFFF',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Captain',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
