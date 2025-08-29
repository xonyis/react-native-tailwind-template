import { BodyText, Caption, Heading1, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { MaterielDetail, materielsApi } from "@/services/materielsApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar1, Edit, Mail, Package, Phone, Trash, User, Wrench } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function MaterielDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [materiel, setMateriel] = useState<MaterielDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterielDetail = useCallback(async () => {
    if (!id || !token) {
      setError("ID matériel ou token manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const materielData = await materielsApi.getMaterielById(parseInt(id), token);
      setMateriel(materielData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(message);
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchMaterielDetail();
  }, [fetchMaterielDetail]);

  // Rafraîchir les données quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMaterielDetail();
    });

    return unsubscribe;
  }, [navigation, fetchMaterielDetail]);

  const handleGoBack = () => {
    router.push("/materiel");
  };

  const handleEdit = () => {
    if (materiel) {
      router.push(`/materiel-edit?id=${materiel.id}`);
    }
  };

  const handleDelete = () => {
    if (!materiel) return;

    Alert.alert(
      "Supprimer le matériel",
      `Êtes-vous sûr de vouloir supprimer ${materiel.nom} ?\n\nCette action ne peut pas être annulée.`,
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
              setLoading(true);
              await materielsApi.deleteMateriel(materiel.id, token!);
              Alert.alert(
                "Matériel supprimé",
                "Le matériel a été supprimé avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/materiel"),
                  },
                ]
              );
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                "Erreur",
                error instanceof Error 
                  ? error.message 
                  : "Impossible de supprimer le matériel"
              );
            } finally {
              setLoading(false);
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

  const getEtatColor = (etat: string) => {
    switch (etat?.toLowerCase()) {
      case 'neuf':
      case 'excellent':
        return '#10b981';
      case 'bon':
      case 'moyen':
        return '#f59e0b';
      case 'mauvais':
      case 'défectueux':
        return '#ef4444';
      default:
        return '#6b7280';
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

  if (error || !materiel) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || "Matériel non trouvé"}
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
        <Heading2 style={styles.headerTitle}>Détail Matériel</Heading2>
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
        {/* Nom du matériel */}
        <View style={styles.materielHeader}>
          <Heading1 style={styles.materielName}>{materiel.nom}</Heading1>
          {materiel.reference && (
            <View style={styles.referenceBadge}>
              <Caption style={styles.referenceText}>Référence: #{materiel.reference}</Caption>
            </View>
          )}
          <View style={styles.badgesContainer}>
            {materiel.etat && (
              <View style={[styles.statusBadge, { backgroundColor: getEtatColor(materiel.etat) + '20' }]}>
                <Caption style={[styles.statusText, { color: getEtatColor(materiel.etat) }]}>{materiel.etat}</Caption>
              </View>
            )}
            {materiel.type_materiel && (
              <View style={styles.typeBadge}>
                <Caption style={styles.typeText}>{materiel.type_materiel}</Caption>
              </View>
            )}
          </View>
        </View>

        {/* Informations du matériel */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations du matériel</Heading3>
          
          <View style={styles.infoRow}>
            <Package size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Type de matériel</Caption>
              <BodyText style={styles.infoValue}>{materiel.type_materiel || "Non spécifié"}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Wrench size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>État</Caption>
              <BodyText style={styles.infoValue}>{materiel.etat || "Non spécifié"}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar1 size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date d'achat</Caption>
              <BodyText style={styles.infoValue}>{formatDate(materiel.date_achat)}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar1 size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Date d'expiration</Caption>
              <BodyText style={styles.infoValue}>{formatDate(materiel.date_achat)}</BodyText>
              <Caption style={styles.expirationWarning}>2 jours restants</Caption>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Package size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Quantité totale</Caption>
              <BodyText style={styles.infoValue}>{materiel.quantite_total || 0}</BodyText>
            </View>
          </View>
        </View>

        {/* Contact */}
        {materiel.client && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Contact</Heading3>
            
            <View style={styles.infoRow}>
              <User size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Nom</Caption>
                <BodyText style={styles.infoValue}>{materiel.client.nom}</BodyText>
              </View>
            </View>

            {materiel.client.email && (
              <View style={styles.infoRow}>
                <Mail size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Email</Caption>
                  <BodyText style={styles.infoValue}>{materiel.client.email}</BodyText>
                </View>
              </View>
            )}

            {materiel.client.telephone && (
              <View style={styles.infoRow}>
                <Phone size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Téléphone</Caption>
                  <BodyText style={styles.infoValue}>{materiel.client.telephone}</BodyText>
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
  materielHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  materielName: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
  typeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: "#1e40af",
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
  expirationWarning: {
    color: "#f59e0b",
    fontSize: 12,
    marginTop: 2,
  },
});
