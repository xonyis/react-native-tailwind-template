import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";

import { useNexLeaseDetail } from "@/hooks/useNexLeaseDetail";
import { nexleaseApi } from "@/services/nexleaseApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Clock, FileText, Save } from "lucide-react-native";
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

export default function NexLeaseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();

  
  const nexleaseId = id ? parseInt(id) : null;
  const { nexlease, loading, error } = useNexLeaseDetail(nexleaseId);
  
  const [saving, setSaving] = useState(false);
  const [showDebutDatePicker, setShowDebutDatePicker] = useState(false);
  const [showFinDatePicker, setShowFinDatePicker] = useState(false);
  const [showRelance1DatePicker, setShowRelance1DatePicker] = useState(false);
  const [showRelance2DatePicker, setShowRelance2DatePicker] = useState(false);
  const [selectedDebutDate, setSelectedDebutDate] = useState(new Date());
  const [selectedFinDate, setSelectedFinDate] = useState(new Date());
  const [selectedRelance1Date, setSelectedRelance1Date] = useState(new Date());
  const [selectedRelance2Date, setSelectedRelance2Date] = useState(new Date());
  const [tempSelectedDebutDate, setTempSelectedDebutDate] = useState(new Date());
  const [tempSelectedFinDate, setTempSelectedFinDate] = useState(new Date());
  const [tempSelectedRelance1Date, setTempSelectedRelance1Date] = useState(new Date());
  const [tempSelectedRelance2Date, setTempSelectedRelance2Date] = useState(new Date());
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    duree: '',
    dateRelance1: '',
    dateRelance2: '',
    biensFinances: '',
    client_id: null as number | null,
  });

  // Le client est déjà dans les données du NexLease
  const selectedClient = nexlease?.client;

  useEffect(() => {
    if (nexlease) {
      // Initialiser le formulaire avec les données du NexLease
      setFormData({
        dateDebut: nexlease.dateDebut || '',
        dateFin: nexlease.dateFin || '',
        duree: nexlease.duree?.toString() || '',
        dateRelance1: nexlease.dateRelance1 || '',
        dateRelance2: nexlease.dateRelance2 || '',
        biensFinances: nexlease.biensFinances || '',
        client_id: nexlease.client?.id || null,
      });

      // Initialiser les dates sélectionnées
      if (nexlease.dateDebut) {
        setSelectedDebutDate(new Date(nexlease.dateDebut));
      }
      if (nexlease.dateFin) {
        setSelectedFinDate(new Date(nexlease.dateFin));
      }
      if (nexlease.dateRelance1) {
        setSelectedRelance1Date(new Date(nexlease.dateRelance1));
      }
      if (nexlease.dateRelance2) {
        setSelectedRelance2Date(new Date(nexlease.dateRelance2));
      }
    }
  }, [nexlease]);

  const handleGoBack = () => {
    router.push("/(drawer)/nexlease");
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
    if (!nexlease || !token) return;

    // Validation simple
    if (!formData.dateDebut.trim() || !formData.dateFin.trim() || !formData.duree.trim()) {
      Alert.alert("Erreur", "La date de début, la date de fin et la durée sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const updateData = {
        dateDebut: formatDateForAPI(formData.dateDebut),
        dateFin: formatDateForAPI(formData.dateFin),
        duree: formData.duree.trim(),
        dateRelance1: formatDateForAPI(formData.dateRelance1),
        dateRelance2: formatDateForAPI(formData.dateRelance2),
        biensFinances: formData.biensFinances.trim(),
        client_id: formData.client_id,
      } as any; // Type assertion pour contourner le problème de type

      console.log('Données envoyées à l\'API:', updateData);
      
      await nexleaseApi.updateNexLease(nexlease.id, updateData, token);
      
      Alert.alert(
        "Succès", 
        "NexLease mis à jour avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/nexlease-detail?id=${nexlease.id}`)
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

  const handleDebutDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowDebutDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedDebutDate(selectedDate);
      } else {
        setSelectedDebutDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateDebut: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleFinDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowFinDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedFinDate(selectedDate);
      } else {
        setSelectedFinDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateFin: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleRelance1DateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRelance1DatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRelance1Date(selectedDate);
      } else {
        setSelectedRelance1Date(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRelance1: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleRelance2DateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowRelance2DatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedRelance2Date(selectedDate);
      } else {
        setSelectedRelance2Date(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRelance2: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmDebutDate = () => {
    setSelectedDebutDate(tempSelectedDebutDate);
    setFormData(prev => ({
      ...prev,
      dateDebut: tempSelectedDebutDate.toISOString().split('T')[0]
    }));
    setShowDebutDatePicker(false);
  };

  const handleConfirmFinDate = () => {
    setSelectedFinDate(tempSelectedFinDate);
    setFormData(prev => ({
      ...prev,
      dateFin: tempSelectedFinDate.toISOString().split('T')[0]
    }));
    setShowFinDatePicker(false);
  };

  const handleConfirmRelance1Date = () => {
    setSelectedRelance1Date(tempSelectedRelance1Date);
    setFormData(prev => ({
      ...prev,
      dateRelance1: tempSelectedRelance1Date.toISOString().split('T')[0]
    }));
    setShowRelance1DatePicker(false);
  };

  const handleConfirmRelance2Date = () => {
    setSelectedRelance2Date(tempSelectedRelance2Date);
    setFormData(prev => ({
      ...prev,
      dateRelance2: tempSelectedRelance2Date.toISOString().split('T')[0]
    }));
    setShowRelance2DatePicker(false);
  };

  const handleCancelDebutDate = () => {
    setTempSelectedDebutDate(selectedDebutDate);
    setShowDebutDatePicker(false);
  };

  const handleCancelFinDate = () => {
    setTempSelectedFinDate(selectedFinDate);
    setShowFinDatePicker(false);
  };

  const handleCancelRelance1Date = () => {
    setTempSelectedRelance1Date(selectedRelance1Date);
    setShowRelance1DatePicker(false);
  };

  const handleCancelRelance2Date = () => {
    setTempSelectedRelance2Date(selectedRelance2Date);
    setShowRelance2DatePicker(false);
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <BodyText style={styles.loadingText}>Chargement...</BodyText>
      </View>
    );
  }

  if (error || !nexlease) {
    return (
      <View style={styles.errorContainer}>
        <BodyText style={styles.errorText}>
          {error || 'NexLease non trouvé'}
        </BodyText>
        <Pressable style={styles.button} onPress={handleGoBack}>
          <BodyText style={styles.buttonText}>Retour aux NexLease</BodyText>
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
        <Heading2 style={styles.headerTitle}>Modifier le NexLease</Heading2>
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
          {/* Informations du NexLease */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations du NexLease</Heading2>

            {/* Date de début */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de début *</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedDebutDate(selectedDebutDate);
                  setShowDebutDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateDebut ? formatDateForDisplay(formData.dateDebut) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date de fin */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de fin *</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedFinDate(selectedFinDate);
                  setShowFinDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateFin ? formatDateForDisplay(formData.dateFin) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Durée */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Durée (mois) *</Caption>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.duree}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, duree: text }))}
                  placeholder="Saisir la durée en mois"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Biens financés */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Biens financés</Caption>
              <View style={styles.inputContainer}>
                <FileText size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.biensFinances}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, biensFinances: text }))}
                  placeholder="Saisir les biens financés"
                  placeholderTextColor="#9ca3af"
                  multiline
                />
              </View>
            </View>

            {/* Date de relance 1 */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de relance 1</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRelance1Date(selectedRelance1Date);
                  setShowRelance1DatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateRelance1 ? formatDateForDisplay(formData.dateRelance1) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date de relance 2 */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de relance 2</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedRelance2Date(selectedRelance2Date);
                  setShowRelance2DatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.dateRelance2 ? formatDateForDisplay(formData.dateRelance2) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>
          </View>
            {/* Client (lecture seule) */}
            {selectedClient && (
              <View style={styles.section}>
                <Caption style={styles.label}>Client</Caption>
                <View style={styles.readOnlyContainer}>
                  <BodyText style={styles.clientName}>{selectedClient.nom}</BodyText>
                  {selectedClient.email && (
                    <BodyText style={styles.clientInfo}>{selectedClient.email}</BodyText>
                  )}
                  {selectedClient.telephone && (
                    <BodyText style={styles.clientInfo}>{selectedClient.telephone}</BodyText>
                  )}
                </View>
              </View>
            )}

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de date de début */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDebutDatePicker}
          onRequestClose={() => setShowDebutDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelDebutDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de début</BodyText>
                <Pressable 
                  onPress={handleConfirmDebutDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedDebutDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDebutDateChange}
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
        showDebutDatePicker && (
          <DateTimePicker
            value={selectedDebutDate}
            mode="date"
            display="default"
            onChange={handleDebutDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de fin */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showFinDatePicker}
          onRequestClose={() => setShowFinDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelFinDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de fin</BodyText>
                <Pressable 
                  onPress={handleConfirmFinDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedFinDate}
                  mode="date"
                  display="spinner"
                  onChange={handleFinDateChange}
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
        showFinDatePicker && (
          <DateTimePicker
            value={selectedFinDate}
            mode="date"
            display="default"
            onChange={handleFinDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de relance 1 */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRelance1DatePicker}
          onRequestClose={() => setShowRelance1DatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRelance1Date}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de relance 1</BodyText>
                <Pressable 
                  onPress={handleConfirmRelance1Date}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRelance1Date}
                  mode="date"
                  display="spinner"
                  onChange={handleRelance1DateChange}
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
        showRelance1DatePicker && (
          <DateTimePicker
            value={selectedRelance1Date}
            mode="date"
            display="default"
            onChange={handleRelance1DateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date de relance 2 */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRelance2DatePicker}
          onRequestClose={() => setShowRelance2DatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelRelance2Date}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de relance 2</BodyText>
                <Pressable 
                  onPress={handleConfirmRelance2Date}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedRelance2Date}
                  mode="date"
                  display="spinner"
                  onChange={handleRelance2DateChange}
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
        showRelance2DatePicker && (
          <DateTimePicker
            value={selectedRelance2Date}
            mode="date"
            display="default"
            onChange={handleRelance2DateChange}
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
    color: "#374151",
    fontSize: 16,
    flex: 1,
    padding: 0,
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
  readOnlyContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  clientName: {
    color: "#1f2937",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  clientInfo: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 2,
  },
});
