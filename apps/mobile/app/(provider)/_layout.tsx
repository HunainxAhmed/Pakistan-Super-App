import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';

export default function ProviderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="job-active" />
    </Stack>
  );
}
