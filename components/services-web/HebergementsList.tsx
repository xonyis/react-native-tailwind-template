import { BodyText, Caption, Heading3 } from "@/components/CustomText";
import { Hebergement } from "@/services/servicesWebApi";
import { Calendar, Edit, Eye, FileText, Globe } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HebergementsListProps {
  hebergements: Hebergement[];
  onItemPress: (hebergement: Hebergement) => void;
  onEditPress: (hebergement: Hebergement) => void;
  onDeletePress: (hebergement: Hebergement) => void;
  loading?: boolean;
}

export function HebergementsList({ 
  hebergements, 
  onItemPress, 
  onEditPress, 
  onDeletePress,
  loading = false 
}: HebergementsListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (hebergements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BodyText style={styles.emptyText}>Aucun hébergement trouvé</BodyText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hebergements.map((hebergement) => (
        <TouchableOpacity
          key={hebergement.id}
          style={styles.card}
          onPress={() => onItemPress(hebergement)}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <Heading3 style={styles.title}>{hebergement.client_nom}</Heading3>
            {hebergement.is_nom_domaine && (
              <View style={styles.statusBadge}>
                <Caption style={styles.statusText}>Domaine</Caption>
              </View>
            )}
          </View>

          <View style={styles.info}>
            {hebergement.url && (
              <View style={styles.infoRow}>
                <Globe size={16} color="#666" />
                <BodyText style={styles.infoText}>{hebergement.url}</BodyText>
              </View>
            )}
            
            <View style={styles.infoRow}>
              <FileText size={16} color="#666" />
              <BodyText style={styles.infoText}>{hebergement.type_hebergement}</BodyText>
            </View>
            
            {hebergement.date_renouvellement && (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Renouvellement: {hebergement.date_renouvellement}
                </BodyText>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onItemPress(hebergement)}
            >
              <Eye size={24} color="#3D9FCD" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEditPress(hebergement)}
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
  statusBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
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
