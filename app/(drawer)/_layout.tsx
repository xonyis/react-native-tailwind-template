import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { View } from 'react-native';

export default function DrawerLayout() {
  const { token, isLoading } = useAuth();
  if (!isLoading && !token) return <Redirect href="/login" />;
  return (
    <View style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerShown: false }} drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen name="index" options={{ drawerLabel: 'Dashboard' }} />
        <Drawer.Screen name="calendrier" options={{ drawerLabel: 'Calendrier' }} />
        <Drawer.Screen name="carte-clients" options={{ drawerLabel: 'Carte des Clients' }} />
        <Drawer.Screen name="rappels" options={{ drawerLabel: 'Rappels' }} />
        <Drawer.Screen name="services-web" options={{ drawerLabel: 'Services Web' }} />
        <Drawer.Screen name="contrats" options={{ drawerLabel: 'Contrats' }} />
        <Drawer.Screen name="clients" options={{ drawerLabel: 'Clients' }} />
        <Drawer.Screen name="visites" options={{ drawerLabel: 'Visites' }} />
        <Drawer.Screen name="materiel" options={{ drawerLabel: 'Matériel' }} />
        <Drawer.Screen name="interventions" options={{ drawerLabel: 'Interventions' }} />
        <Drawer.Screen name="nexlease" options={{ drawerLabel: 'NexLease' }} />
      </Drawer>
    </View>
  );
}


