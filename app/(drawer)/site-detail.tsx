import { BodyText, Caption, Heading1, Heading2, Heading3 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useSiteDetail } from "@/hooks/useSiteDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar1, Edit, Eye, EyeOff, Globe, ShieldUser, Trash, User, UserLock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function SiteDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const siteId = id ? parseInt(String(id)) : null;
  const { site, loading, error, refreshSite } = useSiteDetail(siteId);
  const { token } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshSite();
    });
    return unsubscribe;
  }, [navigation, refreshSite]);

  const handleBack = () => {
    router.push("/(drawer)/services-web");
  };

  
  const handleEdit = () => {
    if (!site) return;
    router.push(`/site-edit?id=${site.id}`);
  };

  const handleDelete = () => {
    if (!site) return;

    Alert.alert(
      "Supprimer le site",
      `Êtes-vous sûr de vouloir supprimer "${site.url}" ?\n\nCette action ne peut pas être annulée.`,
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
              await servicesWebApi.deleteSite(site.id, token!);
              Alert.alert(
                "Site supprimé",
                "Le site a été supprimé avec succès.",
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
                  : "Impossible de supprimer le site"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!site) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <BodyText>Site introuvable</BodyText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       {/* Header avec bouton retour */}
       <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Détail du Site</Heading2>
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
        {/* Nom du client en grand */}
        <View style={styles.clientHeader}>
          <Heading1 style={styles.clientName}>
            {site.client?.nom || 'Client non défini'}
          </Heading1> 
        </View>

        <View style={styles.section}>
          <Heading3 style={styles.sectionTitle}>Informations</Heading3>
          
          <View style={styles.infoRow}>
            <Globe size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>URL du site</Caption>
              <BodyText style={styles.infoValue}>{site.url || '—'}</BodyText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ShieldUser size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>URL admin</Caption>
              <BodyText style={styles.infoValue}>{site.urlAdmin}</BodyText>
            </View>
          </View>
          {site.login ? (
          <View style={styles.infoRow}>
            <User size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Identifiant</Caption>
              <BodyText style={styles.infoValue}>{site.login}</BodyText>
            </View>
          </View>
          ) : null}
          {site.passwordDechiffre ? (
          <View style={styles.infoRow}>
            <UserLock size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Caption style={styles.infoLabel}>Mot de passe</Caption>
              <BodyText style={styles.valueText}>
                {showPassword ? site.passwordDechiffre : '•••••••••'}
              </BodyText>    
                   
              </View>
              <Pressable 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </Pressable>   
          </View>
          ) : null}
                     <View style={styles.infoRow}>
             <Calendar1 size={20} color="#6b7280" />
             <View style={styles.infoContent}>
               <Caption style={styles.infoLabel}>Date de création</Caption>
               <BodyText style={styles.infoValue}>{formatDate(site.dateCreation || null)}</BodyText>
             </View>
           </View>
        <View style={{ height: 120 }} />
        </View>

      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  content: { flex: 1 },
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
  section: { padding: 16 },
  sectionTitle: { color: '#1f2937', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  infoCard: {
    backgroundColor: '#fff', padding: 16, 
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
  fieldBlock: { marginBottom: 12 },
  label: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
  valueText: { fontSize: 16, color: '#1f2937' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  clientInfo: {
    backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  clientSubText: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
});
