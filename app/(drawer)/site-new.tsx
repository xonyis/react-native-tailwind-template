import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { servicesWebApi } from "@/services/servicesWebApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronDown, Eye, EyeOff, Globe, Save, User, UserLock } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function SiteNewScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    clientId: null as number | null,
    url: '',
    urlAdmin: '',
    login: '',
    password: '',
  });

  // Charger les clients
  const loadClients = async () => {
    if (!token) return;
    
    try {
      setLoadingClients(true);
      const clientsData = await servicesWebApi.getClients(token);
      setClients(clientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      Alert.alert("Erreur", "Impossible de charger la liste des clients");
    } finally {
      setLoadingClients(false);
    }
  };

  // Charger les clients au montage du composant
  React.useEffect(() => {
    loadClients();
  }, [token]);

  const handleGoBack = () => {
    router.push("/(drawer)/services-web");
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!formData.clientId) {
      Alert.alert("Erreur", "Le client est obligatoire");
      return;
    }

    if (!formData.url.trim()) {
      Alert.alert("Erreur", "L'URL du site est obligatoire");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        clientId: formData.clientId,
        url: formData.url.trim(),
        urlAdmin: formData.urlAdmin.trim() || undefined,
        login: formData.login.trim() || undefined,
        password: formData.password.trim() || undefined,
      };

      console.log('Données envoyées à l\'API:', createData);

      const newSite = await servicesWebApi.createSite(createData, token);
      
      Alert.alert(
        "Succès", 
        "Site créé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/site-detail?id=${newSite.id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Erreur lors de la création du site"
      );
    } finally {
      setSaving(false);
    }
  };

  const getSelectedClientName = () => {
    if (!formData.clientId) return null;
    const client = clients.find(c => c.id === formData.clientId);
    return client?.nom || null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <BodyText style={styles.headerTitle}>Nouveau site</BodyText>
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

            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <Pressable
                  style={styles.selectContainer}
                  onPress={() => setShowClientPicker(true)}
                  disabled={loadingClients}
                >
                  <BodyText style={[styles.selectText, !formData.clientId && styles.placeholderText]}>
                    {loadingClients ? "Chargement..." : 
                     formData.clientId ? 
                       getSelectedClientName() || "Client sélectionné" :
                       "Sélectionner un client"}
                  </BodyText>
                  <ChevronDown size={20} color="#6b7280" />
                </Pressable>
              </View>
            </View>

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

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de client */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showClientPicker}
        onRequestClose={() => setShowClientPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <BodyText style={styles.modalTitle}>Sélectionner un client</BodyText>
              <BodyText style={styles.modalSubtitle}>Choisissez un client pour le site</BodyText>
            </View>
            <View style={styles.modalOptions}>
              {loadingClients ? (
                <BodyText style={styles.modalOptionText}>Chargement des clients...</BodyText>
              ) : clients.length === 0 ? (
                <BodyText style={styles.modalOptionText}>Aucun client trouvé.</BodyText>
              ) : (
                clients.map((client) => (
                  <Pressable
                    key={client.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, clientId: client.id }));
                      setShowClientPicker(false);
                    }}
                  >
                    <BodyText style={styles.modalOptionText}>{client.nom}</BodyText>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>

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
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
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
    padding: 16,
  },
  sectionTitle: {
    color: "#1f2937",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    flex: 1,
  },
  selectText: {
    color: '#374151',
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOptions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});
