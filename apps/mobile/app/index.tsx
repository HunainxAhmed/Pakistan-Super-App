import React from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';

export default function EntryIndex() {
  const userRoleMode = useAppStore((s) => s.userRoleMode);

  return (
    <Redirect
      href={userRoleMode === 'PROVIDER' ? '/(provider)/dashboard' : '/(customer)/home'}
    />
  );
}

