import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { View } from 'react-native';

export default function DrawerLayout() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      // Utiliser un délai pour s'assurer que la déconnexion est bien effectuée
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, token, router]);

  // Si en cours de chargement, afficher un écran de chargement
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View />
      </View>
    );
  }

  // Si pas connecté, ne rien afficher (la redirection se fera via useEffect)
  if (!token) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View />
      </View>
    );
  }

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


