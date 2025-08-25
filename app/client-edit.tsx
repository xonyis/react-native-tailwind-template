import { BodyText, Caption, Heading1, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { Client, clientsApi } from "@/services/ClientsApi";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
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
    View,
} from "react-native";

export default function ClientEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresseClient: '',
    ville: '',
    codePostal: '',
    raisonSocial: '',
    numeroTel1: '',
    numeroTel2: '',
    siret: '',
    typeClient: '',
  });

  useEffect(() => {
    const fetchClientDetail = async () => {
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
        
        // Initialiser le formulaire avec les données du client
        setFormData({
          nom: clientData.nom || '',
          email: clientData.email || '',
          telephone: clientData.telephone || '',
          adresseClient: clientData.adresseClient || '',
          ville: clientData.ville || '',
          codePostal: clientData.codePostal || '',
          raisonSocial: clientData.raisonSocial || '',
          numeroTel1: clientData.numeroTel1 || '',
          numeroTel2: clientData.numeroTel2 || '',
          siret: clientData.siret || '',
          typeClient: clientData.typeClient || '',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
        Alert.alert("Erreur", message);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetail();
  }, [id, token]);

  const handleGoBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!client || !token) return;

    // Validation simple
    if (!formData.nom.trim() || !formData.email.trim()) {
      Alert.alert("Erreur", "Le nom et l'email sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData: Partial<Client> = {
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        adresseClient: formData.adresseClient.trim(),
        ville: formData.ville.trim(),
        codePostal: formData.codePostal.trim(),
        raisonSocial: formData.raisonSocial.trim() || null,
        numeroTel1: formData.numeroTel1.trim() || null,
        numeroTel2: formData.numeroTel2.trim() || null,
        siret: formData.siret.trim() || null,
        typeClient: formData.typeClient.trim() || null,
      };

      await clientsApi.updateClient(client.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "Client mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Modifier Client</Heading2>
        <Pressable 
          onPress={handleSave} 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size={20} color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.form}>
          <Heading1 style={styles.clientName}>{client.nom}</Heading1>
          
          {/* Informations principales */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>INFORMATIONS PRINCIPALES</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Nom *</BodyText>
              <TextInput
                style={styles.input}
                value={formData.nom}
                onChangeText={(value) => updateFormField('nom', value)}
                placeholder="Nom du client"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Email *</BodyText>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateFormField('email', value)}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Téléphone</BodyText>
              <TextInput
                style={styles.input}
                value={formData.telephone}
                onChangeText={(value) => updateFormField('telephone', value)}
                placeholder="0123456789"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Adresse */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>ADRESSE</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Adresse</BodyText>
              <TextInput
                style={styles.input}
                value={formData.adresseClient}
                onChangeText={(value) => updateFormField('adresseClient', value)}
                placeholder="123 Rue de la République"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 0.3 }]}>
                <BodyText style={styles.label}>Code postal</BodyText>
                <TextInput
                  style={styles.input}
                  value={formData.codePostal}
                  onChangeText={(value) => updateFormField('codePostal', value)}
                  placeholder="75001"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.inputGroup, { flex: 0.65 }]}>
                <BodyText style={styles.label}>Ville</BodyText>
                <TextInput
                  style={styles.input}
                  value={formData.ville}
                  onChangeText={(value) => updateFormField('ville', value)}
                  placeholder="Paris"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Téléphones additionnels */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>CONTACTS ADDITIONNELS</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Téléphone 1</BodyText>
              <TextInput
                style={styles.input}
                value={formData.numeroTel1}
                onChangeText={(value) => updateFormField('numeroTel1', value)}
                placeholder="0123456789"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Téléphone 2</BodyText>
              <TextInput
                style={styles.input}
                value={formData.numeroTel2}
                onChangeText={(value) => updateFormField('numeroTel2', value)}
                placeholder="0123456789"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Informations entreprise */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>ENTREPRISE</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Raison sociale</BodyText>
              <TextInput
                style={styles.input}
                value={formData.raisonSocial}
                onChangeText={(value) => updateFormField('raisonSocial', value)}
                placeholder="Ma Société SARL"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>SIRET</BodyText>
              <TextInput
                style={styles.input}
                value={formData.siret}
                onChangeText={(value) => updateFormField('siret', value)}
                placeholder="12345678901234"
                keyboardType="number-pad"
                maxLength={14}
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Type de client</BodyText>
              <TextInput
                style={styles.input}
                value={formData.typeClient}
                onChangeText={(value) => updateFormField('typeClient', value)}
                placeholder="Particulier, Entreprise, etc."
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 100 }} />
        </ThemedView>
      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
    </KeyboardAvoidingView>
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
  saveButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  clientName: {
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    color: "#374151",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#fff",
    fontFamily: "DMSans_400Regular",
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