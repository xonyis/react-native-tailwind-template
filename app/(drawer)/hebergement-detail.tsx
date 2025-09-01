import { BodyText, Caption, Heading1, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useHebergementDetail } from "@/hooks/useHebergementDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Edit, Globe, Server, Trash } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function HebergementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const hebergementId = id ? parseInt(id) : null;
  const { hebergement, loading, error, refreshHebergement } = useHebergementDetail(hebergementId);

  // Rafraîchir les données quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshHebergement();
    });

    return unsubscribe;
  }, [navigation, refreshHebergement]);

  const handleGoBack = () => {
    router.push("/(drawer)/services-web");
  };

  const handleEdit = () => {
    if (hebergement) {
      router.push(`/(drawer)/hebergement-edit?id=${hebergement.id}`);
    }
  };

  const handleDelete = () => {
    if (!hebergement || !token) return;

    Alert.alert(
      "Supprimer l'hébergement",
      `Êtes-vous sûr de vouloir supprimer l'hébergement "${hebergement.url}" ?\n\nCette action ne peut pas être annulée.`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await servicesWebApi.deleteHebergement(hebergement.id, token);
              Alert.alert(
                "Hébergement supprimé",
                "L'hébergement a été supprimé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(drawer)/services-web"),
                  },
                ]
              );
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                "Erreur",
                error instanceof Error 
                  ? error.message 
                  : "Impossible de supprimer l'hébergement"
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Non définie';
    }
    
    try {
      // Essayer de parser la date
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', dateString, error);
      return 'Date invalide';
    }
  };

  const getDaysRemaining = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return null;
    }
    
    try {
      const expirationDate = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(expirationDate.getTime())) {
        return null;
      }
      
      const today = new Date();
      
      // Reset time to compare only dates
      today.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0);
      
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Erreur lors du calcul des jours restants:', dateString, error);
      return null;
    }
  };

  const getStatusColor = (daysRemaining: number | null) => {
    if (daysRemaining === null) return '#6b7280';
    if (daysRemaining < 0) return '#ef4444'; // Rouge pour expiré
    if (daysRemaining <= 30) return '#f59e0b'; // Orange pour bientôt expiré
    return '#10b981'; // Vert pour OK
  };

  const getStatusText = (daysRemaining: number | null) => {
    if (daysRemaining === null) return 'Non définie';
    if (daysRemaining < 0) return 'Expiré';
    if (daysRemaining === 0) return 'Expire aujourd\'hui';
    if (daysRemaining === 1) return 'Expire demain';
    if (daysRemaining <= 30) return `Expire dans ${daysRemaining} jours`;
    return `Expire dans ${daysRemaining} jours`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !hebergement) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || "Hébergement non trouvé"}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  const renouvellementDays = getDaysRemaining(hebergement.dateRenouvellement);
  const rappelDays = getDaysRemaining(hebergement.dateRappel);

  // Debug: afficher les données de dates
  console.log('Données hébergement:', {
    dateCreation: hebergement.dateCreation,
    dateRenouvellement: hebergement.dateRenouvellement,
    dateRappel: hebergement.dateRappel,
    derniereFacture: hebergement.derniereFacture
  });

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Détail Hébergement</Heading2>
        <View style={styles.actionButtons}>
          <Pressable onPress={handleEdit} style={styles.editButton}>
            <Edit size={20} color="#2563eb" />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Trash size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* URL de l'hébergement */}
        <View style={styles.hebergementHeader}>
          <Heading1 style={styles.hebergementUrl}>{hebergement.client?.nom || 'Non défini'}</Heading1>
          <View className="gap-2 flex-row">
            <View style={styles.typeBadge}>
              <Caption style={styles.typeText}>{hebergement.typeHebergement}</Caption>
            </View>
            {hebergement.isNomDomaine && (
              <View style={styles.domainBadge}>
                <Caption style={styles.domainText}>Nom de domaine</Caption>
              </View>
            )}
          </View>
        </View>

        {/* Informations techniques */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations techniques</Heading3>
          
          { hebergement.url  && (
            <View style={styles.infoRow}>
              <Globe size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>URL</Caption>
                <BodyText style={styles.infoValue}>{hebergement.url}</BodyText>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Server size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Type d&apos;hébergement</Caption>
              <BodyText style={styles.infoValue}>{hebergement.typeHebergement}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de création</Caption>
              <BodyText style={styles.infoValue}>{formatDate(hebergement.dateCreation)}</BodyText>
            </View>
          </View>
        </View>

        {/* Dates importantes */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Dates importantes</Heading3>
          
          <View style={styles.infoRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de renouvellement</Caption>
              <BodyText style={styles.infoValue}>{formatDate(hebergement.dateRenouvellement)}</BodyText>
              <BodyText style={[styles.statusText, { color: getStatusColor(renouvellementDays) }]}>
                {getStatusText(renouvellementDays)}
              </BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de rappel</Caption>
              <BodyText style={styles.infoValue}>{formatDate(hebergement.dateRappel)}</BodyText>
              <BodyText style={[styles.statusText, { color: getStatusColor(rappelDays) }]}>
                {getStatusText(rappelDays)}
              </BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Dernière facture</Caption>
              <BodyText style={styles.infoValue}>{hebergement.derniereFacture}</BodyText>
            </View>
          </View>
        </View>

        {/* Informations du client (lecture seule) */}
        {hebergement.client && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Client</Heading3>
            <View style={styles.clientInfo}>
              <BodyText style={styles.clientName}>{hebergement.client.nom}</BodyText>
              {hebergement.client.raisonSocial && (
                <BodyText style={styles.clientEmail}>{hebergement.client.raisonSocial}</BodyText>
              )}
              {hebergement.client.adresseEmailClient && (
                <BodyText style={styles.clientEmail}>{hebergement.client.adresseEmailClient}</BodyText>
              )}
              {hebergement.client.numeroTel1 && (
                <BodyText style={styles.clientPhone}>{hebergement.client.numeroTel1}</BodyText>
              )}
            </View>
          </View>
        )}

        {/* Actions rapides */}
        {/* <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Actions rapides</Heading3>
          <View style={styles.actionButtonsContainer}>
            <Pressable style={styles.actionButton}>
              <ExternalLink size={20} color="#2563eb" />
              <BodyText style={styles.actionButtonText}>Visiter le site</BodyText>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Calendar size={20} color="#2563eb" />
              <BodyText style={styles.actionButtonText}>Programmer un rappel</BodyText>
            </Pressable>
          </View>
        </View> */}

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
  actionButtons: {
    flexDirection: 'row',
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
  hebergementHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  hebergementUrl: {
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
  },
  domainBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  domainText: {
    color: "#d97706",
    fontWeight: "600",
    textAlign: "center",
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
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: "#9ca3af",
    marginBottom: 2,
  },
  infoValue: {
    color: "#374151",
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    color: '#2563eb',
    fontWeight: '600',
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
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  clientInfo: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  clientEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
});
