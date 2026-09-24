import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { Colors } from '../../src/theme/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/useAppStore';
import { ServiceRequestStatus } from '@superapp/types';

export default function CustomerTabsLayout() {
  const router = useRouter();
  const { activeRide } = useAppStore();

  const isOngoingRide =
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
          title: isOngoingRide ? 'Active Ride' : 'Rides',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <MaterialCommunityIcons name="car" size={23} color={isOngoingRide ? '#059669' : color} />
              {isOngoingRide && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#10B981',
                    borderWidth: 1.5,
                    borderColor: '#FFFFFF',
                  }}
                />
              )}
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            const { activeRide: currentActiveRide } = useAppStore.getState();
            const isOngoing =
              !!currentActiveRide &&
              [
                ServiceRequestStatus.ACCEPTED,
                ServiceRequestStatus.PROVIDER_EN_ROUTE,
                ServiceRequestStatus.ARRIVED,
                ServiceRequestStatus.IN_PROGRESS,
              ].includes(currentActiveRide.status);
            if (isOngoing) {
              e.preventDefault();
              router.push('/(customer)/ride-tracking');
            }
          },
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
