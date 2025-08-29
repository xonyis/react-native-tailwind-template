import { BodyText, Caption, Heading1, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useNexLeaseDetail } from "@/hooks/useNexLeaseDetail";
import { nexleaseApi } from "@/services/nexleaseApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bell, BellRing, Calendar, Calendar1, Clock, Edit, FileText, Mail, Phone, Trash, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function NexLeaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const nexleaseId = id ? parseInt(id) : null;
  const { nexlease, loading, error } = useNexLeaseDetail(nexleaseId);

  const handleGoBack = () => {
    router.push("/(drawer)/nexlease");
  };

  const handleEdit = () => {
    if (nexlease) {
      router.push(`/(drawer)/nexlease-edit?id=${nexlease.id}`);
    }
  };

  const handleDelete = () => {
    if (!nexlease) return;

    Alert.alert(
      "Supprimer le NexLease",
      `Êtes-vous sûr de vouloir supprimer ce NexLease ?\n\nCette action ne peut pas être annulée.`,
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
              await nexleaseApi.deleteNexLease(nexlease.id, token!);
              Alert.alert(
                "NexLease supprimé",
                "Le NexLease a été supprimé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(drawer)/nexlease"),
                  },
                ]
              );
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                "Erreur",
                error instanceof Error 
                  ? error.message 
                  : "Impossible de supprimer le NexLease"
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non spécifiée";
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
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !nexlease) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || "NexLease non trouvé"}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Détail NexLease</Heading2>
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
        {/* Nom du client */}
        <View style={styles.nexleaseHeader}>
          <Heading1 style={styles.nexleaseName}>{nexlease.client?.nom || "Client non spécifié"}</Heading1>
          {nexlease.client?.referenceClient && (
            <View style={styles.referenceBadge}>
              <Caption style={styles.referenceText}>Référence: #{nexlease.client.referenceClient}</Caption>
            </View>
          )}
          <View style={styles.badgesContainer}>
            {nexlease.duree && (
              <View style={styles.dureeBadge}>
                <Caption style={styles.dureeText}>{nexlease.duree}</Caption>
              </View>
            )}
            {nexlease.client?.raisonSocial && (
              <View style={styles.raisonSocialBadge}>
                <Caption style={styles.raisonSocialText}>{nexlease.client.raisonSocial}</Caption>
              </View>
            )}
          </View>
        </View>

        {/* Informations du NexLease */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations du NexLease</Heading3>
          
          <View style={styles.infoRow}>
            <Calendar size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de début</Caption>
              <BodyText style={styles.infoValue}>{formatDate(nexlease.dateDebut)}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar1 size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date de fin</Caption>
              <BodyText style={styles.infoValue}>{formatDate(nexlease.dateFin)}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Durée</Caption>
              <BodyText style={styles.infoValue}>{nexlease.duree || "Non spécifiée"} mois</BodyText>
            </View>
          </View>

          {nexlease.biensFinances && (
            <View style={styles.infoRow}>
              <FileText size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Biens financés</Caption>
                <BodyText style={styles.infoValue}>{nexlease.biensFinances}</BodyText>
              </View>
            </View>
          )}

          {nexlease.dateRelance1 && (
            <View style={styles.infoRow}>
              <Bell size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Date de relance 1</Caption>
                <BodyText style={styles.infoValue}>{formatDate(nexlease.dateRelance1)}</BodyText>
              </View>
            </View>
          )}

          {nexlease.dateRelance2 && (
            <View style={styles.infoRow}>
              <BellRing size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Date de relance 2</Caption>
                <BodyText style={styles.infoValue}>{formatDate(nexlease.dateRelance2)}</BodyText>
              </View>
            </View>
          )}
        </View>

        {/* Contact */}
        {nexlease.client && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Contact</Heading3>
            
            <View style={styles.infoRow}>
              <User size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Nom</Caption>
                <BodyText style={styles.infoValue}>{nexlease.client.nom}</BodyText>
              </View>
            </View>

            {nexlease.client.email && (
              <View style={styles.infoRow}>
                <Mail size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Email</Caption>
                  <BodyText style={styles.infoValue}>{nexlease.client.email}</BodyText>
                </View>
              </View>
            )}

            {nexlease.client.telephone && (
              <View style={styles.infoRow}>
                <Phone size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Téléphone</Caption>
                  <BodyText style={styles.infoValue}>{nexlease.client.telephone}</BodyText>
                </View>
              </View>
            )}

            {nexlease.client.raisonSocial && (
              <View style={styles.infoRow}>
                <User size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Raison sociale</Caption>
                  <BodyText style={styles.infoValue}>{nexlease.client.raisonSocial}</BodyText>
                </View>
              </View>
            )}

            {/* Adresse du client */}
            {(nexlease.client.adresseClient || nexlease.client.ville || nexlease.client.codePostal) && (
              <View style={styles.infoRow}>
                <User size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Adresse</Caption>
                  <BodyText style={styles.infoValue}>
                    {nexlease.client.adresseClient && `${nexlease.client.adresseClient}\n`}
                    {nexlease.client.codePostal && nexlease.client.ville 
                      ? `${nexlease.client.codePostal} ${nexlease.client.ville}`
                      : nexlease.client.ville || nexlease.client.codePostal
                    }
                    {nexlease.client.pays && `\n${nexlease.client.pays}`}
                  </BodyText>
                </View>
              </View>
            )}
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
  nexleaseHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  nexleaseName: {
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 24,
    fontWeight: "bold",
  },
  referenceBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  referenceText: {
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dureeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dureeText: {
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
  raisonSocialBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  raisonSocialText: {
    color: "#d97706",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
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
});
