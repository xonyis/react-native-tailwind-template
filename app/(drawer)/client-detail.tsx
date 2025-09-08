import { BodyText, Caption, Heading1, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { CustomMapView } from "@/components/MapView";
import { useAuth } from "@/context/AuthContext";
import { Client, clientsApi } from "@/services/ClientsApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Building, Calendar1, Edit, Mail, MapPin, Phone, Trash, User } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetail = useCallback(async () => {
    if (!id || !token) {
      setError("ID client ou token manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const clientData = await clientsApi.getClientById(parseInt(id), token);
      setClient(clientData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(message);
      Alert.alert("Erreur", message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchClientDetail();
  }, [fetchClientDetail]);

  // Rafraîchir les données quand on revient sur cet écran
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchClientDetail();
    });

    return unsubscribe;
  }, [navigation, fetchClientDetail]);

  const handleGoBack = () => {
    router.push("/clients");
  };

  const handleEdit = () => {
    if (client) {
      router.push(`/client-edit?id=${client.id}`);
    }
  };

  const handleDelete = () => {
    if (!client) return;

    Alert.alert(
      "Supprimer le client",
      `Êtes-vous sûr de vouloir supprimer ${client.nom} ?\n\nCette action supprimera également toutes les données liées (contrats, matériels, interventions, etc.) et ne peut pas être annulée.`,
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
              await clientsApi.deleteClient(client.id, token!);
              Alert.alert(
                "Client supprimé",
                "Le client et toutes ses données ont été supprimés avec succès.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                "Erreur",
                error instanceof Error 
                  ? error.message 
                  : "Impossible de supprimer le client"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !client) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || "Client non trouvé"}
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
        <Heading2 style={styles.headerTitle}>Détail Client</Heading2>
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
        <View style={styles.clientHeader}>
          <Heading1 style={styles.clientName}>{client.nom}</Heading1>
          <View className="gap-2 flex-row">
            {client.referenceClient && (
              <View style={styles.clientTypeBadge}>
                <Caption style={styles.clientTypeText}>{client.referenceClient}</Caption>
              </View>
            )}
            {client.typeClient && (
              <View style={styles.clientTypeBadge}>
                <Caption style={styles.clientTypeText}>{client.typeClient}</Caption>
              </View>
            )}
          </View>
        </View>

        {/* Informations de contact */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Contact</Heading3>
          
          {client.adresseEmail1 && (
            <View style={styles.infoRow}>
              <Mail size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Email 1</Caption>
                <BodyText style={styles.infoValue}>{client.adresseEmail1}</BodyText>
              </View>
            </View>
          )}

          {client.adresseEmail2 && (
            <View style={styles.infoRow}>
              <Mail size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Email 2</Caption>
                <BodyText style={styles.infoValue}>{client.adresseEmail2}</BodyText>
              </View>
            </View>
          )}

          {client.numeroTel1 && (
            <View style={styles.infoRow}>
              <Phone size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Téléphone 1</Caption>
                <BodyText style={styles.infoValue}>{client.numeroTel1}</BodyText>
              </View>
            </View>
          )}

          {client.numeroTel2 && (
            <View style={styles.infoRow}>
              <Phone size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Caption style={styles.infoLabel}>Téléphone 2</Caption>
                <BodyText style={styles.infoValue}>{client.numeroTel2}</BodyText>
              </View>
            </View>
          )}
        </View>

        {/* Adresse */}
        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Adresse</Heading3>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <BodyText style={styles.infoValue}>
                {client.adresseClient}
              </BodyText>
              <BodyText style={styles.infoValue}>
                {client.codePostal} {client.ville}
              </BodyText>
            </View>
          </View>
        </View>

        {/* Informations client */}
        {(client.referenceClient || client.typeClient || client.visiteAnnuelle || client.commentaire) && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Informations client</Heading3>
            
            {client.referenceClient && (
              <View style={styles.infoRow}>
                <User size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Référence client</Caption>
                  <BodyText style={styles.infoValue}>{client.referenceClient}</BodyText>
                </View>
              </View>
            )}

            {client.typeClient && (
              <View style={styles.infoRow}>
                <Building size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Type de client</Caption>
                  <BodyText style={styles.infoValue}>{client.typeClient}</BodyText>
                </View>
              </View>
            )}

            {client.commentaire && (
              <View style={styles.infoRow}>
                <User size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Caption style={styles.infoLabel}>Commentaire</Caption>
                  <BodyText style={styles.infoValue}>{client.commentaire}</BodyText>
                </View>
              </View>
            )}

             {client.visiteAnnuelle && (
                <View style={styles.infoRow}>
                 <Calendar1 size={20} color="#6b7280" />
                 <View style={styles.infoContent}>
                   <Caption style={styles.infoLabel}>Visite annuelle</Caption>
                   <BodyText style={styles.infoValue}>{client.visiteAnnuelle}</BodyText>
                 </View>
               </View>
             )}
          </View>
        )}

        {/* Coordonnées GPS */}
        {(client.latitude && client.longitude) && (
          <View style={styles.section}>
            <Heading3 style={styles.sectionTitle}>Localisation</Heading3>
            {/* Carte interactive */}
            <View style={styles.mapContainer}>
              <CustomMapView
                latitude={client.latitude}
                longitude={client.longitude}
                title={client.nom}
                description={`Localisation de ${client.nom}`}
                height={250}
                zoom={15}
                clientType={client.typeClient}
              />
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
  clientHeader: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  clientName: {
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  clientTypeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clientTypeText: {
    color: "#1e40af",
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  mapContainer: {
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
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