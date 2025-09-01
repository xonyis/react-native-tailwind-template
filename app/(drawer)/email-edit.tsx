import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useEmailDetail } from "@/hooks/useEmailDetail";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Eye, EyeOff, Mail, Save, User } from "lucide-react-native";
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

export default function EmailEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  
  const emailId = id ? parseInt(id) : null;
  const { email, loading, error } = useEmailDetail(emailId);
  
  const [saving, setSaving] = useState(false);
  const [showRenouvellementDatePicker, setShowRenouvellementDatePicker] = useState(false);
  const [showRappelDatePicker, setShowRappelDatePicker] = useState(false);
  const [selectedRenouvellementDate, setSelectedRenouvellementDate] = useState(new Date());
  const [selectedRappelDate, setSelectedRappelDate] = useState(new Date());
  const [tempSelectedRenouvellementDate, setTempSelectedRenouvellementDate] = useState(new Date());
  const [tempSelectedRappelDate, setTempSelectedRappelDate] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    adresseMail: '',
    typeEmail: '',
    motDePasse: '',
    dateDeRenouvellement: '',
    dateRappel: '',
    derniereFacture: '',
  });

  // Options pour les sélecteurs
  const typeEmailOptions = ['Exchange', 'MX', 'Autre'];

  useEffect(() => {
    if (email) {
      // Initialiser le formulaire avec les données de l'email
      setFormData({
        adresseMail: email.adresseMail || '',
        typeEmail: email.typeEmail || '',
        motDePasse: '', // On ne pré-remplit pas le mot de passe pour des raisons de sécurité
        dateDeRenouvellement: email.dateDeRenouvellement || '',
        dateRappel: email.dateRappel || '',
        derniereFacture: email.derniereFacture || '',
      });

      // Initialiser les dates sélectionnées
      if (email.dateDeRenouvellement) {
        setSelectedRenouvellementDate(new Date(email.dateDeRenouvellement));
      }
      if (email.dateRappel) {
        setSelectedRappelDate(new Date(email.dateRappel));
      }
    }
  }, [email]);

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
    if (!email || !token) return;

    // Validation simple
    if (!formData.adresseMail.trim() || !formData.typeEmail.trim()) {
      Alert.alert("Erreur", "L'adresse email et le type d'email sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData: any = {
        adresseMail: formData.adresseMail.trim(),
        typeEmail: formData.typeEmail.trim(),
        dateDeRenouvellement: formatDateForAPI(formData.dateDeRenouvellement),
        dateRappel: formatDateForAPI(formData.dateRappel),
        derniereFacture: formData.derniereFacture.trim(),
      };

      // Ajouter le mot de passe seulement s'il a été modifié
      if (formData.motDePasse.trim()) {
        updateData.motDePasse = formData.motDePasse.trim();
      }

      console.log('Données envoyées à l\'API:', updateData);
      
      await servicesWebApi.updateEmail(email.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "Boîte mail mise à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/email-detail?id=${email.id}`)
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
          dateDeRenouvellement: selectedDate.toISOString().split('T')[0]
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
          dateRappel: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmRenouvellementDate = () => {
    setSelectedRenouvellementDate(tempSelectedRenouvellementDate);
    setFormData(prev => ({
      ...prev,
      dateDeRenouvellement: tempSelectedRenouvellementDate.toISOString().split('T')[0]
    }));
    setShowRenouvellementDatePicker(false);
  };

  const handleConfirmRappelDate = () => {
    setSelectedRappelDate(tempSelectedRappelDate);
    setFormData(prev => ({
      ...prev,
      dateRappel: tempSelectedRappelDate.toISOString().split('T')[0]
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !email) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || 'Boîte mail non trouvée'}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour aux services web</BodyText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Modifier la boîte mail</Heading2>
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
            
            {/* Adresse email */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Adresse email *</Caption>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.adresseMail}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, adresseMail: text }))}
                  placeholder="exemple@domaine.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Type d'email */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Type d'email *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Type d\'email',
                      'Sélectionnez le type d\'email',
                      typeEmailOptions.map(option => ({
                        text: option,
                        onPress: () => setFormData(prev => ({ ...prev, typeEmail: option }))
                      }))
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.typeEmail || 'Sélectionner un type'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nouveau mot de passe</Caption>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.motDePasse}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, motDePasse: text }))}
                  placeholder="Laisser vide pour ne pas modifier"
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

            {/* Date de renouvellement */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de renouvellement</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRenouvellementDate(selectedRenouvellementDate);
                  setShowRenouvellementDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateDeRenouvellement ? formatDateForDisplay(formData.dateDeRenouvellement) : 'Sélectionner une date'}
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
                  {formData.dateRappel ? formatDateForDisplay(formData.dateRappel) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Dernière facture */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Dernière facture</Caption>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.derniereFacture}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, derniereFacture: text }))}
                  placeholder="Montant de la dernière facture"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Informations du client (lecture seule) */}
          {email.client && (
            <View style={styles.section}>
              <Heading2 style={styles.sectionTitle}>Client</Heading2>
              <View style={styles.clientInfo}>
                <BodyText style={styles.clientName}>{email.client.nom}</BodyText>
                {email.client.adresseEmailClient && (
                  <BodyText style={styles.clientEmail}>{email.client.adresseEmailClient}</BodyText>
                )}
                {email.client.numeroTel1 && (
                  <BodyText style={styles.clientPhone}>{email.client.numeroTel1}</BodyText>
                )}
                {email.client.raisonSocial && (
                  <BodyText style={styles.clientRaison}>{email.client.raisonSocial}</BodyText>
                )}
              </View>
            </View>
          )}

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerButton: {
    padding: 12,
  },
  pickerText: {
    color: "#374151",
    fontSize: 16,
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
  clientInfo: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clientName: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  clientEmail: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 2,
  },
  clientPhone: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 2,
  },
  clientRaison: {
    color: "#6b7280",
    fontSize: 14,
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
