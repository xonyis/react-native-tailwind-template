import { BodyText } from "@/components/CustomText";
import { Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type VisiteCategory = 'programmee' | 'historique';

interface VisitesTabsProps {
  activeTab: VisiteCategory;
  onTabChange: (tab: VisiteCategory) => void;
}

export function VisitesTabs({ activeTab, onTabChange }: VisitesTabsProps) {
  const tabs = [
    {
      id: 'programmee' as VisiteCategory,
      label: 'Programmées',
      icon: Calendar,
    },
    {
      id: 'historique' as VisiteCategory,
      label: 'Historique',
      icon: Clock,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab.id)}
          >
            <IconComponent 
              size={20} 
              color={isActive ? "#FF6B6B" : "#9ca3af"} 
            />
            <BodyText style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </BodyText>
            {isActive && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    position: 'relative',
  },
  activeTab: {
    // Styles pour l'onglet actif
  },
  tabText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF6B6B',
  },
});
