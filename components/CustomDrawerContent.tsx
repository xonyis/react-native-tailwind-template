import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { DrawerContentScrollView, DrawerItem, type DrawerContentComponentProps } from '@react-navigation/drawer';
import {
  Aperture,
  Bell,
  Calendar,
  CalendarCheck2,
  FileText,
  Gauge,
  Laptop,
  LogOut,
  MapPinned,
  MonitorCog,
  Server,
  Users,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const ICONS = {
  Gauge,
  Calendar,
  MapPinned,
  Bell,
  Server,
  FileText,
  Users,
  CalendarCheck2,
  Laptop,
  MonitorCog,
  Aperture,
} as const;

type DrawerItemDef = { name: string; label: string; icon: keyof typeof ICONS };

const MENU_ITEMS: DrawerItemDef[] = [
  { name: 'index', label: 'Dashboard', icon: 'Gauge' },
  { name: 'calendrier', label: 'Calendrier', icon: 'Calendar' },
  { name: 'carte-clients', label: 'Carte des Clients', icon: 'MapPinned' },
  { name: 'rappels', label: 'Rappels', icon: 'Bell' },
];

const GESTION_ITEMS: DrawerItemDef[] = [
  { name: 'services-web', label: 'Services Web', icon: 'Server' },
  { name: 'contrats', label: 'Contrats', icon: 'FileText' },
  { name: 'clients', label: 'Clients', icon: 'Users' },
  { name: 'visites', label: 'Visites', icon: 'CalendarCheck2' },
  { name: 'materiel', label: 'Matériel', icon: 'Laptop' },
  { name: 'interventions', label: 'Interventions', icon: 'MonitorCog' },
  { name: 'nexlease', label: 'NexLease', icon: 'Aperture' },
];

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const activeRouteName = props.state.routes[props.state.index]?.name;
  const { signOut, isLoading } = useAuth();

  const renderItem = (item: DrawerItemDef) => {
    const Icon = ICONS[item.icon];
    return (
      <DrawerItem
        activeTintColor="#FF6B6B"
        key={item.name}
        label={item.label}
        focused={activeRouteName === item.name}
        icon={({ color, size }) => <Icon color={color} size={size} />}
        onPress={() => props.navigation.navigate(item.name as never)}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ margin:"auto", paddingBottom:16 }}>
          <ThemedText className="mt-2 text-2xl font-semibold text-gray-500">GESTINFO</ThemedText>
        </View>
        <View style={{ paddingHorizontal: 24, paddingTop: 0, paddingBottom: 16 }}>
          <ThemedText className="mt-2 text-lg font-semibold text-gray-500">MENU</ThemedText>
        </View>
        {MENU_ITEMS.map(renderItem)}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <ThemedText className="mt-2 text-lg font-semibold text-gray-500">GESTION</ThemedText>
        </View>
        {GESTION_ITEMS.map(renderItem)}
      </DrawerContentScrollView>
      <View style={styles.bottomSection}>
        <DrawerItem
          labelStyle={{ color: '#ef4444' }}
          label="Déconnexion"
          icon={({ color, size }) => <LogOut color="#ef4444" size={size} />}
          onPress={() => {
            if (isLoading) return;
            props.navigation.closeDrawer();
            void signOut();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#a3a3a3',
    paddingHorizontal: 18,
    paddingVertical: 4,
    paddingBottom:16,
  },
});


