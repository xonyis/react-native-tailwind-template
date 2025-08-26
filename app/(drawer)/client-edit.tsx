import { BodyText, Caption, Heading1, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { Client, clientsApi } from "@/services/ClientsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function ClientEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [showTypePicker, setShowTypePicker] = useState(false);
  
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
    referenceClient: '',
    visiteAnnuelle: '',
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
          referenceClient: clientData.referenceClient || '',
          visiteAnnuelle: clientData.visiteAnnuelle || '',
        });

        // Initialiser la date sélectionnée si elle existe
        if (clientData.visiteAnnuelle) {
          try {
            const dateParts = clientData.visiteAnnuelle.split('/');
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Les mois commencent à 0
              const year = parseInt(dateParts[2]);
              setSelectedDate(new Date(year, month, day));
            }
          } catch (error) {
            // Si la date n'est pas dans le bon format, on garde la date actuelle
            console.log('Format de date invalide:', clientData.visiteAnnuelle);
          }
        }
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
    router.push("/clients");
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
        telephone: formData.telephone.trim() || '',
        adresseClient: formData.adresseClient.trim() || '',
        ville: formData.ville.trim() || '',
        codePostal: formData.codePostal.trim() || '',
        raisonSocial: formData.raisonSocial.trim() || null,
        numeroTel2: formData.numeroTel2.trim() || null,
        siret: formData.siret.trim() || null,
        referenceClient: formData.referenceClient.trim() || null,
        typeClient: null, // Initialiser à null par défaut
        visiteAnnuelle: null, // Initialiser à null par défaut
      };

      // Gestion spéciale pour visiteAnnuelle
      const visiteAnnuelleValue = formatDateForAPI(formData.visiteAnnuelle);
      console.log('Valeur brute du champ:', formData.visiteAnnuelle);
      console.log('Valeur après formatDateForAPI:', visiteAnnuelleValue);
      
      if (visiteAnnuelleValue === null) {
        updateData.visiteAnnuelle = null; // Envoyer null pour supprimer la valeur
        console.log('Visite annuelle sera supprimée (null)');
      } else {
        updateData.visiteAnnuelle = visiteAnnuelleValue;
        console.log('Visite annuelle sera mise à jour:', visiteAnnuelleValue);
      }

      // Gestion spéciale pour typeClient
      if (formData.typeClient === '' || formData.typeClient === null) {
        updateData.typeClient = null; // Envoyer null pour "aucun type"
        console.log('Type client sera null (aucun type)');
      } else {
        updateData.typeClient = formData.typeClient;
        console.log('Type client sera:', formData.typeClient);
      }

      // Gestion spéciale pour referenceClient
      if (formData.referenceClient === '' || formData.referenceClient === null) {
        updateData.referenceClient = null; // Envoyer null si vide
        console.log('Reference client sera null');
      } else {
        updateData.referenceClient = formData.referenceClient;
        console.log('Reference client sera:', formData.referenceClient);
      }

      console.log('Valeur finale visiteAnnuelle:', updateData.visiteAnnuelle);
      console.log('Type de visiteAnnuelle:', typeof updateData.visiteAnnuelle);
      console.log('Données envoyées à l\'API:', updateData);
      console.log('JSON envoyé:', JSON.stringify(updateData, null, 2));
      
      try {
        await clientsApi.updateClient(client.id, updateData, token);
      } catch (error) {
        console.error('Erreur complète:', error);
        throw error;
      }
      
      Alert.alert(
        "Succès", 
        "Client mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/client-detail?id=${client.id}`)
          }
        ]
      );
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    console.log('handleDateChange appelé:', { event, date });
    
    if (Platform.OS === 'android') {
      // Sur Android, traiter directement
      if (date) {
        console.log('Date sélectionnée (Android):', date);
        setSelectedDate(date);
        const formattedDate = date.toLocaleDateString('fr-FR');
        updateFormField('visiteAnnuelle', formattedDate);
      }
      setShowDatePicker(false);
    } else {
      // Sur iOS, stocker temporairement
      if (date) {
        console.log('Date temporaire (iOS):', date);
        setTempSelectedDate(date);
      }
    }
  };

  const handleConfirmDate = () => {
    console.log('Confirmation de la date:', tempSelectedDate);
    setSelectedDate(tempSelectedDate);
    const formattedDate = tempSelectedDate.toLocaleDateString('fr-FR');
    updateFormField('visiteAnnuelle', formattedDate);
    setShowDatePicker(false);
  };

  const handleCancelDate = () => {
    console.log('Annulation de la sélection de date');
    setTempSelectedDate(selectedDate);
    setShowDatePicker(false);
  };

  // Fonction pour convertir la date française en format ISO
  const formatDateForAPI = (dateString: string): string | null => {
    if (!dateString.trim()) return null;
    
    try {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Les mois commencent à 0
        const year = parseInt(parts[2]);
        // Créer la date en UTC pour éviter les problèmes de fuseau horaire
        const date = new Date(Date.UTC(year, month, day));
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      }
    } catch (error) {
      console.log('Erreur de formatage de date:', error);
    }
    return null;
  };

  const showDatePickerModal = () => {
    console.log('Ouverture du sélecteur de date');
    setTempSelectedDate(selectedDate);
    setShowDatePicker(true);
  };

  const clearVisiteAnnuelle = () => {
    updateFormField('visiteAnnuelle', '');
    setSelectedDate(new Date());
  };

  const showTypePickerModal = () => {
    setShowTypePicker(true);
  };

  const handleTypeChange = (value: string) => {
    updateFormField('typeClient', value);
    setShowTypePicker(false);
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
              <BodyText style={styles.label}>Référence client</BodyText>
              <TextInput
                style={styles.input}
                value={formData.referenceClient}
                onChangeText={(value) => updateFormField('referenceClient', value)}
                placeholder="REF123456"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Type de client</BodyText>
              <Pressable style={styles.input} onPress={showTypePickerModal}>
                <BodyText style={formData.typeClient ? styles.dateText : styles.placeholderText}>
                  {formData.typeClient || "Sélectionner un type"}
                </BodyText>
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Visite annuelle</BodyText>
              <View style={styles.dateInputContainer}>
                <Pressable style={styles.dateInput} onPress={showDatePickerModal}>
                  <BodyText style={formData.visiteAnnuelle ? styles.dateText : styles.placeholderText}>
                    {formData.visiteAnnuelle || "Sélectionner une date"}
                  </BodyText>
                </Pressable>
                {formData.visiteAnnuelle && (
                  <Pressable style={styles.clearButton} onPress={clearVisiteAnnuelle}>
                    <X size={16} color="#6b7280" />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 100 }} />
        </ThemedView>
      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      
      {/* Modal pour le sélecteur de date */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date</BodyText>
                <Pressable 
                  onPress={handleConfirmDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View>
              <View style={{ padding: 20, alignItems: 'center', backgroundColor: 'white' }}>
              <DateTimePicker
                value={tempSelectedDate}
                mode="date"
                display="spinner"           // spinner conservé
                onChange={handleDateChange}
                maximumDate={new Date(2100, 11, 31)}
                minimumDate={new Date(1900, 0, 1)}
                themeVariant="light"        // optionnel, aide avec les contrastes
                textColor="#000"  
              />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de type de client */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTypePicker}
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable 
                onPress={() => setShowTypePicker(false)}
                style={styles.modalButtonContainer}
              >
                <BodyText style={styles.modalButton}>Annuler</BodyText>
              </Pressable>
              <BodyText style={styles.modalTitle}>Sélectionner un type</BodyText>
              <Pressable 
                onPress={() => setShowTypePicker(false)}
                style={styles.modalButtonContainer}
              >
                <BodyText style={styles.modalButton}>Terminé</BodyText>
              </Pressable>
            </View>
            <View style={{ padding: 20, backgroundColor: 'white' }}>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleTypeChange('')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  !formData.typeClient && styles.typeOptionSelected
                ]}>
                  Aucun type
                </BodyText>
              </Pressable>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleTypeChange('Maintenance')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.typeClient === 'Maintenance' && styles.typeOptionSelected
                ]}>
                  Maintenance
                </BodyText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
    fontFamily: "DMSans_400Regular",
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
    fontFamily: "DMSans_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    minHeight: 300,
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  modalButtonContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: "DMSans_400Regular",
  },
  typeOptionSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
});