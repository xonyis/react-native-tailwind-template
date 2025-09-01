import { BodyText, Heading3 } from "@/components/CustomText";
import { Site } from "@/services/servicesWebApi";
import { useRouter } from "expo-router";
import { Calendar, Edit, Eye, Globe, Lock, ShieldUser } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface SitesListProps {
  sites: Site[];
  onItemPress: (site: Site) => void;
  onEditPress: (site: Site) => void;
  onDeletePress: (site: Site) => void;
  loading?: boolean;
}

export function SitesList({ 
  sites, 
  onItemPress, 
  onEditPress, 
  onDeletePress,
  loading = false 
}: SitesListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (sites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BodyText style={styles.emptyText}>Aucun site trouvé</BodyText>
      </View>
    );
  }

  const handlePress = (site: any) => {
    if (onItemPress) {
      onItemPress(site);
      return;
    }
    router.push(`/site-detail?id=${site.id}`);
  };

  return (
    <View style={styles.container}>
      {sites.map((site) => (
        <TouchableOpacity
          key={site.id}
          style={styles.card}
          onPress={() => handlePress(site)}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <Heading3 style={styles.title}>{site.client_nom}</Heading3>
          </View>

          <View style={styles.info}>
            <View style={styles.infoRow}>
              <Globe size={16} color="#666" />
              <BodyText style={styles.infoText}>{site.url}</BodyText>
            </View>
            
            {site.url_admin && (
              <View style={styles.infoRow}>
                <ShieldUser size={16} color="#666" />
                <BodyText style={styles.infoText}>{site.url_admin}</BodyText>
              </View>
            )}
            
            {site.login && (
              <View style={styles.infoRow}>
                <Lock size={16} color="#666" />
                <BodyText style={styles.infoText}>Login: {site.login}</BodyText>
              </View>
            )}
            
            {site.date_creation && (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Créé le: {site.date_creation}
                </BodyText>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handlePress(site)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/site-edit?id=${site.id}`)}
    
            >
              <Edit size={24} color="#FBCA35" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  info: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});
