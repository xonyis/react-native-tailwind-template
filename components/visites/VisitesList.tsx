import { BodyText, Caption, Heading3 } from "@/components/CustomText";
import { Visite } from "@/services/servicesWebApi";
import { Calendar, Edit, Eye, FileText, MessageSquare, User } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

interface VisitesListProps {
  visites: Visite[];
  onItemPress: (visite: Visite) => void;
  onEditPress: (visite: Visite) => void;
  onDeletePress: (visite: Visite) => void;
  loading?: boolean;
}

export function VisitesList({ 
  visites, 
  onItemPress, 
  onEditPress, 
  onDeletePress, 
  loading = false 
}: VisitesListProps) {
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'programmee':
        return '#f59e0b'; // Orange
      case 'effectuee':
        return '#10b981'; // Vert
      case 'annulee':
        return '#ef4444'; // Rouge
      default:
        return '#6b7280'; // Gris
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'programmee':
        return 'Programmée';
      case 'effectuee':
        return 'Effectuée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  };

  const getTypeVisiteLabel = (type: string) => {
    switch (type) {
      case 'annuelle':
        return 'Visite annuelle';
      case 'ponctuelle':
        return 'Visite ponctuelle';
      case 'maintenance':
        return 'Maintenance';
      default:
        return type || 'Non spécifié';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non définie';
    // Si la date est déjà au format d/m/Y, on la retourne telle quelle
    if (dateString.includes('/')) {
      return dateString;
    }
    // Sinon, on essaie de la convertir
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <BodyText style={styles.loadingText}>Chargement des visites...</BodyText>
      </View>
    );
  }

  if (visites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FileText size={48} color="#9ca3af" />
        <Heading3 style={styles.emptyTitle}>Aucune visite</Heading3>
        <BodyText style={styles.emptyText}>
          Aucune visite n'a été trouvée. Créez votre première visite.
        </BodyText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visites.map((visite) => (
        <TouchableOpacity
          key={visite.id}
          style={styles.card}
          onPress={() => onItemPress(visite)}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <Heading3 style={styles.title}>
              {visite.client_nom || 'Client non défini'}
            </Heading3>
            <View style={[styles.statusBadge, { backgroundColor: getStatutColor(visite.statut) }]}>
              <Caption style={styles.statusText}>
                {getStatutLabel(visite.statut)}
              </Caption>
            </View>
          </View>
          
          <View style={styles.info}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#666" />
              <BodyText style={styles.infoText}>
                Visite: {formatDate(visite.date_visite)}
              </BodyText>
            </View>
            
            {visite.date_programmee && (
              <View style={styles.infoRow}>
                <Calendar size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Programmée: {formatDate(visite.date_programmee)}
                </BodyText>
              </View>
            )}
            
            {visite.type_visite && (
              <View style={styles.infoRow}>
                <FileText size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  {getTypeVisiteLabel(visite.type_visite)}
                </BodyText>
              </View>
            )}
            
            {visite.technicien && (
              <View style={styles.infoRow}>
                <User size={16} color="#666" />
                <BodyText style={styles.infoText}>
                  Technicien: {visite.technicien}
                </BodyText>
              </View>
            )}
            
            {visite.commentaires && (
              <View style={styles.infoRow}>
                <MessageSquare size={16} color="#666" />
                <BodyText style={styles.infoText} numberOfLines={2}>
                  {visite.commentaires}
                </BodyText>
              </View>
            )} 
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onItemPress(visite)}
            >
              <Eye size={24} color="#3D9FCD" />
              </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEditPress(visite)}
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: '#1f2937',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: '#6b7280',
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
