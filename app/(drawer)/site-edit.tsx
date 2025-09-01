import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useSiteDetail } from "@/hooks/useSiteDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Eye, EyeOff, Globe, Save, User, UserLock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";

export default function SiteEditScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const siteId = id ? parseInt(String(id)) : null;
  const { site, loading, error, refreshSite } = useSiteDetail(siteId);
  const { token } = useAuth();

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    url: '',
    urlAdmin: '',
    login: '',
    password: '',
  });

  useEffect(() => {
    if (site) {
      // Initialiser le formulaire avec les données du site
      setFormData({
        url: site.url || '',
        urlAdmin: site.urlAdmin || '',
        login: site.login || '',
        password: site.passwordDechiffre || '',
      });
    }
  }, [site]);

  const handleGoBack = () => {
    router.push("/(drawer)/services-web");
  };

  const handleSave = async () => {
    if (!site || !token) return;

    // Validation simple
    if (!formData.url.trim()) {
      Alert.alert("Erreur", "L'URL du site est obligatoire");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData = {
        url: formData.url.trim(),
        urlAdmin: formData.urlAdmin.trim() || undefined,
        login: formData.login.trim() || undefined,
        password: formData.password.trim() || undefined,
      };

      console.log('Données envoyées à l\'API:', updateData);

      await servicesWebApi.updateSite(site.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "Site mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/site-detail?id=${site.id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Erreur lors de la mise à jour du site"
      );
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Modifier le site</Heading2>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Save size={20} color="#2563eb" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations du site</Heading2>

            {/* URL du site */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>URL du site *</Caption>
              <View style={styles.inputContainer}>
                <Globe size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.url}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, url: text }))}
                  placeholder="Saisir l'URL du site"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* URL admin */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>URL admin</Caption>
              <View style={styles.inputContainer}>
                <Globe size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.urlAdmin}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, urlAdmin: text }))}
                  placeholder="Saisir l'URL admin"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Login */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Identifiant</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.login}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, login: text }))}
                  placeholder="Saisir l'identifiant"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Mot de passe</Caption>
              <View style={styles.inputContainer}>
                <UserLock size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder="Saisir le mot de passe"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                />
                <Pressable 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={20} color="#6b7280" />
                  ) : (
                    <EyeOff size={20} color="#6b7280" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Informations du client (lecture seule) */}
          {site.client && (
            <View style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Client</Heading2>
              <View style={styles.clientInfo}>
                <BodyText style={styles.clientName}>{site.client.nom}</BodyText>
                {site.client.raisonSocial && (
                  <BodyText style={styles.clientEmail}>{site.client.raisonSocial}</BodyText>
                )}
                {site.client.adresseEmailClient && (
                  <BodyText style={styles.clientEmail}>{site.client.adresseEmailClient}</BodyText>
                )}
                {site.client.numeroTel1 && (
                  <BodyText style={styles.clientPhone}>{site.client.numeroTel1}</BodyText>
                )}
              </View>
            </View>
          )}

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#1f2937",
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#374151",
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
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
