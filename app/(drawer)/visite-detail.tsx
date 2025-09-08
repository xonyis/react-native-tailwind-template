import { BodyText, Caption, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useVisiteDetail } from "@/hooks/useVisiteDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Edit, FileText, Mail, MapPin, MessageSquare, Phone, Trash, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function VisiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const visiteId = id ? parseInt(id) : null;
  const { visite, loading, error } = useVisiteDetail(visiteId);
  const [deleting, setDeleting] = useState(false);

  const handleGoBack = () => {
    router.push("/(drawer)/visites");
  };

  const handleEdit = () => {
    if (visite) {
      router.push(`/(drawer)/visite-edit?id=${visite.id}`);
    }
  };

  const handleDelete = async () => {
    if (!visite || !token) return;

    Alert.alert(
      'Supprimer la visite',
      `Êtes-vous sûr de vouloir supprimer cette visite ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await servicesWebApi.deleteVisite(visite.id, token);
              Alert.alert(
                'Succès',
                'Visite supprimée avec succès',
                [
                  {
                    text: 'OK',
                    onPress: () => router.push("/(drawer)/visites")
                  }
                ]
              );
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la visite');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Non définie';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <BodyText style={styles.loadingText}>Chargement de la visite...</BodyText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>{error}</BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  if (!visite) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>Visite non trouvée</BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Détails de la visite</Heading2>
        <View style={styles.headerActions}>
        <Pressable onPress={handleEdit} style={styles.editButton}>
            <Edit size={20} color="#2563eb" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Trash size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations de la visite */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations de la visite</Heading3>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <User size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Client</Caption>
                <BodyText style={styles.infoValue}>
                  {visite.client?.nom || 'Client non défini'}
                </BodyText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <FileText size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Statut</Caption>
                <View style={[styles.statusBadge, { backgroundColor: getStatutColor(visite.statut || '') }]}>
                  <BodyText style={styles.statusText}>
                    {getStatutLabel(visite.statut || '')}
                  </BodyText>
                </View>
              </View>
            </View>

            {(visite.type_visite || visite.typeVisite) && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={20} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Type de visite</Caption>
                  <BodyText style={styles.infoValue}>
                    {getTypeVisiteLabel(visite.type_visite || visite.typeVisite || '')}
                  </BodyText>
                </View>
              </View>
            )}

            {visite.technicien && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <User size={20} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Technicien</Caption>
                  <BodyText style={styles.infoValue}>{visite.technicien}</BodyText>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Dates</Heading3>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Date de visite</Caption>
                <BodyText style={styles.infoValue}>
                  {formatDate(visite.date_visite || visite.dateVisite)}
                </BodyText>
              </View>
            </View>

            {(visite.date_programmee || visite.dateProgrammee) && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={20} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Date programmée</Caption>
                  <BodyText style={styles.infoValue}>
                    {formatDate(visite.date_programmee || visite.dateProgrammee)}
                  </BodyText>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color="#6b7280" />
              </View>
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Date de création</Caption>
                <BodyText style={styles.infoValue}>
                  {formatDateTime(visite.date_creation || visite.dateCreation)}
                </BodyText>
              </View>
            </View>
          </View>
        </View>

        {/* Commentaires */}
        {visite.commentaires && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Commentaires</Heading3>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MessageSquare size={20} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <BodyText style={styles.commentText}>{visite.commentaires}</BodyText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Informations du client */}
        {visite.client && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Informations du client</Heading3>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <User size={20} color="#6b7280" />
                </View>
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Nom</Caption>
                  <BodyText style={styles.infoValue}>{visite.client.nom}</BodyText>
                </View>
              </View>

              {visite.client.ville && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MapPin size={20} color="#6b7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Ville</Caption>
                    <BodyText style={styles.infoValue}>{visite.client.ville}</BodyText>
                  </View>
                </View>
              )}

              {visite.client.adresseClient && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MapPin size={20} color="#6b7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Adresse</Caption>
                    <BodyText style={styles.infoValue}>{visite.client.adresseClient}</BodyText>
                  </View>
                </View>
              )}

              {visite.client.numeroTel1 && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Phone size={20} color="#6b7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Téléphone</Caption>
                    <BodyText style={styles.infoValue}>{visite.client.numeroTel1}</BodyText>
                  </View>
                </View>
              )}

              {visite.client.adresseEmail1 && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Mail size={20} color="#6b7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Email</Caption>
                    <BodyText style={styles.infoValue}>{visite.client.adresseEmail1}</BodyText>
                  </View>
                </View>
              )}

              {visite.client.referenceClient && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <FileText size={20} color="#6b7280" />
                  </View>
                  <View style={styles.infoContent}>
                    <Caption style={styles.infoLabel}>Référence client</Caption>
                    <BodyText style={styles.infoValue}>{visite.client.referenceClient}</BodyText>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Espace en bas */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#1f2937",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    color: "#374151",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    width: 24,
    alignItems: "center",
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    color: "#1f2937",
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  commentText: {
    color: "#1f2937",
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
