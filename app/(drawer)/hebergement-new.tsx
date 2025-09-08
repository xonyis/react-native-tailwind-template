import { BodyText, Caption, Heading2 } from "@/components/CustomText";
import { FAB } from "@/components/FAB";
import { useAuth } from "@/context/AuthContext";
import { servicesWebApi } from "@/services/servicesWebApi";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, Globe, Save } from "lucide-react-native";
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
  Switch,
  TextInput,
  View,
} from "react-native";

export default function HebergementNewScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [saving, setSaving] = useState(false);
  const [showRenouvellementDatePicker, setShowRenouvellementDatePicker] = useState(false);
  const [showRappelDatePicker, setShowRappelDatePicker] = useState(false);
  const [selectedRenouvellementDate, setSelectedRenouvellementDate] = useState(new Date());
  const [selectedRappelDate, setSelectedRappelDate] = useState(new Date());
  const [tempSelectedRenouvellementDate, setTempSelectedRenouvellementDate] = useState(new Date());
  const [tempSelectedRappelDate, setTempSelectedRappelDate] = useState(new Date());
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const typeHebergementOptions = [
    { label: 'OVH', value: 'OVH' },
    { label: 'Server Dédié', value: 'Server Dédié' },
  ];

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    clientId: null as number | null,
    typeHebergement: '',
    isNomDomaine: false,
    url: '',
    dateRenouvellement: '',
    dateRappel: '',
    derniereFacture: '',
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
  useEffect(() => {
    loadClients();
  }, [token]);

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
    if (!formData.clientId) {
      Alert.alert("Erreur", "Le client est obligatoire");
      return;
    }

    if (!formData.typeHebergement.trim()) {
      Alert.alert("Erreur", "Le type d'hébergement est obligatoire");
      return;
    }

    if (formData.isNomDomaine && !formData.url.trim()) {
      Alert.alert("Erreur", "L'URL est obligatoire quand le nom de domaine est inclus");
      return;
    }

    try {
      setSaving(true);
      
      // Préparer les données pour l'API
      const createData = {
        clientId: formData.clientId,
        typeHebergement: formData.typeHebergement.trim(),
        isNomDomaine: formData.isNomDomaine,
        url: formData.isNomDomaine ? formData.url.trim() : '',
        dateRenouvellement: formatDateForAPI(formData.dateRenouvellement) || undefined,
        dateRappel: formatDateForAPI(formData.dateRappel) || undefined,
        derniereFacture: formData.derniereFacture.trim() || undefined,
      };

      console.log('Données envoyées à l\'API:', createData);

      const newHebergement = await servicesWebApi.createHebergement(createData, token);
      
      Alert.alert(
        "Succès", 
        "Hébergement créé avec succès",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/(drawer)/hebergement-detail?id=${newHebergement.id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert(
        "Erreur",
        error instanceof Error ? error.message : "Erreur lors de la création de l'hébergement"
      );
    } finally {
      setSaving(false);
    }
  };

  // Gestionnaires pour les DatePickers
  const handleRenouvellementDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowRenouvellementDatePicker(false);
      if (selectedDate) {
        setSelectedRenouvellementDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRenouvellement: selectedDate.toISOString().split('T')[0]
        }));
      }
    } else {
      setTempSelectedRenouvellementDate(selectedDate || tempSelectedRenouvellementDate);
    }
  };

  const handleConfirmRenouvellementDate = () => {
    setSelectedRenouvellementDate(tempSelectedRenouvellementDate);
    setFormData(prev => ({
      ...prev,
      dateRenouvellement: tempSelectedRenouvellementDate.toISOString().split('T')[0]
    }));
    setShowRenouvellementDatePicker(false);
  };

  const handleCancelRenouvellementDate = () => {
    setTempSelectedRenouvellementDate(selectedRenouvellementDate);
    setShowRenouvellementDatePicker(false);
  };

  const handleRappelDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowRappelDatePicker(false);
      if (selectedDate) {
        setSelectedRappelDate(selectedDate);
        setFormData(prev => ({
          ...prev,
          dateRappel: selectedDate.toISOString().split('T')[0]
        }));
      }
    } else {
      setTempSelectedRappelDate(selectedDate || tempSelectedRappelDate);
    }
  };

  const handleConfirmRappelDate = () => {
    setSelectedRappelDate(tempSelectedRappelDate);
    setFormData(prev => ({
      ...prev,
      dateRappel: tempSelectedRappelDate.toISOString().split('T')[0]
    }));
    setShowRappelDatePicker(false);
  };

  const handleCancelRappelDate = () => {
    setTempSelectedRappelDate(selectedRappelDate);
    setShowRappelDatePicker(false);
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
        <BodyText style={styles.headerTitle}>Nouvel hébergement</BodyText>
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
            <Heading2 style={styles.sectionTitle}>Informations de l&apos;hébergement</Heading2>

            {/* Client */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Client *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
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
                          text: client.nom,
                          onPress: () => {
                            setFormData(prev => ({
                              ...prev,
                              clientId: client.id
                            }));
                          },
                        }))
                      ]
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {(() => {
                      const selectedClient = clients.find(c => c.id === formData.clientId);
                      return selectedClient ? selectedClient.nom : 'Sélectionner un client';
                    })()}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Type d'hébergement */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Type d&apos;hébergement *</Caption>
              <View style={styles.pickerContainer}>
                <Pressable
                  style={styles.pickerButton}
                  onPress={() => {
                    Alert.alert(
                      'Type d\'hébergement',
                      'Sélectionnez le type d\'hébergement',
                      [
                        {
                          text: 'Annuler',
                          style: 'cancel',
                        },
                        ...typeHebergementOptions.map(option => ({
                          text: option.label,
                          onPress: () => {
                            setFormData(prev => ({
                              ...prev,
                              typeHebergement: option.value
                            }));
                          },
                        }))
                      ]
                    );
                  }}
                >
                  <BodyText style={styles.pickerText}>
                    {formData.typeHebergement || 'Sélectionner le type d\'hébergement'}
                  </BodyText>
                </Pressable>
              </View>
            </View>

            {/* Nom de domaine inclus */}
            <View style={styles.inputGroup}>
              <Caption style={styles.label}>Nom de domaine inclus</Caption>
              <View style={styles.switchContainer}>
                <BodyText style={styles.switchLabel}>
                  {formData.isNomDomaine ? 'Oui' : 'Non'}
                </BodyText>
                <Switch
                  value={formData.isNomDomaine}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      isNomDomaine: value,
                      url: value ? prev.url : '' // Effacer l'URL si le switch est désactivé
                    }));
                  }}
                  trackColor={{ false: "#d1d5db", true: "#2563eb" }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* URL (conditionnel) */}
            {formData.isNomDomaine && (
              <View style={styles.inputGroup}>
                <Caption style={styles.label}>URL *</Caption>
                <View style={styles.inputContainer}>
                  <Globe size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.url}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, url: text }))}
                    placeholder="Saisir l'URL"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            )}

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
                  {formData.dateRenouvellement ? formatDateForDisplay(formData.dateRenouvellement) : 'Sélectionner une date'}
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
                <Globe size={20} color="#6b7280" />
                <TextInput
                  style={styles.textInput}
                  value={formData.derniereFacture}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, derniereFacture: text }))}
                  placeholder="Saisir la dernière facture"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Espace en bas */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DatePickers */}
      {Platform.OS === 'ios' ? (
        showRenouvellementDatePicker && (
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
        )
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

      {Platform.OS === 'ios' ? (
        showRappelDatePicker && (
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
        )
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

      {/* Modal pour le sélecteur de type d'hébergement */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTypePicker}
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <BodyText style={styles.modalTitle}>Type d&apos;hébergement</BodyText>
              <BodyText style={styles.modalSubtitle}>Sélectionnez le type d&apos;hébergement</BodyText>
            </View>
            <View style={styles.modalOptions}>
              {typeHebergementOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, typeHebergement: option.value }));
                    setShowTypePicker(false);
                  }}
                >
                  <BodyText style={[
                    styles.modalOptionText,
                    formData.typeHebergement === option.value && styles.modalSelectedOption
                  ]}>
                    {option.label}
                  </BodyText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

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
              <BodyText style={styles.modalSubtitle}>Choisissez un client pour l&apos;hébergement</BodyText>
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  switchLabel: {
    fontSize: 16,
    color: "#374151",
  },
  dateInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#374151",
  },
  placeholderText: {
    color: "#9ca3af",
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
  modalTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
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
  modalSelectedOption: {
    color: '#2563eb',
    fontWeight: '600',
  },
  modalButtonContainer: {
    minWidth: 60,
  },
  modalButton: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
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
});
