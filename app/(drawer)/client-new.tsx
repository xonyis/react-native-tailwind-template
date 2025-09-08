import { BodyText, Caption, Heading1, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { Client, clientsApi } from "@/services/ClientsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, X } from "lucide-react-native";
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

export default function ClientNewScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    adresseEmail1: '',
    adresseEmail2: '',
    adresseClient: '',
    ville: '',
    codePostal: '',
    pays: '',
    numeroTel1: '',
    numeroTel2: '',
    typeClient: '',
    referenceClient: '',
    visiteAnnuelle: '',
    commentaire: '',
  });

  const handleGoBack = () => {
    router.push("/clients");
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!formData.nom.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    // Validation email si fourni
    if (formData.adresseEmail1 && !isValidEmail(formData.adresseEmail1)) {
      Alert.alert("Erreur", "L'adresse email 1 n'est pas valide");
      return;
    }
    if (formData.adresseEmail2 && !isValidEmail(formData.adresseEmail2)) {
      Alert.alert("Erreur", "L'adresse email 2 n'est pas valide");
      return;
    }

    // Validation téléphone si fourni
    if (formData.numeroTel1 && !isValidPhone(formData.numeroTel1)) {
      Alert.alert("Erreur", "Le numéro de téléphone 1 n'est pas valide");
      return;
    }
    if (formData.numeroTel2 && !isValidPhone(formData.numeroTel2)) {
      Alert.alert("Erreur", "Le numéro de téléphone 2 n'est pas valide");
      return;
    }

    // Validation code postal si fourni
    if (formData.codePostal && !isValidPostalCode(formData.codePostal)) {
      Alert.alert("Erreur", "Le code postal n'est pas valide");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData: Omit<Client, 'id'> = {
        nom: formData.nom.trim(),
        adresseEmail1: formData.adresseEmail1.trim() || null,
        adresseEmail2: formData.adresseEmail2.trim() || null,
        adresseClient: formData.adresseClient.trim() || null,
        ville: formData.ville.trim() || null,
        codePostal: formData.codePostal.trim() || null,
        pays: formData.pays.trim() || null,
        numeroTel1: formData.numeroTel1.trim() || null,
        numeroTel2: formData.numeroTel2.trim() || null,
        referenceClient: formData.referenceClient.trim() || null,
        typeClient: null, // Initialiser à null par défaut
        latitude: null,
        longitude: null,
        visiteAnnuelle: null, // Initialiser à null par défaut
        commentaire: formData.commentaire.trim() || null,
      };

      // Gestion spéciale pour visiteAnnuelle
      const visiteAnnuelleValue = formatDateForAPI(formData.visiteAnnuelle);
      console.log('Valeur brute du champ:', formData.visiteAnnuelle);
      console.log('Valeur après formatDateForAPI:', visiteAnnuelleValue);
      
      if (visiteAnnuelleValue === null) {
        createData.visiteAnnuelle = null; // Envoyer null pour supprimer la valeur
        console.log('Visite annuelle sera supprimée (null)');
      } else {
        createData.visiteAnnuelle = visiteAnnuelleValue;
        console.log('Visite annuelle sera mise à jour:', visiteAnnuelleValue);
      }

      // Gestion spéciale pour typeClient
      if (formData.typeClient === '' || formData.typeClient === null) {
        createData.typeClient = null; // Envoyer null pour "aucun type"
        console.log('Type client sera null (aucun type)');
      } else {
        createData.typeClient = formData.typeClient;
        console.log('Type client sera:', formData.typeClient);
      }

      // Gestion spéciale pour referenceClient
      if (formData.referenceClient === '' || formData.referenceClient === null) {
        createData.referenceClient = null; // Envoyer null si vide
        console.log('Reference client sera null');
      } else {
        createData.referenceClient = formData.referenceClient;
        console.log('Reference client sera:', formData.referenceClient);
      }

      console.log('Valeur finale visiteAnnuelle:', createData.visiteAnnuelle);
      console.log('Type de visiteAnnuelle:', typeof createData.visiteAnnuelle);
      console.log('Données envoyées à l\'API:', createData);
      console.log('JSON envoyé:', JSON.stringify(createData, null, 2));
      
      try {
        const newClient = await clientsApi.createClient(createData, token);
        console.log('Client créé avec succès:', newClient);
        
        Alert.alert(
          "Succès", 
          "Client créé avec succès",
          [
            {
              text: "OK",
              onPress: () => router.replace(`/client-detail?id=${newClient.id}`)
            }
          ]
        );
      } catch (error) {
        console.error('Erreur complète:', error);
        throw error;
      }
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

  const showCountryPickerModal = () => {
    setShowCountryPicker(true);
  };

  const handleCountryChange = (value: string) => {
    updateFormField('pays', value);
    setShowCountryPicker(false);
  };

  // Fonctions de validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
    return phoneRegex.test(phone);
  };

  const isValidPostalCode = (postalCode: string): boolean => {
    const postalRegex = /^[A-Z0-9\- ]{3,10}$/i;
    return postalRegex.test(postalCode);
  };

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
        <Heading2 style={styles.headerTitle}>Nouveau Client</Heading2>
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
          <Heading1 style={styles.clientName}>Créer un nouveau client</Heading1>
          
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
              <BodyText style={styles.label}>Adresse email 1</BodyText>
              <TextInput
                style={styles.input}
                value={formData.adresseEmail1}
                onChangeText={(value) => updateFormField('adresseEmail1', value)}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Adresse email 2</BodyText>
              <TextInput
                style={styles.input}
                value={formData.adresseEmail2}
                onChangeText={(value) => updateFormField('adresseEmail2', value)}
                placeholder="email2@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
                  autoCapitalize="characters"
                  maxLength={10}
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

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Pays</BodyText>
              <Pressable style={styles.input} onPress={showCountryPickerModal}>
                <BodyText style={formData.pays ? styles.dateText : styles.placeholderText}>
                  {formData.pays || "Sélectionner un pays"}
                </BodyText>
              </Pressable>
            </View>
          </View>

          {/* Téléphones additionnels */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>CONTACTS ADDITIONNELS</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Numéro de téléphone 1</BodyText>
              <TextInput
                style={styles.input}
                value={formData.numeroTel1}
                onChangeText={(value) => updateFormField('numeroTel1', value)}
                placeholder="+33 1 23 45 67 89"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Numéro de téléphone 2</BodyText>
              <TextInput
                style={styles.input}
                value={formData.numeroTel2}
                onChangeText={(value) => updateFormField('numeroTel2', value)}
                placeholder="+33 1 23 45 67 89"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Informations client */}
          <View style={styles.section}>
            <Caption style={styles.sectionTitle}>INFORMATIONS CLIENT</Caption>
            
            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Référence client</BodyText>
              <TextInput
                style={styles.input}
                value={formData.referenceClient}
                onChangeText={(value) => updateFormField('referenceClient', value)}
                placeholder="CUXXXX-XXXXX"
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
              <BodyText style={styles.label}>Date de la prochaine visite annuelle</BodyText>
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

            <View style={styles.inputGroup}>
              <BodyText style={styles.label}>Commentaire</BodyText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.commentaire}
                onChangeText={(value) => updateFormField('commentaire', value)}
                placeholder="Ajoutez un commentaire sur ce client..."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 100 }} />
        </ThemedView>
      </ScrollView>

      <FAB onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancelDate}>
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date</BodyText>
                <Pressable onPress={handleConfirmDate}>
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View>
              <View style={{ padding: 20, alignItems: 'center', backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                  minimumDate={new Date(1900, 0, 1)}
                  style={{ 
                    backgroundColor: 'white',
                    width: '100%',
                    height: 250,
                  }}
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
                onPress={() => handleTypeChange('maintenance')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.typeClient === 'maintenance' && styles.typeOptionSelected
                ]}>
                  Maintenance
                </BodyText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour le sélecteur de pays */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCountryPicker}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable 
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalButtonContainer}
              >
                <BodyText style={styles.modalButton}>Annuler</BodyText>
              </Pressable>
              <BodyText style={styles.modalTitle}>Sélectionner un pays</BodyText>
              <Pressable 
                onPress={() => setShowCountryPicker(false)}
                style={styles.modalButtonContainer}
              >
                <BodyText style={styles.modalButton}>Terminé</BodyText>
              </Pressable>
            </View>
            <View style={{ padding: 20, backgroundColor: 'white' }}>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleCountryChange('')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  !formData.pays && styles.typeOptionSelected
                ]}>
                  Aucun pays
                </BodyText>
              </Pressable>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleCountryChange('France')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.pays === 'France' && styles.typeOptionSelected
                ]}>
                  France
                </BodyText>
              </Pressable>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleCountryChange('Luxembourg')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.pays === 'Luxembourg' && styles.typeOptionSelected
                ]}>
                  Luxembourg
                </BodyText>
              </Pressable>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleCountryChange('Belgique')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.pays === 'Belgique' && styles.typeOptionSelected
                ]}>
                  Belgique
                </BodyText>
              </Pressable>
              <Pressable 
                style={styles.typeOption}
                onPress={() => handleCountryChange('Autre')}
              >
                <BodyText style={[
                  styles.typeOptionText,
                  formData.pays === 'Autre' && styles.typeOptionSelected
                ]}>
                  Autre
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    flex: 1,
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
  clearButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
