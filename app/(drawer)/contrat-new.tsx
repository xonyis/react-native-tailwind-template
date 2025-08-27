import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { useClientsList } from "@/hooks/useClientsList";
import { contratsApi } from "@/services/contratsApi";
import DateTimePicker from '@react-native-community/datetimepicker';
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Save } from "lucide-react-native";
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
  View,
} from "react-native";

export default function ContratNewScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const { clients, loading: clientsLoading } = useClientsList();
  
  const [saving, setSaving] = useState(false);
  const [showSignatureDatePicker, setShowSignatureDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
  const [selectedSignatureDate, setSelectedSignatureDate] = useState(new Date());
  const [selectedExpirationDate, setSelectedExpirationDate] = useState(new Date());
  const [tempSelectedSignatureDate, setTempSelectedSignatureDate] = useState(new Date());
  const [tempSelectedExpirationDate, setTempSelectedExpirationDate] = useState(new Date());
  
  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    type_contrat: '',
    statut: '',
    date_signature: '',
    date_expiration: '',
    client_id: null as number | null,
  });

  // Trouver le client sélectionné
  const selectedClient = clients.find(client => client.id === formData.client_id);

  // Options pour les sélecteurs
  const typeContratOptions = ['VIP', 'BLUE', 'HEBERGEMENT EVOLUCLOUD', 'OFFICE 365', 'SAGE', 'SAUVEGARDE', 'AUTRE'];
  const statutOptions = ['En cours', 'Terminé', 'En attente'];

  const handleGoBack = () => {
    router.push("/(drawer)/contrats");
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
    if (!formData.type_contrat.trim() || !formData.statut.trim()) {
      Alert.alert("Erreur", "Le type de contrat et le statut sont obligatoires");
      return;
    }

    if (!formData.client_id) {
      Alert.alert("Erreur", "Veuillez sélectionner un client");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        type_contrat: formData.type_contrat.trim(),
        statut: formData.statut.trim(),
        date_signature: formatDateForAPI(formData.date_signature),
        date_expiration: formatDateForAPI(formData.date_expiration),
        client_id: formData.client_id,
      } as any; // Type assertion pour contourner le problème de type

      console.log('Données envoyées à l\'API:', createData);
      
      const newContrat = await contratsApi.createContrat(createData, token);
      
      Alert.alert(
        "Succès", 
        "Contrat créé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/contrat-detail?id=${newContrat.id}`)
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

  const handleSignatureDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowSignatureDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedSignatureDate(selectedDate);
      } else {
        setSelectedSignatureDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_signature: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleExpirationDateChange = (event: any, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowExpirationDatePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempSelectedExpirationDate(selectedDate);
      } else {
        setSelectedExpirationDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          date_expiration: selectedDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleConfirmSignatureDate = () => {
    setSelectedSignatureDate(tempSelectedSignatureDate);
    setFormData(prev => ({
      ...prev,
      date_signature: tempSelectedSignatureDate.toISOString().split('T')[0]
    }));
    setShowSignatureDatePicker(false);
  };

  const handleConfirmExpirationDate = () => {
    setSelectedExpirationDate(tempSelectedExpirationDate);
    setFormData(prev => ({
      ...prev,
      date_expiration: tempSelectedExpirationDate.toISOString().split('T')[0]
    }));
    setShowExpirationDatePicker(false);
  };

  const handleCancelSignatureDate = () => {
    setTempSelectedSignatureDate(selectedSignatureDate);
    setShowSignatureDatePicker(false);
  };

  const handleCancelExpirationDate = () => {
    setTempSelectedExpirationDate(selectedExpirationDate);
    setShowExpirationDatePicker(false);
  };

  const handleSelectClient = () => {
    if (clientsLoading) {
      Alert.alert('Chargement', 'Veuillez attendre le chargement des clients');
      return;
    }

    if (clients.length === 0) {
      Alert.alert('Aucun client', 'Aucun client disponible');
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
          text: client.nom,
          onPress: () => {
            setFormData(prev => ({
              ...prev,
              client_id: client.id
            }));
          },
        }))
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </Pressable>
        <Heading2 style={styles.headerTitle}>Nouveau contrat</Heading2>
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
          {/* Informations du contrat */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>Informations du contrat</Heading2>
            
            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={handleSelectClient}
                  disabled={clientsLoading}
                >
                  <BodyText style={styles.pickerText}>
                    {clientsLoading 
                                              ? 'Chargement des clients...' 
                        : selectedClient 
                          ? selectedClient.nom
                          : 'Sélectionner un client'
                    }
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Type de contrat */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Type de contrat *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Type de contrat',
                      'Sélectionnez le type de contrat',
                      typeContratOptions.map(option => ({
                        text: option,
                        onPress: () => setFormData(prev => ({ ...prev, type_contrat: option }))
                      }))
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.type_contrat || 'Sélectionner un type'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Statut */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Statut *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Statut',
                      'Sélectionnez le statut',
                      statutOptions.map(option => ({
                        text: option,
                        onPress: () => setFormData(prev => ({ ...prev, statut: option }))
                      }))
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.statut || 'Sélectionner un statut'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Date de signature */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date de signature</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedSignatureDate(selectedSignatureDate);
                  setShowSignatureDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_signature ? formatDateForDisplay(formData.date_signature) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>

            {/* Date d'expiration */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Date d&apos;expiration</Caption>
              <Pressable
                style={styles.dateButton}
                onPress={() => {
                  setTempSelectedExpirationDate(selectedExpirationDate);
                  setShowExpirationDatePicker(true);
                }}
              >
                <Calendar size={20} color="#6b7280" />
                <BodyText style={styles.dateText}>
                  {formData.date_expiration ? formatDateForDisplay(formData.date_expiration) : 'Sélectionner une date'}
                </BodyText>
              </Pressable>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal pour le sélecteur de date de signature */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSignatureDatePicker}
          onRequestClose={() => setShowSignatureDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelSignatureDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date de signature</BodyText>
                <Pressable 
                  onPress={handleConfirmSignatureDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedSignatureDate}
                  mode="date"
                  display="spinner"
                  onChange={handleSignatureDateChange}
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
        showSignatureDatePicker && (
          <DateTimePicker
            value={selectedSignatureDate}
            mode="date"
            display="default"
            onChange={handleSignatureDateChange}
            maximumDate={new Date(2100, 11, 31)}
            minimumDate={new Date(1900, 0, 1)}
          />
        )
      )}

      {/* Modal pour le sélecteur de date d'expiration */}
      {Platform.OS === 'ios' ? (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showExpirationDatePicker}
          onRequestClose={() => setShowExpirationDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={handleCancelExpirationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Annuler</BodyText>
                </Pressable>
                <BodyText style={styles.modalTitle}>Sélectionner une date d&apos;expiration</BodyText>
                <Pressable 
                  onPress={handleConfirmExpirationDate}
                  style={styles.modalButtonContainer}
                >
                  <BodyText style={styles.modalButton}>Terminé</BodyText>
                </Pressable>
              </View> 
              <View style={{ padding: 20, backgroundColor: 'white' }}>
                <DateTimePicker
                  value={tempSelectedExpirationDate}
                  mode="date"
                  display="spinner"
                  onChange={handleExpirationDateChange}
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
        showExpirationDatePicker && (
          <DateTimePicker
            value={selectedExpirationDate}
            mode="date"
            display="default"
            onChange={handleExpirationDateChange}
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
