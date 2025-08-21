import { useAuth } from '@/context/AuthContext';
import React from 'react';
import { Pressable, Text } from 'react-native';

export function LogoutButton() {
  const { signOut, isLoading } = useAuth();
  return (
    <Pressable onPress={signOut} disabled={isLoading} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ color: '#ef4444', fontWeight: '600' }}>Déconnexion</Text>
    </Pressable>
  );
}


