import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useClientsList } from "@/hooks/useClientsList";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Eye, EyeOff, Mail, Save, User } from "lucide-react-native";
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

export default function EmailNewScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [showRenouvellementDatePicker, setShowRenouvellementDatePicker] = useState(false);
  const [showRappelDatePicker, setShowRappelDatePicker] = useState(false);
  const [selectedRenouvellementDate, setSelectedRenouvellementDate] = useState(new Date());
  const [selectedRappelDate, setSelectedRappelDate] = useState(new Date());
  const [tempSelectedRenouvellementDate, setTempSelectedRenouvellementDate] = useState(new Date());
  const [tempSelectedRappelDate, setTempSelectedRappelDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // Hook pour récupérer la liste des clients
  const { clients, loading: loadingClients } = useClientsList();
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    adresse_mail: '',
    type_email: '',
    serveur: '',
    mot_de_passe: '',
    date_de_renouvellement: '',
    date_rappel: '',
    derniere_facture: '',
  });

  // Options pour les sélecteurs
  const typeEmailOptions = [
    { label: 'MX', value: 'MX' },
    { label: 'Exchange', value: 'Exchange' }
  ];

  const serveurOptions = [
    { label: 'Hosted 1 (ex2.mail.ovh.net)', value: 'hosted 1 (ex2.mail.ovh.net)' },
    { label: 'Hosted 2 (ex3.mail.ovh.net)', value: 'hosted 2 (ex3.mail.ovh.net)' },
    { label: 'Hosted 3 (ex4.mail.ovh.net)', value: 'hosted 3 (ex4.mail.ovh.net)' },
    { label: 'Hosted 4 (ex4.mail.ovh.net)', value: 'hosted 4 (ex4.mail.ovh.net)' },
    { label: 'Hosted 5 (ex4.mail.ovh.net)', value: 'hosted 5 (ex4.mail.ovh.net)' }
  ];

  // Fonction pour mettre à jour un champ du formulaire
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoBack = () => {
    router.push("/(drawer)/services-web");
  };

  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatDateForAPI = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!selectedClient || !formData.adresse_mail.trim() || !formData.type_email.trim()) {
      Alert.alert("Erreur", "Le client, l'adresse email et le type d'email sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData: any = {
        client: selectedClient.id,
        adresse_mail: formData.adresse_mail.trim(),
        type_email: formData.type_email.trim(),
        date_de_renouvellement: formatDateForAPI(formData.date_de_renouvellement),
        date_rappel: formatDateForAPI(formData.date_rappel),
        derniere_facture: formData.derniere_facture.trim(),
      };

      // Ajouter le serveur s'il a été sélectionné
      if (formData.serveur.trim()) {
        createData.serveur = formData.serveur.trim();
      }

      // Ajouter le mot de passe seulement s'il a été saisi
      if (formData.mot_de_passe.trim()) {
        createData.mot_de_passe = formData.mot_de_passe.trim();
      }

      console.log('Données envoyées à l\'API:', createData);
      
      const newEmail = await servicesWebApi.createEmail(createData, token);
      
      Alert.alert(
        "Succès", 
        "Boîte mail créée avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/email-detail?id=${newEmail.id}`)
          }
        ]
      );
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      const message = err instanceof Error ? err.message : "Erreur lors de la création";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const handleRenouvellementDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRenouvellementDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRenouvellementDate(selectedDate);
      } else {
        setSelectedRenouvellementDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_de_renouvellement: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleRappelDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRappelDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRappelDate(selectedDate);
      } else {
        setSelectedRappelDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_rappel: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmRenouvellementDate = () => {
    setSelectedRenouvellementDate(tempSelectedRenouvellementDate);
    setFormData(prev => ({
      ...prev,
      date_de_renouvellement: tempSelectedRenouvellementDate.toISOString().split('T')[0]
    }));
    setShowRenouvellementDatePicker(false);
  };

  const handleConfirmRappelDate = () => {
    setSelectedRappelDate(tempSelectedRappelDate);
    setFormData(prev => ({
      ...prev,
      date_rappel: tempSelectedRappelDate.toISOString().split('T')[0]
    }));
    setShowRappelDatePicker(false);
  };

  const handleCancelRenouvellementDate = () => {
    setTempSelectedRenouvellementDate(selectedRenouvellementDate);
    setShowRenouvellementDatePicker(false);
  };

  const handleCancelRappelDate = () => {
    setTempSelectedRappelDate(selectedRappelDate);
    setShowRappelDatePicker(false);
  };

  // Fonction pour sélectionner un client
  const handleSelectClient = () => {
    if (loadingClients) {
      Alert.alert('Chargement', 'Veuillez attendre le chargement des clients');
      return;
    }
    
    Alert.alert(
      'Sélectionner un client',
      'Choisissez un client dans la liste',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        ...clients.map(client => ({
          text: `${client.nom} - ${client.ville || 'Ville non spécifiée'}`,
          onPress: () => setSelectedClient(client),
        }))
      ]
    );
  };

  // Fonction pour rendre un sélecteur
  const renderPicker = (label: string, field: string, options: any[], value: string, icon?: any) => (
    <View style={styles.inputGroup}>
      <Caption style={styles.label}>{label}</Caption>
      <Pressable
        style={styles.pickerButton}
        onPress={() => {
          Alert.alert(
            label,
            'Sélectionnez une option',
            [
              {
                text: 'Annuler',
                style: 'cancel',
              },
              ...options.map(option => ({
                text: option.label,
                onPress: () => updateFormField(field, option.value)
              }))
            ]
          );
        }}
      >
        <View style={styles.pickerContent}>
          {icon && <View style={styles.pickerIcon}>{icon}</View>}
          <BodyText style={styles.pickerText}>
            {options.find(opt => opt.value === value)?.label || 'Sélectionner une option'}
          </BodyText>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Nouvelle boîte mail</Heading2>
        <Pressable onPress={handleSave} style={styles.saveButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Save size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informations de la boîte mail */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations de la boîte mail</Heading2>
            
            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <Pressable
                style={styles.pickerButton}
                onPress={handleSelectClient}
                disabled={loadingClients}
              >
                <View style={styles.pickerContent}>
                  <View style={styles.pickerIcon}>
                    <User size={20} color="#6b7280" />
                  </View>
                  <BodyText style={styles.pickerText}>
                    {loadingClients 
                      ? 'Chargement des clients...' 
                      : selectedClient 
                        ? `${selectedClient.nom} - ${selectedClient.ville || 'Ville non spécifiée'}`
                        : 'Sélectionner un client'
                    }
                  </BodyText>
                </View>
              </Pressable>
            </View>

            {/* Adresse email */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Adresse email *</Caption>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.adresse_mail}
                  onChangeText={(value) => updateFormField('adresse_mail', value)}
                  placeholder="exemple@domaine.com"
                  placeholderTextColor="#4C4D5C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Type d'email */}
            {renderPicker('Type d\'email *', 'type_email', typeEmailOptions, formData.type_email, <Mail size={20} color="#6b7280" />)}

            {/* Serveur */}
            {renderPicker('Serveur', 'serveur', serveurOptions, formData.serveur, <User size={20} color="#6b7280" />)}

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Mot de passe</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.mot_de_passe}
                  onChangeText={(value) => updateFormField('mot_de_passe', value)}
                  placeholder="Mot de passe de la boîte mail"
                  placeholderTextColor="#4C4D5C"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Dates</Heading2>

            {/* Date de renouvellement */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de renouvellement *</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRenouvellementDate(selectedRenouvellementDate);
                  setShowRenouvellementDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_de_renouvellement ? formatDateForDisplay(formData.date_de_renouvellement) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date de rappel */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de rappel</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRappelDate(selectedRappelDate);
                  setShowRappelDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_rappel ? formatDateForDisplay(formData.date_rappel) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>
          </View>

          {/* Facturation */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Facturation</Heading2>

            {/* Dernière facture */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Numéro de dernière facture</Caption>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.derniere_facture}
                  onChangeText={(value) => updateFormField('derniere_facture', value)}
                  placeholder="Ex: FACT-2024-001"
                  placeholderTextColor="#4C4D5C"
                />
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de date de renouvellement */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRenouvellementDatePicker}
          onRequestClose={() => setShowRenouvellementDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRenouvellementDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de renouvellement</BodyText>
                <Pressable 
                  onPress={handleConfirmRenouvellementDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRenouvellementDate}
                  mode="date"
                  display="spinner"
                  onChange={handleRenouvellementDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                  minimumDate={new Date(1900, 0, 1)}
                  themeVariant="light"
                  textColor="#000"  
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showRenouvellementDatePicker && (
          <DateTimePicker
            value={selectedRenouvellementDate}
            mode="date"
            display="default"
            onChange={handleRenouvellementDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de rappel */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRappelDatePicker}
          onRequestClose={() => setShowRappelDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRappelDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de rappel</BodyText>
                <Pressable 
                  onPress={handleConfirmRappelDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRappelDate}
                  mode="date"
                  display="spinner"
                  onChange={handleRappelDateChange}
                  maximumDate={new Date(2100, 11, 31)}
                  minimumDate={new Date(1900, 0, 1)}
                  themeVariant="light"
                  textColor="#000"  
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showRappelDatePicker && (
          <DateTimePicker
            value={selectedRappelDate}
            mode="date"
            display="default"
            onChange={handleRappelDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

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
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
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
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  textInput: {
    flex: 1,
    color: "#374151",
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  pickerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerIcon: {
    width: 20,
    alignItems: "center",
  },
  pickerText: {
    color: "#374151",
    fontSize: 16,
    flex: 1,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
    gap: 12,
  },
  dateText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButtonContainer: {
    minWidth: 60,
  },
  modalButton: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
  },
});
