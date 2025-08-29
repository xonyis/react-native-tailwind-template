import { BodyText, Caption } from "@/components/CustomText";
import { Edit, Eye, Trash } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export interface ServiceWebItem {
  id: number;
  nom: string;
  reference?: string;
  client?: {
    nom: string;
    referenceClient?: string;
  };
  statut?: string;
  dateCreation?: string;
  dateExpiration?: string;
}

interface ServicesWebListProps {
  items: ServiceWebItem[];
  onItemPress: (item: ServiceWebItem) => void;
  onEditPress: (item: ServiceWebItem) => void;
  onDeletePress: (item: ServiceWebItem) => void;
  loading?: boolean;
}

export function ServicesWebList({ 
  items, 
  onItemPress, 
  onEditPress, 
  onDeletePress,
  loading = false 
}: ServicesWebListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BodyText style={styles.emptyText}>Aucun service trouvé</BodyText>
      </View>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Non spécifiée";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.item}
          onPress={() => onItemPress(item)}
        >
          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <BodyText style={styles.itemTitle}>{item.nom}</BodyText>
              {item.reference && (
                <View style={styles.referenceBadge}>
                  <Caption style={styles.referenceText}>
                    #{item.reference}
                  </Caption>
                </View>
              )}
            </View>

            {item.client && (
              <View style={styles.clientInfo}>
                <Caption style={styles.clientLabel}>Client:</Caption>
                <BodyText style={styles.clientName}>{item.client.nom}</BodyText>
                {item.client.referenceClient && (
                  <Caption style={styles.clientReference}>
                    #{item.client.referenceClient}
                  </Caption>
                )}
              </View>
            )}

            {item.statut && (
              <View style={styles.statusContainer}>
                <Caption style={styles.statusLabel}>Statut:</Caption>
                <View style={styles.statusBadge}>
                  <Caption style={styles.statusText}>{item.statut}</Caption>
                </View>
              </View>
            )}

            <View style={styles.datesContainer}>
              {item.dateCreation && (
                <View style={styles.dateInfo}>
                  <Caption style={styles.dateLabel}>Créé le:</Caption>
                  <BodyText style={styles.dateValue}>
                    {formatDate(item.dateCreation)}
                  </BodyText>
                </View>
              )}
              {item.dateExpiration && (
                <View style={styles.dateInfo}>
                  <Caption style={styles.dateLabel}>Expire le:</Caption>
                  <BodyText style={styles.dateValue}>
                    {formatDate(item.dateExpiration)}
                  </BodyText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.itemActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => onItemPress(item)}
            >
              <Eye size={18} color="#6b7280" />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onEditPress(item)}
            >
              <Edit size={18} color="#2563eb" />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onDeletePress(item)}
            >
              <Trash size={18} color="#ef4444" />
            </Pressable>
          </View>
        </Pressable>
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
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  referenceBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  referenceText: {
    color: '#6b7280',
    fontSize: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  clientLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  clientName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  clientReference: {
    color: '#9ca3af',
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  dateValue: {
    color: '#374151',
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
});
